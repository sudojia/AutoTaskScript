/**
 * #小程序://顾家会员/DUUpEeo0zF2Gw8k
 *
 * 抓包 Host：https://mc.kukahome.com 获取请求头 AccessToken 和 X-Customer
 * export GU_HOME_TOKEN = 'AccessToken#X-Customer'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/12/3
 * @lastModifyTime 2024/12/27
 *
 * const $ = new Env('顾家家居')
 * cron: 5 10 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('顾家家居');
const kukaList = process.env.GU_HOME_TOKEN ? process.env.GU_HOME_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
const appId = '667516';
const appSecret = 'FH3yRrHG2RfexND8';
// 接口地址
const baseUrl = 'https://mc.kukahome.com'
let headers = {
    "user-agent": sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'brandCode': 'K001',
    'appid': '667516',
    'Referer': 'https://servicewechat.com/wx0770280d160f09fe/214/page-frame.html',
    'Accept-Language': 'zh-CN,zh;q=0.9',
};
!(async () => {
    await checkUpdate($.name, kukaList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < kukaList.length; i++) {
        const index = i + 1;
        const [aToken, xCustomer] = kukaList[i].split('#');
        // 添加请求头
        headers.AccessToken = aToken;
        headers['X-Customer'] = xCustomer;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        console.log(headers);
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
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await sign();
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await getArticleList();
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await getScore();
}

async function getUserInfo() {
    try {
        const data = await sendSignRequest(`/club-server/api/user/info`, 'post');
        const nickName = data.data.nickName || '简朴寨';
        const mobile = data.data.mobile || '18888888888';
        console.log(`${nickName}(${mobile})`);
        message += `${nickName}(${mobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

async function sign() {
    try {
        const data = await sendSignRequest('/integral-server/scenePoint/scene/point', 'post', {
            "scene": "sign",
            "brandCode": "K001"
        });
        console.log(`签到成功，积分+${data.data}`);
        message += `签到成功，积分+${data.data}\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

async function getArticleList() {
    try {
        const data = await sendSignRequest(`/club-server/applet/waterfall/newWaterfall`, 'post', {
            pageNum: 1,
            pageSize: 30,
            source: 1
        });
        const article = data.data[Math.floor(Math.random() * data.data.length)];
        const {id, title} = article;
        console.log(`开始点赞【${title}】`);
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        await likePost(id);
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        await collectPost(id);
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        await sharePost(id);
    } catch (e) {
        console.error(`获取文章时发生异常：${e}`);
    }
}

async function likePost(postId) {
    try {
        const body = {id: postId};
        await sendSignRequest(`/club-server/front/postOrder/like`, 'post', body);
        await sendSignRequest(`/club-server/front/member/likeSendPoint`, 'post', {
            postOrderId: postId,
            triggerType: 1,
            content: "点赞"
        });
        console.log('点赞成功~');
        await $.wait(sudojia.getRandomWait(2e3, 3e3));
        console.log('开始取消点赞');
        await sendSignRequest(`/club-server/front/postOrder/like`, 'post', body);
        console.log('取消点赞成功~');
    } catch (e) {
        console.error(`点赞时发生异常：${e}`);
    }
}

async function collectPost(postId) {
    try {
        const body = {id: postId};
        await sendSignRequest(`/club-server/front/postOrder/collect`, 'post', body);
        await sendSignRequest(`/club-server/front/member/likeSendPoint`, 'post', {
            postOrderId: postId,
            triggerType: 2,
            content: "收藏"
        });
        console.log('收藏文章成功`');
        await $.wait(sudojia.getRandomWait(2e3, 3e3));
        console.log('开始取消收藏');
        await sendSignRequest(`/club-server/front/postOrder/collect`, 'post', body);
        console.log('取消收藏成功~');
    } catch (e) {
        console.error(`收藏时发生异常：${e}`);
    }
}

async function sharePost(postId) {
    try {
        await sendSignRequest(`/club-server/front/postOrder/share`, 'post', {id: postId});
        console.log('分享成功~');
        await $.wait(sudojia.getRandomWait(500, 800));
        await sendSignRequest(`/club-server/front/member/likeSendPoint`, 'post', {
            postOrderId: postId,
            triggerType: 3,
            content: "微信好友转发",
            forwardType: 2
        });
    } catch (e) {
        console.error(`分享时发生异常：${e}`);
    }
}

async function getScore() {
    try {
        const data = await sendSignRequest(`/club-server/front/member/userCenterScore`, 'get');
        console.log(`已连续签到${data.data.signCount}天`);
        console.log(`当前积分：${data.data.point}`);
        message += `已连续签到${data.data.signCount}天\n`;
        message += `当前积分：${data.data.point}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：${e}`);
    }
}

async function sendSignRequest(url, method, body) {
    headers.sign = genSign();
    if (body) {
        headers.parameterSign = genSign(body);
    }
    const data = await sudojia.sendRequest(`${baseUrl}${url}`, method, headers, body);
    if (0 !== data.code) {
        throw new Error(`请求 ${url} 失败：${data.message}\n`);
    }
    return data;
}

function genSign(body) {
    const ts = new Date().getTime();
    headers.timestamp = ts;
    if (body) {
        return sudojia.md5(sudojia.md5(processBody(body)) + String(ts).substring(4, 10));
    } else {
        return sudojia.md5(appId + appSecret + ts).toLowerCase();
    }
}

function processBody(data) {
    return Object.keys(data).sort((a, b) => a.localeCompare(b)).map(key => {
        const value = data[key];
        return [key, typeof value === 'object' || Array.isArray(value) ? JSON.stringify(value) : value];
    }).filter(pair => pair !== null).map(([key, value]) => `${key}=${value}`).join('&');
}
