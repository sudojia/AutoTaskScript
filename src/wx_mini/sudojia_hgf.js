/**
 * #小程序://厚工坊商城/aWVCNOaniBxf4Pk
 *
 * 抓包 Host：https://api.hgf1862.com 获取请求头 sessionid
 * export HGF_COOKIE = 'hgfappmin.8848xxxxxxxxxxxxxxxxxxxxx.eyJxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/15
 *
 * const $ = new Env('厚工坊')
 * cron: 33 5 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('厚工坊');
const moment = require("moment");
const hgfList = process.env.HGF_COOKIE ? process.env.HGF_COOKIE.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://api.hgf1862.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'x-requested-with': 'XMLHttpRequest',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'accept-language': 'zh-CN,zh;q=0.9',
};

!(async () => {
    await checkUpdate($.name, hgfList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < hgfList.length; i++) {
        const index = i + 1;
        headers.Cookie = `user=SessionID=${hgfList[i]}`;
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
    await sign();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await doTask();
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/YUN//Game/2021/QianDao/QianDaoAjax_By28.aspx?op=now&vers=${moment().format('YYYYMMDD')}`, 'post', headers);
        if (1 !== data.status) {
            message += `${data.msg}\n`;
            return console.error(`签到失败：${data.msg}`);
        }
        message += `签到成功，获得${data.jiubi}酒币\n`;
        console.log(`签到成功，获得${data.jiubi}酒币`);
        console.log(data.Lianxu.jp_txt);
    } catch (e) {
        console.error(`获取签到信息时发生异常：${e}`);
    }
}

/**
 * 领取任务奖励
 *
 * @returns {Promise<void>}
 */
async function doTask() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/YUN//Game/2024/RenWuJB/AjaxGo.aspx?cid=9`, 'post', headers);
        if (1 !== data.status) {
            return console.error(`浏览失败：${data.msg}`);
        }
        await $.wait(sudojia.getRandomWait(2000, 2500));
        console.log('浏览小阿头条成功！');
        message += `浏览小阿头条成功！\n\n`;
    } catch (e) {
        console.error(`浏览任务时发生异常：${e}`);
    }
}
