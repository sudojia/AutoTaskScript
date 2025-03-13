/**
 * OPPO商城 APP
 *
 * 打开抓包、进入我的 - 签到任务
 * 抓包 URL：https://hd.opposhop.cn/api/cn/oapi/users/web/member/check?unpaid=0 获取 Cookie 和 User-Agent
 * export OPPOSHOP_COOKIE = 'xxxxxxxxx'
 * export OPPO_USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; xxxxxxxxx'
 * export OPPO_ACTIVITY_IDS = '签到活动ID#任务列表活动ID'
 * OPPO Activity ID 获取说明：https://rh-docs.netlify.app/docs/list/client/opposhop/#%E8%8E%B7%E5%8F%96%E8%AF%B4%E6%98%8E
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/23
 *
 * const $ = new Env('OPPO商城')
 * cron: 25 12 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('OPPO商城');
const oppoList = process.env.OPPOSHOP_COOKIE ? process.env.OPPOSHOP_COOKIE.split(/[\n&]/) : [];
// UserAgent 配置
const UserAgent = process.env.OPPO_USER_AGENT;
// const UserAgent = 'Mozilla/5.0 (Linux; Android 9; OPPO R9s Build/PQ3A.190605.07291528; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36 oppostore/402700 ColorOS/ brand/OPPO model/OPPO R9s;kyc/h5face;kyc/2.0;netType:NETWORK_WIFI;appVersion:402700;packageName:com.oppo.store';
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://hd.opposhop.cn'
// 活动集合ID，签到活动ID#任务列表活动ID
const activityIdsFromEnv = process.env.OPPO_ACTIVITY_IDS || '1838147945355288576#1838149802563739648';
// 按照 # 分割字符串
const activityIds = activityIdsFromEnv.split('#');
// 签到活动ID
const signActivityId = activityIds[0] || '1838147945355288576';
// 任务列表活动ID
const taskActivityId = activityIds[1] || '1838149802563739648';
// 判断User-Agent
if (!UserAgent) {
    console.error('请先填写OPPO商城的 User-Agent、变量名【OPPO_USER_AGENT】');
    process.exit(0);
}
// 请求头
const headers = {
    'Host': 'hd.opposhop.cn',
    'User-Agent': UserAgent,
    'Accept-Encoding': 'gzip, deflate',
};
// 签到天数对应奖励ID
const signInDaysMap = {
    1327: 3,
    1328: 5,
    1329: 10,
    1330: 15
};

!(async () => {
    await checkUpdate($.name, oppoList);
    for (let i = 0; i < oppoList.length; i++) {
        const index = i + 1;
        $.signDayNum = 1;
        headers.Cookie = oppoList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        if (!await isLogin()) {
            console.error('Cookie 已失效');
            await notify.sendNotify(`「Cookie失效通知」`, `${$.name}账号[${index}] Cookie 已失效，请重新登录获取 Cookie\n\n`);
            continue;
        }
        await $.wait(sudojia.getRandomWait(800, 1200))
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo()
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getSignInStatus();
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getSignDays();
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getTaskList();
    // 领取累计签到奖励
    console.log(`当前累计签到[${$.signDayNum}]天\n`);
    for (const [awardId, days] of Object.entries(signInDaysMap)) {
        // 只有签到天数达到才领取
        if ($.signDayNum >= days) {
            console.log(`开始领取[${days}]天累计签到奖励`);
            await $.wait(sudojia.getRandomWait(1e3, 2e3));
            await receiveSignInAward(parseInt(awardId));
        } else {
            console.log(`不满足${days}天，跳过领取`)
            await $.wait(sudojia.getRandomWait(1e3, 2e3));
        }
    }
}

/**
 * 检测 Cookie 是否有效
 * @returns {Promise<boolean>}
 */
async function isLogin() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/task/isLogin`, 'get', headers);
        return 403 !== data.code;
    } catch (e) {
        console.error(`检测 Cookie 是否有效时发生异常 -> `, e);
    }
}

/**
 * 获取用户信息
 *
 * @return {Promise<boolean>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/users/web/member/check?unpaid=0`, 'get', headers);
        if (data.data) {
            console.log(`OPPO会员：${data.data.name}`);
            message += `OPPO会员：${data.data.name}\n`;
        }
    } catch (e) {
        console.error(`获取用户信息时发生异常 -> `, e);
    }
}

/**
 * 获取签到状态
 *
 * @returns {Promise<void>}
 */
