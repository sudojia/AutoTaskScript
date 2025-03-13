const {default: axios} = require("axios");
const crypto = require('crypto');

// ****************************************Send Request****************************************
/**
 * Send request
 *
 * @param url request url
 * @param method request method
 * @param headers request headers
 * @param data body data
 *
 * @return {Promise<any>}
 */
async function sendRequest(url, method, headers = {}, data = {}) {
    const options = {
        method: method.toUpperCase(), url, data, headers: headers,
    };
    const response = await axios(options);
    return response.data;
}

// ****************************************Wait time****************************************

/**
 * Random wait time
 *
 * @param min minimum value
 * @param max maximum value
 *
 * @returns {*} random number
 */
function getRandomWait(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ****************************************MD5****************************************
/**
 * md5 encryption
 *
 * @param str
 * @return {string}
 */
function md5(str) {
    const hash = crypto.createHash('md5');
    hash.update(str);
    return hash.digest('hex');
}

// ****************************************USER-AGENT****************************************
const USER_AGENTS = {
    // Windows
    "PC": [
        "Mozilla/5.0 (iPad; CPU iPad OS 10_3_4 like Mac OS X) AppleWebKit/533.0 (KHTML, like Gecko) FxiOS/16.5z7892.0 Mobile/52J091 Safari/533.0",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 3_1_3 like Mac OS X) AppleWebKit/536.2 (KHTML, like Gecko) CriOS/39.0.866.0 Mobile/49L726 Safari/536.2",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15",
        "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko",
        "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.86 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.155 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Maxthon/4.4.3.4000 Chrome/30.0.1599.101 Safari/537.36"
    ],
    // 微信小程序
    "wx_mini": [
        "Mozilla/5.0 (Linux; Android 9; COL-AL10 Build/HUAWEICOL-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/85.0.3527.52 MQQBrowser/6.2 TBS/044607 Mobile Safari/537.36 MMWEBID/7140 MicroMessenger/7.0.4.1420(0x27000437) Process/tools NetType/4G Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 13; V2148A Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240404 MMWEBID/8833 MicroMessenger/8.0.49.2600(0x28003137) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 12; NOH-AL00 Build/HUAWEINOH-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240404 MMWEBID/6916 MicroMessenger/8.0.49.2600(0x28003136) WeChat/arm64 Weixin NetType/4G Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 14; V2307A Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240301 MMWEBID/4922 MicroMessenger/8.0.48.2580(0x28003052) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 13; 23049RAD8C Build/TKQ1.221114.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20230303 MMWEBID/4466 MicroMessenger/8.0.34.2340(0x2800225F) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 10; PBEM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20240301 MMWEBID/3124 MicroMessenger/8.0.48.2580(0x2800303F) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 13; V2024A Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240301 MMWEBID/2429 MicroMessenger/8.0.48.2580(0x28003050) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 13; V2304A Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20240301 MMWEBID/195 MicroMessenger/8.0.48.2580(0x2800303F) WeChat/arm64 Weixin NetType/5G Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 9; COL-AL10 Build/HUAWEICOL-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.4467.59 MQQBrowser/6.2 TBS/044607 Mobile Safari/537.36 MMWEBID/7140 MicroMessenger/7.0.4.1420(0x27000437) Process/tools NetType/4G Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 9; COL-AL10 Build/HUAWEICOL-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/56.0.3545.100 MQQBrowser/6.2 TBS/044607 Mobile Safari/537.36 MMWEBID/7140 MicroMessenger/7.0.4.1420(0x27000437) Process/tools NetType/4G Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003127) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003127) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003030) NetType/4G Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42(0x18002a32) NetType/4G Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x1800302c) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003129) NetType/4G Language/zh_HK",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003030) NetType/4G Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_8_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003030) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003030) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x1800312a) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003127) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x18003127) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42(0x18002a32) NetType/4G Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003030) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 11_2_6 like Mac OS X) AppleWebKit/604.5.6 (KHTML, like Gecko) Mobile/15D100 MicroMessenger/6.6.7 NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.48(0x18003030) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 13; 23049RAD8C Build/TKQ1.221114.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20230303 MMWEBID/4466 MicroMessenger/8.0.34.2340(0x2800225F) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 13; V2024A Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240301 MMWEBID/2429 MicroMessenger/8.0.48.2580(0x28003050) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 14; SM-S9110 Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240301 MMWEBID/8661 MicroMessenger/8.0.48.2580(0x28003052) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 6.0.1; OPPO R9s Build/MMB29M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044204 Mobile Safari/537.36 MicroMessenger/6.6.7.1321(0x26060737) NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 11; Mi 9 Lite Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240404 MMWEBID/5830 MicroMessenger/8.0.49.2580(0x28003110) WeChat/arm64 Weixin NetType/4G Language/zh_HK ABI/arm64",
        "Mozilla/5.0 (Linux; Android 14; 22041211AC Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20240301 MMWEBID/1559 MicroMessenger/8.0.48.2580(0x28003039) WeChat/arm64 Weixin NetType/5G Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 9; COL-AL10 Build/HUAWEICOL-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/78.0.3186.40 MQQBrowser/6.2 TBS/044607 Mobile Safari/537.36 MMWEBID/7140 MicroMessenger/7.0.4.1420(0x27000437) Process/tools NetType/4G Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 14; PJD110 Build/UKQ1.230924.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240404 MMWEBID/1658 MicroMessenger/8.0.49.2600(0x28003137) WeChat/arm64 Weixin NetType/5G Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 11; MI 9 Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160117 MMWEBSDK/20240301 MMWEBID/6821 MicroMessenger/8.0.48.2580(0x28003052) WeChat/arm64 Weixin NetType/4G Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 12; DCO-AL00 Build/HUAWEIDCO-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20240301 MMWEBID/1256 MicroMessenger/8.0.48.2580(0x2800303D) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 9; COL-AL10 Build/HUAWEICOL-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4171.84 MQQBrowser/6.2 TBS/044607 Mobile Safari/537.36 MMWEBID/7140 MicroMessenger/7.0.4.1420(0x27000437) Process/tools NetType/4G Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 14; 23013RK75C Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20240301 MMWEBID/5940 MicroMessenger/8.0.48.2580(0x28003096) WeChat/arm64 Weixin NetType/5G Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 9; COL-AL10 Build/HUAWEICOL-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.3166.116 MQQBrowser/6.2 TBS/044607 Mobile Safari/537.36 MMWEBID/7140 MicroMessenger/7.0.4.1420(0x27000437) Process/tools NetType/4G Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 6.0.1; SM-C5000 Build/MMB29M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/53.0.2785.49 Mobile MQQBrowser/6.2 TBS/043409 Safari/537.36 MicroMessenger/6.5.8.1060 NetType/WIFI Language/zh_CN",
        "Mozilla/5.0 (Linux; Android 14; V2338A Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20231202 MMWEBID/4013 MicroMessenger/8.0.47.2560(0x28002F51) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
        "Mozilla/5.0 (Linux; Android 14; 23078RKD5C Build/UP1A.230905.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 XWEB/1160083 MMWEBSDK/20231202 MMWEBID/4335 MicroMessenger/8.0.47.2560(0x28002F51) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64",
    ],
    // Android
    "H5": [
        "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; Mi 9T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; OnePlus 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; vivo 1914) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; Redmi Note 9 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-A505FN) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; LG G8X ThinQ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; moto g(7) power) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; ASUS_I001DC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; Nokia 7.2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; SH-03L) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; HTC U12+) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; Lenovo Z6 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; OPPO A92) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; realme X2 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; HUAWEI P40) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 11; Sony Xperia 1 II) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 10; POCO X3 NFC) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0 Mobile Safari/537.36",
        "Mozilla/5.0 (Linux; Android 9; ZTE A2020G Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0 Mobile Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.5 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.6 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.6 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.2 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.7 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.7 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.3 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    ]
};

/**
 * 生成随机数字
 *
 * @param type UA 类型
 * @return {string}
 */
function getRandomUserAgent(type = 'wx_mini') {
    const arrays = USER_AGENTS[type];
    const index = Math.floor(Math.random() * arrays.length);
    return arrays[index];
}

module.exports = {sendRequest, getRandomWait, md5, getRandomUserAgent};