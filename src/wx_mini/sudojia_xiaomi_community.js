/**
 * 微信小程序：小米社区
 *
 * 每日签到获得成长值
 *
 * 抓包 Host：https://api.vip.miui.com 获取请求头 Cookie
 * export XIAOMI_COMM_COOKIE = 'serviceToken=xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2025/04/27
 *
 * const $ = new Env('小米社区-小程序')
 * cron: 48 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('小米社区-小程序');
const xiaoMiComGeList = process.env.XIAOMI_COMM_COOKIE ? process.env.XIAOMI_COMM_COOKIE.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://api.vip.miui.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Accept': 'application/json, text/plain, */*',
    'xweb_xhr': '1',
    'Origin': 'https://servicewechat.com',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'https://servicewechat.com/wx240a4a764023c444/3/page-frame.html',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

!(async () => {
    await checkUpdate($.name, xiaoMiComGeList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < xiaoMiComGeList.length; i++) {
        const index = i + 1;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        headers.Cookie = xiaoMiComGeList[i]
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
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await sign();
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await getPoints();
}

async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mtop/planet/lite/userinfo`, 'get', headers);
        if (200 !== data.status) {
            return console.error(`获取用户信息失败：${data.message}`);
        }
        const {username, userId} = data?.entity;
        console.log(`${username}(${userId})`);
        message += `${username}(${userId})\n`;
    } catch (e) {
        console.error(`获取用户接口请求失败:`, e.response.data);
    }
}

async function sign() {
    try {
        const miuiVipPh = headers.Cookie.match(/miui_vip_ph=([^;]+)/)[1];
        if (!miuiVipPh) {
            return console.error(`未找到 miui_vip_ph`);
        }
        const data = await sudojia.sendRequest(`${baseUrl}/mtop/planet/vip/member/addCommunityGrowUpPointByActionV2?miui_vip_ph=${encodeURIComponent(miuiVipPh)}`, 'post', headers, 'action=WECHAT_CHECKIN_TASK');
        if (200 !== data.status) {
            message += `${data.message} -> 如果加分失败，说明签到过了\n`;
            return console.error(`签到失败：${data.message}`);
        }
        console.log(`签到成功，积分+${data?.entity?.score}`);
        message += `签到成功，积分+${data?.entity?.score}\n`;
    } catch (e) {
        console.error(`签到接口请求失败:`, e.response.data);
    }
}

async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mtop/planet/wechat/growup/points/detail`, 'get', headers);
        if (200 !== data.status) {
            return console.error(`获取积分失败：${data.message}`);
        }
        const totalPoints = (data?.entity || []).reduce((sum, item) => {
            const points = parseInt(item.jumpText.replace(/\D/g, ''), 10);
            return sum + (isNaN(points) ? 0 : points);
        }, 0);
        console.log(`当前成长值: ${totalPoints}`);
        message += `当前成长值: ${totalPoints}\n\n`;
    } catch (e) {
        console.error(`获取成长值接口请求失败:`, e.response.data);
    }
}