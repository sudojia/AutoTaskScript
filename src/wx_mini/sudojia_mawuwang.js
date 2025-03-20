/**
 * 微信小程序 - 馬伍旺饮料厂
 *
 * 抓包 URL：https://webapi.qmai.cn/web/seller/oauth/flash-sale-login 在响应体 Json 找到 token 和 user 下的 id, 用 # 分割
 * export MAWUW_TOKEN = 'token#id'
 * 多账号用 & 或换行
 *
 * 和霸王茶姬一样
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/01
 *
 * const $ = new Env('馬伍旺饮料厂')
 * cron: 48 6 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('馬伍旺饮料厂');
const mwwToken = process.env.MAWUW_TOKEN ? process.env.MAWUW_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://webapi.qmai.cn'
// AppId
const appId = 'wxc1381dc6f2213b72';
// 签到活动ID
const activityId = '1103263769176125440';
// 请求头
const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a1b)XWEB/11097',
    'content-type': 'application/json',
    'accept-encoding': 'gzip, deflate, br',
    'qm-from': 'wechat',
    'referer': `https://servicewechat.com/${appId}/26/page-frame.html`,
}

!(async () => {
    await checkUpdate($.name, mwwToken);
    for (let i = 0; i < mwwToken.length; i++) {
        const index = i + 1;
        const [token, uid] = mwwToken[i].split('#');
        headers['qm-user-token'] = token;
        $.userId = uid;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        const isLogin = await checkLogin();
        if (!isLogin) {
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
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await getSignInStatus();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await pointsInfo();
}

/**
 * 检测 Token
 *
 * @returns {Promise<*>}
 */
async function checkLogin() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/web/catering/crm/customer-center?appid=${appId}`, 'get', headers);
        return data.status;
    } catch (e) {
        console.error(`检测 Token 时发生异常：${e}`);
    }
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/web/catering/crm/personal-info`, 'get', headers, {
            appid: appId
        });
        if (data.status) {
            message += `${data.data.mobilePhone}\n`;
            console.log(`${$.nickName}登录成功~`);
        } else {
            console.error(data.message);
        }
    } catch (e) {
        console.error(`获取用户信息时发生异常：`, e);
    }
}

/**
 * 查询签到状态
 *
 * @return {Promise<void>}
 */
async function getSignInStatus() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/web/cmk-center/sign/userSignStatistics`, 'post', headers, {
            activityId: activityId,
            appid: appId,
        });
        if (data.status) {
            const {signDays, signStatus} = data.data;
            if (1 === signStatus) {
                console.log(`今天已经签到过了\n已连续签到${signDays}天`);
                message += `今天已经签到过了\n已连续签到${signDays}天\n`;
            } else {
                await $.wait(sudojia.getRandomWait(3e3, 5e3));
                await sign();
            }
        }
    } catch (e) {
        console.error('查询签到状态时发生异常：', e);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const times = new Date().getTime();
        const data = await sudojia.sendRequest(`${baseUrl}/web/cmk-center/sign/takePartInSign`, 'post', headers, {
            activityId: activityId,
            storeId: 215357,
            timestamp: times,
            signature: getSign(times, 10086),
            appid: appId,
        });
        if (data.status) {
            message += `签到成功\n`;
            console.log(`签到成功`);
        } else {
            console.error('签到失败：', data.message);
        }
    } catch (e) {
        console.error('签到时发生异常：', e);
    }
}

/**
 * 积分查询
 *
 * @return {Promise<void>}
 */
async function pointsInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/web/catering/crm/points-info`, 'post', headers, {
            appid: appId
        });
        if (data.status) {
            const {soonExpiredPoints, totalPoints, expiredTime} = data.data;
            message += `当前积分：${totalPoints}\n`;
            console.log(`当前积分：${totalPoints}`);
            soonExpiredPoints > 0 ? message += `${soonExpiredPoints}积分将在${expiredTime}失效\n\n` : message += `暂无过期积分\n\n`;
            soonExpiredPoints > 0 ? console.log(`${soonExpiredPoints}积分将在${expiredTime}失效`) : console.log(`暂无过期积分`);
        }
    } catch (e) {
        console.error('获取积分时发生异常：', e);
    }
}

function getSign(timestamp, userId) {
    const sellerId = 215357;
    const params = {
        activityId: activityId,
        sellerId: sellerId.toString(),
        timestamp: timestamp,
        userId: userId
    };
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
    }, {});
    const encodedParams = Object.entries(sortedParams).map(([key, value]) => {
        return key + "=" + value;
    }).join("&") + "&key=" + activityId.split("").reverse().join("");
    return sudojia.md5(encodedParams).toUpperCase();
}