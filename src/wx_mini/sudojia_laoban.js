/**
 * 老板电器服务微商城
 *
 * 抓包 Host：https://vip.foxech.com 在请求 Body 参数中获取 openid 的值（不是在请求头哈）
 * export LAOBAN_OPENID = 'tAXnPxxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/19
 *
 * const $ = new Env('老板电器服务微商城')
 * cron: 15 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('老板电器服务微商城');
const lbList = process.env.LAOBAN_OPENID ? process.env.LAOBAN_OPENID.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://vip.foxech.com'
// 请求头
const headers = {
    'Host': 'vip.foxech.com',
    'User-Agent': sudojia.getRandomUserAgent(),
    "xweb_xhr": "1",
    'Content-Type': 'application/json',
    'Accept': '*/*',
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    'Referer': 'https://servicewechat.com/wxc8c90950cf4546f6/157/page-frame.html',
};

!(async () => {
    await checkUpdate($.name, lbList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < lbList.length; i++) {
        const index = i + 1;
        $.openId = lbList[i];
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
    await $.wait(sudojia.getRandomWait(1300, 2000));
    await getSignWeek();
    await $.wait(sudojia.getRandomWait(1300, 2000));
    await doTask();
    await $.wait(sudojia.getRandomWait(1300, 2000));
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/member/get_member_info`, 'post', headers, getToken());
        if ('200' !== data.code) {
            console.error(data.msg);
            return;
        }
        const nickName = data.data.info.nickname;
        const mobile = data.data.info.mobile;
        console.log(`昵称：${nickName}`);
        message += `${nickName}(${mobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}


/**
 * 获取每周签到状态
 *
 * @return {Promise<void>}
 */
async function getSignWeek() {
    try {
        const jsonData = getToken();
        delete jsonData.is_need_sync;
        const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/member/get_sign_week`, 'post', headers, jsonData);
        if ('200' !== data.code) {
            console.error(data.msg);
            return;
        }
        const {day: signDay, list: dataList} = data.data;
        console.log(`已累计签到${signDay}天`);
        message += `已累计签到${signDay}天\n`;
        const nowDay = new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + String(new Date().getDate()).padStart(2, '0');
        const todayRecord = dataList.find(list => list.date === nowDay);
        if (todayRecord) {
            if (0 === todayRecord.is_sign) {
                await $.wait(sudojia.getRandomWait(1000, 1500));
                await userSign();
            } else if (todayRecord.is_sign === 1) {
                console.log('今日已经签到过了！');
                message += '今日已经签到过了！\n';
            }
        } else {
            console.error('todayRecord 数据为空');
        }
        if (signDay >= 7) {
            await getSignPrizeList();
        }
    } catch (e) {
        console.error(`获取每周签到状态时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function userSign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/member/user_sign`, 'post', headers, getToken());
        if ('200' !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log(`签到成功，积分+${data.data.score}`);
        message += `签到成功，积分+${data.data.score}\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取连续签到奖励列表
 *
 * @return {Promise<void>}
 */
async function getSignPrizeList() {
    try {
        const jsonData = getToken();
        delete jsonData.is_need_sync;
        const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/member/get_sign_prize_list`, 'post', headers, jsonData);
        if ('200' !== data.code) {
            console.error(data.msg);
            return;
        }
        const {list: dataList} = data.data;
        for (const list of dataList) {
            await $.wait(sudojia.getRandomWait(1000, 1500));
            switch (list.status) {
                case 1:
                    console.log(`开始领取【${list.title}】积分奖励`);
                    await getSignPrize(list.id, list.title);
                    break;
                case 2:
                    console.log(`【${list.title}】奖励已经领取过了`);
                    break;
                case 0:
                    console.log(`【${list.title}】奖励还未达到指定天数，继续签到吧！`);
                    break;
            }
        }
    } catch (e) {
        console.error(`获取连续签到奖励列表时发生异常：${e}`);
    }
}

/**
 * 领取连续签到奖励
 *
 * @param id 奖励 id
 * @param title 奖励标题
 * @return {Promise<void>}
 */
async function getSignPrize(id, title) {
    try {
        const jsonData = getToken();
        jsonData.id = id;
        delete jsonData.is_need_sync;
        const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/member/get_sign_prize`, 'post', headers, jsonData);
        if ('200' !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log(`领取【${title}】奖励成功，积分+${data.data.score}`);
        message += `领取【${title}】奖励成功，积分+${data.data.score}\n`;
    } catch (e) {
        console.error(`领取连续签到奖励时发生异常：${e}`);
    }
}

/**
 * 做任务
 *
 * @return {Promise<void>}
 */
async function doTask() {
    const jsonData = getToken();
    jsonData.page = 1;
    jsonData.limit = 10000;
    delete jsonData.is_need_sync;

    const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/member/get_member_score_mission_list`, 'post', headers, jsonData);
    if ('200' !== data.code) {
        console.error(data.msg);
        return;
    }
    const taskList = data.data.list.filter(task => [7, 8, 12].includes(task.id));
    for (const task of taskList) {
        const {id, title, isOver} = task;
        if (1 === isOver) {
            console.log(`${title}任务已完成`);
            continue;
        }
        console.log(`开始${title}任务...`);
        await $.wait(sudojia.getRandomWait(1500, 2500));
        await taskAction(id);
    }
}

/**
 * 根据任务 id 做任务
 *
 * @param id
 * @return {Promise<void>}
 */
async function taskAction(id) {
    switch (id) {
        case 7:
            // 浏览三个商品
            await performListAction('get_goods_list');
            break;
        case 8:
            // 逛秒杀, 待完善
            console.log('秒杀任务好像关闭了，暂时注释');
            // await performListAction('get_ms_list');
            break;
        case 12:
            await performListAction('get_news_list');
            break;
    }
}

/**
 * 获取要浏览的列表
 *
 * @param actionType
 * @return {Promise<void>}
 */
async function performListAction(actionType) {
    const types = {
        'get_goods_list': {page: 1, limit: 20, category: 3},
        // 'get_ms_list': {page: 1, limit: 20, category: 4},
        'get_news_list': {page: 1, list: 20, category: 4, flag: 1}
    };
    const config = types[actionType];
    const jsonData = getToken();
    Object.assign(jsonData, config);
    delete jsonData.is_need_sync;

    const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/common/${actionType}`, 'post', headers, jsonData);
    const list = data.data.list;
    for (let i = 0; i < 3; i++) {
        const item = list[Math.floor(Math.random() * list.length)];
        await detail(item.id, actionType);
    }
}

/**
 * 浏览任务
 *
 * @param id
 * @param actionType
 * @return {Promise<void>}
 */
async function detail(id, actionType) {
    const jsonData = getToken();
    jsonData.id = id;
    delete jsonData.is_need_sync;
    if ('get_goods_list' === actionType) {
        jsonData.is_act = '';
    }
    const type = actionType.replace('list', 'detail');
    const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/common/${type}`, 'post', headers, jsonData);
    await $.wait(sudojia.getRandomWait(5000, 6000));
    const info = data.data.info;
    console.log(`浏览${info.title}成功！`);
}

/**
 * 获取积分
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const jsonData = getToken();
        delete jsonData.is_need_sync
        const data = await sudojia.sendRequest(`${baseUrl}/index.php/api/member/sync_crm_member_score`, 'post', headers, jsonData);
        if ('200' !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log(`当前积分：${data.data.userinfo.score}`);
        message += `当前积分：${data.data.userinfo.score}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}

/**
 * 获取请求头参数
 *
 * @return {{openid: *, is_need_sync: number, timestamp: number, token: string}}
 */
function getToken() {
    const currentTimestampMs = Date.now();
    const rawString = `${currentTimestampMs}ae1fd50f${$.openId}`;
    return {
        is_need_sync: 1,
        timestamp: currentTimestampMs,
        token: sudojia.md5(rawString),
        openid: $.openId
    }
}
