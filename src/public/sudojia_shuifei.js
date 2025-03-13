/**
 * 微信公众号：水费易
 *
 * 抓包 Host：https://m.ipaiyun.cn 获取请求头 Cookie 的值和请求 Body 参数 memberId，用 # 分割
 * export SHUI_FEI_COOKIE = 'ASP.NET_SessionId=xxxxxx; IPAI_UV=xxxx; temp_clause=1#123456'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/31
 *
 * const $ = new Env('水费易签到')
 * cron: 3 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('水费易签到');
const shuiFeiList = process.env.SHUI_FEI_COOKIE ? process.env.SHUI_FEI_COOKIE.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://m.ipaiyun.cn'
// 请求头
const headers = {
    'Host': 'm.ipaiyun.cn',
    'User-Agent': sudojia.getRandomUserAgent('PC'),
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'Origin': 'https://m.ipaiyun.cn',
    'Referer': 'https://m.ipaiyun.cn/Ipai/Home/Index?code=031sLtFa11eBTH0d0uFa1NqtY53sLtFQ&state=wxbe5b7a2bc0467240',
    'Accept-Encoding': 'gzip, deflate, br',
};

!(async () => {
    await checkUpdate($.name, shuiFeiList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < shuiFeiList.length; i++) {
        const index = i + 1;
        const [cookie, mId] = shuiFeiList[i].split('#');
        headers.Cookie = cookie || '';
        $.memberId = mId || '';
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
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/PersonalCenter/PersonalCenter/GetShopMemberDetail`, 'post', headers, `memberId=${$.memberId}`);
        if (0 !== data.code) {
            console.error(data.message);
            return;
        }
        // 昵称
        const nickName = data.resultJson.userMember.nickName;
        // 手机号
        const phone = data.resultJson.userMember.mobilePhone;
        // 剩余签到次数
        const signNum = data.resultJson.signNum;
        console.log(`${nickName}(${phone})`);
        message += `${nickName}(${phone})\n`;
        await $.wait(sudojia.getRandomWait(500, 1200));
        if (0 === signNum) {
            console.log('今日已签到');
            message += '今日已签到\n';
            return;
        }
        await $.wait(sudojia.getRandomWait(2000, 2500));
        await sign();
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/PersonalCenter/PersonalCenter/ShopMemberSign`, 'post', headers, `memberId=${$.memberId}`);
        if (0 !== data.code) {
            console.error(data.message);
            return;
        }
        console.log(`签到成功，已连续签到${data.resultJson.signdays}天`);
        message += `签到成功，已连续签到${data.resultJson.signdays}天\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 积分查询
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/PersonalCenter/PersonalCenter/GetShopMemberDetail`, 'post', headers, `memberId=${$.memberId}`);
        if (0 !== data.code) {
            console.error(data.message);
            return;
        }
        // 积分
        const points = data.resultJson.meberinfo.totalIntegral;
        console.log(`当前积分：${points}`);
        message += `当前积分：${points}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}
