/**
 * 离线打包入口，分别调用 全量包、增量包逻辑
 * Created by Jess on 2017/12/18.
 */

'use strict';

const path = require('path');
const os = require('os');
const yargs = require('yargs');
const mysql = require('mysql');
const fse = require('fs-extra');
const moment = require('moment');


const loggerFactory = require('./utils/log.js');
const FSHelper = require('./utils/fs_helper.js');
const DependencyInstaller = require('./utils/dependency_installer.js');
const DiffPatch = require('./utils/diff_patch.js');
const TaskEntrance = require('./task_entrance.js');


const sep = path.sep;

const argv = yargs.argv;

const logger = loggerFactory(`[publish_entry][task_${argv.task_id}]`);


async function main(){

    const start = new Date();

    const today = moment().format('YYYYMMDD');

    logger.log(`当前 node 版本： ${process.version}`);
    logger.log(`开始执行离线发版任务，时间： ${start.toLocaleString()}`);

    FSHelper.logger = logger;
    DependencyInstaller.logger = logger;
    DiffPatch.logger = logger;

    //获取任务ID
    const taskId = argv.task_id;

    //mysql 相关配置
    const mysqlHost = argv.mysql_host;
    const mysqlUser = argv.mysql_user;
    const mysqlPassword = argv.mysql_password;
    const mysqlDatabase = argv.mysql_database;

    //全量包的根目录
    const packageRootDir = path.normalize(argv.package_dir);
    //增量包的根目录
    const diffRootDir = path.normalize(argv.diff_dir);

    let taskEntrance = new TaskEntrance({
        taskId : taskId,
        mysqlHost : mysqlHost,
        mysqlUser : mysqlUser,
        mysqlPassword : mysqlPassword,
        mysqlDatabase : mysqlDatabase,
        packageRootDir : packageRootDir,
        diffRootDir : diffRootDir,
        logger : logger
    });

    try{
        await taskEntrance.run();
    }catch(err){
        logger.error(`taskEntrance.run 执行异常！ 错误信息： ${err.message}`);
    }


    const endTime = new Date();

    logger.log(`离线打包任务结束，时间： ${endTime.toLocaleString()}`);

    process.exit(0);

}





main();





