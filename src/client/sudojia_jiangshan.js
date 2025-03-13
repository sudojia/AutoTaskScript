/**
 * 多娇江山APP
 *
 * 抓包 Host：https://vapp.tmuyun.com 获取请求头 X-SESSION-ID 的值
 * export JIANG_SHAN_SESSION = '66fa82xxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/29
 *
 * const $ = new Env('多娇江山')
 * cron: 26 9 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('多娇江山');
const crypto = require('crypto');
const jiangShanList = process.env.JIANG_SHAN_SESSION ? process.env.JIANG_SHAN_SESSION.split(/[\n&]/) : [];
// 推送消息
let message = '';
// 接口地址
const baseUrl = 'https://vapp.tmuyun.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent('H5'),
    'Accept-Encoding': 'gzip',
    'X-TENANT-ID': '24',
};

!(async () => {
    await checkUpdate($.name, jiangShanList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < jiangShanList.length; i++) {
        const index = i + 1;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        headers['X-SESSION-ID'] = jiangShanList[i];
        await $.wait(sudojia.getRandomWait(1e3, 1500));
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
    await $.wait(sudojia.getRandomWait(1500, 2500));
    await doTask();
    await $.wait(sudojia.getRandomWait(1500, 2500));
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1500, 2500));
    await updateTask();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const apiPath = '/api/user_mumber/account_detail';
        headers['X-SIGNATURE'] = generateSHA256(apiPath);
        const data = await sudojia.sendRequest(`${baseUrl}${apiPath}`, 'get', headers);
        if (0 !== data.code) {
            return console.error(`获取用户信息失败：${data.message}`);
        }
        console.log(`\n${data.data.rst.nick_name}(${data.data.rst.grade_name})`);
        console.log(`当前积分：${data.data.rst.total_integral}`);
        message += `${data.data.rst.nick_name}(${data.data.rst.grade_name})\n当前积分：${data.data.rst.total_integral}\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        const apiPath = '/api/user_mumber/sign';
        headers['X-SIGNATURE'] = generateSHA256(apiPath);
        const data = await sudojia.sendRequest(`${baseUrl}${apiPath}`, 'get', headers);
        if (0 !== data.code) {
            return console.error(`签到失败：${data.message}`);
        }
        console.log(`签到成功，积分+${data.data.signIntegral}，经验+${data.data.signExperience}`);
        console.log(`已连续签到${data.data.serialdays}天`);
        message += `签到成功\n已连续签到${data.data.serialdays}天\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

async function doTask() {
    const apiPath = '/api/user_center/task';
    headers['X-SIGNATURE'] = generateSHA256(apiPath);
    const data = await sudojia.sendRequest(`${baseUrl}${apiPath}?type=1&current=1&size=20`, 'get', headers);
    if (0 !== data.code) {
        return console.error(`获取任务列表失败：${data.message}`);
    }
    const taskList = data.data.list;
    for (const task of taskList) {
        if (task.finish_times >= task.frequency) {
            console.log(`【${task.name}】任务已完成`);
            await $.wait(sudojia.getRandomWait(1000, 1500));
            continue;
        }
        // 剩余次数
        const remainingTimes = task.frequency - task.finish_times;
        console.log(`开始任务【${task.name}】剩余[${remainingTimes}]次`);
        for (let i = 0; i < remainingTimes; i++) {
            let articleId = null;
            for (let j = 0; j < 5; j++) {
                articleId = await getArticleList();
                if (articleId) {
                    break;
                }
                await $.wait(sudojia.getRandomWait(2e3, 3e3));
            }
            if (!articleId) {
                console.error('已超过最大次数（5次）获取文章 ID 仍然失败，跳过此次任务...');
                continue;
            }
            switch (task.member_task_type) {
                case 2: // 新闻资讯阅读
                    await articleDetail(articleId);
                    break;
                case 3: // 分享资讯给好友
                    await shareArticle(articleId, 'share');
                    break;
                case 4: // 新闻资讯评论
                    await commentArticle(articleId);
                    break;
                case 5: // 新闻资讯点赞
                    await likeArticle(articleId);
                    break;
                case 6: // 使用本地服务
                    await shareArticle('', 'local');
                    break;
                default:
                    console.log(`未知任务名称【${task.name}】`);
                    break;
            }
            await $.wait(sudojia.getRandomWait(2e3, 3e3));
        }
    }
}

/**
 * 获取文章列表
 *
 * @returns {Promise<*|null|void>}
 */
async function getArticleList() {
    try {
        const channelIds = [
            // 社会
            '5da293a31b011b7c692ffda8',
            // 头条
            '5d3fe981b198500f695bdebf',
            // 要闻
            '6264b0b6fe3fc11a653387d2',
            // 人文
            '5d3fea3ab198500f695bdec4'
        ];
        // 随机选择一个频道
        const channelId = channelIds[Math.floor(Math.random() * channelIds.length)];
        const apiPath = '/api/article/channel_list';
        headers['X-SIGNATURE'] = generateSHA256(apiPath);
        const data = await sudojia.sendRequest(`${baseUrl}${apiPath}?channel_id=${channelId}`, 'get', headers);
        if (0 !== data.code) {
            return console.error(`获取文章列表失败：${data.message}`);
        }
        const articleList = data.data.article_list;
        const article = articleList[Math.floor(Math.random() * articleList.length)];
        if (!article) {
            return console.error(`文章列表为空，请重试...`);
        }
        return article.id;
    } catch (e) {
        console.error(`获取文章列表时发生异常：${e}`);
        return null;
    }
}

