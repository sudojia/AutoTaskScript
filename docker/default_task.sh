#!/bin/sh
# Author: lxk0301
# Modify：sudojia
set -e

echo "定义定时任务合并处理用到的文件路径..."
defaultListFile="/AutoTaskScript/docker/$DEFAULT_LIST_FILE"
echo "默认文件定时任务文件路径为 ${defaultListFile}"
mergedListFile="/AutoTaskScript/docker/merged_list_file.sh"
echo "合并后定时任务文件路径为 ${mergedListFile}"
echo "##############自动生成的定时任务##############" > /AutoTaskScript/docker/crontab_list.sh

echo "开始自动生成定时任务列表..."
find /AutoTaskScript/src -type f -name "*.js" ! -path "*/utils/*" | while read -r js_file; do
    if [ -f "$js_file" ]; then
        script_name=$(basename "$js_file")
        cron_expression=$(grep -o 'cron: [^#\n\r]*' "$js_file" | sed 's/cron: //')
        task_name=$(grep -o "new Env('[^']*')" "$js_file" | sed "s/new Env('//;s/')//")
        if [ -n "$cron_expression" ]; then
            if [ -n "$task_name" ]; then
                echo "# $task_name" >> /AutoTaskScript/docker/crontab_list.sh
            else
                echo "# 未定义的任务名称" >> /AutoTaskScript/docker/crontab_list.sh
            fi
            echo "$cron_expression node $js_file >> /AutoTaskScript/src/logs/${script_name%.js}.log 2>&1" >> /AutoTaskScript/docker/crontab_list.sh
        else
            echo "警告：$js_file 没有 cron 或 cron 有误"
        fi
    fi
done

echo "第1步将默认定时任务列表添加到并后定时任务文件..."
cat "$defaultListFile" > "$mergedListFile"

echo "第2步判断是否存在自定义任务任务列表并追加..."
if [ $CUSTOM_LIST_FILE ]; then
    echo "您配置了自定义任务文件：$CUSTOM_LIST_FILE，自定义任务类型为：$CUSTOM_LIST_MERGE_TYPE..."
    # 无论远程还是本地挂载, 均复制到 $customListFile
    customListFile="/AutoTaskScript/docker/custom_list_file.sh"
    echo "自定义定时任务文件临时工作路径为 ${customListFile}"
    if expr "$CUSTOM_LIST_FILE" : 'http.*' &>/dev/null; then
        echo "自定义任务文件为远程脚本，开始下载自定义远程任务。"
        wget -O $customListFile $CUSTOM_LIST_FILE
        echo "下载完成..."
    elif [ -f /AutoTaskScript/docker/$CUSTOM_LIST_FILE ]; then
        echo "自定义任务文件为本地挂载。"
        cp /AutoTaskScript/docker/$CUSTOM_LIST_FILE $customListFile
    fi
    if [ -f "$customListFile" ]; then
        if [ $CUSTOM_LIST_MERGE_TYPE == "append" ]; then
            echo "合并默认定时任务文件：$DEFAULT_LIST_FILE 和 自定义定时任务文件：$CUSTOM_LIST_FILE"
            echo -e "" >>$mergedListFile
            cat $customListFile >>$mergedListFile
        elif [ $CUSTOM_LIST_MERGE_TYPE == "overwrite" ]; then
            echo "配置了自定义任务文件：$CUSTOM_LIST_FILE，自定义任务类型为：$CUSTOM_LIST_MERGE_TYPE..."
            cat $customListFile >$mergedListFile
        else
            echo "配置配置了错误的自定义定时任务类型：$CUSTOM_LIST_MERGE_TYPE，自定义任务类型为只能为 append 或者 overwrite..."
        fi
    else
        echo "配置的自定义任务文件：$CUSTOM_LIST_FILE未找到，使用默认配置$DEFAULT_LIST_FILE..."
    fi
else
    echo "当前只使用了默认定时任务文件 $DEFAULT_LIST_FILE ..."
fi

echo "第3步判断是否配置了随即延迟参数..."
if [ $RANDOM_DELAY_MAX ]; then
    if [ $RANDOM_DELAY_MAX -ge 1 ]; then
        echo "已设置随机延迟为 $RANDOM_DELAY_MAX , 设置延迟任务中..."
        sed -i "s/node/sleep $((RANDOM % RANDOM_DELAY_MAX)); node/g" "$mergedListFile"
    fi
else
    echo "未配置随即延迟对应的环境变量，故不设置延迟任务..."
fi

echo "第4步删除不运行的脚本任务..."
if [ $DO_NOT_RUN_SCRIPTS ]; then
    echo "您配置了不运行的脚本：$DO_NOT_RUN_SCRIPTS"
    arr=${DO_NOT_RUN_SCRIPTS//&/ }
    for item in $arr; do
        sed -ie '/'"${item}"'/d' ${mergedListFile}
    done
fi

echo "第5步设定下次运行 docker_entrypoint.sh 时间..."
echo "删除原有 docker_entrypoint.sh 任务"
sed -ie '/'docker_entrypoint.sh'/d' ${mergedListFile}

echo "设定 docker_entrypoint.sh cron为："
echo -e "\n# 必要的默认定时任务请勿删除" >>$mergedListFile
echo -e "52 */6 * * * docker_entrypoint.sh >> /AutoTaskScript/src/logs/default_task.log 2>&1" >>$mergedListFile

echo "第6步增加 |ts 任务日志输出时间戳..."
sed -i "/\( ts\| |ts\|| ts\)/!s/>>/\|ts >>/g" $mergedListFile

echo "第7步加载最新的定时任务文件..."
crontab $mergedListFile

echo "第8步将仓库的 docker_entrypoint.sh 脚本更新至系统 /usr/local/bin/docker_entrypoint.sh 内..."
cat /AutoTaskScript/docker/docker_entrypoint.sh > /usr/local/bin/docker_entrypoint.sh
