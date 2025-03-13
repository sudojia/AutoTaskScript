/**
 * 南方航空小程序
 *
 * 抓包 URL：https://wxapi.csair.com/marketing-tools/ 这个路径下的 cookie 只要 sign_user_token = xxxxxx
 * 不要带 sign_user_token=
 * 需实名认证
 * export NFHK_COOKIE = 'b59234ecxxxxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/10
 * @lastModifyTime: 2024/08/12
 *
 * const $ = new Env('南方航空')
 * cron: 49 11 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('南方航空');
const moment = require("moment");
const nfhkList = process.env.NFHK_COOKIE ? process.env.NFHK_COOKIE.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://wxapi.csair.com'
// 请求头
let headers = {
    'User-Agent': 'okhttp/3.12.1;jdmall;android;version/10.3.4;build/92451;',
    'Content-Type': 'application/json',
};

!(async () => {
    await checkUpdate($.name, nfhkList);
    for (let i = 0; i < nfhkList.length; i++) {
        const index = i + 1;
        headers.cookie = [
            `sign_user_token=${nfhkList[i]}`,
            `TOKEN=${nfhkList[i]}`,
            `cs1246643sso=${nfhkList[i]}`,
        ].join('; ');
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
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getSignDays();
    await $.wait(sudojia.getRandomWait(1000, 2000));
    await getMinPriceMileage();
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/marketing-tools/activity/join?type=APPTYPE&chanel=ss&lang=zh`, 'post', headers, {
            "activityType": "sign",
            "channel": "app",
            "entrance": 1,
        });
        await $.wait(sudojia.getRandomWait(1500, 2300));
        if ('000' !== data.respCode) {
            if ('S2001' === data.respCode) {
                console.log(data.respMsg);
                message += '今日已签到\n';
                return;
            }
            console.error(data.respMsg);
            return;
        }
        console.log(data);
        message += `签到成功！\n`;
    } catch (e) {
        console.error('签到时发生异常：', e.response.data);
    }
}

/**
 * 获取签到天数
 *
 * @return {Promise<void>}
 */
async function getSignDays() {
    try {
        const firstDay = moment().startOf('month').format('YYYY-MM-DD');
        const lastDay = moment().endOf('month').format('YYYY-MM-DD');
        const data = await sudojia.sendRequest(`${baseUrl}/marketing-tools/sign/getSignCalendar?type=APPTYPE&chanel=ss&lang=zh&startQueryDate=${firstDay}&endQueryDate=${lastDay}`, 'get', headers);
        if ('0000' !== data.respCode) {
            console.error(data.respMsg);
        }
        console.log(data.data.signProgressMsg.join(''));
        message += `${data.data.signProgressMsg.join('')}\n`;
    } catch (e) {
        console.error(`获取签到天数时发生异常：`, e.response.data);
    }
}

/**
 * 获取里程
 *
 * @return {Promise<void>}
 */
async function getMinPriceMileage() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/marketing-tools/sign/minPriceMileage`, 'post', headers, 'type=APPTYPE&chanel=ss&lang=zh');
        if ('0000' !== data.respCode) {
            console.error(data.respMsg);
        }
        console.log(`当前里程：${data.data.availableMileage}`);
        message += `当前里程：${data.data.availableMileage}\n\n`;
    } catch (e) {
        console.error(`获取里程时发生异常：`, e.response.data);
    }
}
