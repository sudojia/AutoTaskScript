/**
 * 上海杨浦APP
 *
 * 抓包 Host：https://ypapi.shmedia.tech 获取请求头 token
 * export SHYP_TOKEN = 'eyJ0eXxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/10/05
 *
 * const $ = new Env('上海杨浦')
 * cron: 33 7 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('上海杨浦');
const shMediaList = process.env.SHYP_TOKEN ? process.env.SHYP_TOKEN.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://ypapi.shmedia.tech'
// 请求头
const headers = {
    'User-Agent': 'okhttp/4.10.0',
    'Accept-Encoding': 'gzip',
    'siteid': '310110',
    'content-type': 'application/json; charset=UTF-8'
};
// 请求体
const dataBody = {
    "orderBy": "release_desc",
    "requestType": "2",
    "siteId": "310110"
}
// 映射表用于转换任务 ID
const TASK_ID_MAP = {
    '002': 'read',
    '003': 'video',
    '007': 'share'
};

!(async () => {
    await checkUpdate($.name, shMediaList);
    for (let i = 0; i < shMediaList.length; i++) {
        const index = i + 1;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        headers.token = shMediaList[i];
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
    await $.wait(sudojia.getRandomWait(1500, 2500));
    await doTask();
    await $.wait(sudojia.getRandomWait(1500, 2500));
    await getPoints();
    await $.wait(sudojia.getRandomWait(1500, 2500));
    await getGoodsList();
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/personal/get`, 'post', headers);
        if (0 !== data.code) {
            return console.error('获取用户信息失败 ->', data.msg);
        }
        const mobile = data.data.mobile || '18888888888';
        const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}`;
        console.log(`${data.data.nickname}(${hiddenMobile})`);
        message += `${data.data.nickname}(${mobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常 -> ${e}`);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/personal/score/sign`, 'post', headers, dataBody);
        if (0 !== data.code) {
            return console.error('签到失败 ->', data.msg);
        }
        if (!data.data.score) {
            return console.error(data.data.title);
        }
        console.log(`签到成功，积分+${data.data.score}`);
        message += `签到成功\n`;
    } catch (e) {
        console.error(`签到时发生异常 -> ${e}`);
    }
}

/**
 * 获取任务列表
 *
 * @returns {Promise<void>}
 */
async function doTask() {
    try {
        let data = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/personal/score/info`, 'post', headers, dataBody);
        if (0 !== data.code) {
            return console.error(`获取任务列表失败 -> ${data.msg}`);
        }
        const tasks = data.data.jobs;
        for (const item of tasks) {
            if (['004'].includes(item.id)) {
                console.log(`\n跳过【${item.title}】`);
                continue;
            }
            // 已获得的任务积分
            let taskScore = item.progress;
            if (taskScore >= item.totalProgress) {
                console.log(`【${item.title}】任务已完成`)
                await $.wait(sudojia.getRandomWait(800, 1300));
                continue;
            }
            console.log(`\n开始【${item.title}】`);
            await $.wait(sudojia.getRandomWait(1e3, 2e3));
            while (taskScore < item.totalProgress) {
                // 获取文章 ID
                const articleId = await getArticleId();
                switch (item.id) {
                    case '001':
                        // 签到
                        await sign();
                        await $.wait(sudojia.getRandomWait(2e3, 3e3));
                        break;
                    case '002': // 阅读
                    case '003': // 视频
                    case '007': // 分享
                        await commonTask(item.id, item.title);
                        break;
                    case '005':
                        // 收藏
                        await favorArticle(articleId);
                        await $.wait(sudojia.getRandomWait(5e3, 8e3));
                        break;
                    case '006':
                        // 评论
                        await commentArticle(articleId);
                        await $.wait(sudojia.getRandomWait(15000, 20000));
                        break;
                    default:
                        console.log(`其它任务：${item.title}`);
                        break;
                }
                // 更新 taskScore
                taskScore = await updateTaskScore(item.id);
                await $.wait(sudojia.getRandomWait(1e3, 2e3));
            }
        }
    } catch (e) {
        console.error(`获取任务列表时发生异常 -> ${e}`);
    }
}

/**
 * 通用任务 002
 *        003
 *        007
 *
 * @param taskId
 * @param taskName
 * @returns {Promise<void>}
 */
async function commonTask(taskId, taskName) {
    const taskType = TASK_ID_MAP[taskId];
    const taskUrl = `${baseUrl}/media-basic-port/api/app/points/${taskType}/add`;
    const taskData = await sudojia.sendRequest(taskUrl, 'post', headers, {
        "orderBy": "release_desc",
        "requestType": "1",
        "siteId": "310110"
    });
    if (0 !== taskData.code) {
        throw new Error(`${taskName}任务失败 -> ${taskData.msg}`);
    }
    console.log(`${taskName}任务成功`);
    await $.wait(sudojia.getRandomWait(5e3, 8e3));
}

/**
 * 更新任务积分
 *
 * @param itemId
 * @returns {Promise<*|void>}
 */
async function updateTaskScore(itemId) {
    try {
        const updatedData = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/personal/score/info`, 'post', headers, dataBody);
        if (0 !== updatedData.code) {
            return console.error('更新任务列表失败 ->', updatedData.msg);
        }
        const updatedItem = updatedData.data.jobs.find(job => job.id === itemId);
        if (!updatedItem) {
            return console.error(`未找到任务ID: ${itemId}`);
        }
        return updatedItem.progress;
    } catch (e) {
        console.error(`更新任务列表出错 -> ${e}`);
    }
}

