/**
 * 33台词 https://33.agilestudio.cn/invite?userCode=Rx5X7gjH
 * 一个通过台词找影片素材
 * 每日签到获得积分
 *
 * 积分有什么用？
 * 官方文档回答：
 * 1. 积分可以用来截取图片和剪切视频。
 * 2. 积分可以兑换会员。（限普通积分）
 *
 * export AGILE_STUDIO_ACCOUNTS = 'email#password'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/12/3
 *
 * const $ = new Env('33台词')
 * cron: 1 11 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('33台词');
const agileList = process.env.AGILE_STUDIO_ACCOUNTS ? process.env.AGILE_STUDIO_ACCOUNTS.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://ssv-api.agilestudio.cn'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent('PC'),
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Host': 'ssv-api.agilestudio.cn',
    'Origin': 'https://33.agilestudio.cn',
    'Content-Type': 'application/json;charset=UTF-8',
};

!(async () => {
    await checkUpdate($.name, agileList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < agileList.length; i++) {
        const index = i + 1;
        const [email, password] = agileList[i].split('#');
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        console.log('开始登录~');
        const loginSuccess = await login(email, password);
        if (!loginSuccess) {
            break;
        }
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main();
        await $.wait(sudojia.getRandomWait(1500, 2300));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1500, 2300));
    await dailyCheck();
    await $.wait(sudojia.getRandomWait(1500, 2300));
    await getPoints();
}

/**
 * 登录
 *
 * @param email
 * @param password
 * @returns {Promise<boolean>}
 */
async function login(email, password) {
    try {
        const ts = (new Date).getTime() - 9999;
        headers['x-signature'] = generateXSignature(ts);
        const data = await sudojia.sendRequest(`${baseUrl}/api/auth/email-login?_platform=web&_versioin=0.2.5&_ts=${ts}`, 'post', headers, {
            "email": email,
            "password": password
        });
        if (0 !== data.code) {
            console.error(data.msg);
            return false;
        }
        headers['x-token'] = data.data.token;
        console.log('登录成功~');
        return true;
    } catch (e) {
        console.error(`登录时发生异常：${e}`);
        return false;
    }
}

async function getUserInfo() {
    try {
        const ts = (new Date).getTime() - 9999;
        headers['x-signature'] = generateXSignature(ts);
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/my-info?_platform=web&_versioin=0.2.5&_ts=${ts}`, 'get', headers);
        if (0 !== data.code) {
            return console.error(data.msg);
        }
        console.log(`用户：${data.data.email}`);
        message += `用户：${data.data.email}\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

async function dailyCheck() {
    try {
        const ts = (new Date).getTime() - 9999;
        headers['x-signature'] = generateXSignature(ts);
        const data = await sudojia.sendRequest(`${baseUrl}/api/integral/do-daily-check?_platform=web&_versioin=0.2.5&_ts=${ts}`, 'post', headers);
        if (0 !== data.code) {
            return console.error(data.msg);
        }
        console.log('签到成功！');
        message += `签到成功！\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

async function getPoints() {
    try {
        const ts = (new Date).getTime() - 9999;
        headers['x-signature'] = generateXSignature(ts);
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/user-info?_platform=web&_versioin=0.2.5&_ts=${ts}`, 'get', headers);
        if (0 !== data.code) {
            return console.error(data.msg);
        }
        console.log(`当前积分：${data.data.integral}`);
        message += `当前积分：${data.data.integral}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}

function generateXSignature(ts) {
    return sudojia.md5(`_platform=web,_ts=${ts},_versioin=0.2.5,`);
}
