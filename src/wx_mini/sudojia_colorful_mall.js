/**
 * 七彩虹商城小程序
 *
 * 退出登录后打开抓包再登录才会有此 URL
 * 退出登录后打开抓包再登录才会有此 URL
 * 退出登录后打开抓包再登录才会有此 URL
 *
 * 1. 抓包 URL：https://shop.skycolorful.com/api/User/DecryptPhoneNumber 获取请求体的 Json 数据，全选复制
 * 2. 到 JSON 在线工具网站 https://www.json.cn/jsonzip/ 粘贴 json 并压缩
 * JSON 必须是一行，不能换行 不能换行 不能换行
 * JSON 必须是一行，不能换行 不能换行 不能换行
 * JSON 必须是一行，不能换行 不能换行 不能换行
 *
 * export COLORFUL_TOKEN = '{"OpenId":"xxx","Iv":"xxx","EncryptedData":"iYC3xFxxx"}'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/06/18
 * @lastModify 2025/01/20
 *
 * const $ = new Env('七彩虹商城')
 * cron: 14 12 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('七彩虹商城');
const colorList = process.env.COLORFUL_TOKEN ? process.env.COLORFUL_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://shop.skycolorful.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Accept': '*/*',
    'source': 'Wx',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'referer': 'https://servicewechat.com/wx49018277e65fc3e1/61/page-frame.html',
    'Ticks': Date.now(),
    'requestId': uuidv4(),
    'AppSecret': 'MmI1YzAxZmItNzY0MC00MDFhLTgxODgtNDNhMTMxOTBhNjI2',
    'AppId': '815d8026-9a52-4445-a42c-a5443134232e',
    'Sign': getSign()
};

!(async () => {
    await checkUpdate($.name, colorList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < colorList.length; i++) {
        const index = i + 1;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        await getToken(JSON.parse(colorList[i]));
        await $.wait(sudojia.getRandomWait(1200, 2000));
        await checkLogin();
        if (!$.isLogin) {
            console.error(`Token 已失效`);
            await notify.sendNotify(`「Token失效通知」`, `${$.name}账号[${index}] Token 已失效，请重新登录获取 Token\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await isSign();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await newSign();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await signDays();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await createComment();
    await $.wait(sudojia.getRandomWait(1000, 2000));
    await getUserPoint();
}

async function getToken(bodyData) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/DecryptPhoneNumber`, 'post', headers, bodyData);
        if (0 !== data.Code) {
            return console.error(data.Message);
        }
        headers.Authorization = `Bearer ${data.Data.Token}`;
        headers['X-Authorization'] = `Bearer ${data.Data.RefreshToken}`;
        console.log('Token 已更新');
    } catch (e) {
        console.error(`刷新 Token 时发生异常：${e}`);
    }
}

async function checkLogin() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/RefreshLoginTime`, 'post', headers, {"phone": ""});
        if (0 !== data.Code) {
            $.isLogin = false;
            return;
        }
        $.isLogin = true;
        console.log('Token 有效');
    } catch (e) {
        console.error('状态:', e.response.status);
        $.isLogin = false;
    }
}

/**
 * 获取用户信息
 *
 * @return {Promise<*>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/GetUserInfo`, 'get', headers);
        if (0 !== data.Code) {
            return console.error(data.Message);
        }
        $.mobile = data.Data.Mobile;
        const nickName = data.Data.NickName;
        const hiddenMobile = `${$.mobile.slice(0, 3)}***${$.mobile.slice(-3)}`;
        console.log(`${nickName}(${hiddenMobile})`);
        message += `${nickName}(${$.mobile})\n`
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 获取签到状态
 *
 * @return {Promise<void>}
 */
async function isSign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/IsSign`, 'get', headers);
        if (data.Code !== 0) {
            console.error(data.Message);
            return;
        }
        if (data.Data.IsSign) {
            console.log('今日已签到');
            message += `今日已签到\n`;
            return;
        }
        await $.wait(sudojia.getRandomWait(1200, 2000));
        await sign();
    } catch (e) {
        console.error(`获取签到状态接口时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/Sign`, 'post', headers);
        if (0 !== data.Code) {
            console.error(data.Message);
            return;
        }
        const signPoint = data.Data.Point
        console.log(`旧版签到成功！积分+${signPoint}`);
        message += `旧版签到成功！积分+${signPoint}\n`;
    } catch (e) {
        console.error(`旧版签到时发生异常：${e}`);
    }
}

/**
 * 新版签到
 *
 * @returns {Promise<void>}
 */
async function newSign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/SignV2`, 'post', headers);
        if (0 !== data.Code) {
            return console.error(`新版签到失败：${data.Message}`);
        }
        console.log(`新版签到成功！`);
        message += `新版签到成功！\n`;
    } catch (e) {
        console.error(`新版签到时发生异常：${e}`);
    }
}

