/**
 * 奈雪点单小程序
 *
 * 抓包 Host：tm-api.pin-dao.cn，请求头的 Authorization（删掉 Bearer）
 * export NAIXUE_TOKEN = 'xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/4
 *
 * const $ = new Env('奈雪点单')
 * cron: 36 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('奈雪点单');
const crypto = require('crypto');
const naiXueList = process.env.NAIXUE_TOKEN ? process.env.NAIXUE_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://tm-web.pin-dao.cn'
// openId
const openId = 'QL6ZOftGzbziPlZwfiXM';

!(async () => {
    await checkUpdate($.name, naiXueList);
    for (let i = 0; i < naiXueList.length; i++) {
        const index = i + 1;
        $.token = naiXueList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        const isLogin = await baseUserInfo();
        if (!isLogin) {
            console.error(`Token 已失效`);
            await notify.sendNotify(`「Token失效通知」`, `${$.name}账号[${index}] Token 已失效，请重新登录获取 Token\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        message += `${$.nickName}(${$.mobile})\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await queryAndHandleSignIn();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await queryUserCoin();
}

/**
 * 获取用户信息
 *
 * @return {Promise<boolean>}
 */
async function baseUserInfo() {
    try {
        const data = await sendRequest({
            method: 'post',
            url: `${baseUrl}/user/base-userinfo`,
            body: {}
        });
        if (0 === data.code) {
            $.mobile = data.data.phone;
            $.userId = data.data.userId;
            $.nickName = data.data.nickName;
            const hiddenMobile = `${$.mobile.slice(0, 3)}***${$.mobile.slice(-3)}`;
            console.log(`${$.nickName}(${hiddenMobile})`);
            return true;
        } else {
            console.error(`获取用户信息失败：${data.message}`);
            return false;
        }
    } catch (error) {
        console.error(`获取用户信息时发生异常：${error}`);
        return false;
    }
}

/**
 * 查询签到状态
 *
 * @return {Promise<void>}
 */
async function queryAndHandleSignIn() {
    try {
        const now = new Date();
        // signDateStr：获取当月第一天 \ nowDate：获取当天
        const signDate = new Date(now.getFullYear(), now.getMonth(), 1), signDateStr = formatDate(signDate),
            nowDate = formatDate(now);
        const data = await sendRequest({
            method: 'post',
            url: `${baseUrl}/user/sign/records`,
            body: {
                signDate: signDateStr, startDate: nowDate
            }
        });
        if (0 !== data.code) {
            console.error(`查询签到状态失败：${data.message}`);
            return;
        }
        // 签到天数
        $.signCount = data.data.signCount;
        console.log(`签到状态：${data.data.status ? '已签到' : '未签到'}`);
        if (data.data.status) {
            message += `今日已签到\n`
            console.log('跳过签到...');
            return;
        }
        console.log('开始签到...');
        await $.wait(sudojia.getRandomWait(1500, 2500));
        await performSignIn(nowDate);
    } catch (e) {
        console.error(`查询签到状态时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @param nowDate 当前日期
 * @return {Promise<void>}
 */
async function performSignIn(nowDate) {
    try {
        const data = await sendRequest({
            method: 'post',
            url: `${baseUrl}/user/sign/save`,
            body: {
                signDate: nowDate
            }
        });
        if (0 === data.code) {
            console.log(`${data.data.flag ? '签到成功' : 'flag 显示为 false，请打开小程序检查签到状态'}`)
            message += `${data.data.flag ? '签到成功' : 'flag 显示为 false，请打开小程序检查签到状态'}\n`;
        } else {
            console.error(`签到失败：${data.message}`);
        }
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 查询奈雪币
 *
 * @return {Promise<void>}
 */
async function queryUserCoin() {
    try {
        const data = await sendRequest({
            method: 'post',
            url: `${baseUrl}/user/account/user-account`,
            body: {}
        });
        if (0 === data.code) {
            const coin = data.data.coin;
            console.log(`当前奈雪币：${coin}`);
            message += `当前奈雪币：${coin}\n已连续签到${$.signCount}天\n\n`;
        } else console.error(`查询奈雪币失败：${data.message}`);
    } catch (e) {
        console.error(`查询奈雪币时发生异常：${e}`);
    }
}

/**
 * 获取请求体
 */
async function getBody() {
    const nonce = await randomString();
    const timestamp = Math.floor(Date.now() / 1000);
    const urlPath = `nonce=${nonce}&openId=${openId}&timestamp=${timestamp}`;
    // https://tm-web-cdn.pin-dao.cn/static/js/1.b718167c.chunk.js
    // var u = t.params && 26000252 === t.params.brand && c && t.common && "wxapp" === t.common.platform ? "sArMTldQ9tqU19XIRDMWz7BO5WaeBnrezA" : "iYkcDMF8Eti255hti5M629RQTQ4Z2XihG";
    const hmacDigest = crypto.createHmac('sha1', 'sArMTldQ9tqU19XIRDMWz7BO5WaeBnrezA')
        .update(urlPath)
        .digest();
    const signature = Buffer.from(hmacDigest).toString('base64');
    const common = {
        platform: 'wxapp',
        version: '5.2.38',
        imei: '',
        osn: 'microsoft',
        sv: 'Windows 10 x64',
        lang: 'zh_CN',
        currency: 'CNY',
        timeZone: '',
        nonce,
        openId,
        timestamp,
        signature
    };
    const params = {
        businessType: 1,
        brand: 26000252,
        tenantId: 1,
        channel: 2,
        stallType: null,
        storeId: '',
        storeType: '',
        cityId: '',
        appId: 'wxab7430e6e8b9a4ab'
    };
    return {
        common,
        params
    };
}

/**
 * 请求接口
 *
 * @param apiOptions
 * @return {Promise<*>}
 */
async function sendRequest(apiOptions) {
    const {method = 'GET', url, body = {}, headers = {}} = apiOptions;
    const requestBody = await getBody();
    requestBody.params = {...requestBody.params, ...body};
    const fullUrl = new URL(url);
    if (apiOptions.queryParam) {
        for (const [k, v] of Object.entries(apiOptions.queryParam)) {
            fullUrl.searchParams.append(k, v);
        }
    }
    const requestHeaders = {
        Host: fullUrl.hostname,
        Connection: 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/6945',
        Authorization: `Bearer ${$.token}`,
        Referer: `${baseUrl}/`,
        Origin: `${baseUrl}`,
        ...headers
    };
    if (method.toUpperCase() !== 'GET') {
        requestHeaders['Content-Type'] = 'application/json';
    }
    return sudojia.sendRequest(fullUrl.href, method, requestHeaders, requestBody);
}

/**
 * 随机字符串
 *
 * @param length
 * @param chars
 * @return {Promise<string>}
 */
async function randomString(length = 6, chars = '123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 日期格式化
 *
 * @param date
 * @return {string}
 */
function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
