#!/bin/sh
# Author: lxk0301
# Modify：sudojia
set -e

# 获取配置的自定义参数
if [ $1 ]; then
    run_cmd=$1
fi

echo "设定远程仓库地址..."
cd /AutoTaskScript
git remote set-url origin $REPO_URL
git reset --hard

echo "git pull 拉取最新代码..."
git -C /AutoTaskScript pull --rebase

echo "设置 npm 源为淘宝镜像..."
npm config set registry https://registry.npmmirror.com

echo "npm install 安装最新依赖"
npm install --prefix /AutoTaskScript
# 恢复默认 npm 源
npm config delete registry

echo "------------------------------------执行定时任务任务shell脚本------------------------------------"
sh -x /AutoTaskScript/docker/default_task.sh

echo "------------------------------------默认定时任务执行完成------------------------------------"
# 根据自定义参数决定是否启动crontab定时任务主进程
if [ $run_cmd ]; then
    echo -e "启动 crontab 定时任务主进程...\n\n"
    crond -f
else
    echo -e "默认定时任务执行结束。\n\n"
fi
