/**
 * 享玩游戏APP
 * 下载链接：https://dl.duoyou.com/fenapk/xwshare/xw_100016.apk?version=1.3
 *
 * 会员v0：起始签到 10 个玩豆，连续签到递增 1 玩豆，最高签到 15 个玩豆
 * 会员v1-2：起始 15，最高 20
 * ...
 * 会员v10：起始 75，最高 80
 * 具体自行查看签到规则
 *
 * 以会员v0来计算（包含连签奖励）：
 * 10 玩豆 兑换 0.1 现金，
 * 500 玩豆 兑换 5 现金，大约需 21 天
 * 1000 玩豆 兑换 10 现金，大约需 30 天
 * 5000 玩豆 兑换 50 现金，大约需 200 天
 * 10000 玩豆 兑换 100现金，大约需 381 天
 * 30000 玩豆 兑换 300 现金，大约需 1135 天 😂😂😂
 *
 * export XWGAME_ACCOUNTS = '手机号#密码'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2025/02/25
 *
 * const $ = new Env('享玩游戏APP')
 * cron: 33 0 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('享玩游戏APP');
const crypto = require('crypto');
const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');
const xiangWanList = process.env.XWGAME_ACCOUNTS ? process.env.XWGAME_ACCOUNTS.split(/[\n&]/) : [];
// 消息推送
let message = '';
// token 缓存地址
const TOKEN_CACHE_PATH = path.join(__dirname, 'xiangwan_token_cache.json');
// 接口地址
const baseUrl = 'https://sdk-api.xiangwan.com'
// 加密秘钥（Base64）
const keyBase64 = '5snOI0E5WUpP99pG5+fzug==';
// 解码 Base64 得到原始的二进制密钥
const key = Buffer.from(keyBase64, 'base64');
// 加密 Iv（Base64）
const ivBase64 = 'KhVRUtkYTNM82dSDxb7/YQ==';
// 解码 Base64 得到原始的二进制 IV
const iv = Buffer.from(ivBase64, 'base64');
// 请求头
const headers = {
    'User-Agent': 'okhttp/4.11.0',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/x-www-form-urlencoded'
};

!(async () => {
    await checkUpdate($.name, xiangWanList);
    for (let i = 0; i < xiangWanList.length; i++) {
        const index = i + 1;
        const [account, pwd] = xiangWanList[i].split('#');
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        await login(account, pwd);
        if (!$.isLogin) {
            continue;
        }
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
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
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await getUserInfo();
}

/**
 * 登录
 *
 * @param account
 * @param password
 * @returns {Promise<void>}
 */
async function login(account, password) {
    try {
        let cachedToken = await getTokenFromCache("xiangwan", account);
        if (cachedToken) {
            headers.authorization = `Bearer ${cachedToken}`;
            console.log('使用缓存 token 登录，验证中...');
            const isValid = await validateToken(cachedToken);
            await $.wait(sudojia.getRandomWait(2e3, 3e3));
            if (isValid) {
                $.isLogin = true;
                console.log('token 验证有效✅');
                return;
            } else {
                console.log('缓存 token 验证失效，开始重新登录更新 token...');
            }
        }
        const encryptData = await sudojia.sendRequest(`${baseUrl}/account/account_login`, 'post', headers, {
            "params": encryptCredentials(JSON.stringify({
                ...getCommonParams(),
                account: account,
                password: password
            }))
        });
        const decryptData = JSON.parse(decryptCredentials(encryptData));
        if (200 !== decryptData.status_code) {
            $.isLogin = false;
            return console.error(`登录失败 ->`, decryptData);
        }
        console.log('登录成功~');
        headers.authorization = `Bearer ${decryptData.data.token}`;
        $.isLogin = true;
        // 保存 token 到文件
        await saveTokenToCache("xiangwan", account, decryptData.data.token);
    } catch (e) {
        $.isLogin = false;
        if (e.response || e.response.data) {
            console.error(`登录时发生异常 ->`, e.response.data);
        } else {
            console.error(`登录时发生异常 ->`, e);
        }
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function sign() {
    try {
        console.log('\n开始执行...');
        await $.wait(sudojia.getRandomWait(1e3, 2e3));
        const days = moment().format('YYYYMMDD');
        const encryptData = await sudojia.sendRequest(`${baseUrl}/discover/sign`, 'post', headers, {
            "params": encryptCredentials(JSON.stringify({
                ...getCommonParams(),
                "days": days
            }))
        });
        const decryptData = JSON.parse(decryptCredentials(encryptData));
        if (200 !== decryptData.status_code) {
            message += `签到失败 -> ${decryptData.message}\n`;
            return console.error(`签到失败 ->`, decryptData.message);
        }
        console.log(`签到成功，恭喜获得：${decryptData.data.score}玩豆`);
        message += `签到成功，恭喜获得：${decryptData.data.score}玩豆\n`;
    } catch (e) {
        console.error(`签到时发生异常 ->`, e);
    }
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const encryptData = await sudojia.sendRequest(`${baseUrl}/me/member_info`, 'post', headers, {
            "params": encryptCredentials(JSON.stringify({
                ...getCommonParams()
            }))
        });
        const decryptData = JSON.parse(decryptCredentials(encryptData));
        if (200 !== decryptData.status_code) {
            return console.error(`获取用户信息时发生异常 ->`, decryptData);
        }
        const {nickname, mobile, balance} = decryptData.data;
        const hiddenMobile = `${mobile.slice(0, 3)}***${mobile.slice(-3)}` || 18888888888;
        const displayName = nickname || "吴彦祖";
        console.log(`${displayName}(${hiddenMobile})`);
        console.log(`当前玩豆：${balance}`);
        message += `${nickname}(${hiddenMobile})\n`;
        message += `当前玩豆：${balance}\n\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常 ->`, e);
    }
}

