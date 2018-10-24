#!/bin/sh

# 将编译之后的目录，拷贝到最终运行目录

base_dir=$(cd "$(dirname "$0")";pwd)
system_dir="${base_dir}/.."
dist_dir_name="dist"
dist_dir="${system_dir}/${dist_dir_name}"
run_dir="/usr/app/leekserver"

# 调用编译脚本
cd ${system_dir}
echo "调用 build.sh"
sh "${base_dir}/build.sh"

cd ${system_dir}

# 创建最终应用根目录
echo "创建应用执行根目录"
mkdir -p ${run_dir}

# 创建日志根目录
echo "创建应用日志目录"
mkdir -p /usr/app/noah-log

echo "拷贝编译后的代码到运行目录"
cp -r "${dist_dir}/*" ${run_dir}

echo "进入运行根目录"
cd ${run_dir}

echo "准备重启服务"
sh tools/server_control.sh reload production




