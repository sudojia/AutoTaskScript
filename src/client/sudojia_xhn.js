/**
 * 新湖南 APP
 *
 * 开发不易，作者专属邀请码：RWY6745
 *
 * 注册请使用真机注册，请勿使用模拟器，否则会导致账号黑号
 * 目前只写了每日签到，因为其它任务打开文章模拟器直接闪退
 *
 * 登录之前开启抓包，登录成功之后找到 URL：https://xhnapi2.voc.com.cn/v5/user/login 并全选复制请求体参数
 * export XHN_ACCOUNTS = 'password=XXXX&logintype=1&RegistrationID=AsE7lggMxlmXXXXXXXXXXXX&appid=9&type=0&username=18888888888'
 * 多账号用 “换行”，不要用 & 不要用 & 不要用 &
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/11/29
 *
 * const $ = new Env('新湖南')
 * cron: 51 4 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('新湖南');
const crypto = require('crypto');
const xhnList = process.env.XHN_ACCOUNTS ? process.env.XHN_ACCOUNTS.split(/\n/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://usergrow-xhncloud.voc.com.cn'
// 请求头
const headers = {
    'User-Agent': 'xhn-11.0.3-Mozilla/5.0 (Linux; Android 9; V1916A Build/PQ3B.190801.06131105; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36',
    'Accept-Encoding': 'gzip, deflate',
    'referer': 'https://usergrow-xhncloud.voc.com.cn/points/web/',
};

!(async () => {
    await checkUpdate($.name, xhnList);
    for (let i = 0; i < xhnList.length; i++) {
        const index = i + 1;
        $.isLogin = true;
        $.accounts = xhnList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        await login()
        if (!$.isLogin) {
            console.error('账号已失效');
            await notify.sendNotify(`「账号失效通知」`, `${$.name}账号[${index}]已失效，请手动尝试登录\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await sign();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getPoints();
}


/**
 * 登录接口
 *
 * @returns {Promise<void>}
 */
async function login() {
    try {
        const randomBytes = crypto.randomBytes(20);
        const hexString = randomBytes.toString('hex').toUpperCase();
        const timestamp = Date.now();
        const header = {
            'User-Agent': 'xhn/11.0.3 (vivo/V1916A; android/28; okhttp/4.12.0)',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/x-www-form-urlencoded',
            'os': 'android',
            'rmt-device-id': hexString,
            'appversion': '11.0.3',
            'rmt-device-type': 'android',
            'rmt-build': '1100302',
            'rmt-app-version': '11.0.3',
            'rmt-app-id': '9',
            'rmt-hash': sudojia.md5(`C50GIK6GDhQNjtMRVRoQbwxVovXCX8DUv5android${hexString}${timestamp}`),
            'rmt-request-time': timestamp,
        }
        const data = await sudojia.sendRequest('https://xhnapi2.voc.com.cn/v5/user/login', 'post', header, $.accounts)
        if (1 !== data.state_code) {
            $.isLogin = false;
            return console.error('登录失败 ->', data.message);
        }
        console.log('登录成功');
        $.authToken = data.data.auth;
    } catch (e) {
        console.error(`登录时发生异常：${e}`);
    }
}

/**
 * 获取签名头
 *
 * @param headers
 * @param nonce
 * @returns {any}
 */
function getSignHeaders(headers, nonce) {
    const headersCp = JSON.parse(JSON.stringify(headers));
    headersCp.time = Date.now();
    headersCp.nonce = nonce;
    const originalData = `${headersCp.time}${headersCp.nonce}hHacFKN5DxR5sPwyc1ns52M168rdoe3AGrWaseN3zYd2XoKaxYhYQTqDXvCtMkwz`;
    headersCp.signature = crypto.createHash('sha1').update(originalData).digest('hex');
    return headersCp;
}

async function sign() {
    try {
        const headersCp = getSignHeaders(headers, '300000');
        const data = await sudojia.sendRequest(`${baseUrl}/usergrow/api/v2/points/`, 'post', headersCp, `points_rule_id=8&appid=9&oauth_token=${$.authToken}`);
        if (1 !== data.statecode) {
            message += `签到失败 -> ${data.message}\n`;
            return console.error('签到失败 ->', data.message);
        }
        console.log(`${data.data.successNote}(${data.data.ruleName})`);
        message += `${data.data.successNote}(${data.data.ruleName})\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

async function getPoints() {
    try {
        const headersCp = getSignHeaders(headers, '700000');
        const data = await sudojia.sendRequest(`${baseUrl}/usergrow/api/v2/points/pointsUser?refreshUserInfo=0&appid=9&oauth_token=${$.authToken}`, 'get', headersCp);
        if (1 !== data.statecode) {
            return console.error('获取用户积分失败 ->', data.message);
        }
        console.log(`当前积分：${data.data.validPoints}`);
        message += `当前积分：${data.data.validPoints}\n\n`;
    } catch (e) {
        console.error(`获取用户积分时发生异常：${e}`);
    }
}

// async function getTaskList() {
//     try {
//         const headersCp = getSignHeaders(headers, '600000');
//         const data = await sudojia.sendRequest(`${baseUrl}/usergrow/api/v2/points/pointsData?appid=9&oauth_token=${$.authToken}`, 'get', headersCp);
//         if (1 !== data.statecode) {
//             return console.error('获取任务列表失败 ->', data.message);
//         }
//
//         for (const task of data.data.pointsRuleBeanList) {
//             if (!task.buttonName) {
//                 continue;
//             }
//             console.log(task.buttonName, task.pointsRuleId);
//         }
//
//     } catch (e) {
//     }
// }
