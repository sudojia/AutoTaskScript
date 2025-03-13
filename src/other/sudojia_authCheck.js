/**
 * 检测现有脚本仓库（https://github.com/sudojia/AutoTaskScript）凭证（Token、Cookie）等是否失效
 * 目前只推送失效的账号，每天跑两次即可，没有推送消息就说明没有账号失效
 * 默认关闭，如需启用设置变量为 true
 * export ENABLE_CHECK_TOKEN = 'true'
 *
 * @author Telegram@sudojia
 * @site https://blog.imzjw.cn
 * @date 2024/09/24
 *
 * const $ = new Env('多合一账号失效检测')
 * cron: 10 12,21 * * *
 */
const initScript = require('../utils/initScript')
const {$, notify, sudojia} = initScript('多合一账号失效检测');
const cheerio = require("cheerio");
const crypto = require("crypto");
// 消息推送
let message = '';
// 环境变量
const enableCheckToken = process.env.ENABLE_CHECK_TOKEN || false;
// 账号列表
const accounts = [
    {
        name: '所有女生',
        list: process.env.ALL_GIRLS_TOKEN ? process.env.ALL_GIRLS_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://7.wawo.cc/api/account/wx/member/base`, 'get', createHeaders('wx_mini', `authorization@bearer ${token}`, 'Content-Type@application/json', 'referer@https://servicewechat.com/wx7d1403fe84339669/1076/page-frame.html'));
            return '000' !== data.code || !data.data;
        },
    },
    {
        name: '安慕希',
        list: process.env.AMX_TOKEN ? process.env.AMX_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://amxshop.yili.com/api/user/getUser`, 'get', createHeaders('wx_mini', `accesstoken@${token}`, 'Content-Type@application/x-www-form-urlencoded', 'referer@https://servicewechat.com/wxf2a6206f7e2fd712/666/page-frame.html'));
            return '未登陆或登陆超时' === data.msg || !data.data;
        },
    },
    {
        name: '霸王茶姬',
        list: process.env.BW_TEA_TOKEN ? process.env.BW_TEA_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            token = token.split('#')[0];
            const data = await sudojia.sendRequest(`https://webapi2.qmai.cn/web/catering2-apiserver/crm/customer-center?appid=wxafec6f8422cb357b`, 'get', createHeaders('wx_mini', `qm-user-token@${token}`, 'Content-Type@application/json', 'qm-from@wechat'));
            return !data.status;
        },
    },
    {
        name: '飞牛私有云',
        list: process.env.FN_NAS_COOKIE ? process.env.FN_NAS_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://club.fnnas.com`, 'get', createHeaders('PC', `Cookie@${token}`, 'Accept-Encoding@gzip, deflate, br, zstd'));
            const $ = cheerio.load(data);
            const uid = $('a', '.icon_msg').attr('href').match(/uid=(\d+)/)[1];
            return 0 > uid;
        },
    },
    {
        name: '国乐酱酒',
        list: process.env.GYJ_TOKEN ? process.env.GYJ_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://member.guoyuejiu.com/api/user/info`, 'get', createHeaders('wx_mini', `Authorization@${token}`, 'Content-Type@application/json', 'Host@member.guoyuejiu.com', 'referer@https://servicewechat.com/wxeff120e4d11594c0/72/page-frame.html'));
            return 1011 === data.code;
        },
    },
    {
        name: '厚工坊',
        list: process.env.HGF_COOKIE ? process.env.HGF_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://api.hgf1862.com/YUN//Game/2021/QianDao/QianDaoAjax_By28.aspx?op=now&vers=`, 'post', createHeaders('wx_mini', `Cookie@user=SessionID=${token}`, 'Accept@application/json, text/javascript, */*; q=0.01'));
            return -10000 === data.status;
        },
    },
    {
        name: '海澜之家-游戏',
        list: process.env.HLZJ_UNID ? process.env.HLZJ_UNID.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://gmdevpro.hlzjppgl.cn/server/api/authorized-login`, 'post', createHeaders('wx_mini', `Cookie@user=SessionID=${token}`, 'Content-Type@application/json', 'Host@gmdevpro.hlzjppgl.cn'), {
                "union_id": token,
                "invite_user_id": "78630"
            });
            return 200 !== data.code || !data.data.token;
        },
    },
    {
        name: '媓钻护肤品',
        list: process.env.HZHFP_TOKEN ? process.env.HZHFP_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const headers = createHeaders(
                'wx_mini',
                `Authorization@Bearer ${token}`,
                'Content-Type@application/json;charset=UTF-8',
                'Host@api.hzyxhfp.com',
                'referer@https://servicewechat.com/wx3df7476c42cace5d/377/page-frame.html',
                'app@wx3df7476c42cace5d',
            );
            const data = await sudojia.sendRequest(`https://api.hzyxhfp.com/api/users/getUserDetailInfo`, 'post', headers);
            return 0 !== data.code || !data.data;
        },
    },
    {
        name: '玩拍由我俱乐部',
        list: process.env.INSTAX_TOKEN ? process.env.INSTAX_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            token = token.split('#')[0];
            const data = await sudojia.sendRequest(`https://instax.app.xcxd.net.cn/api/me`, 'get', createHeaders('wx_mini', `Authorization@Bearer ${token}`, 'Content-Type@application/json', 'Host@instax.app.xcxd.net.cn', 'referer@https://servicewechat.com/wx3cb572fbf3aa30c8/136/page-frame.html'));
            return data.error || !data.data;
        },
    },
    {
        name: '金典有机生活+',
        list: process.env.JINDIAN_TOKEN ? process.env.JINDIAN_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://msmarket.msx.digitalyili.com/gateway/api/auth/account/user/info`, 'get', createHeaders('wx_mini', `access-token@${token}`, 'Content-Type@application/json', 'referer@https://servicewechat.com/wxf32616183fb4511e/616/page-frame.html'));
            return !data.status || !data.data.userId;
        },
    },
    {
        name: '嘉立创',
        list: process.env.JLC_TOKEN ? process.env.JLC_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://m.jlc.com/api/appPlatform/center/setting/selectPersonalInfo`, 'get', createHeaders('PC', `x-jlc-accesstoken@${token}`, 'x-jlc-clienttype@WEB', 'accept@application/json, text/plain, */*', 'referer@https://m.jlc.com/mapp/pages/my/index'), '');
            return 200 !== data.code || !data.data.customerLinkPhone
        },
    },
    {
        name: '植白说官方商城',
        list: process.env.KOZBS_TOKEN ? process.env.KOZBS_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://www.kozbs.com/demo/wx/user/getUserIntegral`, 'get', createHeaders('wx_mini', `x-dts-token@${token}`, 'Content-Type@application/json', 'referer@https://servicewechat.com/wx6b6c5243359fe265/153/page-frame.html'));
            return '无效用户' === data.errmsg || 0 !== data.errno;
        },
    },
    {
        name: '开天工作室',
        list: process.env.KTGZS_TOKEN ? process.env.KTGZS_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://api.box.vipinfinity.com/user`, 'get', createHeaders('wx_mini', `Authorization@${token}`, 'Client-Name@default', 'Content-Type@application/json', 'Client-Type@wechat--miniapp-windows', 'Host@api.box.vipinfinity.com', 'referer@https://servicewechat.com/wxa1ff7cf5ddff1da2/9/page-frame.html'));
            return 0 !== data.code || !data.data.user;
        },
    },
    {
        name: '库街区',
        list: process.env.KURO_TOKEN ? process.env.KURO_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            $.source = 'h5';
            let data = await sudojia.sendRequest(`https://api.kurobbs.com/gamer/widget/game3/refresh`, 'post', {
                "source": $.source,
                'token': token,
            }, `type=2&sizeType=1`);
            if (220 === data.code) {
                $.source = 'android';
                await $.wait(sudojia.getRandomWait(1000, 1500));
                data = await sudojia.sendRequest(`https://api.kurobbs.com/gamer/widget/game3/refresh`, 'post', {
                    "source": $.source,
                    'token': token,
                }, `type=2&sizeType=1`);
                return 220 === data.code || !data.data;
            }
            return 220 === data.code || !data.data;
        },
    },
    {
        name: '老板电器服务微商城',
        list: process.env.LAOBAN_OPENID ? process.env.LAOBAN_OPENID.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://vip.foxech.com/index.php/api/member/get_member_info`, 'post', createHeaders('wx_mini', 'Content-Type@application/json', 'referer@https://servicewechat.com/wxc8c90950cf4546f6/157/page-frame.html'), getLaoBanToken(token));
            return '200' !== data.code || !data.data;
        },
    },
    {
        name: '龙湖天街',
        list: process.env.LONG_FOR_TOKEN ? process.env.LONG_FOR_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://gw2c-hw-open.longfor.com/riyuehu-miniapp-prod/service/ryh/user/info`, 'post', createHeaders('wx_mini', 'X-Gaia-Api-Key@646fce29-3a77-462a-aabe-0fe77bc3023f', `token@${token}`, 'Content-Type@application/json'), {
                "data": {
                    "projectId": "B379F9F1-C176-4925-B6F6-92555AC62E61"
                }
            });
            return 10000 !== data.code || !data.data;
        },
    },
    {
        name: '欣都龙城',
        list: process.env.MALLCOO_TOKEN ? process.env.MALLCOO_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://m.mallcoo.cn/api/user/user/GetUserAndMallCard`, 'post', createHeaders('wx_mini', 'Content-Type@application/json', 'referer@https://servicewechat.com/wx7ef63cf605a639fb/18/page-frame.html'), {
                "MallId": 10144,
                "Header": {
                    "Token": token,
                    "systemInfo": {
                        "model": "microsoft",
                        "SDKVersion": "3.5.0",
                        "system": "Windows 11 x64",
                        "version": "3.9.10",
                        "miniVersion": "2.67.7"
                    }
                }
            });
            return 1 !== data.m || 320 === data.m;
        },
    },
    {
        name: '馬伍旺饮料厂',
        list: process.env.MAWUW_TOKEN ? process.env.MAWUW_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            token = token.split('#')[0];
            const data = await sudojia.sendRequest(`https://webapi.qmai.cn/web/catering/crm/customer-center?appid=wxc1381dc6f2213b72`, 'get', createHeaders('wx_mini', `qm-user-token@${token}`, 'Content-Type@application/json', 'qm-from@wechat'));
            return !data.status || !data.data;
        },
    },
    {
        name: '美的会员',
        list: process.env.MIDEA_COOKIE ? process.env.MIDEA_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://mvip.midea.cn/next/mucuserinfo/getmucuserinfo`, 'get', createHeaders('wx_mini', `Cookie@${token}`, 'Content-Type@application/json', 'referer@https://servicewechat.com/wx03925a39ca94b161/437/page-frame.html'));
            return 0 !== data.errcode || !data.data.userinfo;
        },
    },
    {
        name: '摩托范',
        list: process.env.MOTO_TOKEN ? process.env.MOTO_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const [ck, uid] = token.split('#')
            const headers = createHeaders(
                'H5',
                `token@${ck}`,
                'Content-Type@application/x-www-form-urlencoded',
                'referer@api.58moto.com',
                `timestamp@${Date.now()}`,
                'version@3.57.63'
            );
            const data = await sudojia.sendRequest(`https://api.58moto.com/user/center/info/v2/principal`, 'post', headers, `uid=${uid}`);
            return 0 !== data.code || !data.data.mobile
        },
    },
    {
        name: '南方航空',
        list: process.env.NFHK_COOKIE ? process.env.NFHK_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://wxapi.csair.com/marketing-tools/activity/join?type=APPTYPE&chanel=ss&lang=zh`, 'post', createHeaders('wx_mini', `Cookie@${[`sign_user_token=${token}`, `TOKEN=${token}`, `cs1246643sso=${token}`,].join('; ')}`, 'User-Agent@okhttp/3.12.1;jdmall;android;version/10.3.4;build/92451;', 'Content-Type@application/json'), {
                "activityType": "sign",
                "channel": "app",
                "entrance": 1,
            });
            return 'S00011' === data.respCode || !data.data;
        },
    },
    {
        name: '胖哥俩肉蟹煲',
        list: process.env.PANG_GE_TOKEN ? process.env.PANG_GE_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const headers = createHeaders(
                'wx_mini',
                'deviceWidth@400',
                'Host@saash5.namek.com.cn',
                'tenantId@24',
                'Accept@*/*',
                'Content-Type@application/json;charset=UTF-8',
                'Accept-Encoding@gzip, deflate, br',
                'referer@https://servicewechat.com/wxe61905cae01a6c7d/67/page-frame.html',
                'clientVersion@3.2.0',
                `timestamp@${Date.now()}`,
                `token@${token}`
            )
            const data = await sudojia.sendRequest(`https://saash5.namek.com.cn//api/v1/member/personal?shopId=24`, 'get', headers);
            return !data.body.member;
        },
    },
    {
        name: '皮皮世界',
        list: process.env.PPX_COOKIE ? process.env.PPX_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://api.pipix.com/bds/user/user_profile/`, 'get', createHeaders('H5', 'Accept-Encoding@gzip', 'host@api.pipix.com', `Cookie@sessionid=${token}`), {});
            return 11002 === data.status_code || 'no_login' === data.message;
        },
    },
    {
        name: '水费易签到',
        list: process.env.SHUI_FEI_COOKIE ? process.env.SHUI_FEI_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const [cookie, mId] = token.split('#');
            const data = await sudojia.sendRequest(`https://m.ipaiyun.cn/PersonalCenter/PersonalCenter/GetShopMemberDetail`, 'post', createHeaders('PC', `Cookie@${cookie}`, 'Accept@*/*', 'referer@https://m.ipaiyun.cn/Ipai/Home/Index?code=031sLtFa11eBTH0d0uFa1NqtY53sLtFQ&state=wxbe5b7a2bc0467240', 'Content-Type@application/x-www-form-urlencoded; charset=UTF-8'), `memberId=${mId}`);
            return 0 !== data.code || !data.resultJson.meberinfo;
        },
    },
    {
        name: '特步会员中心',
        list: process.env.TEBU_JSON ? process.env.TEBU_JSON.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const headers = createHeaders('wx_mini', 'ezr-source@weapp', 'content-type@application/json', 'referer@https://servicewechat.com/wx12e1cb3b09a0e6f0/121/page-frame.html')
            for (const [key, value] of Object.entries(JSON.parse(token))) {
                headers[key] = value;
            }
            const data = await sudojia.sendRequest(`https://wxa-tp.ezrpro.com/myvip/FamilyCard/GetVipCardInfoByVipId`, 'get', headers);
            return 200 !== data.Status || !data.Result.VipInfo;
        },
    },
    {
        name: '贴吧签到',
        list: process.env.TIE_BA_COOKIE ? process.env.TIE_BA_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const headers = createHeaders('H5', 'Content-Type@application/x-www-form-urlencoded');
            const matchList = token.match(/BDUSS=([^;]+);?/);
            if (matchList) {
                headers.Cookie = `BDUSS=${matchList[1]}`;
            } else {
                headers.Cookie = `BDUSS=${token}`;
            }
            const data = await sudojia.sendRequest(`http://tieba.baidu.com/dc/common/tbs`, 'get', headers);
            return !data.tbs || 1 !== data.is_login;
        },
    },
    {
        name: '贴吧任务签到',
        list: process.env.TIE_BA_COOKIE ? process.env.TIE_BA_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest(`https://tieba.baidu.com/mo/q/usergrowth/showUserGrowth?client_type=2&client_version=12.60.1.2`, 'get', createHeaders('H5', `Cookie@${token}`));
            return !data.data.tbs || !data.data.user;
        },
    },
    {
        name: 'V2EX每日签到',
        list: process.env.V2EX_COOKIE ? process.env.V2EX_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest('https://www.v2ex.com', 'get', createHeaders('PC', `Cookie@${token}`, 'Accept-Encoding@gzip, deflate, br', 'Accept@text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'));
            return !(data.indexOf('登出') > -1);
        },
    },
    {
        name: '心喜',
        list: process.env.XINXI_TOKEN ? process.env.XINXI_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest('https://api.xinc818.com/mini/user', 'get', createHeaders('wx_mini', `sso@${token}`, 'Accept-Encoding@gzip, deflate, br', 'Content-Type@application/json', 'referer@https://servicewechat.com/wx673f827a4c2c94fa/276/page-frame.html'));
            return 40001 === data.code || !data.data.nickname;
        },
    },
    {
        name: '兴攀农场',
        list: process.env.XPFARM_TOKEN ? process.env.XPFARM_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest('https://p.xpfarm.cn/treemp/user.PersonalCenter/getInfo', 'post', createHeaders('wx_mini', `authorization@${token}`, 'Accept-Encoding@gzip, deflate, br', 'Content-Type@application/json', 'referer@https://servicewechat.com/wx27e219ff3142b7c8/63/page-frame.html'));
            return 1000 !== data.code || !data.data.id;
        },
    },
    {
        name: '智能电视',
        list: process.env.ZNDS_COOKIE ? process.env.ZNDS_COOKIE.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest('https://www.znds.com/', 'post', createHeaders('PC', `Cookie@${token}`, 'Accept-Encoding@gzip, deflate, br', 'Content-Type@text/html; charset=utf-8', 'Accept@text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'));
            return !(data.indexOf('退出') > -1);
        },
    },
    {
        name: '甄稀冰淇淋',
        list: process.env.ZX_ICE_TOKEN ? process.env.ZX_ICE_TOKEN.split(/[\n&]/) : [],
        checkFn: async (token) => {
            const data = await sudojia.sendRequest('https://msmarket.msx.digitalyili.com/gateway/api/auth/account/user/info', 'get', createHeaders('wx_mini', `access-token@${token}`, 'Content-Type@application/json', 'referer@https://servicewechat.com/wx21fd8b5d6d4cf1ca/195/page-frame.html'));
            return !data.status || !data.data.userId;
        },
    },
];

