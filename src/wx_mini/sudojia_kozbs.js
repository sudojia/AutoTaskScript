/**
 * 植白说官方商城小程序
 *
 * 抓包 url：https://www.kozbs.com 获取请求头 x-dts-token 的值
 * export KOZBS_TOKEN = '1l967bxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/07
 *
 * const $ = new Env('植白说官方商城')
 * cron: 18 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('植白说官方商城');
const kozbsList = process.env.KOZBS_TOKEN ? process.env.KOZBS_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://www.kozbs.com'
// 请求头
const headers = {
    'xweb_xhr': 1,
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': `https://servicewechat.com/wx6b6c5243359fe265/153/page-frame.html`,
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9'
};

!(async () => {
    await checkUpdate($.name, kozbsList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < kozbsList.length; i++) {
        const index = i + 1;
        headers['x-dts-token'] = kozbsList[i];
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
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await signDay();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/demo/wx/user/getUserIntegral`, 'get', headers);
        if (0 !== data.errno) {
            console.error(data.errmsg);
            return;
        }
        // 当前积分
        const integer = data.data.integer
        // 昵称
        const userName = data.data.list[0].userName
        console.log(`${userName}`);
        console.log(`当前积分：${integer}`);
        message += `${userName}\n当前积分：${integer}\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 检测签到状态
 *
 * @return {Promise<void>}
 */
async function signDay() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/demo/wx/home/signDay`, 'get', headers);
        if (0 !== data.errno) {
            console.error(data.errmsg);
            return;
        }
        if (1 === data.data.isSign) {
            console.log(`今天已经签到过了`);
            message += `今天已经签到过了\n\n`;
            return;
        }
        await $.wait(sudojia.getRandomWait(2000, 2500));
        await sign();
    } catch (e) {
        console.error(`检测签到状态时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/demo/wx/home/sign`, 'get', headers);
        if (0 !== data.errno) {
            console.error(data.errmsg);
            return;
        }
        console.log(`签到成功`);
        message += `签到成功\n\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}
