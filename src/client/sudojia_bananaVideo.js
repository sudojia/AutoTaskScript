/**
 * 香蕉视频 APP
 *
 * 扫码下载：https://pic.rmb.bdstatic.com/bjh/240914/dc8411e749492d270032b5278c5abd321993.png
 * 开发不易，走个邀请码呗，感谢!!!
 * 邀请码：IOWDUC
 * 每日签到及任务获得金币, 金币可提现或在棋牌处单车变摩托, 10 金币 = 1元, 保底每日 6 金币
 * 手机号#密码
 * export BANANA_ACCOUNT = '18888888888#123456'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/14
 *
 * const $ = new Env('香蕉视频')
 * cron: 10 1 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('香蕉视频');
const bananaList = process.env.BANANA_ACCOUNT ? process.env.BANANA_ACCOUNT.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://mgcrjh.ipajx0.cc'
// 收藏列表数组
let favoriteList = [];
// 请求头
const headers = {
    "x-system": "Android",
    "x-channel": "xj1",
    "x-version": "5.0.5",
    'User-Agent': sudojia.getRandomUserAgent('H5'),
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"
};

!(async () => {
    await checkUpdate($.name, bananaList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < bananaList.length; i++) {
        const index = i + 1;
        const [phone, pwd] = bananaList[i].split('#');
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await main(phone, pwd);
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main(phone, pwd) {
    // 登录
    await login(phone, pwd);
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 获取用户信息
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 签到
    await sign();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 添加收藏
    await addFavorite();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 获取收藏列表并删除收藏
    await getFavoriteList();
    await $.wait(sudojia.getRandomWait(800, 1200));
    await removeFavorite();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 点击广告任务
    await adViewClick();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 下载长视频任务
    await downLoadVideoTask();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 观看影片任务
    await watchVideo();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 保存二维码任务
    await qrcodeSave();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 发布评论任务
    await postComment();
    await $.wait(sudojia.getRandomWait(1500, 2000));

    // 获取金币
    await getPoints();
}

/**
 * 登录
 *
 * @return {Promise<void>}
 */
async function login(phone, pwd) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/login`, 'post', headers, `logintype=0&mobiprefix=86&mobi=${phone}&password=${pwd}`);
        if (0 !== data.retcode) {
            return console.error(data.errmsg);
        }
        headers['X-Cookie-Auth'] = data.data.xxx_api_auth;
        console.log(`登录成功~`);
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
    }
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/ucp/index`, 'get', headers);
        if (0 !== data.retcode) {
            return console.error(data.errmsg);
        }
        console.log(`昵称：${data.data.user.username}`);
        message += `昵称：${data.data.user.username}\n`;
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
        const data = await sudojia.sendRequest(`${baseUrl}/ucp/task/sign`, 'post', headers);
        if (0 !== data.retcode) {
            message += `${data.errmsg}\n`;
            return console.error(data.errmsg);
        }
        console.log(`签到成功，金币+${data.data.taskdone}`);
        message += `签到成功\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 视频收藏
 *
 * @returns {Promise<void>}
 */
async function addFavorite() {
    // 每次收藏的最大尝试次数
    const maxAttempts = 5;
    for (let i = 0; i < 5; i++) {
        let attempt = 0;
        while (attempt < maxAttempts) {
            try {
                const data = await sudojia.sendRequest(`${baseUrl}/favorite/add`, 'post', headers, `vodid=${sudojia.getRandomWait(1, 66000)}`);
                if (data.retcode === 0) {
                    console.log(`第 ${i + 1} 次收藏视频成功！`);
                    await $.wait(sudojia.getRandomWait(1500, 2300));
                    break;
                } else if (data.retcode === -1) {
                    console.log(`第 ${i + 1} 次收藏视频失败（已收藏），重新尝试...`);
                    attempt++;
                    await $.wait(sudojia.getRandomWait(1500, 2300));
                } else {
                    console.error(`第 ${i + 1} 次收藏视频失败，错误代码：${data.retcode}，错误信息：${data.errmsg}`);
                    return;
                }
            } catch (e) {
                console.error(`收藏视频时发生异常：${e}`);
            }
        }
        if (attempt === maxAttempts) {
            console.error(`收藏视频达到最大尝试次数，收藏任务未成功`);
            return;
        }
    }
}

/**
 * 获取收藏列表
 *
 * @returns {Promise<void>}
 */
async function getFavoriteList() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/favorite/listing`, 'get', headers);
        if (0 !== data.retcode) {
            return console.error(`获取收藏列表失败：${data.errmsg}`);
        }
        for (const item of data.data.rows) {
            favoriteList.push(item.vodid);
        }
        console.log(`已获取收藏列表，开始删除收藏...`);
    } catch (e) {
        console.error(`获取收藏列表时发生异常：${e}`);
    }
}

