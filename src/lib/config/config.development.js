/**
 *
 * Created by Jess on 2018/6/7.
 */

'use strict';

const path = require('path');
const fse = require('fs-extra');

const redisHost = require('./common/redis_host.js');

const distRoot = path.normalize(`${leek.appRoot}/../dist`);

const config = {
    //全量包的存放根目录
    packageDir : path.join( distRoot, `dirs`, `full`),
    //增量包的存放根目录
    diffDir : path.join( distRoot, `dirs`, `diff`),
    //app发版的日志存放根目录
    publishLogDir : path.join( distRoot, `publish_logs`),
};

//确保相应目录存在
fse.ensureDirSync(config.packageDir);
fse.ensureDirSync(config.diffDir);
fse.ensureDirSync(config.publishLogDir);

config.log = {
    name: 'noah-system',
    streams: [
        {
            level: 'info',
            stream: process.stdout
        },
        {
            level: 'warn',
            path: path.normalize(`${distRoot}/log/warn.log`)
        },
        {
            level: 'error',
            path: path.normalize(`${distRoot}/log/error.log`)
        }
    ]
};

config.middlewareOption = {

  leek_static: {
      root: path.normalize(`${distRoot}/static`),
  }
};

config.view = {

    engineOptions: {

        nunjucks: {
            noCache: true,
            rootDir: path.normalize(`${distRoot}/views`),
        }
    }
};

config.mysql = {

    connectionLimit: 10,
    host: '172.16.3.173',
    user: 'root',
    password: '123123',
    database: 'noah_system',
    charset: 'utf8mb4',
    timezone: 'local',
    connectTimeout: 10000

};

config.backend = {

};

config.redis = {
  //是否是集群模式
  isCluster: true,
  clusterServer: redisHost.cluster_local,
};

module.exports = config;