!(async () => {
    if (!enableCheckToken) {
        console.log('\n如需执行，请先配置环境变量【ENABLE_CHECK_TOKEN】为 true');
        return;
    }
    for (const account of accounts) {
        if (!account.list.length) {
            console.log(`\n未配置${account.name}环境变量，跳过...`);
            await $.wait(sudojia.getRandomWait(500, 1000));
            continue;
        }
        let totalAccounts = account.list.length;
        let failedAccounts = 0;
        let failedIndices = [];
        for (let i = 0; i < totalAccounts; i++) {
            if (account.name === '贴吧任务签到') {
                if (!account.list[i].includes('CUID=')) {
                    console.log('\n检测到贴吧任务签到变量缺少 CUID，将跳过...');
                    continue;
                }
            }
            const index = i + 1;
            console.log(`\n${account.name}账号[${index}]`);
            const isLoginFailed = await checkAccount(account, account.list[i]);
            await $.wait(sudojia.getRandomWait(800, 1100));
            if (isLoginFailed) {
                console.error(`失效！❌`);
                failedAccounts++;
                failedIndices.push(index);
            } else {
                console.log(`有效！✅`);
            }
        }
        if (failedAccounts > 0) {
            message += `${account.name}\n`;
            message += `共计[${totalAccounts}]个账号\n`;
            message += `第[${failedIndices.join(', ')}]个账号失效\n\n`;
            message += `------------\n\n`;
        }
    }
    if (message) {
        await notify.sendNotify(`「${$.name}」`, `${message}`);
    } else {
        console.log('\n检测完毕，暂无失效账号！✅');
    }
})().catch((e) => $.logErr(e)).finally(() => $.done());

async function checkAccount(account, token) {
    try {
        return await account.checkFn(token);
    } catch (e) {
        return true;
    }
}

/**
 * 创建请求头
 *
 * @param type
 * @param customHeaders
 */
function createHeaders(type, ...customHeaders) {
    const headers = {
        'User-Agent': sudojia.getRandomUserAgent(type),
    };
    customHeaders.forEach(customHeader => {
        const [key, value] = customHeader.split('@');
        if (key && value) {
            headers[key] = value;
        }
    });
    return headers;
}

/**
 * 老板电器 token 获取
 *
 * @param openId
 * @returns {{openid, is_need_sync: number, timestamp: number, token: string}}
 */
function getLaoBanToken(openId) {
    const currentTimestampMs = Date.now();
    const rawString = `${currentTimestampMs}wqewq${openId}`;
    return {
        is_need_sync: 1,
        timestamp: currentTimestampMs,
        token: sudojia.md5(rawString),
        openid: openId
    }
}