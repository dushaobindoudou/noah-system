/**
 *
 * Created by Jess on 2018/6/5.
 */

'use strict';

const path = require('path');
const fse = require('fs-extra');

const redisHost = require('./common/redis_host.js');

const config = {
    //离线任务的bin目录
    binDir : path.join( leek.appRoot, `bin`),
};

//日志
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

//覆盖框架默认的中间件列表
config.middleware = [
    {
        name: 'leek_meta',
    },
    {
        name: 'leek_static',
    },
    {
        package: 'koa-bodyparser',
        options: {

        }
    },
    {
      name: 'leek_session'
    }

];

//覆盖默认的中间件配置
config.middlewareOption = {
    leek_static: {
        '$mountPath': '/static',
        root: path.normalize(`${leek.appRoot}/static/`)
    },

    //session
    leek_session: {
        keys : [ 'IT2UzjcIEk8IOUIK', '0znsI81sRgyGR04L'],
        key: 'sess',
        redisPrefix: 'sess:'
    }
};

//rewrite
config.rewrite = [
    {
        match: '/',
        rewrite: '/dash/index/index'
    },
    // {
    //     match: '/p/:name/:age',
    //     rewrite: '/passport/index/hello'
    // },
    // {
    //     match: /^\/p2\/([^\/]+)\/([^\/]+)/,
    //     rewrite: '/passport/index/state?q1=$1&q2=$2'
    // }
];

//模板相关配置
config.view = {

    defaultExtension: '.nj',

    engines: [
        {
            name: 'nunjucks',
            engine: require('leek-view-nunjucks'),
            options: {
                customFunction: require('../../core/view/nunjucks.js'),
            }
        }
    ],

    engineOptions: {

        nunjucks: {

            rootDir: path.normalize(`${leek.appRoot}/dist/views`),
            tags: {
                blockStart: '{%',
                blockEnd: '%}',
                variableStart: '{{',
                variableEnd: '}}',
                commentStart: '{#',
                commentEnd: '#}'
            }
        }
    },

    mapping: {
        '.tpl': 'nunjucks'
    }
};

//后端服务的配置
config.backend = {


};

config.mysql = {

};

config.redis = {

};

//关闭URL美化
config.urlBeautify = {
    controller: '',
    action: ''
};


module.exports = config;


