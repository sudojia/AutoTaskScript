/**
 * 智能电视 https://www.znds.com/?fromuid=7565102
 *
 * export ZNDS_COOKIE = 's9it_2132_auth=xxx;s9it_2132_saltkey=xxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/5/31
 *
 * const $ = new Env('智能电视')
 * cron: 5 11 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('智能电视');
const cheerio = require('cheerio');
const zndsList = process.env.ZNDS_COOKIE ? process.env.ZNDS_COOKIE.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://www.znds.com';
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent('PC'),
    'Content-Type': 'text/html; charset=utf-8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
};

!(async () => {
    await checkUpdate($.name, zndsList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < zndsList.length; i++) {
        const index = i + 1;
        headers.Cookie = zndsList[i];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        message += `📣====${$.name}账号[${index}]====📣\n`;
        const userInfo = await getFormHashAndUid();
        if (!userInfo) {
            console.error('Cookie 已失效');
            await notify.sendNotify(`「Cookie失效通知」`, `${$.name}账号[${index}] Cookie 已失效，请重新登录获取 Cookie\n\n`);
            continue;
        }
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main(userInfo);
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main(userInfo) {
    await checkIn(userInfo.formHash);
    await $.wait(sudojia.getRandomWait(1500, 2000));
    await getSpace(userInfo.uid);
    await $.wait(sudojia.getRandomWait(1500, 2000));
    await getCount(userInfo.uid);
}

/**
 * 获取 formHash 和 uid
 *
 * @return {Promise<{uid: string, formHash: string}>}
 */
async function getFormHashAndUid() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/?fromuid=7565102`, 'post', headers, {});
        const $ = cheerio.load(data);
        // 获取 formHash 的值
        const logoutLink = $('a[href^="member.php?mod=logging"]');
        // 获取 uid
        const userIdLink = $('a.avts').attr('href');
        return {
            uid: userIdLink.match(/uid=(\d+)/)[1],
            formHash: logoutLink.attr('href').split('&formhash=')[1]
        }
    } catch (e) {
        console.error(`获取 uid 发生异常：${e}\n`);
        return null;
    }
}

/**
 * 签到
 *
 * @param formHash
 * @return {Promise<void>}
 */
async function checkIn(formHash) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/plugin.php?id=ljdaka:daka&action=msg&formhash=${formHash}&infloat=yes&handlekey=ljdaka&inajax=1&ajaxtarget=fwin_content_ljdaka`, 'post', headers, {});
        const $ = cheerio.load(data);
        message += $('div.alert_info').first().text() + '\n';
        console.log($('div.alert_info').first().text());
    } catch (e) {
        console.error(`签到发生异常：${e}`);
    }
}

/**
 * 每日访问空间
 *
 *  @return {Promise<void>}
 */
async function getSpace(uid) {
    if (uid === '7565102') {
        await sudojia.sendRequest(`${baseUrl}/home.php?mod=space&uid=6014765`, 'post', headers);
    } else {
        await sudojia.sendRequest(`${baseUrl}/home.php?mod=space&uid=7565102`, 'post', headers);
    }
}

/**
 * 获取积分、威望、金币和 Z币
 *
 * @param uid
 * @return {Promise<void>}
 */
async function getCount(uid) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/home.php?mod=space&uid=${uid}`, 'post', headers, {});
        if (!data) {
            console.error('获取数据失败');
            return;
        }
        const $ = cheerio.load(data);
        // 使用选择器找到包含积分、威望、金币和 Z币的 <li> 元素
        const statisticItems = $('#statistic_content .xl li');
        // 初始化一个对象来存储结果
        const result = {
            jifen: '--',
            weiwang: '--',
            jinbi: '--',
            zbi: '--'
        };
        // 遍历找到的元素，并提取信息
        statisticItems.each((index, element) => {
            const $element = $(element);
            const text = $element.text().trim();
            extractStatInfo($element, result, text);
        });
        message += '积分：' + result.jifen + '\n' + '威望：' + result.weiwang + '\n' + '金币：' + result.jinbi + '\n' + 'Z币：' + result.zbi + '\n\n';
        console.log('当前积分：' + result.jifen + '、威望：' + result.weiwang + '、金币：' + result.jinbi + '、Z币：' + result.zbi);
    } catch (e) {
        console.error(`获取积分、威望、金币和 Z币发生异常：${e}`);
    }
}

/**
 * 提取统计信息
 *
 * @param $element
 * @param result
 * @param text
 */
function extractStatInfo($element, result, text) {
    if (text.includes('积分')) {
        result.jifen = $element.find('a').text();
    } else if (text.includes('威望')) {
        result.weiwang = $element.find('a').text();
    } else if (text.includes('金币')) {
        result.jinbi = $element.find('a').text();
    } else if (text.includes('Z币')) {
        result.zbi = $element.find('a').text();
    }
}
