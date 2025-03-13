# 每隔 3 天 23:50 清理一次日志
50 23 */3 * * rm -rf /AutoTaskScript/src/logs/*.log

# 以下只是示例，自行删除添加
##############小程序##############
# 霸王茶姬
22 11 * * * node /AutoTaskScript/src/wx_mini/sudojia_bwtea.js >> /AutoTaskScript/src/logs/sudojia_bwtea.log 2>&1

##############客户端##############
# 多娇江山
14 7 * * * node /AutoTaskScript/src/client/sudojia_jiangshan.js >> /AutoTaskScript/src/logs/sudojia_jiangshan.log 2>&1

##############网页端##############
# v2ex
0 9 * * * node /AutoTaskScript/src/web/sudojia_v2ex.js >> /AutoTaskScript/src/logs/sudojia_v2ex.log 2>&1

##############公众号##############
# 水费易
3 9 * * * node /AutoTaskScript/src/public/sudojia_shuifei.js >> /AutoTaskScript/src/logs/sudojia_shuifei.log 2>&1