async function getSignInStatus() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/cumulativeSignIn/getSignInDetail?activityId=${signActivityId}`, 'get', headers);
        if (data.data) {
            if (data.data.todaySignIn) {
                console.log('今日已签到');
                message += `今日已签到\n`;
                return;
            }
            await $.wait(sudojia.getRandomWait(1200, 1800));
            await sign();
        } else {
            console.error('获取签到状态失败 -> ', data);
        }
    } catch (e) {
        console.error(`获取签到状态时发生异常 -> `, e);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/cumulativeSignIn/signIn`, 'post', headers, {
            "activityId": signActivityId
        });
        if (data.data) {
            console.log(`签到成功，积分+${data.data.awardValue}`);
            message += `签到成功\n`;
        } else {
            console.error('签到失败 -> ', data);
        }
    } catch (e) {
        console.error(`签到时发生异常 -> `, e);
    }
}

/**
 * 获取签到天数
 *
 * @returns {Promise<void>}
 */
async function getSignDays() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/cumulativeSignIn/getSignInDetail?activityId=${signActivityId}`, 'get', headers);
        if (data.data) {
            $.signDayNum = data.data.signInDayNum;
            console.log(`已连续签到${$.signDayNum}天`);
            message += `已连续签到${$.signDayNum}天\n`;
        } else {
            console.error('获取签到天数失败 -> ', data);
        }
    } catch (e) {
        console.error(`获取签到天数时发生异常 -> `, e);
    }
}

/**
 * 获取任务列表
 *
 * @returns {Promise<void>}
 */
async function getTaskList() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/task/queryTaskList?activityId=${taskActivityId}&source=c`, 'get', headers);
        if (data.data) {
            const taskList = data.data.taskDTOList;
            for (const task of taskList) {
                // 排除黑卡和购物
                if (6 === task.taskType) {
                    continue;
                }
                console.log(`开始[${task.taskName}]任务...`);
                await $.wait(sudojia.getRandomWait(1000, 1500));

                await completeTask(task.taskId, task.activityId);
                await $.wait(sudojia.getRandomWait(2e3, 4e3));

                await receiveAward(task.taskName, task.taskId, task.activityId);
                await $.wait(sudojia.getRandomWait(1e3, 2e3));
            }
            message += `\n`;
        } else {
            console.error('获取任务列表失败 -> ', data.message);
        }
    } catch (e) {
        console.error(`获取任务列表时发生异常 -> `, e);
    }
}

/**
 * 完成任务
 *
 * @param taskId
 * @param activityId
 *
 * @returns {Promise<void>}
 */
async function completeTask(taskId, activityId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/taskReport/signInOrShareTask?taskId=${taskId}&activityId=${activityId}&taskType=1`, 'get', headers);
        if (data.data) {
            console.log(`${data.message}`);
        } else {
            console.error('操作失败 -> ', data.message);
        }
    } catch (e) {
        console.error(`完成任务时发生异常 -> `, e);
    }
}

/**
 * 领取奖励
 *
 * @param taskName
 * @param taskId
 * @param activityId
 * @returns {Promise<void>}
 */
async function receiveAward(taskName, taskId, activityId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/task/receiveAward?taskId=${taskId}&activityId=${activityId}`, 'get', headers);
        if (data.data) {
            message += `完成[${taskName}]任务，积分+${data.data.awardValue}\n`;
            console.log(`领取成功，积分+${data.data.awardValue}`);
        } else {
            console.error('领取失败 -> ', data.message);
        }
    } catch (e) {
        console.error(`领取奖励时发生异常 -> `, e);
    }
}

/**
 * 领取连续签到奖励
 *
 * @param awardId 1327: 3天奖励
 *                1328: 5天奖励
 *                1329: 10天奖励
 *                1330: 15天奖励
 *
 * @returns {Promise<void>}
 */
async function receiveSignInAward(awardId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/cn/oapi/marketing/cumulativeSignIn/drawCumulativeAward`, 'post', headers, {
            "activityId": signActivityId,
            "awardId": awardId
        });
        if (data.data) {
            const days = signInDaysMap[awardId] || '未知';
            const awardValue = data.data.awardValue;
            if (awardValue.trim().length > 0) {
                console.log(`领取累计${days}天奖励成功，获得[${awardValue}]积分\n`);
            } else {
                console.log(`领取累计${days}天奖励成功，获得[${awardValue}]\n`);
            }
        } else {
            console.error('领取连续签到奖励失败 -> ', data.message);
        }
    } catch (e) {
        console.error(`领取连续签到奖励时发生异常 -> `, e);
    }
}
