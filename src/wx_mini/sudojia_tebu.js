/**
 * 特步会员中心小程序
 *
 * 抓包 URL：https://mall-mobile-v6.vecrp.com 获取请求头 token
 * export TEBU_TOKEN = 'eyJhxxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/20
 * @lastModifyTime: 2024/11/2
 *
 * const $ = new Env('特步会员中心')
 * cron: 26 10 * * *
 */
const initScript = require('../utils/initScript')
const moment = require("moment");
const {$, notify, sudojia, checkUpdate} = initScript('特步会员中心');
const tbList = process.env.TEBU_TOKEN ? process.env.TEBU_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://mall-mobile-v6.vecrp.com'
// 店铺ID
const shopId = '100656040';
// 活动ID
let activityId;
// 请求头
const headers = {
    "user-agent": sudojia.getRandomUserAgent(),
    'ts': Date.now(),
    'Content-Type': 'application/json;charset=UTF-8',
    'appid': 'wx12e1cb3b09a0e6f0',
    'Referer': 'https://servicewechat.com/wx12e1cb3b09a0e6f0/132/page-frame.html',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

!(async () => {
    await checkUpdate($.name, tbList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < tbList.length; i++) {
        const index = i + 1;
        headers.token = tbList[i];
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
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getActivityId();
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await sign();
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getMyBonusLogs();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mobile/customer/initMy?shopId=${shopId}`, 'get', headers);
        if (!data.success) {
            return console.error(data.msg);
        }
        const info = data.result.customer;
        const hiddenMobile = `${info.mobile.slice(0, 3)}***${info.mobile.slice(-3)}`;
        console.log(`${info.customerName}(${hiddenMobile})`);
        message += `${info.customerName}(${info.mobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 获取活动ID
 *
 * @returns {Promise<void>}
 */
async function getActivityId() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mobile/customer/queryMobilePersonCenterTemplateByShopId?shopId=${shopId}`, 'get', headers);
        if (!data.success) {
            return console.error(data.msg);
        }
        const component = data.result.views.find(item => item.componentId === 'WHXG8614883');
        if (!component) {
            return console.warn('未找到 componentId 为 WHXG8614883');
        }
        const getActivityId = component.defaultConfig.img.find(img => img.link && img.link.path === '/pages/ehd/activities/signIn/index');
        if (!getActivityId) {
            return console.warn('未找到 activityId');
        }
        activityId = getActivityId.link.id;
        console.log(`activityId 已更新：${activityId}`);
    } catch (e) {
        console.error(`获取活动ID时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mobile/activity/sign/sign`, 'post', headers, {
            "shopId": shopId,
            "activityId": activityId,
            "signDate": moment().format('YYYY-MM-DD')
        });
        if (!data.success) {
            return console.error(data.msg);
        }
        console.log(`签到成功，积分+${data.result.integral}`);
        message += `签到成功，积分+${data.result.integral}\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取积分详细
 *
 * @return {Promise<void>}
 */
async function getMyBonusLogs() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mobile/customer/getMyAllPoint?shopId=${shopId}`, 'get', headers);
        if (!data.success) {
            return console.error(data.msg);
        }
        console.log(`当前积分：${data.result[0].score}`);
        message += `当前积分：${data.result[0].score}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}
