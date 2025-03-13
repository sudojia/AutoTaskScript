/**
 * 植物星球小程序
 *
 * 注册登录之后在 我的 -> 账号管理 -> 修改密码 进行重设密码
 * export BOTANY_ACCOUNT = '18888888888#sudojia' 手机号#密码
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/09
 *
 * const $ = new Env('植物星球')
 * cron: 32 13 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('植物星球');
const botanyList = process.env.BOTANY_ACCOUNT ? process.env.BOTANY_ACCOUNT.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://api.pftp2012.com'
// 请求头
const headers = {
    'user-agent': sudojia.getRandomUserAgent(),
    'accept-encoding': 'gzip, deflate, br',
    'referer': 'https://servicewechat.com/wxd7296b6421fc974e/1/page-frame.html',
    'content-type': 'application/x-www-form-urlencoded',
    'accept': '*/*',
};

!(async () => {
    await checkUpdate($.name, botanyList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < botanyList.length; i++) {
        const index = i + 1;
        const [phone, password] = botanyList[i].split('#');
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        if (!await login(phone, sudojia.md5(password))) {
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await sign();
    await $.wait(sudojia.getRandomWait(800, 1200));
    console.log(`开始浏览任务...\n如果绿星币+0，那么说明已经完成浏览任务了`);
    await doTask('10');
    await $.wait(11000);
    await doTask('60');
    await $.wait(sudojia.getRandomWait(800, 1200));
    await getPoints();
}

/**
 * 登录
 *
 * @param phone
 * @param password
 * @return {Promise<void>}
 */
async function login(phone, password) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/Member/Login`, 'post', headers, `userName=${phone}&userPwd=${password}`);
        if (100 !== data.Status) {
            return null;
        }
        $.userToken = data.Data.MemberInfo.Token;
        headers.Authorization = `Bearer ${$.userToken}`;
        return $.userToken;
    } catch (e) {
        console.error(`登录时发生异常：${e}`);
        return null;
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function sign() {
    await $.wait(sudojia.getRandomWait(800, 1100));
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/Member/SignIn`, 'post', headers);
        if (100 !== data.Status) {
            console.error(data.Msg);
            return;
        }
        // 签到天数
        const signDays = data.Data.ContinuouNum;
        console.log(`签到成功！绿星币+${data.Data.PollenNum}，已连续签到${signDays}天`);
        message += `签到成功！绿星币+${data.Data.PollenNum}\n已连续签到${signDays}天\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 浏览任务
 *
 * @param taskId 任务ID
 * @return {Promise<void>}
 */
async function doTask(taskId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/Member/CompleteMemberMission`, 'post', headers, `type=${taskId}&channel=40`);
        if (100 !== data.Status) {
            console.error(data.Msg);
            return;
        }
        console.log(`浏览任务成功，绿星币+${data.Data}`);
    } catch (e) {
        console.error(`浏览任务时发生异常：${e}`);
    }
}

/**
 * 获取绿星币
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/Member/GetMemberInfo`, 'get', headers);
        if (100 !== data.Status) {
            console.error(data.Msg);
            return;
        }
        const points = data.Data.MemberInfo.MemberPollen;
        console.log(`当前绿星币：${points}`);
        message += `当前绿星币：${points}\n\n`;
    } catch (e) {
        console.error(`获取绿星币时发生异常：${e}`);
    }
}
