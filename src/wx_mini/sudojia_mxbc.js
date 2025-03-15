/**
 * 蜜雪冰城小程序
 *
 * 抓包 Host：https://mxsa.mxbc.net 获取请求头 Access-Token
 * export MXBC_TOKEN = 'eyJ0xxxxxxxxxxxx'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/07/27
 *
 * const $ = new Env('蜜雪冰城')
 * cron: 28 10 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('蜜雪冰城');
const crypto = require('crypto');
const mxbcList = process.env.MXBC_TOKEN ? process.env.MXBC_TOKEN.split(/[\n&]/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://mxsa.mxbc.net'
// appId
const appId = 'd82be6bbc1da11eb9dd000163e122ecb';
// 请求头
const headers = {
    'Host': 'mxsa.mxbc.net',
    'app': 'mxbc',
    'appchannel': 'xiaomi',
    'User-Agent': sudojia.getRandomUserAgent(),
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Referer': `https://servicewechat.com/wx7696c66d2245d107/123/page-frame.html`,
    'Accept-Encoding': 'gzip, deflate, br',
};

!(async () => {
    await checkUpdate($.name, mxbcList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < mxbcList.length; i++) {
        const index = i + 1;
        headers['Access-Token'] = mxbcList[i];
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
        console.error('Token 失效');
        return;
    }
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await signIn();
    await $.wait(sudojia.getRandomWait(1e3, 2e3));
    await getPoints();
}

/**
 * 获取用户信息
 *
 * @return {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/v1/customer/info?appId=${appId}&t=${ts13()}&sign=${getSHA256withRSA(`appId=${appId}&t=${ts13()}`)}`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg);
            $.isLogin = false;
            return;
        }
        console.log(`${data.data.mobilePhone}登陆成功~`);
        message += `用户：${data.data.mobilePhone}\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：${e}`);
        $.isLogin = false;
    }
}

/**
 * 签到
 *
 * @return {Promise<void>}
 */
async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/v1/customer/signin?appId=${appId}&t=${ts13()}&sign=${getSHA256withRSA(`appId=${appId}&t=${ts13()}`)}`, 'get', headers);
        if (0 !== data.code) {
            console.error(`签到失败：${data.msg}`);
            return;
        }
        console.log(`签到成功，雪王币+${data.data.ruleValuePoint}`);
        console.log(`已连续签到${data.data.ruleValueGrowth}天`);
        message += `签到成功，已连续签到${data.data.ruleValueGrowth}天\n`;
    } catch (e) {
        console.error(`签到时发生异常：${e}`);
    }
}

/**
 * 获取雪王币
 *
 * @return {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/api/v1/customer/info?appId=${appId}&t=${ts13()}&sign=${getSHA256withRSA(`appId=${appId}&t=${ts13()}`)}`, 'get', headers);
        if (0 !== data.code) {
            console.error(data.msg);
            return;
        }
        console.log(`当前雪王币：${data.data.customerPoint}`);
        message += `当前雪王币：${data.data.customerPoint}\n\n`;
    } catch (e) {
        console.error(`获取雪王币时发生异常：${e}`);
    }
}

function getSHA256withRSA(content) {
    const signer = crypto.createSign('RSA-SHA256').update(content);
    const signature = signer.sign(privateKeyStr, 'base64');
    return signature.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function ts13() {
    return Math.round(new Date().getTime()).toString();
}

const privateKeyStr = `
-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCtypUdHZJKlQ9L
L6lIJSphnhqjke7HclgWuWDRWvzov30du235cCm13mqJ3zziqLCwstdQkuXo9sOP
Ih94t6nzBHTuqYA1whrUnQrKfv9X4/h3QVkzwT+xWflE+KubJZoe+daLKkDeZjVW
nUku8ov0E5vwADACfntEhAwiSZUALX9UgNDTPbj5ESeII+VztZ/KOFsRHMTfDb1G
IR/dAc1mL5uYbh0h2Fa/fxRPgf7eJOeWGiygesl3CWj0Ue13qwX9PcG7klJXfToI
576MY+A7027a0aZ49QhKnysMGhTdtFCksYG0lwPz3bIR16NvlxNLKanc2h+ILTFQ
bMW/Y3DRAgMBAAECggEBAJGTfX6rE6zX2bzASsu9HhgxKN1VU6/L70/xrtEPp4SL
SpHKO9/S/Y1zpsigr86pQYBx/nxm4KFZewx9p+El7/06AX0djOD7HCB2/+AJq3iC
5NF4cvEwclrsJCqLJqxKPiSuYPGnzji9YvaPwArMb0Ff36KVdaHRMw58kfFys5Y2
HvDqh4x+sgMUS7kSEQT4YDzCDPlAoEFgF9rlXnh0UVS6pZtvq3cR7pR4A9hvDgX9
wU6zn1dGdy4MEXIpckuZkhwbqDLmfoHHeJc5RIjRP7WIRh2CodjetgPFE+SV7Sdj
ECmvYJbet4YLg+Qil0OKR9s9S1BbObgcbC9WxUcrTgECgYEA/Yj8BDfxcsPK5ebE
9N2teBFUJuDcHEuM1xp4/tFisoFH90JZJMkVbO19rddAMmdYLTGivWTyPVsM1+9s
tq/NwsFJWHRUiMK7dttGiXuZry+xvq/SAZoitgI8tXdDXMw7368vatr0g6m7ucBK
jZWxSHjK9/KVquVr7BoXFm+YxaECgYEAr3sgVNbr5ovx17YriTqe1FLTLMD5gPrz
ugJj7nypDYY59hLlkrA/TtWbfzE+vfrN3oRIz5OMi9iFk3KXFVJMjGg+M5eO9Y8m
14e791/q1jUuuUH4mc6HttNRNh7TdLg/OGKivE+56LEyFPir45zw/dqwQM3jiwIz
yPz/+bzmfTECgYATxrOhwJtc0FjrReznDMOTMgbWYYPJ0TrTLIVzmvGP6vWqG8rI
S8cYEA5VmQyw4c7G97AyBcW/c3K1BT/9oAj0wA7wj2JoqIfm5YPDBZkfSSEcNqqy
5Ur/13zUytC+VE/3SrrwItQf0QWLn6wxDxQdCw8J+CokgnDAoehbH6lTAQKBgQCE
67T/zpR9279i8CBmIDszBVHkcoALzQtU+H6NpWvATM4WsRWoWUx7AJ56Z+joqtPK
G1WztkYdn/L+TyxWADLvn/6Nwd2N79MyKyScKtGNVFeCCJCwoJp4R/UaE5uErBNn
OH+gOJvPwHj5HavGC5kYENC1Jb+YCiEDu3CB0S6d4QKBgQDGYGEFMZYWqO6+LrfQ
ZNDBLCI2G4+UFP+8ZEuBKy5NkDVqXQhHRbqr9S/OkFu+kEjHLuYSpQsclh6XSDks
5x/hQJNQszLPJoxvGECvz5TN2lJhuyCupS50aGKGqTxKYtiPHpWa8jZyjmanMKnE
dOGyw/X4SFyodv8AEloqd81yGg==
-----END PRIVATE KEY-----
`;