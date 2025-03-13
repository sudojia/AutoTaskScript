/**
 * 机场每日签到
 *
 * 如何鉴别是 SSPANEL 面板？
 * 网站拉到最下面有 Powered by SSPANEL 就是 SSPANEL 面板框架的机场
 * 格式要求：网站1,邮箱1:密码1&网站2,邮箱2:密码2
 * export SITE_ACCOUNTS = 'https://paolu.com,abc@gmail.com:123456'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2021/9/25
 * @lastModifyTime: 2024/09/16
 *
 * const $ = new Env('SSPANEL面板签到')
 * cron: 35 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('SSPANEL面板签到');
const {default: axios} = require("axios");
const accountList = process.env.SITE_ACCOUNTS ? process.env.SITE_ACCOUNTS.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 请求头
const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": sudojia.getRandomUserAgent('PC'),
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
};

!(async () => {
    await checkUpdate($.name, accountList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    // 校验格式
    const isValidFormat = accountList.every(account => {
        const parts = account.split(',');
        if (parts.length !== 2) {
            return false;
        }
        const [site, credentials] = parts;
        const credParts = credentials.split(':');
        return !(credParts.length !== 2 || !site || !credentials);
    });
    if (!isValidFormat) {
        console.error('格式错误，请确保遵循要求格式：网站1,邮箱1:密码1&网站2,邮箱2:密码2');
        process.exit(0);
    }
    for (let i = 0; i < accountList.length; i++) {
        const index = i + 1;
        const [rawUrl, emailPwd] = accountList[i].split(',');
        const [email, pwd] = emailPwd.split(':');
        const url = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        console.log(`设定的机场网站是：${url}`);
        await $.wait(sudojia.getRandomWait(300, 666));
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await login(url, email, pwd);
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

/**
 * 登录
 *
 * @returns {*}
 */
async function login(url, email, pwd) {
    try {
        const options = {
            url: `${url}/auth/login`,
            method: 'POST',
            headers: headers,
            data: `email=${email}&passwd=${pwd}&code=`
        }
        const response = await axios(options);
        if (1 !== response.data.ret) {
            return console.error(`登录失败：${response.data.msg}`);
        }
        const cookies = response.headers['set-cookie'];
        headers.Cookie = cookies.join('; ');
        console.log('登录成功~');
        await $.wait(sudojia.getRandomWait(800, 1200));
        await checkin(url);
    } catch (e) {
        console.error(`登录时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @returns {*}
 */
async function checkin(url) {
    try {
        const data = await sudojia.sendRequest(`${url}/user/checkin`, 'post', headers, {});
        if (1 !== data.ret) {
            return console.error(`签到失败：${data.msg}`);
        }
        const {lastUsedTraffic, unUsedTraffic} = data.trafficInfo;
        console.log(`签到成功，${data.msg}`);
        console.log(`总套餐：${data.traffic}`);
        console.log(`已使用：${lastUsedTraffic}`);
        console.log(`剩余流量：${unUsedTraffic}`);
        message += `签到成功，${data.msg}\n`;
        message += `总套餐：${data.traffic}\n`;
        message += `已使用：${lastUsedTraffic}\n`;
        message += `剩余流量：${unUsedTraffic}\n\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}