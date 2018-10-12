#!/usr/bin/env bash


# 测试代码下载、打包

base_dir=$(cd "$(dirname "$0")";pwd)
bin_dir=${base_dir}/..
app_dist_dir=${bin_dir}/../dist
#全量包根目录
full_package_dir=${app_dist_dir}/dirs/full
#增量包根目录
diff_package_dir=${app_dist_dir}/dirs/diff

node -v

node ${bin_dir}/index.js --task_id=3 --mysql_host=172.16.3.173 --mysql_user=root --mysql_password=123123 --mysql_database=rn_hot_update --package_dir=${full_package_dir} --diff_dir=${diff_package_dir}

