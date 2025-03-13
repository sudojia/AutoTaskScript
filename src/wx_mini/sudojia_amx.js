/**
 * 安慕希小程序
 *
 * 抓包 Host：https://wx-amxshop.msxapi.digitalyili.com 获取请求头 accesstoken 的值
 * export AMX_TOKEN = 'xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/06/16
 *
 * const $ = new Env('安慕希')
 * cron: 33 14 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('安慕希');
const amxList = process.env.AMX_TOKEN ? process.env.AMX_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://amxshop.yili.com'
// 请求头
const headers = {
    'user-agent': sudojia.getRandomUserAgent(),
    'accept-encoding': 'gzip, deflate, br',
    'referer': 'https://servicewechat.com/wxf2a6206f7e2fd712/666/page-frame.html',
    'content-type': 'application/x-www-form-urlencoded',
    'accept': '*/*',
};

!(async () => {
    await checkUpdate($.name, amxList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < amxList.length; i++) {
        const index = i + 1;
        headers.accesstoken = amxList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        const isLogin = await getUser();
        if (!isLogin) {
            console.error(`Token 已失效`);
            await notify.sendNotify(`「Token失效通知」`, `${$.name}账号[${index}] Token 已失效，请重新登录获取 Token\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        message += `安慕希用户：${$.nickName}\n`;
        console.log(`${$.nickName}登录成功~`);
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await checkStatus();
    await $.wait(sudojia.getRandomWait(800, 1200))
    console.log(`开始签到...`);
    await $.wait(sudojia.getRandomWait(1000, 1800));
    if ($.signed) {
        message += `今日已签到\n\n`;
        console.log(`今日已签到`);
        return;
    }
    await signIn();
    await $.wait(sudojia.getRandomWait(1500, 2300));
    await checkStatus();
    await $.wait(sudojia.getRandomWait(1500, 2300));
    await getCount();
}

/**
 * 检测签到状态
 *
 * @return {Promise<void>}
 */
async function checkStatus() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/sign/status`, 'get', headers);
        if (200 === data.code) {
            // false; 未签到
            $.signed = data.data.signed;
            // 签到天数
            $.signDays = data.data.signDays;
        } else {
            console.error(`${data.msg}`);
        }
    } catch (e) {
        console.error(`检测签到状态时发生异常：${e}`);
    }
}

/**
 * 获取用户信息
 *
 * @return {Promise<boolean>}
 */
async function getUser() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/getUser`, 'get', headers);
        if ('未登陆或登陆超时' === data.msg || !data.data) {
            return false;
        }
        if (200 === data.code) {
            $.nickName = data.data.user.name;
        } else {
            console.error(`用户信息获取失败：${data.msg}`);
        }
        return true;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
        return false;
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/daily/sign?exParams=false`, 'get', headers);
        if (200 === data.code) {
            if (data.data) {
                message += `签到成功，积分+${data.data.dailySign.bonusPoints}\n`;
                console.log(`签到成功，积分+${data.data.dailySign.bonusPoints}`);
            } else {
                console.error(`签到失败：${data.msg}`);
            }
        }
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取积分
 *
 * @return {Promise<void>}
 */
async function getCount() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/order/getCount`, 'get', headers);
        if (200 === data.code) {
            message += `当前积分：${data.data.integralCount}，已连续签到：${$.signDays}天\n\n`;
            console.log(`当前积分：${data.data.integralCount}，已连续签到：${$.signDays}天`);
        } else {
            console.error(`积分获取失败：${data.msg}`);
        }
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}
