/**
 * #小程序://薇诺娜专柜商城/fHmvJS57pgeOFCJ
 *
 * 抓包 Host：https://api.qiumeiapp.com 获取请求体 appUserToken
 * export WNNA_TOKEN = '40c8xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/10/01
 *
 * const $ = new Env('薇诺娜专柜商城')
 * cron: 39 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('薇诺娜专柜商城');
const moment = require("moment");
const wnnList = process.env.WNNA_TOKEN ? process.env.WNNA_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://api.qiumeiapp.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'https://servicewechat.com/wx250394ab3f680bfa/599/page-frame.html',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

!(async () => {
    await checkUpdate($.name, wnnList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < wnnList.length; i++) {
        const index = i + 1;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        $.userToken = wnnList[i] || '';
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getZgSigninCalendarNew();
    await $.wait(sudojia.getRandomWait(1500, 2500));
    await getUserInfo();
}

/**
 * 获取签到状态
 *
 * @returns {Promise<void>}
 */

async function getZgSigninCalendarNew() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/zg-activity/zg-daily/getZgSigninCalendarNew`, 'post', headers, `appUserToken=${$.userToken}`);
        if (200 !== data.code) {
            return console.error(`获取签到状态失败：${data.msg}`);
        }
        const isSign = data.data.currentMonth.signinList.find(d => d.date === moment().format('D'))
        if (1 === isSign.isSignin) {
            message += '今天已经签过到了\n';
            return console.error('今天已经签过到了');
        }
        await $.wait(sudojia.getRandomWait(1500, 2500));
        await signIn();
    } catch (e) {
        console.error('获取签到状态时发生异常 ->', e.response.data);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/zg-activity/zg-daily/zgSigninNew`, 'post', headers, `appUserToken=${$.userToken}`);
        if (200 !== data.code) {
            return console.error(`签到失败：${data.msg}`);
        }
        console.log(`签到成功`);
        console.log(`已连续签到${data.data.signinCount}天`);
        message += `签到成功\n已连续签到${data.data.signinCount}天\n`;
    } catch (e) {
        console.error('签到时发生异常 ->', e.response.data);
    }
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/zgxcx/10001/getZgUserInfo`, 'post', headers, `zgUserToken=${$.userToken}`);
        if (200 !== data.code) {
            return console.error(`获取用户信息失败：${data.msg}`);
        }
        console.log(`${data.data.nickname}(${data.data.levelName})`);
        console.log(`当前积分：${data.data.winonaPoint}`);
        message += `${data.data.nickname}(${data.data.levelName})\n当前积分：${data.data.winonaPoint}\n\n`;
    } catch (e) {
        console.error('获取用户信息时发生异常 ->', e.response.data);
    }
}
