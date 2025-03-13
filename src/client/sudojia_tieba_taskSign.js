/**
 * 百度贴吧APP - 我的 - 成长任务 - 每日签到
 * 就成长值，没什么用
 *
 * 抓包 Host：https://tieba.baidu.com 获取 Cookie
 * export TIE_BA_COOKIE = 'CUID=00bCCExxxxxxxx; BDUSS=jhxbxxxxxxxxxxxxxxxx'
 * 与贴吧签到变量共用, 多了个 CUID
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/07
 *
 * const $ = new Env('贴吧任务签到')
 * cron: 19 7 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('贴吧任务签到');
const tieBaList = process.env.TIE_BA_COOKIE ? process.env.TIE_BA_COOKIE.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://tieba.baidu.com';
// 请求头
const headers = {
    'Host': 'tieba.baidu.com',
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': sudojia.getRandomUserAgent('H5'),
};

!(async () => {
    await checkUpdate($.name, tieBaList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < tieBaList.length; i++) {
        const index = i + 1;
        headers.Cookie = tieBaList[i];
        $.cuidValue = tieBaList[i].split(';').find(part => part.startsWith('CUID=')).split('=')[1];
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main();
        await $.wait(sudojia.getRandomWait(2000, 3000));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await sign();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mo/q/usergrowth/showUserGrowth?client_type=2&client_version=12.60.1.2`, 'get', headers);
        if (0 !== data.no) {
            return $.log(data.error);
        }
        // 用户名
        const userName = data.data.user.uname;
        // tbs
        $.tbs = data.data.tbs;
        console.log(`昵称：${userName}`);
        message += `昵称：${userName}\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 每日签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const params = `tbs=${$.tbs}&act_type=page_sign&cuid=${$.cuidValue}&client_type=2&brand=OPPO&model=OPPO%20R9s&zid=&clientVersion=12.60.1.2&clientType=2`
        const data = await sudojia.sendRequest(`${baseUrl}/mo/q/usergrowth/commitUGTaskInfo`, 'post', headers, params);
        if (0 !== data.no) {
            return $.log(data.error);
        }
        console.log('签到成功');
        message += '签到成功\n';
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取用户积分
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mo/q/usergrowth/showUserGrowth?client_type=2&client_version=12.60.1.2`, 'get', headers);
        if (0 !== data.no) {
            return $.log(data.error);
        }
        // 当前成长值
        const currentValue = data.data.growth_info.value;
        // 贴贝余额
        const currentMoney = data.data.tmoney.current;
        // 当前等级信息体
        const currentLevelBody = data.data.level_info.find(cu => cu.is_current === 1);
        // 下一等级
        const nextLevel = (currentLevelBody.next_level_value - currentLevelBody.growth_value);
        console.log(`当前成长值：${currentValue}`);
        console.log(`当前贴贝余额：${currentMoney}`);
        console.log(`当前等级：Lv.${currentLevelBody.level}`);
        console.log(`距离下一等级还需${nextLevel}成长值`);
        message += `当前成长值：${currentValue}\n`;
        message += `当前贴贝余额：${currentMoney}\n`;
        message += `当前等级：Lv.${currentLevelBody.level}\n`;
        message += `距离下一等级还需${nextLevel}成长值\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}
