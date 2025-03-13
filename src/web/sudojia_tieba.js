/**
 * 百度贴吧每日签到
 *
 * 打开 tieba.baidu.com 登录后复制 cookie 只要 BDUSS 的值
 * export TIE_BA_COOKIE = 'xxxxxxxxxxxxxxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/5/18
 *
 * const $ = new Env('贴吧签到')
 * cron: 33 13 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('贴吧签到');
const crypto = require("crypto");
const tieBaList = process.env.TIE_BA_COOKIE ? process.env.TIE_BA_COOKIE.split(/[\n&]/) : [];
let message = '';
// 贴吧 API
const TIEBA_API = {
    TBS_API: 'http://tieba.baidu.com/dc/common/tbs',
    FOLLOW_API: 'https://tieba.baidu.com/mo/q/newmoindex',
    SIGN_API: 'http://c.tieba.baidu.com/c/c/forum/sign'
}
// 请求头
const headers = {
    'connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'tieba.baidu.com',
    'charset': 'UTF-8',
    'User-Agent': sudojia.getRandomUserAgent('H5'),
};
!(async () => {
    await checkUpdate($.name, tieBaList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < tieBaList.length; i++) {
        const index = i + 1;
        const matchList = tieBaList[i].match(/BDUSS=([^;]+);?/);
        if (matchList) {
            headers.Cookie = `BDUSS=${matchList[1]}`;
        } else {
            headers.Cookie = `BDUSS=${tieBaList[i]}`;
        }
        // 签到响应的数组存放信息
        $.success = [];
        // 存储用户所关注的贴吧
        $.follow = [];
        // 签到失败的贴吧列表
        $.failed = [];
        // 失效的贴吧列表
        $.invalid = []
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        $.tbs = await getTBS();
        if (!$.tbs) {
            console.error('Cookie 已失效');
            await notify.sendNotify(`「Cookie失效通知」`, `${$.name}账号[${index}] Cookie 已失效，请重新登录获取 Cookie\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 3000));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getTieBaFollow();
    await $.wait(sudojia.getRandomWait(1200, 1800));
    await signTieBa();
}

/**
 * 获取 TBS
 *
 * @returns {Promise<*>}
 */
async function getTBS() {
    try {
        const data = await sudojia.sendRequest(`${TIEBA_API.TBS_API}`, 'get', headers);
        return data.tbs;
    } catch (e) {
        console.error(`获取 TBS 发生异常：${e}`);
        return null;
    }
}

/**
 * 获取贴吧列表
 *
 * @returns {Promise<*[]>}
 */
async function getTieBaFollow() {
    // 存储用户所关注的贴吧
    try {
        const data = await sudojia.sendRequest(TIEBA_API.FOLLOW_API, 'get', headers);
        $.followNum = data.data.like_forum.length;
        for (const likeForum of data.data.like_forum) {
            // 0 表示未签到
            if (0 === likeForum.is_sign) {
                const tiebaName = likeForum.forum_name.replace('+', '%2B');
                $.follow.push(tiebaName);
                const isTrue = await isTieBaNotExist(tiebaName);
                await $.wait(sudojia.getRandomWait(1000, 2000));
                if (isTrue) {
                    $.follow = $.follow.filter(item => item !== tiebaName);
                    $.invalid.push(tiebaName);
                    $.failed.push(tiebaName);
                }
            } else {
                $.success.push(likeForum.forum_name.replace('+', '%2B'));
            }
        }
        console.log(`正在开始签到所有贴吧, 共计 ${$.followNum} 个贴吧, 请耐心等待...`);
    } catch (error) {
        console.error(`获取关注贴吧失败：${error}`);
    }
}

/**
 * 判断贴吧是否失效 true：贴吧失效，false：贴吧存在
 *
 * @param forum_name
 *
 * @return {Promise<boolean>}
 */
async function isTieBaNotExist(forum_name) {
    try {
        const data = await sudojia.sendRequest(`https://tieba.baidu.com/f?ie=utf-8&kw=${forum_name}&fr=search`, 'get', headers);
        const dataAsString = typeof data === 'string' ? data : data.toString();
        return dataAsString.includes('很抱歉，没有找到相关内容');
    } catch (e) {
        console.error(`获取失效贴吧发生异常：${e}`);
    }
}

/**
 * 签到函数
 *
 * @return {Promise<*[]>}
 */
async function signTieBa() {
    try {
        let maxAttempts = 5;
        while ($.success.length < $.followNum && maxAttempts > 0) {
            try {
                for (let forumName of Array.from($.follow)) {
                    const sign = `kw=${forumName}tbs=${$.tbs}tiebaclient!!!`;
                    const encodedSign = crypto.createHash('md5').update(sign).digest('hex');
                    const postData = {
                        kw: forumName,
                        tbs: $.tbs,
                        sign: encodedSign
                    };
                    const rotation = forumName.replace('%2B', '+');
                    const data = await sudojia.sendRequest(TIEBA_API.SIGN_API, 'post', headers, postData);
                    await $.wait(sudojia.getRandomWait(1000, 2000));
                    if (data.error_code === '0') {
                        $.follow = $.follow.filter(item => item !== forumName);
                        $.success.push(rotation);
                        $.failed = $.failed.filter(item => item !== forumName);
                    } else {
                        $.failed.push(rotation);
                    }
                }
            } catch (error) {
                console.error('签到失败：', error);
                maxAttempts--;
                await $.wait(sudojia.getRandomWait(5000, 10000));
            }
            if ($.success.length !== $.followNum - $.invalid.length) {
                await $.wait(sudojia.getRandomWait(15000, 30000));
                $.tbs = await getTBS();
            }
            maxAttempts--;
        }
        const totalFailed = $.followNum.length - $.success.length || 0;
        message += `【贴吧总结】${$.followNum}个\n【签到统计】成功签到${$.success.length}个, 失败${totalFailed}个, 过滤失效贴吧${$.invalid.length}个\n\n`;
        console.log(`成功签到${$.success.length}个, 失败${totalFailed}个, 过滤失效贴吧${$.invalid.length}个`);
    } catch (e) {
        console.error(`签到发生异常：${e}`);
    }
}
