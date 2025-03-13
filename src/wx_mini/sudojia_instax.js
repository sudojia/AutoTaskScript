/**
 * 富士instax玩拍由我俱乐部小程序
 *
 * 抓包 Host：https://instax.app.xcxd.net.cn 获取请求头 Authorization 的值，并且删掉 Bearer
 * 首次登录在我的 - 绑定手机号加入会员
 * 脚本默认执行抽奖，如需禁用请在变量值后面添加 #false
 * export INSTAX_TOKEN = 'xxxxx#false'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/17
 *
 * const $ = new Env('玩拍由我俱乐部')
 * cron: 41 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('玩拍由我俱乐部');
const instaxList = process.env.INSTAX_TOKEN ? process.env.INSTAX_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://instax.app.xcxd.net.cn'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://servicewechat.com/wx3cb572fbf3aa30c8/136/page-frame.html',
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Host': 'instax.app.xcxd.net.cn',
};

!(async () => {
    await checkUpdate($.name, instaxList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < instaxList.length; i++) {
        const index = i + 1;
        const [auth, enableDraw] = instaxList[i].split('#');
        headers.Authorization = `Bearer ${auth}`;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main(enableDraw);
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main(enableDraw) {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1500, 2000));
    await signActivity();
    await $.wait(sudojia.getRandomWait(1500, 2000));
    if (enableDraw === 'false') {
        console.log('检测到未开启抽奖，本次将取消抽奖');
        return;
    }
    await getChance();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/me`, 'get', headers);
        if (data.error === false) {
            $.userId = data.data.user.id;
            console.log(`昵称：${data.data.user.nickname}\n当前积分：${data.data.user.credit}\n等级：${data.data.user.user_level_id}`);
            message += `昵称：${data.data.user.nickname}\n当前积分：${data.data.user.credit}\n等级：Lv.${data.data.user.user_level_id}\n`;
        }
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e.response.data}`);
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function signActivity() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/${$.userId}/sign-activity/25/sign`, 'post', headers);
        if (data.error === false) {
            console.log('签到成功');
            message += '签到成功\n';
        }
    } catch (e) {
        if (e.response.status === 422) {
            message += e.response.data.tips + '\n';
            console.error(e.response.data.tips);
        } else {
            console.error(`签到时发生异常：${e}`);
        }
    }
}

/**
 * 获取抽奖次数
 *
 * @return {Promise<void>}
 */
async function getChance() {
    try {
        let data = await sudojia.sendRequest(`${baseUrl}/api/user/${$.userId}/draw-activities/42/chance`, 'get', headers);
        if (data.error === false) {
            let count = data.data;
            if (count <= 0) {
                console.log('今日抽奖次数已用光啦~');
                message += '今日抽奖次数已用光啦~\n\n';
                return;
            }
            message += '抽奖获得了：\n';
            while (count > 0) {
                console.log(`第${count}次抽奖机会`);
                await $.wait(sudojia.getRandomWait(3000, 3500));
                await draw();
                // 抽奖后再次检查抽奖次数
                await $.wait(sudojia.getRandomWait(2000, 2600));
                data = await sudojia.sendRequest(`${baseUrl}/api/user/${$.userId}/draw-activities/42/chance`, 'get', headers);
                count = data.data;
                // await getChance();
            }
        }
        message += '\n\n';
    } catch (e) {
        console.error(`获取抽奖次数时发生异常：${e.response.data}`);
    }
}

/**
 * 抽奖
 *
 * @return {Promise<void>}
 */
async function draw() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/user/${$.userId}/draw-activities/42/draw`, 'post', headers);
        if (data.error === false) {
            console.log(`抽奖成功，获得[${data.data.record.desc}]`);
            message += `${data.data.record.desc}、`;
        }
    } catch (e) {
        console.error(`抽奖时发生异常：${e.response.data}`);
    }
}
