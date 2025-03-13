/**
 * #小程序://胖哥俩肉蟹煲/R6ANaXRZmnBeLSB
 *
 * 抓包 Host：https://saash5.namek.com.cn 获取请求头 token
 * export PANG_GE_TOKEN = '1158xxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/03
 *
 * const $ = new Env('胖哥俩肉蟹煲')
 * cron: 19 6 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('胖哥俩肉蟹煲');
const pangGeList = process.env.PANG_GE_TOKEN ? process.env.PANG_GE_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://saash5.namek.com.cn'
// 请求头
const headers = {
    'deviceWidth': '414',
    'clientVersionType': '1',
    'serviceId': 'namek-saas-web-page',
    'accessPageType': '2',
    'pageCatetory': '2',
    'guidePageType': '13',
    'deviceHeight': '780',
    'clientVersion': '3.13.8',
    'tenantId': 24,
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://servicewechat.com/wxe61905cae01a6c7d/81/page-frame.html',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

!(async () => {
    await checkUpdate($.name, pangGeList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < pangGeList.length; i++) {
        const index = i + 1;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        headers.token = pangGeList[i]
        const member = await checkLogin();
        if (!member) {
            console.error(`Token 已失效`);
            await notify.sendNotify(`「Token失效通知」`, `${$.name}账号[${index}] Token 已失效，请重新登录获取 Token\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await checkInStatus();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getUserPoints();
}

/**
 * 检测登录状态
 *
 * @returns {Promise<*>}
 */
async function checkLogin() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}//api/v1/member/info/byToken?tenantId=24&agreementVer=`, 'get', getSignHeader());
        if (0 !== data.header.code) {
            console.error(data.header.message);
            return;
        }
        return data.body.member;
    } catch (e) {
        console.error(`检测登录状态接口请求失败，请检查网络问题：`, e);
    }
}

/**
 * 获取用户信息
 *
 * @return {Promise<*>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}//api/v1/member/index/personal?needPoints=1&needBalance=0&needCouponCount=1&needActivityCount=1&needFrozenState=0`, 'get', getSignHeader());
        if (0 !== data.header.code) {
            return console.error('获取用户信息失败 ->', data.header.message);
        }
        $.userId = data.body.member.id;
        const {nickname, phone} = data.body.member;
        const hiddenMobile = `${phone.slice(0, 3)}***${phone.slice(-3)}` || '18888888888';
        console.log(`${nickname}(${hiddenMobile})`);
        message += `${nickname}(${phone})\n`;
    } catch (e) {
        console.error(`获取用户信息接口请求失败，请检查网络问题：`, e);
    }
}

/**
 * 检测签到状态
 *
 * @returns {Promise<void>}
 */
async function checkInStatus() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}//api/v1/ope/checkin/100135/member?totalSignDayList=`, 'get', getSignHeader());
        if (0 !== data.header.code) {
            return console.error('获取签到状态失败 ->', data.header.message);
        }
        console.log(`已连续签到[${data.body.signContinuedCount}]天, 累计签到[${data.body.signTotalCount}]天`);
        message += `已连续签到[${data.body.signContinuedCount}]天, 累计签到[${data.body.signTotalCount}]天\n`;
        if (data.body.isSignToday) {
            console.log(`今日已签到！`);
            message += `今日已签到！\n`;
            return;
        }
        console.log('开始签到...');
        await $.wait(sudojia.getRandomWait(1200, 2000));
        await sign();
    } catch (e) {
        console.error(`获取签到状态接口请求失败，请检查网络问题：`, e);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}//api/v1/ope/checkin/member/sign`, 'post', getSignHeader());
        if (0 !== data.header.code) {
            return console.error('签到失败 ->', data.header.message);
        }
        console.log(`签到成功，积分+${data.body.getPoint}`);
        message += `签到成功\n`;
    } catch (e) {
        console.error(`签到接口请求失败，请检查网络问题：`, e);
    }
}

/**
 * 获取用户积分
 *
 * @returns {Promise<void>}
 */
async function getUserPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}//api/v1/member/115824951/points/changed/list?startIndex=0&pageCount=20&shopId=24&memberId=${$.userId}`, 'get', getSignHeader());
        if (0 !== data.header.code) {
            return console.error('获取积分失败 ->', data.header.message);
        }
        console.log(`当前积分：${data.body.points}`);
        message += `当前积分：${data.body.points}\n\n`;
    } catch (e) {
        console.error(`获取积分接口请求失败，请检查网络问题：`, e);
    }
}

/**
 * 生成随机字符串
 *
 * @returns {string}
 */
function genNonce() {
    const digits = `174088${Math.floor(100000 + Math.random() * 900000)}`;
    const letters = Array.from({length: 16}, () =>
        String.fromCharCode(Math.random() < 0.5 ?
            Math.floor(Math.random() * 26) + 65 :
            Math.floor(Math.random() * 26) + 97
        )
    ).join('');
    return digits + letters;
}

/**
 * 获取签名请求头
 *
 * @returns {{deviceWidth: string, clientVersionType: string, "User-Agent": string, Referer: string, sign: string, "Accept-Encoding": string, clientVersion: string, nonce: string, pageCatetory: string, deviceHeight: string, tenantId: number, "Accept-Language": string, serviceId: string, accessPageType: string, guidePageType: string, "Content-Type": string, timestamp: number}}
 */
function getSignHeader() {
    const timestamp = Date.now();
    const nonceStr = genNonce();
    return {
        ...headers,
        'timestamp': timestamp,
        'nonce': nonceStr,
        'sign': sudojia.md5(`nonce=${nonceStr}&tenantId=24&timestamp=${timestamp}&token=${headers.token}udHw9173SheXhd`),
    };
}