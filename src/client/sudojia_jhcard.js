/**
 * 江淮卡友APP
 *
 * 抓包 URL：http://jacwxmp.starnetah.com:18280/v2driver/v2/login 获取该 URL 的请求体，不要美化，不要自动换行，选择原始数据（Raw）
 * export JHCARD_BODY = '{"phone":"18888888888","password":"539281948b12751a942459aacb4a9ec1","sendMessageKey":"1aorcomF5n2EVd7Tc6w","deviceType":"1","appType":"0","sign":"XXXXXX"}'
 * 如需开启评论请在最后面加 true，以 # 分割
 * 示例："sign":"XXXXXX"}#true
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/27
 *
 * const $ = new Env('江淮卡友')
 * cron: 55 5 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('江淮卡友');
const moment = require("moment");
const jhCardList = process.env.JHCARD_BODY ? process.env.JHCARD_BODY.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'http://jacwxmp.starnetah.com'
// 请求头
const headers = {
    'User-Agent': sudojia.getRandomUserAgent('H5'),
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
    'appType': '0'
};

!(async () => {
    await checkUpdate($.name, jhCardList);
    console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < jhCardList.length; i++) {
        const index = i + 1;
        const [jsonBody, comment] = jhCardList[i].split('#');
        $.isLogin = true;
        $.loginBody = JSON.parse(jsonBody);
        $.isComment = comment || false;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        await login();
        if (!$.isLogin) {
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main();
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function main() {
    await getUserInfo();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await signIn();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await querySignNumber();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await modifyUserInfo();
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await getPoints();
    if (!$.isComment) {
        console.log('\n检测到你未开启评论任务，本次将跳过评论任务');
        return;
    }
    await $.wait(sudojia.getRandomWait(1000, 1500));
    await getInvitationList();
}

/**
 * 登录
 *
 * @returns {Promise<void>}
 */
async function login() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}:18280/v2driver/v2/login`, 'post', headers, $.loginBody);
        if (200 !== data.resultCode) {
            console.error(data.message);
            $.isLogin = false;
            return;
        }
        headers.token = data.data.token;
        $.uid = data.data.userId;
    } catch (e) {
        console.error('登录时发生异常 ->', e.response.data);
        $.isLogin = false;
    }
}

/**
 * 获取用户信息
 *
 * @returns {Promise<void>}
 */
async function getUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}:18280/v2driver/getUserInfo`, 'post', headers, {
            uc_id: $.uid
        });
        if (200 !== data.resultCode) {
            return console.error(`获取用户信息失败：${data.message}`);
        }
        console.log(`${data.data.name}(${data.data.phone})`);
        message += `${data.data.name}(${data.data.phone})\n`;
        $.isSign = data.data.isSign;
    } catch (e) {
        console.error('获取用户信息时发生异常 ->', e.response.data);
    }
}

/**
 * 签到
 *
 * @returns {Promise<void>}
 */
async function signIn() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}:18280/v2driver/signIn`, 'post', headers, {
            ucId: $.uid
        });
        if (200 !== data.resultCode) {
            message += `${data.message}\n`;
            return console.error(`签到失败：${data.message}`);
        }
        console.log(`签到成功！积分+${data.data.score}`);
        message += `签到成功！积分+${data.data.score}\n`;
    } catch (e) {
        console.error('签到时发生异常 ->', e.response.data);
    }
}

/**
 * 查询签到天数
 *
 * @returns {Promise<void>}
 */
async function querySignNumber() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}:18280/v2driver/querySignNumber`, 'post', headers, {
            year: moment().year(),
            month: moment().month() + 1,
            ucId: $.uid
        });
        if (200 !== data.resultCode) {
            return console.error(`查询签到天数失败：${data.message}`);
        }
        console.log(`已连续签到${data.data.continueTime}天`);
        message += `已连续签到${data.data.continueTime}天\n`;
    } catch (e) {
        console.error('查询签到天数时发生异常 ->', e.response.data);
    }
}

