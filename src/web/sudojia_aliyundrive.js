/**
 * 阿里云盘每日签到
 *
 * 移除了获取奖励, 目前仅支持签到
 * export ALI_REFRESH_TOKEN = 'xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/5/18
 *
 * const $ = new Env('阿里云盘签到')
 * cron: 35 10 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('阿里云盘签到');
// 环境变量
const refreshTokenList = process.env.ALI_REFRESH_TOKEN ? process.env.ALI_REFRESH_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 阿里云盘 API 配置
const API_CONFIG = {
    "SIGN_IN_API": "https://member.aliyundrive.com/v1/activity/sign_in_list",
    "GET_REWARD_API": "https://member.aliyundrive.com/v1/activity/sign_in_reward?_rx-s=mobile",
    "ACCESS_TOKEN_API": "https://auth.aliyundrive.com/v2/account/token"
}

!(async () => {
    await checkUpdate($.name, refreshTokenList);
    for (let i = 0; i < refreshTokenList.length; i++) {
        const index = i + 1;
        const refreshToken = refreshTokenList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main(refreshToken);
        await $.wait(sudojia.getRandomWait(2300, 2800));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main(refreshToken) {
    const accessToken = await getAccessToken(refreshToken);
    if (!accessToken) {
        console.log('获取access_token失败, refresh_token可能有误');
        return;
    }
    await $.wait(sudojia.getRandomWait(1200, 2000));
    const signInCount = await AliSignIn(refreshToken, accessToken);
    // await $.wait(1000);
    // await getReward(accessToken, signInCount);
}

/**
 * 获取 access_token
 *
 * @returns {Promise<void>}
 */
async function getAccessToken(refreshToken) {
    try {
        const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }
        const data = await sudojia.sendRequest(API_CONFIG.ACCESS_TOKEN_API, 'post', {}, params);
        if (!data.access_token) {
            console.log('获取access_token失败, refresh_token可能有误');
            process.exit(0);
        }
        message += `【用户昵称】${data.nick_name}(${data.user_name})\n`;
        return data.access_token;
    } catch (e) {
        $.logErr('获取access_token接口异常：', e);
        return null;
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function AliSignIn(refreshToken, accessToken) {
    try {
        const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
        const data = await sudojia.sendRequest(API_CONFIG.SIGN_IN_API, 'post', headers, params);
        console.log(data.success ? '签到成功\n' : '签到失败\n');
        message += data.success ? '【签到状态】签到成功\n' : '【签到状态】签到失败\n'
        message += `【签到统计】已累计签到${data.result.signInCount}天\n\n`;
        // 返回签到天数
        return data.result.signInCount;
    } catch (e) {
        $.logErr('请求签到接口异常：', e);
        return null;
    }
}

/**
 * 获取签到奖励
 *
 * @returns {Promise<void>}
 */
async function getReward(accessToken, signInCount) {
    const params = {
        signInDay: signInCount
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    }
    const data = await sudojia.sendRequest(API_CONFIG.GET_REWARD_API, 'post', headers, params);
    console.log(`奖励: ${data.result.notice}\n`);
    message += `【签到奖励】${data.result.notice}\n`
}