/**
 * 获取已连续签到天数
 *
 * @return {Promise<void>}
 */
async function signDays() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/SignDays`, 'get', headers);
        console.log(`已连续签到${data.Data}天`);
        message += `已连续签到${data.Data}天\n`;
    } catch (e) {
        console.error('获取签到天数接口请求失败，请检查网络问题：', e);
    }
}

// ****************************任务列表开始****************************
/**
 * 获取 20 篇文章
 *
 * @return {Promise<*>}
 */
async function getArticlePage() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/Bbs/GetHotList?page=1&size=30&phone=${$.mobile}`, 'get', headers);
        const articleList = data.Data[Math.floor(Math.random() * data.Data.length)];
        return articleList.Id;
    } catch (e) {
        console.error(`获取文章列表接口时发生异常：${e}`);
        return null;
    }
}

/**
 * 刷新积分
 *
 * @param taskName
 * @return {Promise<*>}
 */
async function getCurrentCount(taskName) {
    const taskResp = await sudojia.sendRequest(`${baseUrl}/api/Sys/GetPointConfig`, 'get', headers);
    const taskList = taskResp.Data.DataList;
    const task = taskList.find(t => t.Name === taskName);
    return task.DayGetPointTotal;
}

/**
 * 每次积分+3，每日上限9分
 * 评论
 *
 * @return {Promise<void>}
 */
async function createComment() {
    try {
        for (let i = 0; i < 3; i++) {
            const currentCount = await getCurrentCount('社区内容评论');
            if (currentCount >= 9) {
                console.log(`今日评论积分已达上限9分`);
                break;
            }
            console.log(`第[${i + 1}]次评论`);
            // 获取文章 ID
            let articleId = await getArticlePage();
            console.log(`获取的文章 ID: ${articleId}`);
            await $.wait(sudojia.getRandomWait(1000, 2000));
            // 获取随机评论内容
            const content = getContent();
            console.log(`获取的随机评论内容: ${content}`);
            await $.wait(sudojia.getRandomWait(1000, 2000));
            const data = await sudojia.sendRequest(`${baseUrl}/api/Bbs/PostReply`, 'post', headers, {
                "PostId": articleId,
                "ReplyId": "",
                "ParentReplyId": "",
                "Phone": $.mobile,
                "Content": content,
                "Pictures": []
            });
            if (0 === data.Code) {
                console.log(`评论成功`);
                console.log(`等待5s...\n`);
                await $.wait(sudojia.getRandomWait(5500, 6500));
            } else {
                console.error('评论失败，返回: ', data);
            }
        }
    } catch
        (e) {
        console.error(`发表评论时发生异常：${e}`);
    }
}

function getContent() {
    const contentArray = [
        '膜拜大大大神！！',
        '果断Mark！！！',
        '看帖看完了至少要顶一下！',
        '前排占座，学习了！',
        '每天一顶，心情好好',
        '内容引起极度舒适，已收藏。',
        '潜水多年，看到这个帖子我决定浮出水面点个赞。',
        '楼主辛苦了，感谢！！'
    ];
    return contentArray[Math.floor(Math.random() * contentArray.length)];
}


/**
 * 获取用户积分
 *
 * @return {Promise<void>}
 */
async function getUserPoint() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/User/GetUserPoint`, 'get', headers);
        if (0 === data.Code) {
            console.log(`当前积分：${data.Data.Num}`);
            message += `当前积分：${data.Data.Num}\n`;
        } else {
            console.error(data.Message);
        }
    } catch (e) {
        console.error(`获取用户积分接口时发生异常：${e}`);
    }
}

/**
 * 获取 Sign
 *
 * @return {string}
 */
function getSign() {
    return sudojia.md5([
        JSON.stringify({AppId: '815d8026-9a52-4445-a42c-a5443134232e'}),
        JSON.stringify({Ticks: Date.now()}),
        JSON.stringify({requestId: uuidv4()}),
        JSON.stringify({AppSecret: "2b5c01fb-7640-401a-8188-43a13190a626"}
        )].join(""));
}

/**
 * 随机生成 UUID v4
 *
 * @return {string}
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}