module.exports = async function checkUpdate(prefix, list) {
    if (JSON.stringify(process.env).indexOf('GITHUB') > -1) {
        console.log('\n不建议使用 GitHub Actions 方式运行脚本\n推荐使用青龙面板');
        console.log('服务器推荐：https://github.com/sudojia/AutoTaskScript?tab=readme-ov-file#%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%8E%A8%E8%8D%90');
        // process.exit(0);
    }
    if (!list || list.length === 0) {
        console.error(`\n未配置环境变量...`);
        process.exit(1);
    }
    console.log(`\n开始执行${prefix}`);
}