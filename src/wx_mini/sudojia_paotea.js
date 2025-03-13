/**
 * 爷爷不泡茶
 * #小程序://爷爷不泡茶/gv0jvm4SRgYkqMJ
 *
 * 抓包 Host：https://webapi.qmai.cn 获取请求头 qm-user-token
 * export PAO_TEA_TOKEN = 'token#activityId&token2&token3'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/10/03
 *
 * const $ = new Env('爷爷不泡茶')
 * cron: 30 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('爷爷不泡茶');
const paoTeaList = process.env.PAO_TEA_TOKEN ? process.env.PAO_TEA_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://webapi.qmai.cn'
// AppId
const appId = 'wx3423ef0c7b7f19af';
// 请求头
const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a1b)XWEB/11097',
    'Content-Type': 'application/json',
    'store-id': '216652',
    'qm-from': 'wechat',
    'scene': '1145',
    'referer': `https://servicewechat.com/${appId}/49/page-frame.html`
}
!(async () => {
    await checkUpdate($.name, paoTeaList);
    for (let i = 0; i < paoTeaList.length; i++) {
        let activityId;
        const [token, firstActivityId] = paoTeaList[i].split('#');
        activityId = firstActivityId || (paoTeaList[0].split('#')[1] || '1078694295517364225');
        const index = i + 1;
        headers['qm-user-token'] = token;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        const isLogin = await checkLogin();
        if (!isLogin) {
            console.error(`Token 已失效`);
            await notify.sendNotify(`「Token失效通知」`, `${$.name}账号[${index}] Token 已失效，请重新登录获取 Token\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main(activityId);
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main(activityId) {
    await queryNewSign(activityId);
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await querySignDays(activityId);
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
        const data = await sudojia.sendRequest(`${baseUrl}/web/catering2-apiserver/crm/customer-center?appid=${appId}`, 'get', headers);
        return data.status;
    } catch (e) {
        console.error(`检测 Token 时发生异常：${e}`);
    }
}


/**
 * 查询新版签到
 *
 * @return {Promise<void>}
 */
async function queryNewSign(activityId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/web/cmk-center/sign/userSignStatistics`, 'post', headers, {
            "activityId": activityId,
            "appid": appId
        });
        if (data.status) {
            const {signStatus} = data.data;
            if (1 === signStatus) {
                console.log(`今天已经签到过了`);
                message += `今天已经签到过了\n`;
                return;
            }
            await $.wait(sudojia.getRandomWait(3e3, 5e3));
            await newSign(activityId);
        }
    } catch (e) {
        console.error('查询签到接口请求失败：', e);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function newSign(activityId) {
    try {
        const times = new Date().getTime();
        const data = await sudojia.sendRequest(`${baseUrl}/web/cmk-center/sign/takePartInSign`, 'post', headers, {
            "activityId": activityId,
            "storeId": 216652,
            "timestamp": times,
            "appid": appId
        });
        if (data.status) {
            message += `签到成功\n`;
            console.log(`签到成功`);
        } else {
            console.error('签到失败：', data.message);
        }
    } catch (e) {
        console.error('签到接口请求失败：', e);
    }
}

async function querySignDays(activityId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/web/cmk-center/sign/userSignStatistics`, 'post', headers, {
            "activityId": activityId,
            "appid": appId
        });
        if (!data.status) {
            return console.error(`获取签到天数失败：${data}`);
        }
        let {signDays, rewardList} = data.data;
        console.log(`已连续签到[${signDays}]天`);
        let found = false;
        for (const reward of rewardList) {
            if (reward.signNum > signDays) {
                const daysToNextStage = reward.signNum - signDays;
                const rewardName = reward.rewardList[0].rewardName;
                console.log(`下一阶段奖励[${rewardName}]还需签到[${daysToNextStage}]天`);
                message += `下一阶段奖励[${rewardName}]还需签到[${daysToNextStage}]天\n`;
                found = true;
                break;
            }
        }
        if (!found) {
            console.log("已达到所有签到奖励阶段！");
        }
    } catch (e) {
        console.error('查询新版接口请求失败：', e);
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
            soonExpiredPoints > 0 ? message += `${soonExpiredPoints}积分将在${expiredTime}失效\n\n`
                : message += `暂无过期积分\n\n`;
        }
    } catch (e) {
        console.error('积分查询接口请求失败：', e);
    }
}
