/**
 * 心喜小程序
 *
 * 抓包 Host：https://api.xinc818.com 获取请求头 sso 的值
 * export XINXI_TOKEN = 'Wmeimob_eyxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/21
 *
 * const $ = new Env('心喜')
 * cron: 43 12 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('心喜');
const xinxiList = process.env.XINXI_TOKEN ? process.env.XINXI_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://api.xinc818.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': 'https://servicewechat.com/wx673f827a4c2c94fa/276/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
};

!(async () => {
    await checkUpdate($.name, xinxiList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < xinxiList.length; i++) {
        const index = i + 1;
        headers.sso = xinxiList[i];
        $.isLogin = true;
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
        process.exit(0);
    }
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await sign();
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getFreeDrawCount();
    await $.wait(sudojia.getRandomWait(2000, 3000));
    await share();
    await $.wait(sudojia.getRandomWait(2000, 3000));
    await browseGoods();
    await $.wait(sudojia.getRandomWait(2000, 3000));
    await getIntegralGoods();
    await $.wait(sudojia.getRandomWait(2000, 3000));
    await getCommunity();
    await $.wait(sudojia.getRandomWait(2000, 3000));
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/user`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg)
            if (40001 === data.code) {
                $.isLogin = false;
            }
            return;
        }
        $.userId = data.data.id;
        const nickName = data.data.nickname;
        const mobile = data.data.mobile;
        const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}`;
        const integral = data.data.integral;
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
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/sign/in?dailyTaskId=`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        if (!data.data.integral) {
            console.log('今日已签到');
            message += `今日已签到\n`;
            return;
        }
        console.log(`签到成功！喜点+${data.data.integral}`);
        console.log(`已连续签到${data.data.continuousDay}天`);
        message += `签到成功！\n已连续签到${data.data.continuousDay}\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取免费抽奖次数
 *
 * @return {Promise<void>}
 */
async function getFreeDrawCount() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/lottery/71/freeNum`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        console.log(`当前有${data.data}次免费抽奖机会`);
        if (0 >= data.data) {
            console.error(`免费抽奖次数已用完...`);
            return;
        }
        console.log('开始免费抽奖...');
        await $.wait(sudojia.getRandomWait(1200, 2000));
        await draw();
    } catch (e) {
        console.error(`获取免费抽奖次数时发生异常：${e}`);
    }
}

/**
 * 抽奖
 *
 * @return {Promise<void>}
 */
async function draw() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/lottery/draw`, 'post', headers, {
            "activityId": 71,
            "batch": false,
            "isIntegral": false,
            "userId": Number($.userId),
            "dailyTaskId": 9
        });
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        // 任务奖励喜点
        const drawPoints = data.data.taskResult.singleReward
        // 奖品
        const prizeName = data.data.lotteryResult[0].prizeName || '啥也没得';
        console.log(`已完成抽奖任务，奖励${drawPoints}喜点，抽奖获得了${prizeName}`);
        message += `抽奖获得了${prizeName}\n`;
    } catch (e) {
        console.error(`抽奖时发生异常：${e}`);
    }
}

/**
 * 分享心喜任务
 *
 * @return {Promise<void>}
 */
async function share() {
    try {
        for (let i = 0; i < 2; i++) {
            const data = await sudojia.sendRequest(`${baseUrl}/mini/dailyTask/share`, 'get', headers);
            if (0 !== data.code) {
                console.error(data.msg)
                return;
            }
            if (!data.data) {
                console.error('本周已完成分享心喜任务了');
                return;
            }
            console.log(`完成${data.data.taskName}成功！获得${data.data.singleReward}喜点`);
        }
    } catch (e) {
        console.error(`分享心喜任务时发生异常：${e}`);
    }
}

/**
 * 去商城浏览30秒
 *
 * @return {Promise<void>}
 */
async function browseGoods() {
    try {
        for (let i = 0; i < 2; i++) {
            const data = await sudojia.sendRequest(`${baseUrl}/mini/dailyTask/browseGoods/22`, 'get', headers);
            if (0 !== data.code) {
                console.error(data.msg)
                return;
            }
            if (!data.data) {
                console.error('本周已完成去商城浏览30秒任务了');
                return;
            }
            console.log(`完成${data.data.taskName}成功！获得${data.data.singleReward}喜点`);
        }
    } catch (e) {
        console.error(`去商城浏览30秒时发生异常：${e}`);
    }
}

/**
 * 随机获取商品 id
 *
 * @return {Promise<void>}
 */
