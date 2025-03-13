/**
 * 美的会员小程序
 *
 * 抓包 Host：https://mvip.midea.cn 获取请求头 Cookie 的值
 * export MIDEA_COOKIE = 'xxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/21
 *
 * const $ = new Env('美的会员')
 * cron: 33 11 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('美的会员');
const mideaList = process.env.MIDEA_COOKIE ? process.env.MIDEA_COOKIE.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://mvip.midea.cn'
// 请求头
const headers = {
    'Host': 'mvip.midea.cn',
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': 'https://servicewechat.com/wx03925a39ca94b161/437/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
};

!(async () => {
    await checkUpdate($.name, mideaList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < mideaList.length; i++) {
        const index = i + 1;
        headers.Cookie = mideaList[i];
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
    await $.wait(sudojia.getRandomWait(1300, 2000));
    await sign();
    await $.wait(sudojia.getRandomWait(1300, 2000));
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/next/mucuserinfo/getmucuserinfo`, 'get', headers);
        if (0 === data.errcode) {
            const mobile = data.data.userinfo.Mobile;
            // 当前等级
            const levelName = data.data.userinfo.LevelName;
            const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}`;
            console.log(`${levelName}(${hiddenMobile})登录成功~`);
            message += `${levelName}(${mobile})\n`;
        } else {
            console.log(JSON.stringify(data));
        }
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/my/score/create_daily_score`, 'get', headers);
        if (0 === data.errcode) {
            console.log('签到成功！');
            message += `签到成功！\n`;
        } else {
            console.log(JSON.stringify(data));
            message += `今日已签到！\n`;
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
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/my/muc/get_growth_status`, 'get', headers);
        if (0 === data.errcode) {
            console.log(`当前积分：${data.data.vipPoint}\n成长值：${data.data.vipGrow}`);
            message += `当前积分：${data.data.vipPoint}\n成长值：${data.data.vipGrow}\n\n`;
        } else {
            console.log(JSON.stringify(data));
        }
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}
