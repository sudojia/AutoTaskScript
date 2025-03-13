/**
 * 小牛电动 APP
 *
 * 账号#密码
 * export XNIU_ACCOUNT = '18888888888#123456'
 * 多账号用 & 或换行
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/08/26
 *
 * const $ = new Env('小牛电动')
 * cron: 19 11 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('小牛电动');
const xniuList = process.env.XNIU_ACCOUNT ? process.env.XNIU_ACCOUNT.split(/[\n&]/) : [];
// 消息推送
let message = '';
// 接口地址
const baseUrl = 'https://app-api.niu.com'
// 请求头
const headers = {
    'User-Agent': 'manager/5.7.4 (android; OPPO R9s 9);lang=zh-CN;clientIdentifier=Domestic;timezone=Asia/Shanghai;model=OPPO_OPPO R9s;deviceName=OPPO R9s;ostype=android',
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip',
};

!(async () => {
    await checkUpdate($.name, xniuList);
    for (let i = 0; i < xniuList.length; i++) {
        const index = i + 1;
        $.isLogin = true;
        let [phone, pwd] = xniuList[i].split('#');
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        await getToken(phone, sudojia.md5(pwd));
        if (!$.isLogin) {
            continue;
        }
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
    await $.wait(sudojia.getRandomWait(1200, 2000));
    await getQuestionList();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await readGuide();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getPostIdByCity();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await followUser();
    await $.wait(sudojia.getRandomWait(3000, 3500));
    await followUser();
    await $.wait(sudojia.getRandomWait(2000, 2500));
    await getPoints();
}

/**
 * 获取 token
 *
 * @param phone   手机号
 * @param pwd     密码
 * @returns {Promise<void>}
 */
async function getToken(phone, pwd) {
    try {
        const headerCp = JSON.parse(JSON.stringify(headers));
        headerCp['Content-Type'] = 'application/x-www-form-urlencoded';
        headerCp.token = 'tokenExperienceMode';
        const params = `password=${pwd}&grant_type=password&scope=base&app_id=niu_ktdrr960&account=${phone}`
        const data = await sudojia.sendRequest(`https://account.niu.com/v3/api/oauth2/token`, 'post', headerCp, params);
        if (0 !== data.status) {
            console.log(data.desc);
            $.isLogin = false;
            return;
        }
        console.log('登录成功~');
        headers.token = data.data.token.access_token;
        $.userId = data.data.user.user_id;
    } catch (e) {
        console.error(`获取 token 时发生异常：` + e);
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
        const data = await sudojia.sendRequest(`${baseUrl}/community/api/user/profile?user_id=${$.userId}`, 'get', headers);
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        console.log(`昵称：${data.data.user_nick_name}`);
        message += `昵称：${data.data.user_nick_name}\n`;
    } catch (e) {
        console.error(`获取用户信息时发生异常：` + e);
    }
}

/**
 * 获取问题列表
 * type：1 热门 2 最新提问 3 最新回答
 *
 * @returns {Promise<*>}
 */
async function getQuestionList() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/community/api/qa/list?type=2&category_id=&page=1&page_size=30&_=${Date.now()}`, 'get', headers);
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        const quest = data.data.items[Math.floor(Math.random() * data.data.items.length)];
        console.log(`开始回答[${quest.content}]`);
        await $.wait(sudojia.getRandomWait(2000, 2500));
        await getAnswer(quest.id);
    } catch (e) {
        console.error(`获取问题列表时发生异常：` + e);
    }
}

/**
 * 获取回答评论
 *
 * @param pid
 * @returns {Promise<void>}
 */
async function getAnswer(pid) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/community/api/posts/comments/list?parent_id=${pid}&parent_type=1&page=1&page_size=20&hide_hot=1&version=2&_=${Date.now()}`, 'get', headers);
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        let answer;
        if (!data.data.items || data.data.items.length === 0) {
            console.log('这个问题的回答评论为空，将使用默认的回答评论【我也遇到过】');
            answer = '我也遇到过';
        } else {
            answer = data.data.items[Math.floor(Math.random() * data.data.items.length)].content;
        }
        console.log(`开始回答评论 -> ${answer}`);
        await $.wait(sudojia.getRandomWait(2000, 2500));
        await postAnswer(pid, answer);
    } catch (e) {
        console.error(`获取回答评论时发生异常：` + e);
    }
}

/**
 * 回答问题
 *
 * @param pid
 * @param content
 * @returns {Promise<void>}
 */
async function postAnswer(pid, content) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/community/api/posts/comments`, 'post', headers, {
            "content": content,
            "object": 2,
            "parent_id": pid
        });
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        console.log(`回答成功`);
    } catch (e) {
        console.error(`回答问题时发生异常：` + e);
    }
}

/**
 * 阅读社区指引
 *
 * @returns {Promise<void>}
 */
async function readGuide() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/community/api/posts/detail?id=1940&version=2&_=${Date.now()}`, 'get', headers);
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        await $.wait(sudojia.getRandomWait(2000, 2500));
        console.log(`阅读社区指引完成`);
    } catch (e) {
        console.error(`阅读社区指引时发生异常：` + e);
    }
}

/**
 * 根据不同的城市获取文章ID
 *
 * @returns {Promise<void>}
 */
async function getPostIdByCity() {
    try {
        for (let i = 0; i < 2; i++) {
            const cityCodeList = ['110000', '120000', '310000', '440100', '440300', '320400', '441900', '442000', '441300', '440700', '431100', '371000'];
            const city = cityCodeList[Math.floor(Math.random() * cityCodeList.length)];
            const data = await sudojia.sendRequest(`${baseUrl}/community/api/group/city/recommend_list?city_code=${city}&last_score=0&page_size=20&_=${Date.now()}`, 'get', headers);
            if (0 !== data.status) {
                console.log(data.desc);
                return;
            }
            const {id, user_id} = data.data.items[Math.floor(Math.random() * data.data.items.length)];
            await $.wait(sudojia.getRandomWait(2000, 2500));
            await share(id);
            await $.wait(sudojia.getRandomWait(800, 1200));
            $.uid = user_id;
        }
    } catch (e) {
        console.error(`获取文章ID时发生异常：` + e);
    }
}

/**
 * 分享文章
 *
 * @param postId 文章ID
 * @returns {Promise<void>}
 */
async function share(postId) {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/community/api/posts/shares`, 'post', headers, {
            "id": postId
        });
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        console.log(`分享文章成功`);
    } catch (e) {
        console.error(`分享文章时发生异常：` + e);
    }
}

/**
 * 关注用户
 *
 * @returns {Promise<void>}
 */
async function followUser() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/community/api/user/follow/create`, 'post', headers, {
            "follow_user_id": $.uid
        });
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        if (2 === data.data.followType) {
            console.log(`关注用户成功`);
        } else {
            console.log(`取关用户成功`);
        }
    } catch (e) {
        console.error(`关注用户时发生异常：` + e);
    }
}


/**
 * 获取积分
 *
 * @returns {Promise<void>}
 */
async function getPoints() {
    try {
        const data = await sudojia.sendRequest(`${baseUrl}/v5/points/index`, 'get', headers);
        if (0 !== data.status) {
            console.log(data.desc);
            return;
        }
        console.log(`当前积分：${data.data.userPoints}`);
        message += `当前积分：${data.data.userPoints}\n\n`;
    } catch (e) {
        console.error(`获取积分时发生异常：` + e);
    }
}
