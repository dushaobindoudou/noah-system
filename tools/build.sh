#!/bin/sh

# 实际执行的打包任务

base_dir=$(cd "$(dirname "$0")";pwd)
system_dir="${base_dir}/.."
client_dir="${system_dir}/client"
dist_dir_name="dist"
dist_dir="${system_dir}/${dist_dir_name}"
tar_name="prod-noah-system.tar.gz"

export NODE_ENV=production

# 子模块
modules=( dll common dash )

# 编译某个模块
build_module(){
    local cwd=`pwd`
    local module_name=$1
    cd ${client_dir}
    echo "开始编译模块 ${module_name} "
    leek bundle -m ${module_name} --env production
}

# yarn 安装
YarnInstall(){
    if [ -d node_modules ]
    then
        echo "安装 $(pwd) 目录的 node_modules"
        rm -rf node_modules
    fi
    yarn install --production=false
    echo "yarn安装npm包结束"
}

# 回到工程主目录
cd ${system_dir}

# 检查dist目录, 创建空的
if [ -d ${dist_dir_name} ]
then
    echo "编译产出的${dist_dir_name}目录存在源代码中, 冲突了!!"
    echo "=======删除dist目录======="
    rm -rf ${dist_dir_name}
fi

mkdir ${dist_dir_name}

# 在开始编译 client 各个模块前, 先安装依赖的npm包
cd ${client_dir}
YarnInstall

# 编译 client 下各个子模块
for var in ${modules[@]}
do
    build_module ${var}
done

cd ${system_dir}
YarnInstall

cd ${client_dir}

# 处理server端代码
leek server build

cd ${system_dir}

cp -r node_modules ${dist_dir}

# 拷贝 pm2.json 文件
cp ./pm2.json ${dist_dir}
#  拷贝 tools 目录到dist中
cp -r "${system_dir}/tools" ${dist_dir}

# tar czf ${tar_name} ${dist_dir}

# echo "打包 ${dist_dir_name} 上线包 ${tar_name} 完成"
