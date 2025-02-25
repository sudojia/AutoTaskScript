/**
 * #小程序://龙湖天街/pi5MO0UC9oQJ49D
 *
 * 抓包 Host：https://gw2c-hw-open.longfor.com 获取请求头 token 的值
 * export LONG_FOR_TOKEN = '8b465xxxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * 作者号黑了，而且基本也没跑过，所以懒得修复了，解密版本放出来，有能力的自行改一改，就几个接口，抓抓包改改就好了
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/18
 *
 * const $ = new Env('龙湖天街')
 * cron: 39 8 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia} = initScript('龙湖天街');
const longForList = process.env.LONG_FOR_TOKEN ? process.env.LONG_FOR_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://gw2c-hw-open.longfor.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept-Language': 'zh-CN,zh;q=0.9',
};
// 签到抽奖的key
const API_KEY = '2f9e3889-91d9-4684-8ff5-24d881438eaf';
const BU_CODE = 'L00502';
const DX_RISK_SOURCE = 1;
const DX_RISK_CAPTCHA_TOKEN = 'undefined';
const CHANNEL = 'L0';
// 签到活动ID
const ACTIVITY_NO_SIGN = '11111111111736501868255956070000';
// 抽奖活动ID
const ACTIVITY_NO_LOTTERY = 'AP258011N6GVNDNT';

!(async () => {
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < longForList.length; i++) {
        const index = i + 1;
        headers.token = longForList[i];
        // headers.lmToken = longForList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main();
        await $.wait(sudojia.getRandomWait(2e3, 3e3));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await sign()
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await lotterySign();
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await lottery();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const headerCp = JSON.parse(JSON.stringify(headers));
        headerCp['X-Gaia-Api-Key'] = '646fce29-3a77-462a-aabe-0fe77bc3023f';
        const data = await sudojia.sendRequest(`${baseUrl}/riyuehu-miniapp-prod/service/ryh/user/info`, 'post', headerCp, {
            "data": {
                "projectId": "B379F9F1-C176-4925-B6F6-92555AC62E61"
            }
        });
        console.log(`${data.data.nickName}(${data.data.mobile})`);
        message += `${data.data.nickName}(${data.data.mobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常:`, e.response.data);
    }
}

/**
 * 每日签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/lmarketing-task-api-mvc-prod/openapi/task/v1/signature/clock`, 'post', prepareHeaders(), {
            "activity_no": ACTIVITY_NO_SIGN
        });
        if ('0000' !== data.code) {
            return console.error(`签到失败 ->`, data);
        }
        data.data.is_popup === 1 ? console.log(`签到成功！成长值+${data.data.reward_info[0].reward_num}`) : console.log(`今日已签到`);
        data.data.is_popup === 1 ? message += `签到成功！成长值+${data.data.reward_info[0].reward_num}\n` : message += `今日已签到\n`;
    } catch (e) {
        console.error(`签到时发生异常:`, e.response.data);
    }
}

/**
 * 签到抽奖
 *
 * @returns {Promise<void>}
 */
async function lotterySign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/lmarketing-task-api-mvc-prod/openapi/task/v1/lottery/sign`, 'post', prepareHeaders(), {
            "activity_no": ACTIVITY_NO_LOTTERY,
            "task_id": ""
        });
        if ('0000' !== data.code) {
            return console.error(`抽奖签到失败 ->`, data);
        }
        console.log(`抽奖签到成功，获得${data.data.ticket_times}次抽奖机会`);
        message += `抽奖签到成功\n`
    } catch (e) {
        console.error(`抽奖签到时发生异常:`, e.response.data);
    }
}

/**
 * 抽奖
 *
 * @returns {Promise<void>}
 */
async function lottery() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/lmarketing-task-api-mvc-prod/openapi/task/v1/lottery/luck`, 'post', prepareHeaders(), {
            "activity_no": ACTIVITY_NO_LOTTERY,
            "task_id": ""
        });
        if ('0000' !== data.code) {
            return console.error(`抽奖失败`, data);
        }
        console.log(`抽奖成功，获得${data.data.desc}`);
        message += `抽奖成功，获得${data.data.desc}\n\n`;
    } catch (e) {
        console.error(`抽奖时发生异常:`, e.response.data);
    }
}

function prepareHeaders() {
    const headerCp = JSON.parse(JSON.stringify(headers));
    headerCp['X-Gaia-Api-Key'] = API_KEY;
    headerCp['X-LF-UserToken'] = headers.token;
    headerCp['X-LF-Bu-Code'] = BU_CODE;
    headerCp['X-LF-DXRisk-Source'] = DX_RISK_SOURCE;
    headerCp['X-LF-DXRisk-Captcha-Token'] = DX_RISK_CAPTCHA_TOKEN;
    headerCp['X-LF-Channel'] = CHANNEL;
    return headerCp;
}