/**
 * 阅读文章
 *
 * @param articleId
 *
 * @returns {Promise<void>}
 */
async function articleDetail(articleId) {
    try {
        const apiPath = '/api/article/detail';
        headers['X-SIGNATURE'] = generateSHA256(apiPath);
        const data = await sudojia.sendRequest(`${baseUrl}${apiPath}?id=${articleId}`, 'get', headers);
        if (0 !== data.code) {
            return console.error(`阅读文章失败：${data.message}`);
        }
        await $.wait(sudojia.getRandomWait(3e3, 5e3));
        console.log(`阅读成功\n`);
    } catch (e) {
        console.error(`阅读文章时发生异常：${e}`);
    }
}

/**
 * 分享文章
 *
 * @param articleId
 *
 * @param requestType
 * @returns {Promise<void>}
 */
async function shareArticle(articleId, requestType = 'share') {
    try {
        while (true) {
            const apiPath = '/api/user_mumber/doTask';
            headers['X-SIGNATURE'] = generateSHA256(apiPath);
            if (requestType === 'share') {
                const data = await sudojia.sendRequest(`${baseUrl}${apiPath}`, 'post', headers, `memberType=3&member_type=3&target_id=${articleId}`);
                if (0 !== data.code) {
                    // 如果请求失败，则尝试获取新的文章ID并重试
                    console.error(`分享文章失败：${data.message}`);
                    console.log(`正在尝试获取新的文章ID...`);
                    await $.wait(sudojia.getRandomWait(2e3, 3e3));
                    articleId = await getArticleList();
                    console.log(`获取新的文章ID成功：${articleId}`);
                    continue;
                }
                await $.wait(sudojia.getRandomWait(2e3, 3e3));
                console.log(`分享成功\n`);
                break;
            } else {
                const data = await sudojia.sendRequest(`${baseUrl}${apiPath}`, 'post', headers, `memberType=6&member_type=6`);
                if (0 !== data.code) {
                    return console.error(`使用本地服务失败：${data.message}`);
                }
                if (!data.data.score_notify) {
                    return console.log(`本地服务使用任务已完成`);
                }
                console.log(`使用本地服务成功，积分+${data.data.score_notify.integral}，经验+${data.data.score_notify.experience}`);
                break;
            }
        }
    } catch (e) {
        console.error(`${requestType === 'share' ? '分享文章时发生异常' : '使用本地服务时'}发生异常：${e}`);
    }
}

/**
 * 点赞文章
 *
 * @param articleId
 * @returns {Promise<void>}
 */
async function likeArticle(articleId) {
    try {
        const apiPath = '/api/favorite/like';
        headers['X-SIGNATURE'] = generateSHA256(apiPath);
        const data = await sudojia.sendRequest(`${baseUrl}${apiPath}`, 'post', headers, `action=true&id=${articleId}`);
        if (0 !== data.code) {
            return console.error(`点赞文章失败：${data.message}`);
        }
        await $.wait(sudojia.getRandomWait(1500, 2500));
        console.log(`点赞成功\n`);
    } catch (e) {
        console.error(`点赞文章时发生异常：${e}`);
    }
}

/**
 * 评论文章
 *
 * @param articleId
 *
 * @returns {Promise<void>}
 */
async function commentArticle(articleId) {
    try {
        while (true) {
            const contents = ["好", "mark", "沙发"];
            const randomContent = contents[Math.floor(Math.random() * contents.length)];
            const apiPath = '/api/comment/create/v2';
            headers['X-SIGNATURE'] = generateSHA256(apiPath);
            const data = await sudojia.sendRequest(`${baseUrl}${apiPath}`, 'post', headers, {
                "channel_article_id": articleId,
                "content": randomContent
            });
            if (0 !== data.code) {
                console.error(`评论文章失败：${data.message}`);
                console.log(`正在尝试获取新的文章ID...`);
                await $.wait(sudojia.getRandomWait(2e3, 3e3));
                articleId = await getArticleList();
                console.log(`获取新的文章ID成功：${articleId}`);
                continue;
            }
            await $.wait(sudojia.getRandomWait(1500, 2500));
            console.log(`评论成功\n`);
            break;
        }
    } catch (e) {
        console.error(`评论文章时发生异常：${e}`);
    }
}

/**
 * 生成UUID
 *
 * @returns {string}
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 生成签名
 *
 * @param apiPath
 * @returns {string}
 */
function generateSHA256(apiPath) {
    const requestId = generateUUID();
    const timestamp = Date.now();
    headers['X-REQUEST-ID'] = requestId;
    headers['X-TIMESTAMP'] = timestamp;
    const data = `${apiPath}&&${headers['X-SESSION-ID']}&&${requestId}&&${timestamp}&&FR*r!isE5W&&24`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

async function updateTask() {
    try {
        const apiPath = '/api/user_center/task';
        headers['X-SIGNATURE'] = generateSHA256(apiPath);
        const data = await sudojia.sendRequest(`${baseUrl}${apiPath}?type=1&current=1&size=20`, 'get', headers);
        if (0 !== data.code) {
            return console.error(`获取任务列表失败：${data.message}`);
        }
        for (const item of data.data.list) {
            // 任务名称
            const taskName = item.name;
            // 已完成次数
            let finishTimes = item.finish_times
            // 任务次数
            const frequency = item.frequency
            message += `${taskName}【${finishTimes}/${frequency}】\n`;
        }
        message += '\n';
    } catch (e) {
        console.error(`获取任务列表时发生异常：${e}`);
    }
}