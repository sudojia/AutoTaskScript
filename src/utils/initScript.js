module.exports = (appName) => {
    const Env = require('./env');
    const $ = new Env(appName);
    const notify = $.isNode() ? require('./sendNotify') : '';
    const sudojia = require('./common');
    const checkUpdate = require('./introduction');
    return {$, notify, sudojia, checkUpdate};
};