async function getIntegralGoods() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/integralGoods?orderField=sort&orderScheme=DESC&pageSize=20&pageNum=1`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        const randomIndex = Math.floor(Math.random() * data.data.list.length);
        const goods = data.data.list[randomIndex];
        console.log(`随机获取到的商品ID：${goods.id}`);
        await $.wait(sudojia.getRandomWait(500, 1000));
        console.log('开始想要商品任务...')
        await $.wait(sudojia.getRandomWait(2000, 3000));
        await getIntegralGoodsDetail(goods.id);
    } catch (e) {
        console.error(`获取商品 id 时发生异常：${e}`);
    }
}

/**
 * 获取商品详情
 *
 * @param id 商品 id
 *
 * @return {Promise<void>}
 */
async function getIntegralGoodsDetail(id) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/integralGoods/${id}?type=`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        const outerId = data.data.outerId;
        await $.wait(sudojia.getRandomWait(2000, 3000));
        await likeItem(outerId)
    } catch (e) {
        console.error(`获取商品详情时发生异常：${e}`);
    }
}

/**
 * 想要商品
 *
 * @param outerId
 *
 * @return {Promise<void>}
 */
async function likeItem(outerId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/live/likeLiveItem`, 'post', headers, {
            "isLike": true,
            "dailyTaskId": 20,
            "productId": Number(outerId)
        });
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        if (!data.data) {
            console.error('本周已完成去商城浏览30秒任务了');
            return;
        }
        console.log(`完成${data.data.taskName}成功！获得${data.data.singleReward}喜点`);
    } catch (e) {
        console.error(`想要商品时发生异常：${e}`);
    }
}

/**
 * 获取帖子列表
 *
 * @return {Promise<void>}
 */
async function getCommunity() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/community/home/posts?pageNum=1&pageSize=20&queryType=1&position=2`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        // 随机获取帖子和用户
        const randomIndex = Math.floor(Math.random() * data.data.list.length);
        const posts = data.data.list[randomIndex];
        console.log(`随机获取到的帖子ID：${posts.id}`);
        await $.wait(sudojia.getRandomWait(500, 1000));
        console.log('开始点赞帖子...');
        await $.wait(sudojia.getRandomWait(2000, 3000));
        await likePost(posts.id);

        await $.wait(sudojia.getRandomWait(500, 1000));

        console.log(`随机获取到的用户ID：${posts.publisherId}`);
        await $.wait(sudojia.getRandomWait(500, 1000));
        console.log('开始关注用户...');
        await $.wait(sudojia.getRandomWait(2000, 3000));
        await follow(posts.publisherId);
    } catch (e) {
        console.error(`获取帖子列表时发生异常：${e}`);
    }
}

/**
 * 点赞帖子
 *
 * @param postId
 * @return {Promise<void>}
 */
async function likePost(postId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/posts/like`, 'put', headers, {
            "postsId": Number(postId),
            "decision": true
        });
        if (0 !== data.code) {
            console.error(data.msg);
            return;
        }
        if (!data.data) {
            console.error('本周已完成点赞用户任务了');
            return;
        }
        console.log(`完成${data.data.taskName}成功！获得${data.data.singleReward}喜点`);
    } catch (e) {
        console.error(`点赞用户时发生异常：${e}`);
    }
}

/**
 * 关注用户
 *
 * @return {Promise<void>}
 */
async function follow(publisherId) {
    try {
        let data = await sudojia.sendRequest(`${baseUrl}/mini/user/follow`, 'put', headers, {
            "decision": true,
            "followUserId": `${publisherId}`
        });
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        if (!data.data) {
            console.error('本周已完成关注用户任务了');
            return;
        }
        console.log(`完成${data.data.taskName}成功！获得${data.data.singleReward}喜点`);
        console.log(`等待五秒，开始取关用户...`);
        await $.wait(sudojia.getRandomWait(5000, 5200));
        data = await sudojia.sendRequest(`${baseUrl}/mini/user/follow`, 'get', headers, {
            "decision": false,
            "followUserId": `${publisherId}`
        });
        if (0 !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log(`取关成功！`);
    } catch (e) {
        console.error(`关注用户时发生异常：${e}`);
    }
}

/**
 * 获取喜点
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/mini/user`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg)
            return;
        }
        const integral = data.data.integral;
        message += `当前喜点：${integral}\n\n`;
    } catch (e) {
        console.error(`获取喜点时发生异常：${e}`);
    }
}