/**
 * 删除收藏列表
 *
 * @returns {Promise<void>}
 */
async function removeFavorite() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/favorite/remove`, 'post', headers, `vodids=${favoriteList}`);
        if (0 !== data.retcode) {
            return console.error(`删除收藏视频失败：${data.errmsg}`);
        }
        console.log(`${data.errmsg}`);
    } catch (e) {
        console.error(`删除收藏视频时发生异常：${e}`);
    }
}


/**
 * 点击广告任务
 *
 * @returns {Promise<void>}
 */
async function adViewClick() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/ucp/task/adviewClick`, 'get', headers);
        if (0 !== data.retcode) {
            return console.error(`点击广告失败：${data.errmsg}`);
        }
        console.log(`点击广告成功，金币+${data.data.taskdone}`);
    } catch (e) {
        console.error(`点击广告时发生异常：${e}`);
    }
}

/**
 * 长视频下载任务
 *
 * @returns {Promise<void>}
 */
async function downLoadVideoTask() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/vod/reqdown/${sudojia.getRandomWait(1, 66000)}`, 'get', headers);
        if (0 !== data.retcode) {
            if (3 === data.retcode) {
                await $.wait(sudojia.getRandomWait(800, 1200));
                return await downLoadVideoTask();
            }
            console.error(`下载长视频失败：${data.errmsg}`);
            return;
        }
        if (!data.data.taskdone) {
            return console.error(`下载长视频任务已完成`);
        }
        console.log(`下载长视频任务成功，金币+${data.data.taskdone}`);
    } catch (e) {
        console.error(`下载长视频任务时发生异常：${e}`);
    }
}

/**
 * 观看影片任务
 *
 * @returns {Promise<void>}
 */
async function watchVideo() {
    try {
        let watched = 0;
        while (watched < 10) {
            const data = await sudojia.sendRequest(`${baseUrl}/v2/vod/reqplay/${sudojia.getRandomWait(1, 66000)}`, 'get', headers);
            if (0 !== data.retcode) {
                console.error(`观看影片任务失败：${data.errmsg}`);
                await $.wait(sudojia.getRandomWait(800, 1200));
                continue;
            }
            watched++;
            console.log(`已观看影片数量：${watched}`);
            await $.wait(sudojia.getRandomWait(1500, 2300));
        }
    } catch (e) {
        console.error(`观看影片时发生异常：${e}`);
    }
}

/**
 * 保存二维码任务
 *
 * @returns {Promise<void>}
 */
async function qrcodeSave() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/ucp/task/qrcodeSave`, 'get', headers);
        if (0 !== data.retcode) {
            return console.error(`保存二维码任务失败：${data.errmsg}`);
        }
        console.log(`保存二维码任务成功，金币+${data.data.taskdone}`);
    } catch (e) {
        console.error(`保存二维码任务时发生异常：${e}`);
    }
}

/**
 * 发布评论任务
 *
 * @returns {Promise<*|undefined>}
 */
async function postComment() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/comment/post`, 'post', headers, `vodid=${sudojia.getRandomWait(1, 66000)}&content=好`);
        if (0 !== data.retcode) {
            if (3 === data.retcode) {
                await $.wait(sudojia.getRandomWait(800, 1200));
                return await postComment();
            }
            console.error(`发布评论失败：${data.errmsg}`);
            return
        }
        console.log(data.errmsg);
    } catch (e) {
        console.error(`发布评论时发生异常：${e}`);
    }
}

/**
 * 获取金币
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/ucp/index`, 'get', headers);
        if (0 !== data.retcode) {
            return console.error(data.errmsg);
        }
        console.log(`当前金币：${data.data.user.goldcoin}`);
        message += `当前金币：${data.data.user.goldcoin}`;
    } catch (e) {
        console.error(`获取金币时发生异常：${e}`);
    }
}