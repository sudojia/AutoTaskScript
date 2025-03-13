/**
 * #小程序://开天工作室/cBFFdQoybN35EEh
 *
 * 抓包 Host：https://api.box.vipinfinity.com 获取请求头 Authorization 的值
 * export KTGZS_TOKEN = 'vqGjEixxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/19
 *
 * const $ = new Env('开天工作室')
 * cron: 33 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('开天工作室');
const ktgzsList = process.env.KTGZS_TOKEN ? process.env.KTGZS_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://api.box.vipinfinity.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Accept-Encoding': 'gzip, deflate, br',
    'Client-Name': 'default',
    'Referer': 'https://servicewechat.com/wxa1ff7cf5ddff1da2/9/page-frame.html',
    'Client-Type': 'wechat--miniapp-windows',
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Host': 'api.box.vipinfinity.com',
};

!(async () => {
    await checkUpdate($.name, ktgzsList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < ktgzsList.length; i++) {
        const index = i + 1;
        headers.Authorization = ktgzsList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
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
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await sign();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await pointsInfo();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/user`, 'get', headers);
        if (0 !== data.code) {
            return $.log(data.message);
        }
        const {name, phone} = data.data.user
        console.log(`${name}(${phone})`);
        message += `${name}(${phone})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：`, e.response.data);
    }
}

/**
 * 签到
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/sign-in`, 'post', headers);
        if (0 !== data.code) {
            return $.log(data.message);
        }
        const {continuous_days, award_score} = data.data;
        console.log(`签到成功，积分+${award_score}`);
        console.log(`已连续签到${continuous_days}天`);
        message += `签到成功\n已连续签到${continuous_days}天\n`;
    } catch (e) {
        console.error(`签到时发生异常：`, e.response.data);
    }
}

/**
 * 查询积分
 *
 * @return {Promise<void>}
 */
async function pointsInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/asset-records/score?page=1&per_page=20`, 'get', headers);
        if (0 !== data.code) {
            return $.log(data.message);
        }
        console.log(`当前积分：${data.data.list[0].after}`);
        message += `当前积分：${data.data.list[0].after}\n\n`;
    } catch (e) {
        console.error(`积分查询时发生异常：`, e.response.data);
    }
}
