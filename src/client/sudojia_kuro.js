/**
 * 库街区-鸣潮-战双每日签到 https://www.kurobbs.com/
 *
 * 第一种：打开 APP 登录，抓包 Host：https://api.kurobbs.com， 找到请求头 token
 * 第二种：浏览器打开库街区，登录之后 F12 -> Application -> 左侧 Local storage -> 找到 auth_token 复制其 Value
 * export KURO_TOKEN = 'xxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/6/10
 *
 * const $ = new Env('库街区')
 * cron: 22 8 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('库街区');
const moment = require("moment");
const kuroList = process.env.KURO_TOKEN ? process.env.KURO_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://api.kurobbs.com'
// 存储战双的serviceId和roleId
const zsIds = [];
!(async () => {
    await checkUpdate($.name, kuroList);
    for (let i = 0; i < kuroList.length; i++) {
        const index = i + 1;
        const kuroToken = kuroList[i];
        // 默认为 H5
        $.source = 'h5';
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        console.log(`正在检测 Token 有效性...`)
        const isToken = await isAvailable(kuroToken);
        if (!isToken) {
            console.error(`Token 已失效`);
            await notify.sendNotify(`「Token失效通知」`, `${$.name}账号[${index}] Token 已失效，请重新登录获取 Token\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        console.log(`Token 有效`);
        await main(kuroToken);
        await $.wait(sudojia.getRandomWait(2000, 3000));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main(kuroToken) {
    // 社区签到
    await kuroSignIn(kuroToken);
    await $.wait(sudojia.getRandomWait(1300, 2300))
    // 账户库洛币查询
    await getTotalGold(kuroToken);
    await $.wait(sudojia.getRandomWait(1500, 2600))
    // 鸣潮签到
    await mcSignIn(kuroToken);
    await $.wait(sudojia.getRandomWait(1500, 3000))
    // 鸣潮签到奖励查询
    await queryRecordMc(kuroToken);
    await $.wait(sudojia.getRandomWait(1200, 2600));
    // 检测战双是否有角色
    const isHaveRole = await getServerAndRoleId(kuroToken);
    if (!isHaveRole) {
        console.log('检测到战双没有角色，放弃战双签到');
        return;
    }
    await $.wait(sudojia.getRandomWait(1300, 2500));
    // 战双签到
    const [zs] = zsIds;
    await zsSignIn(kuroToken, zs.serverId, zs.roleId);
    await $.wait(sudojia.getRandomWait(1300, 2500));
    // 战双签到奖励查询
    await queryRecordZs(kuroToken, zs.serverId, zs.roleId);
}

/**
 * 检测库街区Token是否有效
 *
 * @param kuroToken
 * @param retry
 * @return {Promise<boolean>}
 */
async function isAvailable(kuroToken, retry = 1) {
    await $.wait(sudojia.getRandomWait(2000, 2800));
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/gamer/widget/game3/refresh`, 'post', {
            "source": $.source,
            'token': kuroToken,
        }, `type=2&sizeType=1`);
        if (220 === data.code) {
            if (2 === retry) {
                console.log(`\n${data.msg}`);
                console.log(`\n已超过最大重试次数：${retry}，请正确获取 Token`);
                return false;
            }
            console.log(`\n第${retry}次检测 token 失效，正在尝试第${retry + 1}次`);
            $.source = 'android';
            return isAvailable(kuroToken, retry + 1);
        } else {
            $.serverId = data.data.serverId;
            $.userId = data.data.userId;
            $.roleId = data.data.roleId;
            return true;
        }
    } catch (e) {
        console.error(`检测Token发生异常：${e}`);
        return false;
    }
}

/**
 * 检测战双是否有角色
 *
 * @param kuroToken
 * @return {Promise<boolean>}
 */
async function getServerAndRoleId(kuroToken) {
    try {
        const devCode = [...Array(40)].map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[(Math.random() * 36) | 0]).join('');
        const data = await sudojia.sendRequest(`${baseUrl}/gamer/widget/game2/refresh`, 'post', {
            "source": $.source,
            'token': kuroToken,
            'devcode': devCode,
        }, `gameId=2&type=1&sizeType=1`);
        if (!data.data) {
            return false;
        }
        if (200 === data.code) {
            console.log(`检测到战双有角色，开始战双每日签到...`);
            zsIds.push({
                serverId: data.data.serverId,
                roleId: data.data.roleId,
            });
            return true;
        } else {
            console.log(`${data.msg}`);
            return false;
        }
    } catch (e) {
        console.error(`检测战双角色发生异常：${e}`);
        return false;
    }
}

/**
 * 账户总库洛币
 *
 * @param kuroToken
 * @return {Promise<void>}
 */
async function getTotalGold(kuroToken) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/encourage/gold/getTotalGold`, 'post', {
            "source": $.source,
            'token': kuroToken,
        }, ``);
        if (200 === data.code) {
            message += `当前账户库洛币：${data.data.goldNum}\n`
        } else {
            console.log(`获取账户库洛币失败，${data.msg}`);
        }
    } catch (e) {
        console.error(`获取账户库洛币发生异常：${e}`);
    }
}

/**
 * 社区签到
 *
 * @param kuroToken
 * @return {Promise<void>}
 */
