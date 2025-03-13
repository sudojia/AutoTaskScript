/**
 * 贝因美小程序
 *
 * 抓包 Host：https://h5.youzan.com 找到并获取请求头 extra-data 的 sid 值
 * export BYM_SID = 'YZ126xxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * 时效性很短，不建议跑
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/21
 *
 * const $ = new Env('贝因美')
 * cron: 19 11 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('贝因美');
const bymList = process.env.BYM_SID ? process.env.BYM_SID.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://h5.youzan.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': 'https://servicewechat.com/wx8b625f82fd29eda7/46/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
};

!(async () => {
    await checkUpdate($.name, bymList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < bymList.length; i++) {
        const index = i + 1;
        $.isLogin = true;
        $.sid = bymList[i];
        headers['extra-data'] = '{"sid":"' + $.sid + '","version":"2.175.7.201","clientType":"weapp-miniprogram","client":"weapp","bizEnv":"","uuid":"kcLq9rh5f7rAd1o1721544429919","ftime":' + new Date().getTime() + '}';
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
    if (!$.isLogin) {
        console.error('sid 失效');
        process.exit(0);
    }
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await checkin();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/wscaccount/api/authorize/data.json?kdt_id=43704621`, 'get', headers);
        if (!data.data.userInfo.hasLogin) {
            $.isLogin = false;
            return;
        }
        const mobile = data.data.userInfo.mobile;
        const nickName = data.data.userInfo.nickname;
        const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}`;
        console.log(`${nickName}(${hiddenMobile})`);
        message += `🎉${nickName}(${hiddenMobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function checkin() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/wscump/checkin/checkinV2.json?checkinId=2845584&app_id=wx8b625f82fd29eda7&kdt_id=43704621&access_token=b60985830b869f705a8bf0a784a07d`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg);
            message += `今日已签到！\n\n`;
            return;
        }
        console.log(`签到成功，+${data.data.list[0].infos.title}`);
        message += `签到成功，+${data.data.list[0].infos.title}\n\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}
