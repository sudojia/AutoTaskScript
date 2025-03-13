/**
 * 所有女生会员服务中心小程序
 *
 * 抓包 Host：7.wawo.cc 获取请求头 AccessToken 的值
 * export ALL_GIRLS_TOKEN = 'xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/09
 *
 * const $ = new Env('所有女生')
 * cron: 19 16 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('所有女生');
const girlsList = process.env.ALL_GIRLS_TOKEN ? process.env.ALL_GIRLS_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://7.wawo.cc'
// 请求头
const headers = {
    'user-agent': sudojia.getRandomUserAgent(),
    'accept-encoding': 'gzip, deflate, br',
    'referer': 'https://servicewechat.com/wx7d1403fe84339669/1076/page-frame.html',
    'content-type': 'application/json',
    'accept': '*/*',
};

!(async () => {
    await checkUpdate($.name, girlsList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < girlsList.length; i++) {
        const index = i + 1;
        headers.AccessToken = girlsList[i];
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
    await $.wait(sudojia.getRandomWait(800, 1200));
    await signStatus();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/account/wx/member/base`, 'get', headers);
        if ('000' !== data.code) {
            console.error(`获取用户信息失败：${data.message}`);
            return;
        }
        $.nickName = data.data.nickName;
        $.cardNo = data.data.cardNo;
        console.log(`[${$.nickName}]登录成功~`);
        message += `昵称：${$.nickName}\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 签到状态
 *
 * @return {Promise<void>}
 */
async function signStatus() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/activity/wx/task/sign/signMsg`, 'post', headers, {cardNo: $.cardNo,});
        if ('000' !== data.code) {
            console.error(`查询签到状态失败：${data.message}`);
            return;
        }
        if (1 === data.data.signed) {
            // 已签到
            console.log('已签到，无需重复签到');
            message += '已签到，无需重复签到\n';
            await $.wait(sudojia.getRandomWait(800, 1100));
            await getPoints();
            return;
        }
        await $.wait(sudojia.getRandomWait(800, 1100));
        await sign();
    } catch (e) {
        console.error(`查询签到状态时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/activity/wx/task/sign/signIn`, 'post', headers);
        if ('000' === data.code && data.data.success) {
            console.log('签到成功！');
            message += `签到成功！\n`;
            await $.wait(sudojia.getRandomWait(800, 1200));
            await getPoints();
        } else console.error(`签到失败：${data.message}`);
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取积分
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/score/wx/score/queryAmount`, 'get', headers);
        if ('000' !== data.code) {
            console.error(`获取积分失败：${data.message}`);
            return;
        }
        message += `当前积分：${data.data}\n\n`;
        console.log(`当前积分：${data.data}`);
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}
