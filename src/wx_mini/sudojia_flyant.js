/**
 * #小程序://旧衣回收/IWrTpDtQnqapMlm
 *
 * 每日签到、抽奖、兑换步数、早起打卡
 *
 * 抓包 Host：https://openapp.fmy90.com 获取请求头 authorization 的值（删掉 bearer）
 * export FLY_ANT_TOKEN = 'eyJ0eXAiOixxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/10/04
 *
 * const $ = new Env('飞蚂蚁旧衣回收')
 * cron: 0 6 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('飞蚂蚁旧衣回收');
const flyAntList = process.env.FLY_ANT_TOKEN ? process.env.FLY_ANT_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 参数信息
const version = 'V2.00.01', platformKey = 'F2EE24892FBF66F0AFF8C0EB532A9394';
// 接口地址
const baseUrl = 'https://openapp.fmy90.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'content-type': 'application/json;charset=utf8',
    'sec-fetch-site': 'cross-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://servicewechat.com/wx501990400906c9ff/426/page-frame.html',
    'accept-language': 'zh-CN,zh;q=0.9'
};

!(async () => {
    await checkUpdate($.name, flyAntList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < flyAntList.length; i++) {
        const index = i + 1;
        headers.authorization = `bearer ${flyAntList[i]}`;
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
    // 早起打卡
    await betSign();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    // 签到
    await sign();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    // 签到天数
    await getContinuaDays();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    // 获取积分
    await getPoints();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    // 步数兑换
    await exchange();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    // 抽奖
    await draw();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    // 报名
    await bet();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/sign/new/do`, 'post', headers, {
            "version": version,
            "platformKey": platformKey,
            "mini_scene": 1356,
            "partner_ext_infos": ""
        });
        if (200 !== data.code) {
            return console.error(`签到失败：${data.message}`);
        }
        console.log(`签到成功`);
        message += `签到成功\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取连续签到天数
 *
 * @returns {Promise<void>}
 */
async function getContinuaDays() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/shop/get-sign-bean-task-nav?version=${version}&platformKey=${platformKey}&mini_scene=1256&partner_ext_infos=`, 'get', headers);
        if (200 !== data.code) {
            return console.error(`获取连续签到天数失败：${data.message}`);
        }
        console.log(`已连续签到：${data.data.sign_data.continuaDays}天`);
        message += `已连续签到：${data.data.sign_data.continuaDays}天\n`;
    } catch (e) {
        console.error(`获取连续签到天数时发生异常：${e}`);
    }
}

/**
 * 获取积分
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        let data = await sudojia.sendRequest(`${baseUrl}/user/new/beans/info?type=1&version=${version}&platformKey=${platformKey}&mini_scene=1256&partner_ext_infos=`, 'get', headers);
        if (200 !== data.code) {
            return console.error(`获取环保豆失败：${data.message}`);
        }
        // 总获取的环保豆
        const getTotalCount = data.data.totalCount;
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        data = await sudojia.sendRequest(`${baseUrl}/user/new/beans/info?type=2&version=${version}&platformKey=${platformKey}&mini_scene=1256&partner_ext_infos=`, 'get', headers);
        if (200 !== data.code) {
            return console.error(`获取环保豆失败：${data.message}`);
        }
        // 已使用的环保豆
        const useTotalCount = data.data.totalCount;
        // 当前环保豆
        $.currentBean = getTotalCount - useTotalCount;
        console.log(`已获取：${getTotalCount}环保豆`);
        console.log(`已使用：${useTotalCount}环保豆`);
        console.log(`当前剩余：${$.currentBean}环保豆`);
        message += `已获取：${getTotalCount}环保豆\n`;
        message += `已使用：${useTotalCount}环保豆\n`;
        message += `当前剩余：${$.currentBean}环保豆\n`;
    } catch (e) {
        console.error(`获取环保豆时发生异常：${e}`);
    }
}

/**
 * 兑换步数
 *
 * @returns {Promise<void>}
 */
async function exchange() {
    try {
        for (let i = 1; i <= 3; i++) {
            console.log(`第${i}次步数兑换...`);
            await $.wait(sudojia.getRandomWait(1e3, 2e3));
            const data = await sudojia.sendRequest(`${baseUrl}/step/exchange`, 'post', headers, {
                "steps": sudojia.getRandomWait(1500, 3200),
                "version": version,
                "platformKey": platformKey,
                "mini_scene": 1356,
                "partner_ext_infos": ""
            });
            if (200 !== data.code || '兑换成功' !== data.message) {
                return console.error(`步数兑换失败：${data.message}`);
            }
            console.log('步数兑换成功！\n');
        }
    } catch (e) {
        console.error(`步数兑换时发生异常：${e}`);
    }
}

/**
 * 抽奖
 *
 * @returns {Promise<void>}
 */
async function draw() {
    try {
        if ($.currentBean < 10) {
            return console.error(`环保豆不足10，跳过抽奖任务...`);
        }
        const data = await sudojia.sendRequest(`${baseUrl}/active/turntable/go`, 'post', headers, {
            "active_id": "1",
            "version": version,
            "platformKey": platformKey,
            "mini_scene": 1356,
            "partner_ext_infos": ""
        });
        if (200 !== data.code) {
            return console.error(`抽奖失败：${data.message}`);
        }
        console.log(`抽奖成功，获得【${data.data.prizeName}】`);
        message += `抽奖成功，获得【${data.data.prizeName}】\n`;
    } catch (e) {
        console.error(`抽奖时发生异常：${e}`);
    }
}

/**
 * 早起打卡
 *
 * @returns {Promise<void>}
 */
async function betSign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/active/pool/sign`, 'post', headers, {
            "active_id": "1",
            "version": version,
            "platformKey": platformKey,
            "mini_scene": 1356,
            "partner_ext_infos": ""
        });
        if (200 !== data.code) {
            message += `早起打卡失败：${data.message}\n\n`;
            return console.error(`早起打卡失败：${data.message}`);
        }
        console.log(`早起打卡成功：${data.message}`);
        message += `早起打卡成功：${data.message}\n`;
    } catch (e) {
        console.error(`早起打卡时发生异常：${e}`);
    }
}

/**
 * 早起报名
 *
 * @returns {Promise<void>}
 */
async function bet() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/active/pool/bet`, 'post', headers, {
            "active_id": "1",
            "version": version,
            "platformKey": platformKey,
            "mini_scene": 1356,
            "partner_ext_infos": ""
        });
        if (200 !== data.code) {
            message += `早起报名失败：${data.message}\n`;
            return console.error(`早起报名失败：${data.message}`);
        }
        message += `早起报名成功，${data.message}\n`;
        console.log(`早起报名成功，${data.message}`);
    } catch (e) {
        console.error(`早起报名时发生异常：${e}`);
    }
}
