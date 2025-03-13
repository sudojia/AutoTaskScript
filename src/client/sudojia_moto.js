/**
 * 摩托范 APP
 *
 * 抓包 Host：https://api.58moto.com 获取请求头 token 的值和 uid （token#uid）
 * export MOTO_TOKEN = 'f08xxxxxxxxxxxxxxxxx#22222222'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/27
 *
 * const $ = new Env('摩托范')
 * cron: 33 3 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('摩托范');
const moment = require("moment/moment");
const motoList = process.env.MOTO_TOKEN ? process.env.MOTO_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://api.58moto.com'
// 请求头
const headers = {
    'User-Agent': 'okhttp/4.11.0',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept-Encoding': 'gzip',
    'os': 'OPPO:OPPO+R9s',
    'osversion': '28',
    'referer': 'api.58moto.com',
    'version': '3.57.63',
    'timestamp': Date.now()
};

!(async () => {
    await checkUpdate($.name, motoList);
    for (let i = 0; i < motoList.length; i++) {
        const index = i + 1;
        const [token, uid] = motoList[i].split('#');
        headers.token = token;
        $.userId = uid;
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
    await isSign();
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
        const data = await sudojia.sendRequest(`${baseUrl}/user/center/info/v2/principal`, 'post', headers, `uid=${$.userId}`);
        if (data.code !== 0) {
            return $.log(data.msg);
        }
        const mobile = data.data.mobile;
        const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}` || '18888888888';
        console.log(`${data.data.nickname}(${hiddenMobile})`);
        message += `${data.data.nickname}(${mobile})\n`;
        headers.token = data.data.token;
    } catch (e) {
        console.error(`获取用户信息时发生异常：` + e);
    }
}

/**
 * 检测签到
 *
 * @returns {Promise<void>}
 */
async function isSign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/coins/task/v2/isSign?uid=${$.userId}`, 'get', headers);
        if (data.code !== 0) {
            return $.log(data.msg);
        }
        if (data.data.isSign) {
            message += `今日已签到\n`;
            return $.log(`今日已签到`);
        }
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        await sign();
    } catch (e) {
        console.error(`检测签到时发生异常：` + e);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/coins/task/dailyCheckIn`, 'post', headers, `uid=${$.userId}&weekDate=${moment().format('YYYYMMDD')}`);
        if (0 !== data.code) {
            return $.log(data.msg);
        }
        console.log(data.data.contentDesc || '签到成功');
        message += '签到成功\n';
    } catch (e) {
        console.error(`签到时发生异常：` + e);
    }
}

/**
 * 获取积分
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/coins/account/energy?uid=${$.userId}`, 'get', headers);
        if (data.code !== 0) {
            return $.log(data.msg);
        }
        console.log(`当前能量：${data.data.available}`);
        message += `当前能量：${data.data.available}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：` + e);
    }
}
