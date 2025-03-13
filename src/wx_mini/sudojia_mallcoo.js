/**
 * 欣都龙城小程序
 *
 * 抓包 Host：https://m.mallcoo.cn 随便找一个 url，在 Body 中获取 Token 的值
 * export MALLCOO_TOKEN = '_Fl34xxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/22
 *
 * const $ = new Env('欣都龙城')
 * cron: 48 10 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('欣都龙城');
const mallcooList = process.env.MALLCOO_TOKEN ? process.env.MALLCOO_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://m.mallcoo.cn'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': 'https://servicewechat.com/wx7ef63cf605a639fb/18/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
};
// 请求体
let getBody = {
    "MallId": 10144,
    "Header": {
        "systemInfo": {
            "model": "microsoft",
            "SDKVersion": "3.5.0",
            "system": "Windows 11 x64",
            "version": "3.9.10",
            "miniVersion": "2.67.7"
        }
    }
}

!(async () => {
    await checkUpdate($.name, mallcooList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < mallcooList.length; i++) {
        const index = i + 1;
        $.isLogin = true;
        getBody.Header.Token = mallcooList[i];
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
    if (!$.isLogin) {
        console.error('用户token错误或已过期');
        process.exit(0);
    }
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await checkinBefore();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getPoints();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getCheckinDetail();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getUserExpiredBonus();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/user/GetUserAndMallCard`, 'post', headers, getBody);
        if (1 === data.m) {
            console.log(`昵称：${data.d.NickName}`);
            message += `昵称：${data.d.NickName}\n`;
        } else {
            if (320 === data.m) {
                $.isLogin = false;
                return;
            }
            console.log(data);
        }
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 检测签到状态
 *
 * @return {Promise<void>}
 */
async function checkinBefore() {
    try {
        let body = JSON.parse(JSON.stringify(getBody));
        body.IsCheckMemberCard = true;
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/user/CheckinBefore`, 'post', headers, body);
        if (1 === data.m) {
            if (!data.d.IsCheckIn) {
                await $.wait(sudojia.getRandomWait(2000, 2500));
                await signIn();
            }
        } else {
            console.error(data.e);
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
async function signIn() {
    try {
        let body = JSON.parse(JSON.stringify(getBody));
        delete body.MallId
        body.MallID = 10144;
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/User/CheckinV2`, 'post', headers, body);
        if (1 === data.m) {
            console.log(`签到成功，积分+${data.d.Content}`);
            message += `签到成功，积分+${data.d.Content}\n`;
        } else {
            console.log(data.e);
            message += `${data.e}\n`;
        }
    } catch (e) {

    }
}

/**
 * 获取积分信息
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        let body = JSON.parse(JSON.stringify(getBody));
        delete body.MallId
        body.MallID = 10144;
        body.PageIndex = 1;
        body.PageSize = 10;
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/Bonus/GetBonusHistoryList`, 'post', headers, body);
        if (1 === data.m) {
            console.log(`当前积分：${data.d.TotalBonus}`);
            message += `当前积分：${data.d.TotalBonus}\n`;
        } else {
            console.log(data.e);
        }
    } catch (e) {
        console.error(`获取积分信息时发生异常：${e}`);
    }
}

/**
 * 获取签到天数
 *
 * @return {Promise<void>}
 */
async function getCheckinDetail() {
    try {
        let body = JSON.parse(JSON.stringify(getBody));
        delete body.MallId
        body.MallID = 10144;
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/User/GetCheckinDetail`, 'post', headers, body);
        if (1 === data.m) {
            console.log(`已连续签到${data.d.ContinueDay}天`);
            message += `已连续签到${data.d.ContinueDay}天\n`;
        } else {
            console.log(data.e);
        }
    } catch (e) {
        console.error(`获取签到天数时发生异常：${e}`);
    }
}

/**
 * 获取过期积分
 *
 * @return {Promise<void>}
 */
async function getUserExpiredBonus() {
    try {
        let body = JSON.parse(JSON.stringify(getBody));
        delete body.MallId
        body.MallID = 10144;
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/Bonus/GetUserExpiredBonus`, 'post', headers, body);
        if (1 === data.m) {
            console.log(`${data.d.ExpiredBounsTips}`);
            message += `${data.d.ExpiredBounsTips}\n\n`;
        } else {
            console.log(data.e);
        }
    } catch (e) {
        console.error(`获取过期积分时发生异常：${e}`);
    }
}
