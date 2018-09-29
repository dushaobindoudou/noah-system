/**
 *
 * Created by Jess on 2018/6/7.
 */

'use strict';

const path = require('path');

const redisHost = require('./common/redis_host.js');

const config = {};


config.log = {
    name: 'noah-system',
    streams: [
        {
            level: 'info',
            path: '/opt/app/node-logs/noah-system/log/info.log'
        },
        {
            level: 'warn',
            path: '/opt/app/node-logs/noah-system/log/warn.log'
        },
        {
            level: 'error',
            path: '/opt/app/node-logs/noah-system/log/error.log'
        }
    ]
};

config.mysql = {

    connectionLimit: 10,
    host: '172.16.3.173',
    user: 'root',
    password: '123123',
    database: 'node_jimu_system',
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


