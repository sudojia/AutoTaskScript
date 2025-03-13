/**
 * TILTA影像城小程序
 *
 * 抓包 Host：https://java.vrupup.com 获取请求头 authorization 的值
 * export TILTA_TOKEN = 'eyJ0eXAiOxxxxxxxx'
 * 多账号用 & 或换行
 *
 * 时效性很短，不建议跑
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/01
 *
 * const $ = new Env('TILTA影像城')
 * cron: 5 10 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('TILTA影像城');
const moment = require("moment");
const tiltaList = process.env.TILTA_TOKEN ? process.env.TILTA_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://java.vrupup.com'
// 请求头
const headers = {
    'xweb_xhr': '1',
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': 'https://servicewechat.com/wxca94758d1196d2ff/33/page-frame.html',
    'Accept-Encoding': 'gzip, deflate, br',
};

!(async () => {
    await checkUpdate($.name, tiltaList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < tiltaList.length; i++) {
        const index = i + 1;
        headers.authorization = tiltaList[i];
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
    await getSignList();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getTaskList();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await updateTask();
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
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/get_user_detail`, 'post', headers);
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        const nickName = data.data.nickName;
        const mobile = data.data.mobile;
        const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}`;
        console.log(`${nickName}(${hiddenMobile})`);
        message += `${nickName}(${mobile})\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 获取签到列表
 *
 * @return {Promise<void>}
 */
async function getSignList() {
    try {
        const planDate = moment().format('YYYY-MM-D');
        const day = new Date().getDate();
        // const day = moment().format('D');
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/personal/sign/list`, 'post', headers, {
            "planDate": planDate
        });
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        const signData = data.data.calendar.find(d => d.day === day);
        if (signData) {
            if (signData.status === 1) {
                console.log('今日已签到');
                message += `今日已签到\n`;
                return;
            }
            await $.wait(sudojia.getRandomWait(1000, 1500));
            await sign();
        } else {
            console.log(`未获取到签到任务，请手动打开小程序是否正常！`);
        }
    } catch (e) {
        console.error(`获取签到列表时发生异常：${e}`);
    }
}

/**
 * 签到函数
 *
 * @return {Promise<void>}
 */
async function sign() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/personal/sign/save`, 'post', headers);
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log(`签到成功！`);
        message += `签到成功!\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取任务列表
 *
 * @return {Promise<void>}
 */
async function getTaskList() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/task/list`, 'post', headers);
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        // 过滤[评价最近一笔商品订单]
        const taskList = data.data.filter(task => task.id !== 6);
        for (const task of taskList) {
            if (task.taskStatus !== 0) {
                console.log(`任务【${task.name}】已完成`);
                await $.wait(sudojia.getRandomWait(888, 1200));
                continue;
            }
            console.log(`开始做【${task.name}】`);
            await $.wait(sudojia.getRandomWait(1000, 1500));
            switch (task.id) {
                case 1:
                    // 铁粉社区文章点赞
                    const articleId = await getArticleList(3);
                    await $.wait(sudojia.getRandomWait(1000, 2000));
                    await likeArticle(articleId);
                    break;
                case 2:
                    // 首页浏览两件商品
                    await getProductList();
                    await $.wait(sudojia.getRandomWait(1000, 2000));
                    await getProductList();
                    break;
                case 3:
                    // 阅读铁粉社区文章10s
                    await finishTask(3);
                    break;
                case 7:
                    // 阅读新闻中心文章10s
                    await finishTask(7);
                    break;
                case 8:
                    // 阅读配件研究所文章10s
                    await finishTask(8);
                    break;
                default:
                    console.error(`有新任务冒出来了【${task.name}】`);
                    break;
            }
        }
    } catch (e) {
        console.error(`获取任务列表时发生异常：${e}`);
    }
}

/**
 * 获取文章列表
 *
 * @param categoryId 分类ID、1：配件研究所，2：新闻中心，3：铁粉社区
 * @return {Promise<*>}
 */
async function getArticleList(categoryId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/article/page`, 'post', headers, {
            "pageNumber": 1,
            "pageSize": 100,
            "articleCategoryId": categoryId
        });
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        const article = data.data.list[Math.floor(Math.random() * data.data.list.length)];
        return article.id;
    } catch (e) {
        console.error(`获取文章列表时发生异常：${e}`);
    }
}

/**
 * 点赞文章
 *
 * @param articleId 文章ID
 * @return {Promise<void>}
 */
async function likeArticle(articleId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/article/like`, 'post', headers, {
            "articleId": articleId
        });
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log('点赞文章成功！');
    } catch (e) {
        console.error(`点赞文章时发生异常：${e}`)
    }
}

/**
 * 首页浏览两件商品
 *
 * @return {Promise<void>}
 */
async function getProductList() {
    try {
        let data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/product/cate/list`, 'post', headers, {
            "pid": 15,
            "type": 2
        });
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        const product = data.data[Math.floor(Math.random() * data.data.length)];
        const cateTwoId = product.id;
        await $.wait(sudojia.getRandomWait(1000, 1500));
        data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/product/page`, 'post', headers, {
            "pageNumber": 1,
            "pageSize": 10,
            "cateOneId": "15",
            "cateTwoId": cateTwoId,
            "name": "",
            "productType": "1",
            "sort": ""
        })
        const proList = data.data.list[Math.floor(Math.random() * data.data.list.length)];
        console.log(`开始浏览【${proList.name}】`);
        await $.wait(sudojia.getRandomWait(1000, 2000));
        await getProductDetail(proList.id);
    } catch (e) {
        console.error(`获取商品列表时发生异常：${e}`)
    }
}

/**
 * 获取商品任务
 *
 * @param productId
 * @return {Promise<void>}
 */
async function getProductDetail(productId) {
    try {
        let data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/product/detail`, 'post', headers, {
            "id": productId
        });
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        await $.wait(sudojia.getRandomWait(1000, 2000));
        data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/v2/pt/queryptlist`, 'post', headers, {
            "id": productId
        });
        console.log('浏览商品成功');
    } catch (e) {
        console.error(`获取商品详情时发生异常：${e}`)
    }
}

/**
 * 浏览新闻中心和配件研究所任务
 *
 * @param taskId
 * @return {Promise<void>}
 */
async function finishTask(taskId = 7) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/task/finishTask`, 'post', headers, {
            "id": taskId
        });
        await $.wait(sudojia.getRandomWait(10000, 11000));
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log('阅读成功！');
    } catch (e) {
        console.error(`完成任务时发生异常：${e}`)
    }
}

/**
 * 更新任务列表
 *
 * @return {Promise<void>}
 */
async function updateTask() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/task/list`, 'post', headers);
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        // 过滤[评价最近一笔商品订单]
        const taskList = data.data.filter(task => task.id !== 6);
        for (const task of taskList) {
            if (task.taskStatus === 1) {
                message += `${task.name}---已完成✅\n`;
            } else {
                message += `${task.name}---未完成❌\n`;
            }
        }
    } catch (e) {
        console.error(`更新任务列表时发生异常：${e}`);
    }
}

/**
 * 获取用户积分
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/tietou-shop/api/get_user_detail`, 'post', headers);
        if (1 !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log(`当前积分：${data.data.point}`);
        message += `当前积分：${data.data.point}\n\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}
