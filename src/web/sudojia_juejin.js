/**
 * 稀土掘金 https://juejin.cn/
 *
 * 仅每日签到（不维护了）
 * 获取 Cookie、只要 sessionid 的值和手动签到之后抓取 https://api.juejin.cn/growth_api/v1/check_in 的 url 拼接的 uuid=123456&spider=0&msToken=xxxxxx&a_bogus=xxxxxx  用 # 分开
 * 填写示例：
 * export JUEJIN_COOKIE = 'sessionid#uuid=123456&spider=0&msToken=xxxxxx&a_bogus=xxxxxx'
 * 多账号用换行，不要用 &
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2022/01/19
 * @lastModify 2024/08/16
 *
 * const $ = new Env('稀土掘金')
 * cron: 5 10 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia, checkUpdate} = initScript('稀土掘金');
const jueJinList = process.env.JUEJIN_COOKIE ? process.env.JUEJIN_COOKIE.split(/\n/) : [];
let message = '';
// 接口地址
const baseUrl = 'https://api.juejin.cn';
// 请求头
const headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    "Content-type": "application/json",
    'Referer': 'https://juejin.cn/',
    'Origin': 'https://juejin.cn',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
};

!(async () => {
    await checkUpdate($.name, jueJinList);
    // console.log(`\n已随机分配 User-Agent\n\n${headers['user-agent'] || headers['User-Agent']}`);
    for (let i = 0; i < jueJinList.length; i++) {
        const [juejinCookie, urlList] = jueJinList[i].split('#');
        headers.Cookie = `sid_tt=${juejinCookie}; sessionid=${juejinCookie}; sessionid_ss=${juejinCookie}`;
        const index = i + 1;
        console.log(`\n*****第[${index}]个${$.name}账号*****`);
        if (await checkStatus()) {
            console.error('Cookie 已失效');
            await notify.sendNotify(`「Cookie失效通知」`, `${$.name}账号[${index}] Cookie 已失效，请重新登录获取 Cookie\n\n`);
            continue;
        }
        message += `📣====${$.name}账号[${index}]====📣\n`;
        await $.wait(sudojia.getRandomWait(800, 1200));
        await main(urlList);
        await $.wait(sudojia.getRandomWait(2000, 2500));
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

/**
 * 主函数
 *
 * @returns {Promise<void>}
 */
async function main(urlList) {
    await getUserName();
    await $.wait(sudojia.getRandomWait(2300, 2700));
    await checkIn(urlList);
    await $.wait(sudojia.getRandomWait(3000, 3500));
    await getOreNum(urlList);
    await $.wait(sudojia.getRandomWait(3000, 3500));
    await getCount();
}

/**
 * 获取用户信息
 */
async function getUserName() {
    try {
        const data = await sudojia.sendRequest(baseUrl + '/user_api/v1/user/get_info_pack?aid=2608', 'post', headers, {
            "pack_req": {
                "user_counter": true,
                "user_growth_info": true,
                "user": true
            }
        });
        // 用户昵称
        const userName = data.data.user_basic.user_name;
        message += `【账号昵称】${userName}\n`;
        console.log(`【账号昵称】${userName}`);
    } catch (e) {
        console.error(`获取用户信息发生异常: ${e.response.data}`);
    }
}

/**
 * 检查状态
 *
 * @return {Promise<*>}
 */
async function checkStatus() {
    const data = await sudojia.sendRequest(baseUrl + '/growth_api/v1/get_today_status', 'get', headers);
    return 403 === data.err_no;
}

/**
 * 签到函数
 *
 * @returns {*}
 */
async function checkIn(urlList) {
    try {
        // uuid=7402961076386793000&spider=0&msToken=6N7P3ETmcpkVBSBdIEAoOvIE5TlEhnAmt382dbZpa1tNLnKhYR8QkGIKTJINouJxXGwc-JkvcwmUPhinCBGBtXg7ZsNn5LZzJtOpR4PSuRejD4spLQYUJ3tJdEurDng%3D&a_bogus=mX-QkcZ8Msm1Zhvtkhkz9GWEeOm0YWRkgZENqN9HUUo7
        const data = await sudojia.sendRequest(baseUrl + `/growth_api/v1/check_in?aid=2608&${urlList}`, 'post', headers);
        if (15001 === data.err_no) {
            console.log(data.err_msg);
            message += `【签到信息】${data.err_msg}\n`
            return;
        }
        console.log(`签到成功，获得 ${data.data.incr_point} 矿石`);
        message += `【签到信息】签到成功, 获得 ${data.data.incr_point} 矿石\n`
    } catch (e) {
        console.error(`签到时发生异常: ${e.response.data}`);
    }
}

/**
 * 获取总账号矿石数
 */
async function getOreNum(urlList) {
    const data = await sudojia.sendRequest(baseUrl + `/growth_api/v1/get_cur_point?aid=2608&${urlList}`, 'get', headers);
    console.log(`当前矿石数：${data.data}`);
    message += `【总矿石数】${data.data} 矿石\n`
}

/**
 * 查询免费抽奖次数
 */
async function queryFreeLuckyDrawCount(urlList) {
    try {
        const data = await sudojia.sendRequest(baseUrl + `/growth_api/v1/lottery_config/get?aid=2608&${urlList}`, 'get', headers);
        // 获取免费抽奖次数
        return data.data.free_count;
    } catch (e) {
        console.error(`查询免费抽奖次数时发生异常: ${e.response.data}`);
        return 0;
    }
}

/**
 * 统计签到天数, 没什么用~
 */
async function getCount() {
    const data = await sudojia.sendRequest(baseUrl + '/growth_api/v1/get_counts?aid=2608', 'get', headers);
    console.log(`已连续签到${data.data.cont_count}天、累计签到${data.data.sum_count}天`);
    message += `【签到统计】已连续签到${data.data.cont_count}天、累计签到${data.data.sum_count}天\n`
}
