/**
 * 图虫APP
 *
 * 每日签到及部分任务获取积分
 * 自行重设密码
 * export TUC_ACCOUNTS = '手机号#密码'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/12/28
 *
 * const $ = new Env('图虫')
 * cron: 38 5 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('图虫');
const crypto = require('crypto');
const tuList = process.env.TUC_ACCOUNTS ? process.env.TUC_ACCOUNTS.split(/[\n&]/) : [];
const key = Buffer.from('41343045353832423133303141423545', 'hex');
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://api.tuchong.com'
// 请求头
const headers = {
    'User-Agent': 'okhttp/3.12.2 com.ss.android.tuchong (Tuchong: 7391 7.39.1) (Android: 11 30)',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/x-www-form-urlencoded',
    'version': '7576',
    'channel': 'oppo',
    'platform': 'android',
};

!(async () => {
    await checkUpdate($.name, tuList);
    for (let i = 0; i < tuList.length; i++) {
        const index = i + 1;
        const [phone, pwd] = tuList[i].split('#');
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        const isLogin = await login(phone, pwd);
        if (!isLogin) {
            continue;
        }
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1e3, 2e3))
    await checkIn();
    await $.wait(sudojia.getRandomWait(1e3, 2e3))
    await getArticle();
    await $.wait(sudojia.getRandomWait(1e3, 2e3))
    await getPointStatus();
}

/**
 * 登录
 *
 * @param phone
 * @param pwd
 * @returns {Promise<boolean>}
 */
async function login(phone, pwd) {
    try {
        const encryptedPhone = encrypt(phone);
        const data = await sudojia.sendRequest(`${baseUrl}/accounts/login`, 'post', headers, {
            "password": pwd,
            "account": encryptedPhone
        });
        if (0 !== data.account_status) {
            console.error(`账号或密码错误`);
            return false;
        }
        headers.token = data.token;
        $.accountId = data.identity;
        console.log(`登录成功`);
        return true;
    } catch (e) {
        console.error(`登录时发生异常：${e}`);
    }
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/2/sites/${$.accountId}`, 'get', headers);
        if ('SUCCESS' !== data.result) {
            return console.error(`获取用户信息失败 ->`, data);
        }
        console.log(`${data.site.name}(${data.site.site_id})`);
        message += `${data.site.name}(${data.site.site_id})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function checkIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/point/check-in`, 'get', headers);
        if ('SUCCESS' !== data.result) {
            message += `签到失败, ${data.message}\n`;
            return console.error(`签到失败 ->`, data);
        }
        console.log('签到成功');
        message += `签到成功\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取文章信息
 * 然后随机选择一篇文章进行点赞和关注作者操作
 *
 * @returns {Promise<void>}
 */
async function getArticle() {
    try {
        const data = await sudojia.sendRequest(`https://tuchong.com/gapi/feed/app`, 'get', headers);
        // 过滤掉没有data_id的项，得到有效的文章列表
        const filteredFeedList = data.feedList.filter(item => item.data_id !== undefined);
        let listElement = filteredFeedList[Math.floor(Math.random() * filteredFeedList.length)];
        console.log(`获取到文章id：${listElement.data_id}`);
        // 执行点赞操作
        await performAction('点赞', favorite, listElement.data_id);
        // 执行关注作者操作
        await performAction('关注作者', follow, listElement.entry.author_id);
    } catch (e) {
        console.error(`开宝箱时发生异常：${e}`);
    }
}

/**
 * 点赞操作
 * 调用performInteraction函数来执行点赞操作
 *
 * @param postId
 * @returns {Promise<void>}
 */
async function favorite(postId) {
    return await performInteraction('favorite', postId);
}

/**
 * 关注作者操作
 * 调用performInteraction函数来执行关注作者操作
 *
 * @param userId
 * @returns {Promise<void>}
 */
async function follow(userId) {
    return await performInteraction('follow', userId, 'site_id');
}

/**
 * 执行交互操作，点赞和关注
 *
 * @param action 交互操作类型 'favorite' 或 'follow'
 * @param id 文章ID或用户ID
 * @param paramKey 请求参数中的键名，默认为 'post_id'
 *
 * @returns {Promise<void>}
 */
async function performInteraction(action, id, paramKey = 'post_id') {
    try {
        let data = await sudojia.sendRequest(`https://tuchong.com/gapi/interactive/${action}?_rticket=${new Date().getTime()}`, 'put', headers, {
            [paramKey]: id
        });
        console.log(`开始取消操作`);
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        data = await sudojia.sendRequest(`https://tuchong.com/gapi/interactive/${action}?${paramKey}=${id}`, 'DELETE', headers);
        console.log(data);
    } catch (e) {
        console.error(`${action}时发生异常：${e}`);
    }
}

async function performAction(description, actionFunction, id) {
    console.log(`开始${description}`);
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    // 执行传入的操作函数
    await actionFunction(id);
}

/**
 * 获取积分
 *
 * @returns {Promise<void>}
 */
async function getPointStatus() {
    try {
        const data = await sudojia.sendRequest(`https://m.tuchong.com/tuchonggapi/misc/point/v2/status?platform=android&version=7.57.6`, 'get', headers);
        console.log(`当前积分：${data.status.total_point}`);
        console.log(`当前等级：${data.status.influence_level_text}`);
        message += `当前积分：${data.status.total_point}\n当前等级：${data.status.influence_level_text}\n\n`;
    } catch (e) {
        console.error(`获取积分状态时发生异常：${e}`);
    }
}

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-128-ecb', key, '');
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
