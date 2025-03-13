/**
 * #小程序://媓钻/gANSWauVDzi4SPH
 *
 * 抓包 Host：https://api.hzyxhfp.com 获取请求头 Authorization 并且删掉 Bearer
 * export HZHFP_TOKEN = 'eyJ0exxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/18
 *
 * const $ = new Env('媓钻护肤品')
 * cron: 29 11 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('媓钻护肤品');
const hzhfpList = process.env.HZHFP_TOKEN ? process.env.HZHFP_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://api.hzyxhfp.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json;charset=UTF-8',
    'app': 'wx3df7476c42cace5d',
    'Accept': '*/*',
    'Referer': 'https://servicewechat.com/wx3df7476c42cace5d/377/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
    'Host': 'api.hzyxhfp.com',
};

!(async () => {
    await checkUpdate($.name, hzhfpList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < hzhfpList.length; i++) {
        const index = i + 1;
        headers.Authorization = `Bearer ${hzhfpList[i]}`;
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
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await signIn();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await getUserPoints();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/users/getUserDetailInfo`, 'post', headers);
        if (0 !== data.code) {
            return $.log(data.msg);
        }
        const phone = data.data.phone;
        const hiddenMobile = `${phone.slice(0, 3)}***${phone.slice(-3)}`;
        console.log(`${data.data.wx_nickname}(${hiddenMobile})`);
        message += `${data.data.wx_nickname}(${phone})\n`;
    } catch (e) {
        console.error('获取用户信息时发生异常：', e.response.data);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/signInLog/addSignIn`, 'post', headers);
        if (0 !== data.code) {
            message += `${data.msg}\n`;
            return $.log(data.msg);
        }
        console.log(`签到成功！已连续签到${data.data.cont_days}天`);
        message += `签到成功！已连续签到${data.data.cont_days}天\n`;
    } catch (e) {
        console.error('签到时发生异常：', e.response.data);
    }
}

/**
 * 获取用户积分
 *
 * @return {Promise<void>}
 */
async function getUserPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/userRight/getUserRightDetail`, 'post', headers);
        if (0 !== data.code) {
            return $.log(data.msg);
        }
        console.log(`当前积分：${data.data.integral}`);
        message += `当前积分：${data.data.integral}\n\n`;
    } catch (e) {
        console.error('获取积分时发生异常：', e.response.data);
    }
}
