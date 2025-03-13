/**
 * v2ex 每日签到 https://www.v2ex.com/
 *
 * export V2EX_COOKIE = 'xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/5/22
 *
 * const $ = new Env('V2EX每日签到')
 * cron: 0 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('V2EX每日签到');
const cheerio = require('cheerio');
const v2exList = process.env.V2EX_COOKIE ? process.env.V2EX_COOKIE.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://www.v2ex.com';
// 请求头
const headers = {
    'Accept-Encoding': `gzip, deflate, br`,
    'Connection': `keep-alive`,
    'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8`,
    "User-Agent": sudojia.getRandomUserAgent('PC'),
};
!(async () => {
    await checkUpdate($.name, v2exList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < v2exList.length; i++) {
        const index = i + 1;
        headers.Cookie = v2exList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        const isCookie = await checkCookie();
        if (!isCookie) {
            console.error('Cookie 已失效');
            await notify.sendNotify(`「Cookie失效通知」`, `${$.name}账号[${index}] Cookie 已失效，请重新登录获取 Cookie\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 3000));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getOnce();
    await wait();
    await getInfo();
}

/**
 * 检测 Cookie 有效返回 true
 *
 * @return {Promise<boolean>}
 */
async function checkCookie() {
    try {
        const data = await sudojia.sendRequest('https://v2ex.com/', 'get', headers);
        return data.indexOf('登出') > -1;
    } catch (e) {
        console.error(`检测 Cookie 状态发生异常：${e}`);
        return false;
    }
}

/**
 * 获取once
 *
 * @returns {Promise<void>}
 */
async function getOnce() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mission/daily`, 'GET', headers, {})
        const $ = cheerio.load(data);
        const targetLink = $('a.top').eq(1);
        const userName = targetLink.text();
        message += `【用户名称】${userName}\n`
        if (data.indexOf('每日登录奖励已领取') < 0) {
            console.log('开始签到...')
            const once = $('input[type="button"]')[0].attribs['onclick'].match(/once=(\d+)/)[1];
            await wait();
            await checkIn(once);
        } else {
            message += `【签到状态】已经签到过了\n`
            console.log('已经签到过了');
        }
    } catch (e) {
        console.error(`获取 once 发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @param once
 * @returns {Promise<void>}
 */
async function checkIn(once) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mission/daily/redeem?once=${once}`, 'GET', headers, {})
        if (data.indexOf('每日登录奖励已领取') > -1) {
            console.log('签到成功');
            message += `【签到状态】签到成功！\n`
            const continueDays = data.match(/已连续登录 (\d+?) 天/)[1];
            message += `【签到统计】已连续签到${continueDays}天\n`
        } else {
            console.log('签到失败');
        }
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/balance`, 'GET', headers, {})
        const $ = cheerio.load(data);
        const balanceArea = $('.balance_area').first();
        // 提取文本内容
        const text = balanceArea.text();
        // 使用正则表达式匹配数字
        const matches = text.match(/\d+/g);
        let goldAmount = 0;
        let silverAmount = 0;
        let bronzeAmount = 0;
        // 如果匹配到三个数字，则分别赋值给金币、银币和铜币
        if (matches && matches.length === 3) {
            goldAmount = parseInt(matches[0], 10);
            silverAmount = parseInt(matches[1], 10);
            bronzeAmount = parseInt(matches[2], 10);
        } else if (matches && matches.length === 2) {
            silverAmount = parseInt(matches[0], 10);
            bronzeAmount = parseInt(matches[1], 10);
        }
        message += `【账户余额】${goldAmount}金币 ${silverAmount}银币 ${bronzeAmount}铜币\n\n`
    } catch (e) {
        console.error(`获取获取用户信息时发生异常：${e}`);
    }
}

async function wait() {
    await $.wait(sudojia.getRandomWait(2000, 3000));
}
