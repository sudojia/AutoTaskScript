/**
 * 甄稀冰淇淋小程序
 *
 * 抓包 Host：https://msmarket.msx.digitalyili.com 获取请求头 access-token 的值
 * export ZX_ICE_TOKEN = 'xxxxxxxxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/06/16
 *
 * const $ = new Env('甄稀冰淇淋')
 * cron: 22 15 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('甄稀冰淇淋');
const zxList = process.env.ZX_ICE_TOKEN ? process.env.ZX_ICE_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://msmarket.msx.digitalyili.com'
// 请求头
const headers = {
    'user-agent': sudojia.getRandomUserAgent(),
    'referer': 'https://servicewechat.com/wx21fd8b5d6d4cf1ca/195/page-frame.html',
    'content-type': 'application/json',
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br',
};
!(async () => {
    await checkUpdate($.name, zxList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < zxList.length; i++) {
        const index = i + 1;
        headers['access-token'] = zxList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        const isLogin = await getUserInfo();
        if (!isLogin) {
            console.error(`Token 已失效`);
            await notify.sendNotify(`「Token失效通知」`, `${$.name}账号[${index}] Token 已失效，请重新登录获取 Token\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        message += `昵称：${$.nickName}\n`;
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
    console.log(`开始检测签到状态...`);
    await checkStatus();
    await $.wait(sudojia.getRandomWait(1500, 2300))
    if ($.signed) {
        message += `今日已签到，请勿重复签到\n\n`;
        console.log(`今日已签到，请勿重复签到`);
        return;
    }
    console.log(`状态：未签到\n开始签到...`);
    await sign();
    await $.wait(sudojia.getRandomWait(1500, 2300));
    await getPoint();
}

/**
 * 获取用户信息
 *
 * @return {Promise<boolean>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/gateway/api/auth/account/user/info`, 'get', headers);
        if (data.status) {
            $.nickName = data.data.nickName;
            return true;
        }
        console.log(data.error);
        return false;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
        return false;
    }
}

/**
 * 检测签到状态
 *
 * @return {Promise<void>}
 */
async function checkStatus() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/gateway/api/member/sign/status`, 'get', headers);
        if (data.status) {
            // false：未签到
            $.signed = data.data.signed
        }
    } catch (e) {
        console.error(`检测签到状态时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/gateway/api/member/daily/sign`, 'post', headers, {});
        if (data.status) {
            message += `签到成功，奶滴值+${data.data.dailySign.bonusPoint}\n`;
            console.log(`签到成功，奶滴值+${data.data.dailySign.bonusPoint}`);
        }
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取奶滴值
 *
 * @return {Promise<void>}
 */
async function getPoint() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/gateway/api/member/point`, 'get', headers);
        if (data.status) {
            message += `当前奶滴值：${data.data}\n\n`;
            console.log(`当前奶滴值：${data.data}`);
        } else {
            console.log(`获取奶滴值失败：${data}`);
        }
    } catch (e) {
        console.error(`获取奶滴值时发生异常：${e}`);
    }
}
