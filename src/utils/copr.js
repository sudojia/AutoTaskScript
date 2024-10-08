function printLogo() {console.log(`                  _         _  _        
  ___  _   _   __| |  ___  (_)(_)  __ _ 
 / __|| | | | / _\` | / _ \\ | || | / _\` |
 \\__ \\| |_| || (_| || (_) || || || (_| |
 |___/ \\__,_| \\__,_| \\___/_/ ||_| \\__,_|
                         |__/           \n`);}function printScriptInfo(script, author, home, currentVersion, newVersion) {console.log(`【脚本作者】${author}\n【脚本地址】${home}\n【当前版本】v${currentVersion}\n【最新版本】v${newVersion}\n【最近更新】${script.changelog.date}\n【更新内容】${script.changelog.changes}`);}module.exports = {printLogo, printScriptInfo};