async function kuroSignIn(kuroToken) {
    try {
        console.log(`开始社区签到...`)
        const data = await sudojia.sendRequest(`${baseUrl}/user/signIn`, 'post', {
            "source": $.source,
            'token': kuroToken,
        }, `gameId=2`);
        if (data.code === 200) {
            if (null === data.data) {
                console.log('签到失败，返回数据为null，请检查库街区展示是否打开');
                return;
            }
            // 签到获得的库洛币
            const gainValue = data.data.gainVoList[0].gainValue;
            // 签到天数
            const continueDays = data.data.continueDays;
            console.log(`社区签到获得${gainValue}库洛币、连签${continueDays}天`);
            message += `社区签到获得${gainValue}库洛币、连签${continueDays}天\n`
        } else {
            message += `社区签到失败：${data.msg}\n`
            console.log(`社区签到失败：${data.msg}`);
        }
    } catch (e) {
        console.error(`社区签到发生异常：${e}`);
    }
}

/**
 * 鸣潮签到
 *
 * @param kuroToken
 * @return {Promise<void>}
 */
async function mcSignIn(kuroToken) {
    console.log(`开始鸣潮每日签到...`);
    try {
        const reqMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
        const devCode = [...Array(40)].map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[(Math.random() * 36) | 0]).join('');
        const params = `gameId=3&serverId=${$.serverId}&roleId=${$.roleId}&userId=${$.userId}&reqMonth=${reqMonth}`
        const data = await sudojia.sendRequest(`${baseUrl}/encourage/signIn/v2`, 'post', {
            "source": $.source,
            'token': kuroToken,
            'devcode': devCode,
        }, params);
        if (data.code === 200) {
            if (data.data === null) {
                console.error('签到失败，返回数据为null，请检查库街区展示是否打开');
                return;
            }
            message += `鸣潮每日签到成功\n`
            console.log(`鸣潮每日签到成功`);
        } else if (data.code === 1511) {
            message += `鸣潮签到失败：${data.msg}\n`;
            console.log(`鸣潮签到失败：${data.msg}`);
        } else {
            console.log(`鸣潮其它错误：${data.msg}`);
        }
    } catch (e) {
        console.error(`鸣潮签到发生异常：${e}`);
    }
}

/**
 * 鸣潮获取签到奖励
 *
 * @param kuroToken
 * @return {Promise<void>}
 */
async function queryRecordMc(kuroToken) {
    try {
        const params = `gameId=3&serverId=${$.serverId}&roleId=${$.roleId}&userId=${$.userId}`
        const data = await sudojia.sendRequest(`${baseUrl}/encourage/signIn/queryRecordV2`, 'post', {
            "source": $.source,
            'token': kuroToken,
        }, params);
        if (data.code === 200) {
            if (data.data === null) {
                console.error('鸣潮获取签到奖励失败，返回数据为null');
                return;
            }
            message += `鸣潮今日签到奖励：`
            for (const item of data.data) {
                if (item.sigInDate) {
                    const signInDateOnly = moment(item.sigInDate).format('YYYY-MM-DD');
                    const currentDate = moment().format('YYYY-MM-DD');
                    if (signInDateOnly === currentDate) {
                        let goodsName = item.goodsName;
                        let goodsNum = item.goodsNum
                        message += `${goodsName}x${goodsNum} `
                    }
                }
            }
            message += `\n`
        }
    } catch (e) {
        console.error(`获取鸣潮签到奖励时发生异常：${e}`);
    }
}

/**
 * 战双签到
 *
 * @param kuroToken
 * @param serverId
 * @param roleId
 * @return {Promise<void>}
 */
async function zsSignIn(kuroToken, serverId, roleId) {
    try {
        const reqMonth = (new Date().getMonth() + 1).toString().padStart(2, '0')
        const devCode = [...Array(40)].map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[(Math.random() * 36) | 0]).join('');
        const params = `gameId=2&serverId=${serverId}&roleId=${roleId}&userId=${$.userId}&reqMonth=${reqMonth}`
        const data = await sudojia.sendRequest(`${baseUrl}/encourage/signIn/v2`, 'post', {
            "source": $.source,
            'token': kuroToken,
            'devcode': devCode,
        }, params);
        if (data.code === 200) {
            if (data.data === null) {
                console.error('签到失败，返回数据为null，请检查库街区展示是否打开');
                return;
            }
            message += `战双每日签到成功\n`
            console.log(`战双每日签到成功`);
        } else if (data.code === 1511) {
            message += `战双签到失败：${data.msg}\n`;
            console.log(`战双签到失败：${data.msg}`);
        } else {
            console.log(`战双其它错误：${data.msg}`);
        }
    } catch (e) {
        console.error(`战双签到时发生异常：${e}`);
    }
}

/**
 * 战双获取签到奖励
 *
 * @param kuroToken
 * @param serverId
 * @param roleId
 * @return {Promise<void>}
 */
async function queryRecordZs(kuroToken, serverId, roleId) {
    try {
        const params = `gameId=2&serverId=${serverId}&roleId=${roleId}&userId=${$.userId}`
        const data = await sudojia.sendRequest(`${baseUrl}/encourage/signIn/queryRecordV2`, 'post', {
            "source": $.source,
            'token': kuroToken,
        }, params);
        if (data.code === 200) {
            if (data.data === null) {
                console.error('战双获取签到奖励失败，返回数据为null');
                return;
            }
            message += `战双今日签到奖励：`
            for (const item of data.data) {
                if (item.sigInDate) {
                    const signInDateOnly = moment(item.sigInDate).format('YYYY-MM-DD');
                    const currentDate = moment().format('YYYY-MM-DD');
                    if (signInDateOnly === currentDate) {
                        let goodsName = item.goodsName;
                        let goodsNum = item.goodsNum
                        message += `${goodsName}x${goodsNum} `
                    }
                }
            }
            message += `\n\n`
        }
    } catch (e) {
        console.error(`获取战双签到奖励发生异常：${e}`);
    }
}
