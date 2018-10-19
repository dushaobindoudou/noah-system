
'use strict';


module.exports = {

    policy: {
        index: {
            '*': [ 'login_filter' ]
        },
        passport: {
            'index': [ 'session_user']
        },
        user: {
            '*': [ 'admin_filter']
        },
        apps: {
            '*': [ 'login_filter'],
            'appDetail' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canRead'} ],
            'publishApp' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canWrite'} ],
            'taskList' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canRead'} ],
            'versionList' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canRead'} ],
            'versionDetail' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canRead'} ],
            'updatePackage' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canWrite'} ],
            'patchList' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canRead'} ],
            //下载全量包的接口，不用校验权限
            'downloadLatestPackage': []
        },
        tasks: {
            '*': [ 'login_filter'],
            'taskDetail' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canRead'}, 'task_fetch' ],
            'taskLog' : [ 'login_filter', { 'name' : 'user_app_access' , 'data' : 'canRead'}, 'task_fetch' ],
        }
    }
};