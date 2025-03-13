/**
 * #小程序://兴攀农场/6gUCIC3zCrcW5wg
 *
 * 每日签到及种树游戏
 * 抓包 Host：https://p.xpfarm.cn 获取请求头 authorization
 * export XPFARM_TOKEN = 'dc45xxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/21
 *
 * const $ = new Env('兴攀农场')
 * cron: 50 11,18 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('兴攀农场');
const xpfarmList = process.env.XPFARM_TOKEN ? process.env.XPFARM_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://p.xpfarm.cn'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'xweb_xhr': '1',
    'Accept': '*/*',
    'Referer': 'https://servicewechat.com/wx27e219ff3142b7c8/63/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
};

!(async () => {
    await checkUpdate($.name, xpfarmList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < xpfarmList.length; i++) {
        const index = i + 1;
        headers.authorization = xpfarmList[i];
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
    await $.wait(sudojia.getRandomWait(1000, 2000));
    await getSignInInfo();
    await $.wait(sudojia.getRandomWait(1000, 2000));
    for (let i = 1; i < 17; i++) {
        await completeTask(i);
        await $.wait(sudojia.getRandomWait(1500, 2200));
        await receiveTaskReward(i);
        await $.wait(sudojia.getRandomWait(800, 1100));
    }
    await $.wait(sudojia.getRandomWait(1000, 2000));
    await getPoints();
    await $.wait(sudojia.getRandomWait(1000, 2000));
    await addFertilizer();
    await $.wait(sudojia.getRandomWait(1000, 2000));
    await addWater();
    await $.wait(sudojia.getRandomWait(1000, 2000));
    await getHomePage();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/treemp/user.PersonalCenter/getInfo`, 'post', headers);
        if (1000 !== data.code) {
            return $.log(data.message);
        }
        const mobile = data.data.mobile;
        const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}`;
        console.log(`${data.data.nickname}(${hiddenMobile})`);
        message += `${data.data.nickname}(${mobile})\n`;
    } catch (e) {
        console.error('获取用户信息时发生异常：' + e.response.data);
    }
}

/**
 * 获取签到信息
 *
 * @return {Promise<void>}
 */
async function getSignInInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/treemp/user.PersonalCenter/getSigninInfo`, 'post', headers);
        if (1000 !== data.code) {
            return $.log(data.message);
        }
        const isSignInToday = data.data.isSignInToday;
        if (0 !== isSignInToday) {
            console.log('今日已签到！');
            message += `今日已签到\n`;
            return;
        }
        await $.wait(sudojia.getRandomWait(1000, 1700));
        await sign();
    } catch (e) {
        console.error('获取签到信息时发生异常：' + e.response.data);

    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/treemp/user.PersonalCenter/addSignIn`, 'post', headers);
        if (1000 !== data.code) {
            return $.log(data.message);
        }
        console.log(`签到成功！积分+${data.data.reward.integral}`);
        message += `签到成功\n`;
    } catch (e) {
        console.error('签到时发生异常：' + e.response.data);
    }
}

/**
 * 获取积分
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/treemp/user.PersonalCenter/getInfo`, 'post', headers);
        if (1000 !== data.code) {
            return $.log(data.message);
        }
        console.log(`当前积分：${data.data.integral}`);
        message += `当前积分：${data.data.integral}\n`;
    } catch (e) {
        console.error('获取积分时发生异常：' + e.response.data);
    }
}

/**
 * 完成任务
 *
 * @param taskId 2: 看广告
 * @return {Promise<void>}
 */
async function completeTask(taskId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/treemp/tree.Tasks/completeTask`, 'post', headers, {
            "task_id": taskId
        });
        if (1000 !== data.code) {
            return console.error(`任务ID[${taskId}], ${data.message}`);
        }
        console.log(`任务ID[${taskId}], ${data.message}`);
    } catch (e) {
        console.error('完成任务时发生异常：' + e.response.data);
    }
}

/**
 * 领取奖励
 *
 * @param taskId
 * @return {Promise<void>}
 */
async function receiveTaskReward(taskId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/treemp/tree.Tasks/receiveTaskReward`, 'post', headers, {
            "task_id": taskId
        });
        if (1000 !== data.code) {
            return console.error(`领取任务ID[${taskId}]奖励失败 -> ${data.message}`);
        }
        console.log(`领取任务ID[${taskId}]奖励成功 -> ${data.message}`);
        console.log(`获得${data.data.reward[0].reward_type_name}X${data.data.reward[0].reward}`);
    } catch (e) {
        console.error('领取奖励时发生异常：' + e.response.data);
    }
}

/**
 * 添加肥料
 *
 * @return {Promise<void>}
 */
async function addFertilizer() {
    try {
        console.log(`开始施肥...`);
        let data = await sudojia.sendRequest(`${baseUrl}/treemp/tree.Tasks/addFertilizer`, 'post', headers, {
            "type": 0
        });
        if (1000 !== data.code) {
            return $.log(data.message);
        }
        // 肥料袋
        let ferValue = data.data.fertilizer_value;
        // 肥力
        let fer = data.data.fertilizer;
        while (ferValue > 0) {
            data = await sudojia.sendRequest(`${baseUrl}/treemp/tree.Tasks/addFertilizer`, 'post', headers, {
                "type": 0
            });
            await $.wait(sudojia.getRandomWait(1500, 2500));
            if (1000 !== data.code) {
                break;
            }
            ferValue = data.data.fertilizer_value;
            fer = data.data.fertilizer;
            console.log(`总肥力：${fer}，剩余肥料袋：${ferValue}`);
        }
    } catch (e) {
        console.error('施肥时发生异常：' + e.response.data);
    }
}

/**
 * 添加浇水
 *
 * @return {Promise<void>}
 */
async function addWater() {
    try {
        console.log(`开始浇水...`);
        let data = await sudojia.sendRequest(`${baseUrl}/treemp/tree.Tasks/addWater`, 'post', headers);
        if (1000 !== data.code) {
            return $.log(data.message);
        }
        // 浇水次数
        let water = data.data.water_value;
        // 肥力
        let fer = data.data.fertilizer;
        while (water > 10) {
            data = await sudojia.sendRequest(`${baseUrl}/treemp/tree.Tasks/addWater`, 'post', headers);
            await $.wait(sudojia.getRandomWait(1500, 2500));
            if (1000 !== data.code) {
                return $.log(data.message);
            }
            water = data.data.water_value;
            fer = data.data.fertilizer;
            console.log(`剩余水滴：${water}💧, 剩余肥力：${fer}`);
        }
    } catch (e) {
        console.error('浇水时发生异常：' + e.response.data);
    }
}

/**
 * 获取种子状态
 *
 * @return {Promise<void>}
 */
async function getHomePage() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/treemp/tree.Tasks/getHomePage`, 'post', headers);
        if (1000 !== data.code) {
            return $.log(data.message);
        }
        console.log(`当前进度：${data.data.type_name}(${data.data.growth_level}%)，剩余水滴：${data.data.water_value}💧，剩余肥力：${data.data.fertilizer}`);
        message += `当前进度：${data.data.type_name}(${data.data.growth_level}%)，剩余水滴：${data.data.water_value}💧，剩余肥力：${data.data.fertilizer}\n\n`;
    } catch (e) {
        console.error('获取种子状态时发生异常：' + e.response.data);
    }
}
