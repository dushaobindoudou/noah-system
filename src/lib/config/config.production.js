
'use strict';

const path = require('path');
const fse = require('fs-extra');

const config = {
    //全量包的存放根目录
    packageDir : '/cms/node_lemon_data/packages/full',
    //增量包的存放根目录
    diffDir : '/cms/node_lemon_data/packages/diff',
    //app发版的日志存放根目录
    publishLogDir : '/opt/app/node-logs/node-lemon-service/publish_logs',
    
};

//确保相应目录存在
fse.ensureDirSync(config.packageDir);
fse.ensureDirSync(config.diffDir);
fse.ensureDirSync(config.publishLogDir);


module.exports = config;