/**
 * 完善个人信息
 *
 * @returns {Promise<void>}
 */
async function modifyUserInfo() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}:18280/v2driver/modifyUserInfo`, 'post', headers, {
            "ucId": $.uid,
            "name": "菜狗联盟",
            "signature": "这个人很帅，什么都没有留下",
            "sex": "0",
            "interest": "看书",
            "birthday": "1949-10-01",
            "drivingAge": 10,
            "provinceDesc": "北京市",
            "cityDesc": "北京直辖市",
            "jianghuaiStaff": "0",
        })
        if (200 !== data.resultCode) {
            return console.error(`完善个人信息失败：${data.message}`);
        }
        console.log(`完善个人信息成功`);
    } catch (e) {
        console.error('完善个人信息时发生异常 ->', e.response.data);
    }
}

/**
 * 获取积分
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}:18280/v2driver/queryIntegral`, 'post', headers, {
            uc_id: $.uid
        });
        if (200 !== data.resultCode) {
            return console.error(`获取积分失败：${data.message}`);
        }
        console.log(`当前积分：${data.data.integralCounts}`);
        message += `当前积分：${data.data.integralCounts}\n\n`;
    } catch (e) {
        console.error('获取积分时发生异常 ->', e.response.data);
    }
}

/**
 * 获取文案
 *
 * @returns {Promise<*|null>}
 */
async function getWenAn() {
    try {
        const data = await sudojia.sendRequest('https://api.vvhan.com/api/ian/wenxue?type=json', 'get', {
            'User-Agent': sudojia.getRandomUserAgent('PC'),
            'Accept-Encoding': 'gzip, deflate, br, zstd'
        });
        if (!data.success) {
            console.error('获取文案失败 ->', data);
            return null;
        }
        return data.data.content;
    } catch (e) {
        console.error('获取文案时发生异常 ->', e);
        return null;
    }
}

/**
 * 获取帖子列表
 *
 * @returns {Promise<void>}
 */
async function getInvitationList() {
    try {
        console.log('你真勇，居然开启了评论任务');
        console.log('❗❗❗❗❗❗');
        console.log('准备开始评论任务，如账号被冻结，损失的一切都与作者(@sudojia)无关\n');
        for (let i = 0; i < 5; i++) {
            console.log(`第${i + 1}次评论...`);
            const data = await sudojia.sendRequest(`${baseUrl}:18180/jac/bbs/api/invitationInfo/getInvitationList`, 'post', headers, {
                "bbsType": "image",
                "forumId": "30",
                "page": 1,
                "size": 30
            })
            if (200 !== data.resultCode) {
                return console.error(`获取帖子列表失败：${data.message}`);
            }
            // 获取帖子对象
            const posts = data.data.records[Math.floor(Math.random() * 30) + 1];
            // 获取帖子ID
            const invitationId = posts.invitationCommentInfo.invitationId;
            await $.wait(sudojia.getRandomWait(5000, 8000));
            await postComment(invitationId);
            await $.wait(sudojia.getRandomWait(1000, 2000));
        }
    } catch (e) {
        console.error('获取帖子列表时发生异常 ->', e.response.data);
    }
}

/**
 * 评论
 *
 * @param invitationId
 * @returns {Promise<void>}
 */
async function postComment(invitationId) {
    try {
        const content = await getWenAn();
        if (!content) {
            return console.error('获取文案失败，暂不发表评论！');
        }
        console.log(`获取到的文案 ->\n${content}`);
        const data = await sudojia.sendRequest(`${baseUrl}:18180/jac/bbs/api/invitationComment/newInvitationComment`, 'post', headers, {
            commentContent: content,
            invitationId: invitationId,
        });
        if (200 !== data.resultCode) {
            return console.error(`评论失败：${data.message}`);
        }
        console.log('评论成功\n');
    } catch (e) {
        console.error('评论时发生异常 ->', e.response.data);
    }
}
