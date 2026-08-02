/**
 * 安慕希小程序
 *
 * 抓包 Host：https://msmarket.msx.digitalyili.com 获取请求头 access-token 的值
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
const baseUrl = 'https://msmarket.msx.digitalyili.com/gateway'
// 请求头
const headers = {
    'user-agent': sudojia.getRandomUserAgent(),
    'accept-encoding': 'gzip, deflate, br',
    'referer': 'https://servicewechat.com/wxf2a6206f7e2fd712/780/page-frame.html',
    'content-type': 'application/json',
    'xweb_xhr': '1',
    'scene': '1145',
    'oms': 'old',
    'accept': '*/*',
};

!(async () => {
    await checkUpdate($.name, amxList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < amxList.length; i++) {
        const index = i + 1;
        headers['access-token'] = amxList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
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
    await $.wait(sudojia.getRandomWait(1500, 2300));
    await getSignStatus();
    await $.wait(sudojia.getRandomWait(1500, 2300));
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/auth/account/user/info`, 'get', headers);
        if (!data.status) {
            return console.error(`获取用户信息失败：${data.error}`);
        }
        const {nickName, mobile} = data?.data;
        console.log(`${nickName}(${mobile})`);
        message += `${nickName}(${mobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 获取签到状态
 *
 * @return {Promise<void>}
 */
async function getSignStatus() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/member/sign/status`, 'get', headers);
        if (!data.status) {
            return console.error(`获取签到状态失败：${data.error}`);
        }
        if (data?.data.signed) {
            message += `今日已签到\n`;
            return console.error(`今日已签到`);
        }
        await $.wait(sudojia.getRandomWait(1500, 2300));
        await signIn();
    } catch (e) {
        console.error(`获取签到状态时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/member/daily/sign`, 'post', headers, {});
        if (!data.status) {
            return console.error(`签到失败：${data.error}`);
        }
        console.log(`签到成功，积分+${data?.data?.dailySign?.bonusPoint}`);
        message += `签到成功，积分+${data?.data?.dailySign?.bonusPoint}\n`;
    } catch (e) {
        console.error(`签到时发生异常：${formatRequestError(e)}`);
    }
}

/**
 * 获取积分
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/member/point`, 'get', headers);
        if (!data.status) {
            return console.error(`获取积分失败：${data.error}`);
        }
        console.log(`当前积分：${data?.data}`);
        message += `当前积分：${data?.data}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}

function formatRequestError(error) {
    const status = error?.response?.status;
    const contentType = String(error?.response?.headers?.['content-type'] || '');
    const responseBody = typeof error?.response?.data === 'string' ? error.response.data : '';
    if (status === 403 && (contentType.includes('text/html') || /<html[\s>]/i.test(responseBody))) {
        return 'HTTP 403：网关返回 WAF HTML，签到请求未被业务接口接受';
    }
    return [error?.message || String(error), status ? `HTTP ${status}` : ''].filter(Boolean).join(' ');
}
