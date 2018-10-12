/**
 * 发版任务model
 */

'use strict';

const TB_NAME = 'tb_task';

//所有可能的任务状态枚举
const TASK_STATUS = {};

const status = {
    //已提交
    INIT : 0,
    //进行中
    PROCESS : 1,
    //执行出错
    ERROR : 2,
    //全量包成功
    SUCCESS : 3,
    //增量包成功
    PATCH_SUCCESS : 4,
    //增量包异常
    PATCH_ERROR : 5
};

//不允许外部修改 TASK_STATUS 里的值
Object.keys(status).forEach( function(key){
    Object.defineProperty(TASK_STATUS, key, {
        writable : false,
        value : status[key]
    });
});

module.exports = function(mysqlClient){

    class Task{

        static get STATUS(){
            return TASK_STATUS;
        }

        /**
         * 根据 taskId 查找对应的 task
         * @param taskId {int} 任务ID
         * @returns {Promise.<*>}
         */
        static async findByTaskId(taskId){
            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    id : taskId
                }
            });
            let data = result.results[0];
            let obj = null;
            if( data ){
                obj = new Task( data );
            }
            return obj;
        }

        /**
         * 根据 packageId 查找对应的 task
         * @param packageId {int} 全量包中的自增ID
         * @returns {Promise.<*>}
         */
        static async findByPackageId(packageId){
            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    packageId : packageId
                }
            });
            let data = result.results[0];
            let obj = null;
            if( data ){
                obj = new Task( data );
            }
            return obj;
        }

        /**
         * 根据 appId 查找该app下所有的任务数据
         * @param appId {int} appId
         * @returns {Promise.<*>}
         */
        static async findByAppId(appId, options){
            options = options || {};
            options.where = options.where || {};
            options.where.appId = appId;
            let result = await mysqlClient.select(TB_NAME, options);
            return result.results.map( function(obj){
                return new Task(obj);
            });
        }

        constructor(args){
            this.id = args.id;
            this.appId = args.appId;
            this.userId = args.userId;
            this.appVersion = args.appVersion;
            this.uploadFullPackagePath = args.uploadFullPackagePath;
            this.uploadFullPackageMd5 = args.uploadFullPackageMd5;
            this.branchName = args.branchName;
            this.status = args.status || 0;
            this.packageId = args.packageId || 0;
            this.logFile = args.logFile;
            this.desc = args.desc || '';
            this.abTest = args.abTest || '';
            this.createdAt = args.createdAt;
            this.updatedAt = args.updatedAt;
        }

        async save(){
            let isExist = ! isNaN( parseInt(this.id, 10) );
            let success = false;
            if( isExist ){
                //修改老app
                success = await this.update();
            }else{
                //添加新app
                let out = await mysqlClient.insert(TB_NAME, {
                    appId : this.appId,
                    userId : this.userId,
                    appVersion: this.appVersion,
                    uploadFullPackagePath: this.uploadFullPackagePath,
                    uploadFullPackageMd5: this.uploadFullPackageMd5,
                    branchName : this.branchName,
                    status : this.status,
                    packageId : this.packageId,
                    logFile : this.logFile,
                    abTest : this.abTest,
                    desc : this.desc
                }, {

                } );
                const results = out.results;
                if(  results && results.affectedRows === 1 ){
                    //插入成功，更新 id
                    this.id = results.insertId;
                    success = true;
                }
            }
            return success;
        }

        //TODO
        async update(){
            throw new Error(`Task.update is not implemented yet!`);
        }
    }

    return Task;

};