/**
 * 获取文章 ID
 *
 * @returns {Promise<*|null>}
 */
async function getArticleId() {
    try {
        // 频道列表
        const channelIds = [
            // 推荐
            'a978f44b3e284e5e86777f9d4e3be7bb',
            // 要闻
            '01ff4b46f6bf4e19af6fe88e6320a6c1',
            // 时政
            'ba1f152e715f4ee99e6e13a02f6a218e',
            // 三区
            '0375dc90023f43ffafaf9bc161c30348',
            // 城事
            '0ea24f917ab54157bcd2cecffbf9bfa2'
        ];
        // 随机选择一个频道
        const channelId = channelIds[Math.floor(Math.random() * channelIds.length)];
        const data = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/news/content/list`, 'post', headers, {
            "channel": {
                "id": channelId
            },
            "pageNo": 1,
            "pageSize": 30,
            "orderBy": "release_desc",
            "requestType": "1",
            "siteId": "310110"
        });
        if (0 !== data.code) {
            console.error('获取新闻列表失败 ->', data.msg)
            return null;
        }
        const articles = data.data.records[Math.floor(Math.random() * data.data.records.length)];
        return articles.id;
    } catch (e) {
        console.error(`获取文章 ID 时发生异常 -> ${e}`);
        return null;
    }
}

/**
 * 收藏文章
 *
 * @returns {Promise<void>}
 */
async function favorArticle(articleId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/news/content/favor`, 'post', headers, {
            "id": articleId,
            "orderBy": "release_desc",
            "requestType": "2",
            "siteId": "310110"
        });
        if (0 !== data.code) {
            return console.error('收藏文章失败 ->', data.msg);
        }
        console.log(`收藏文章成功\n`);
    } catch (e) {
        console.error(`收藏文章时发生异常 -> ${e}`);
    }
}

/**
 * 文章评论
 *
 * @returns {Promise<void>}
 */
async function commentArticle(articleId) {
    try {
        // 随机评论句子
        const contentList = [
            '👍',
            '👍👍',
            '好！！',
            '占个楼',
            'mark！',
            '读完这篇文章后，我感到充满了力量和决心',
            '这篇文章让我感到非常温暖和鼓舞',
            '激荡团结奋斗的强大正能量，汇聚起亿万人民团结奋斗的磅礴之力。'
        ];
        const content = contentList[Math.floor(Math.random() * contentList.length)];
        console.log(`随机获取评论句子：[${content}]`);
        const data = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/common/comment/add`, 'post', headers, {
            "content": content,
            "displayResources": [],
            "targetId": articleId,
            "targetType": "content",
            "pageNo": 0,
            "pageSize": 10,
            "orderBy": "create_desc",
            "requestType": "1",
            "siteId": "310110"
        })
        if (0 !== data.code) {
            return console.error('评论文章失败 ->', data.msg, '\n');
        }
        console.log('评论成功\n');
    } catch (e) {
        console.error(`评论文章时发生异常 -> ${e}`);
    }
}

/**
 * 获取积分
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/media-basic-port/api/app/personal/score/info`, 'post', headers, dataBody);
        if (0 !== data.code) {
            return console.error('获取任务列表失败 ->', data.msg);
        }
        const tasks = data.data.jobs;
        for (const item of tasks) {
            if (['004'].includes(item.id)) {
                continue;
            }
            if ('1' === item.status) {
                message += `【${item.title}】已完成\n`;
            }
        }
        $.points = data.data.totalScore || 0;
        if (data.data.signTitle) {
            console.log(data.data.signTitle);
            message += `${data.data.signTitle}\n`;
        }
        console.log(`当前积分：${$.points}`);
        message += `当前积分：${$.points}\n`;
    } catch (e) {
        console.error(`获取积分时发生异常 -> ${e}`);
    }
}

/**
 * 获取商品列表
 *
 * @returns {Promise<void>}
 */
async function getGoodsList() {
    try {
        const requests = [
            {
                params: 'seller_id=31011001&page_no=1&page_size=10&shop_cat_id=1544652237932859394&sort=create_desc',
                type: '限时商品'
            },
            {
                params: 'keyword=&page_no=1&page_size=20&sort=create_desc&seller_id=31011001&shop_cat_id=1431136756879056898',
                type: '虚拟商品'
            }
        ];
        for (const req of requests) {
            let data = await sudojia.sendRequest(`https://mall-api.shmedia.tech/goods-service/goods/search?${req.params}`, 'get', headers);
            await $.wait(sudojia.getRandomWait(1e3, 2e3));
            if (!data || !data.data) {
                console.error(`${req.type}: data 数据为空`);
                continue;
            }
            const promotions = data.data.flatMap(item => item.promotion);
            let hasExchangeableGoods = false;
            console.log(`${req.type}:`);
            message += `${req.type}:\n`;
            for (const ex of promotions) {
                const {goods_name, exchange_point} = ex.exchange;
                if ($.points >= exchange_point) {
                    console.log(`可兑换[${goods_name}], 所需[${exchange_point}]积分`);
                    message += `可兑换[${goods_name}], 所需[${exchange_point}]积分\n`;
                    hasExchangeableGoods = true;
                }
            }
            if (!hasExchangeableGoods) {
                message += `当前积分暂无商品可兑换\n\n`;
                console.log(`当前积分暂无商品可兑换\n`);
            }
        }
    } catch (e) {
        console.error(`获取商品列表时发生异常 -> ${e}`);
    }
}
