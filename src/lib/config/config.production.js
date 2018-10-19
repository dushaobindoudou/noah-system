
'use strict';

const path = require('path');
const fse = require('fs-extra');

const config = {
    //全量包的存放根目录
    packageDir : '/usr/app/packages/full',
    //增量包的存放根目录
    diffDir : '/usr/app/packages/diff',
    //app发版的日志存放根目录
    publishLogDir : '/usr/app/noah-log/publish_logs',
    
};

config.log = {
    streams: [
        {
            level: 'info',
            path: '/usr/app/noah-log/app-log/info.log'
        },
        {
            level: 'warn',
            path: '/usr/app/noah-log/app-log/warn.log'
        },
        {
            level: 'error',
            path: '/usr/app/noah-log/app-log/error.log'
        }
    ]
};

//确保相应目录存在
fse.ensureDirSync(config.packageDir);
fse.ensureDirSync(config.diffDir);
fse.ensureDirSync(config.publishLogDir);

config.mysql = {

    connectionLimit: 10,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'noah_system',
    charset: 'utf8mb4',
    timezone: 'local',
    connectTimeout: 10000

};

config.redis = {
    //是否是集群模式
    isCluster: false,
    //单机模式的redis配置
    options: {
        port: 6379,          // Redis port
        host: '127.0.0.1',   // Redis host
        family: 4,           // 4 (IPv4) or 6 (IPv6)
        db: 0
    },
  };


module.exports = config;