/**
 * 验证 token 是否有效
 *
 * @param token
 * @returns {Promise<boolean>}
 */
async function validateToken(token) {
    try {
        const encryptData = await sudojia.sendRequest(`${baseUrl}/me/member_account`, 'post', {
            authorization: `Bearer ${token}`
        }, {
            "params": encryptCredentials(JSON.stringify({
                ...getCommonParams()
            }))
        });
        const decryptData = JSON.parse(decryptCredentials(encryptData));
        return 200 === decryptData.status_code;
    } catch (error) {
        console.error('验证 token 时发生异常:', error);
        return false;
    }
}

/**
 * 获取公共请求参数
 *
 * @returns {Object} 包含公共请求参数的对象
 */
function getCommonParams() {
    return {
        "app_channel": "xw_100016",
        "app_version": "1.3",
        "invite_uid": "",
        "app_os": "android",
        "server_device_id": "176"
    };
}

/**
 * 加密请求数据
 *
 * @returns {string} 加密后的Base64字符串
 */
function encryptCredentials(plainText) {
    // 创建加密器
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    // 加密数据
    let encrypted = cipher.update(plainText, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

/**
 * 解密响应数据
 *
 * @param encryptedText
 * @returns {string}
 */
function decryptCredentials(encryptedText) {
    // 创建解密器
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    // 解密数据
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


/**
 * 从文件中读取 token
 *
 * @param platform
 * @param username
 * @returns {Promise<*|null>}
 */
async function getTokenFromCache(platform, username) {
    try {
        try {
            // 检查文件是否存在
            await fs.access(TOKEN_CACHE_PATH);
        } catch (error) {
            console.warn('token 缓存文件不存在，创建一个空文件...');
            await fs.writeFile(TOKEN_CACHE_PATH, JSON.stringify({}, null, 2), 'utf8');
            return null;
        }
        const cache = await fs.readFile(TOKEN_CACHE_PATH, 'utf-8');
        // 检查文件内容是否为空
        if (!cache.trim()) {
            console.warn('token 缓存文件内容为空，开始重新登录生成 token 内容');
            return null;
        }
        let cacheObj;
        try {
            cacheObj = JSON.parse(cache);
        } catch (parseError) {
            console.error('解析 token 缓存文件失败:', parseError);
            return null; // 解析失败时返回 null
        }
        // 检查平台和用户名是否存在
        if (cacheObj[platform] && cacheObj[platform][username]) {
            return cacheObj[platform][username];
        } else {
            console.warn(`token 缓存文件中未找到[${username}]的账号，开始重新登录生成 token`);
            return null;
        }
    } catch (error) {
        console.error('读取缓存文件失败:', error);
        return null;
    }
}

/**
 * 将 token 保存到文件
 *
 * @param platform
 * @param username
 * @param token
 *
 * @returns {Promise<void>}
 */
async function saveTokenToCache(platform, username, token) {
    try {
        let cacheObj = {};
        try {
            const cache = await fs.readFile(TOKEN_CACHE_PATH, 'utf-8');
            if (cache.trim()) {
                cacheObj = JSON.parse(cache);
            } else {
                console.warn('token 缓存文件内容为空，开始初始化为空对象...');
            }
        } catch (error) {
            console.warn('读取缓存文件失败，初始化为空对象:', error);
        }
        if (!cacheObj[platform]) {
            cacheObj[platform] = {};
        }
        cacheObj[platform][username] = token;
        await fs.writeFile(TOKEN_CACHE_PATH, JSON.stringify(cacheObj, null, 2), 'utf-8');
        console.log('token 已保存到缓存文件[xiangwan_token_cache.json]');
        console.log(`路径：${TOKEN_CACHE_PATH}`);
    } catch (error) {
        console.error('保存 token 失败:', error);
    }
}
