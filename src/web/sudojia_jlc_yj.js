/**
 * 嘉立创硬件开源平台
 *
 * 奖励详情：https://github.com/sudojia/AutoTaskScript/issues/126
 * 官网：https://oshwhub.com/sign_in
 * 抓包 Host：https://oshwhub.com 获取 Cookie，全选复制
 * export JLC_COOKIE = 'oshwhub_session=xxx; acw_tc=xxx; oshwhub_csrf=xxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2025/01/02
 *
 * const $ = new Env('嘉立创硬件开源平台')
 * cron: 44 5 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('嘉立创硬件开源平台');
const jlcToken = process.env.JLC_COOKIE ? process.env.JLC_COOKIE.split(/[\n&]/) : [];
// 信息推送
let message = '';
// 接口地址
const baseUrl = 'https://oshwhub.com'
// 请求头
const headers = {
    'user-agent': sudojia.getRandomUserAgent('PC'),
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'zh-CN,zh;q=0.9,ko;q=0.8,en-US;q=0.7,en;q=0.6,zh-TW;q=0.5',
}

!(async () => {
    await checkUpdate($.name, jlcToken);
    for (let i = 0; i < jlcToken.length; i++) {
        const index = i + 1;
        headers.Cookie = jlcToken[i];
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
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await signIn();
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/users`, 'get', headers, '');
        if (!data.success) {
            console.error(data);
            return;
        }
        console.log(`昵称：${data.result.nickname}`);
        message += `昵称：${data.result.nickname}\n`;
        $.userId = data.result.uuid;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/users/signIn`, 'post', headers, {
            "_t": Date.now(),
        });
        if (!data.success) {
            message += `签到失败：${data}\n`;
            return console.error(data);
        }
        console.log(`签到成功`);
        message += `签到成功\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/users`, 'get', headers, '');
        if (!data.success) {
            console.error(data);
            return;
        }
        console.log(`当前积分：${data.result.points}`);
        message += `当前积分：${data.result.points}\n\n`;
    } catch (e) {
        console.error(`获取当前积分时发生异常：${e}`);
    }
}
