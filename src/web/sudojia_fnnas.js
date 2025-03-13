/**
 * 飞牛私有云
 *
 * 官网：https://club.fnnas.com
 * 获取 Cookie，格式：pvRK_2132_auth=46exxxxxxxx; pvRK_2132_saltkey=F3xxxxx
 * export FN_NAS_COOKIE = 'pvRK_2132_auth=46exxxxxxxx; pvRK_2132_saltkey=F3xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/20
 *
 * const $ = new Env('飞牛私有云')
 * cron: 10 0 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('飞牛私有云');
const cheerio = require("cheerio");
const fnNasList = process.env.FN_NAS_COOKIE ? process.env.FN_NAS_COOKIE.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 获取配置信息
let formHash, signLink, uid;
// 接口地址
const baseUrl = 'https://club.fnnas.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent('PC'),
    'Accept-Encoding': 'gzip, deflate, br, zstd',
};

!(async () => {
    await checkUpdate($.name, fnNasList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < fnNasList.length; i++) {
        const index = i + 1;
        headers.Cookie = fnNasList[i];
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
    await getUidAndUserName();
    await $.wait(sudojia.getRandomWait(800, 1200));
    await follow();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await checkIn();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await getCount();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await getPoints();
}

/**
 * 获取重要信息
 *
 * @returns {Promise<void>}
 */
async function getUidAndUserName() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}`, 'get', headers);
        const $ = cheerio.load(data);
        uid = $('a', '.icon_msg').attr('href').match(/uid=(\d+)/)[1];
        const userName = $('.quater_phone_nav .z').text().trim();
        console.log(`${userName}(${uid})`);
        // 拿到 formhash 和签到地址
        const logoutLink = $('li.l4 a').attr('href');
        formHash = logoutLink.split('formhash=')[1];
        signLink = $('a[href*="plugin.php?id=zqlj_sign"]').attr('href');
        message += `${userName}(${uid})\n`;
    } catch (e) {
        console.error('获取重要信息时发生异常:', e);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function checkIn() {
    try {
        let data = await sudojia.sendRequest(`${baseUrl}/${signLink}`, 'get', headers);
        if (!data.includes('点击打卡')) {
            console.log('今日已打卡');
            return;
        }
        await $.wait(sudojia.getRandomWait(800, 1200));
        data = await sudojia.sendRequest(`${baseUrl}/${signLink}&sign=${formHash}`, 'get', headers);
        console.log('打卡成功！');
        message += `打卡成功\n`;
    } catch (e) {
        console.error('签到时发生异常:', e);
    }
}

/**
 * 统计信息
 *
 * @returns {Promise<void>}
 */
async function getCount() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/${signLink}`, 'get', headers);
        const $ = cheerio.load(data);
        const items = {};
        // 使用选择器提取信息
        $('.xl li').each((index, element) => {
            const text = $(element).text().trim();
            switch (text.substring(0, 4)) {
                case '最近打卡':
                    items['zjdk'] = text.substring(5).trim();
                    break;
                case '本月打卡':
                    items['bydk'] = text.substring(5).trim();
                    break;
                case '连续打卡':
                    items['lxdk'] = text.substring(5).trim();
                    break;
                case '累计打卡':
                    items['ljdk'] = text.substring(5).trim();
                    break;
                case '累计奖励':
                    items['ljjl'] = text.substring(5).trim();
                    break;
                case '最近奖励':
                    items['zjjl'] = text.substring(5).trim();
                    break;
                case '当前打卡':
                    items['currenDkLevel'] = text.substring(7).trim();
                    break;
            }
        });
        console.log(`最近打卡：${items.zjdk}\n本月打卡：${items.bydk}\n连续打卡：${items.lxdk}\n累计打卡：${items.ljdk}\n累计奖励：${items.ljjl}\n最近奖励：${items.zjjl}\n当前打卡等级：${items.currenDkLevel}`);
        message += `最近打卡：${items.zjdk}\n本月打卡：${items.bydk}\n连续打卡：${items.lxdk}\n累计打卡：${items.ljdk}\n累计奖励：${items.ljjl}\n最近奖励：${items.zjjl}\n当前打卡等级：${items.currenDkLevel}\n`;
    } catch (e) {
        console.error('获取统计信息时发生异常:', e);
    }
}

/**
 * 获取个人信息
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/home.php?mod=space&uid=${uid}&do=profile&from=space`, 'get', headers);
        const $ = cheerio.load(data);
        const ulElement = $('.pf_l');
        const item = {};
        ulElement.find('li').each((index, element) => {
            const label = $(element).find('em').text().trim();
            const value = $(element).text().replace(label, '').trim();
            switch (label) {
                case '积分':
                    item.points = parseInt(value);
                    break;
                case '牛值':
                    item.bullValue = parseInt(value);
                    break;
                case '飞牛币':
                    item.flyingBullCoins = parseInt(value);
                    break;
                case '登陆天数':
                    item.loginDays = parseInt(value);
                    break;
            }
        });
        console.log(`当前积分：${item.points}\n当前牛值：${item.bullValue}\n当前飞牛币：${item.flyingBullCoins}\n当前登录天数：${item.loginDays}`);
        message += `当前积分：${item.points}\n当前牛值：${item.bullValue}\n当前飞牛币：${item.flyingBullCoins}\n当前登录天数：${item.loginDays}\n\n`;
    } catch (e) {
        console.error('获取个人信息时发生异常:', e);
    }
}

async function follow() {
    const data = await sudojia.sendRequest(`${baseUrl}/home.php?mod=spacecp&ac=follow&op=add&hash=${formHash}&fuid=6441&infloat=yes&handlekey=followmod&inajax=1&ajaxtarget=fwin_content_followmod`, 'get', headers);
}
