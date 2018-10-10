/**
 * 用户和APP对应权限的model
 */

'use strict';

const TB_NAME = 'tb_user_app';

module.exports = function(mysqlClient){

    //无权限
    const ACCESS_NO = 1;
    //只读权限
    const ACCESS_READ = 2;
    //读写权限
    const ACCESS_WRITE = 3;


    const ACCESS = {
        get NO(){
            return ACCESS_NO;
        } ,
        get READ(){
            return ACCESS_READ;
        },
        get WRITE(){
            return ACCESS_WRITE;
        }
    };

    class UserApp {

        static get ACCESS(){
            return ACCESS;
        }

        /**
         * 根据 appId 查找该app相关的所有权限数据
         * @param appId {int} app id
         * @returns {Promise.<Array>}
         */
        static async findByAppId(appId){
            let out = [];

            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    appId : appId
                }
            });

            out = result.results.map(function(obj){
                return new UserApp(obj);
            });

            return out;
        }

        /**
         * 根据 appId 查找该app 匹配 access 权限的 所有权限数据
         * @param appId {int} app id
         * @param access {int} 访问权限
         * @returns {Promise.<Array>}
         */
        static async findByAppIdWithAccess(appId, access){
            let out = [];

            if( typeof access === 'string' ){
                access = parseInt(access, 10);
                if( isNaN(access) ){
                    access = ACCESS_READ;
                }
            }

            let finalAccess = ACCESS_NO;
            switch (access){
                case ACCESS_READ:
                    finalAccess = ACCESS_READ;
                    break;
                case ACCESS_WRITE:
                    finalAccess = ACCESS_WRITE;
                    break;
                default:
                    ;
            }

            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    appId : appId,
                    access : finalAccess
                }
            });

            out = result.results.map(function(obj){
                return new UserApp(obj);
            });

            return out;
        }

        /**
         * 根据 userId 查找app 匹配 access 权限的 所有权限数据
         * @param userId {int} user id
         * @param access {int} 访问权限
         * @returns {Promise.<Array>}
         */
        static async findByUserIdWithAccess(userId, access){
            let out = [];

            if( typeof access === 'string' ){
                access = parseInt(access, 10);
                if( isNaN(access) ){
                    access = ACCESS_READ;
                }
            }

            let finalAccess = ACCESS_NO;
            switch (access){
                case ACCESS_READ:
                    finalAccess = ACCESS_READ;
                    break;
                case ACCESS_WRITE:
                    finalAccess = ACCESS_WRITE;
                    break;
                default:
                    ;
            }

            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    userId : userId,
                    access : finalAccess
                }
            });

            out = result.results.map(function(obj){
                return new UserApp(obj);
            });

            return out;
        }

        /**
         * 根据 userId 查找该app相关的所有权限数据(可读、可写)
         * @param userId {int} user id
         * @returns {Promise.<Array>}
         */
        static async findByUserId(userId){
            let out = [];

            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    userId : userId,
                    access : [ ACCESS_READ, ACCESS_WRITE ]
                }
            });

            out = result.results.map(function(obj){
                return new UserApp(obj);
            });

            return out;
        }

        /**
         * 根据 userId appId 查找该用户和该APP的权限
         * @param userId {int} 用户ID
         * @param appId {int} app id
         * @returns {Promise.<UserApp>}
         */
        static async findByUserIdAndAppId(userId, appId){

            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    userId : userId,
                    appId : appId
                }
            });

            result = result.results;

            if( result[0] ){
                return new UserApp(result[0]);
            }

            return null;
        }

        /**
         * 判断一个用户能否读取某个 app ，规则如下：
         * 1. admin账户可以读取所有app
         * 2. app的拥有者可以读取
         * 3. 对app有 读或者写 权限的用户，也能读取
         * @param user {User} user对象
         * @param app {App} app对象
         * @returns {Promise.<boolean>}
         */
        static async canUserReadApp(user, app){
            let out = false;

            if( user.isAdmin() || app.ownerId === user.id){
                out = true;
            }else{
                let userApp = await UserApp.findByUserIdAndAppId(user.id, app.id);
                out = userApp && userApp.canRead;
            }

            return out;
        }

        /**
         * 判断某个用户是否可以修改某个app的信息
         * @param user {User} user对象
         * @param app {App}  app对象
         * @returns {Promise.<boolean|*>}
         */
        static async canUserModifyApp(user, app){
            return user.isAdmin() || user.id === app.ownerId;
        }

        /**
         * 判断用户对某个APP的权限，包括： 是否可读、可写、可以修改
         * @param user {User} 用户对象
         * @param app {App} app对象
         * @returns {Promise.<{canRead: boolean, canWrite: boolean, canModify: boolean}>}
         */
        static async getUserAppAccess(user, app){
            let out = {
                canRead : false,
                canWrite : false,
                canModify : false
            };

            if( user.isAdmin() || app.ownerId === user.id ){
                //管理员有所有权限
                out.canRead = out.canWrite = out.canModify = true;
            }else{
                //读取用户和该APP的权限
                let userApp = await UserApp.findByUserIdAndAppId(user.id, app.id);
                if( userApp ){
                    out.canRead = userApp.canRead;
                    out.canWrite = userApp.canWrite;
                }
            }

            return out;
        }

        constructor(data){
            data = data || {};

            this.id = data.id;
            this.appId = data.appId;
            this.userId = data.userId;
            //默认是无权限
            this.access = data.access || ACCESS_NO;
            this.createdAt = data.createdAt;
            this.updatedAt = data.updatedAt;

        }

        get canRead(){
            return this.access === ACCESS_READ || this.access === ACCESS_WRITE;
        }

        set canRead(can){
            this.access = can ? ACCESS_READ : ACCESS_NO;
        }

        get canWrite(){
            return this.access === ACCESS_WRITE;
        }

        set canWrite(can){
            this.access = can ? ACCESS_WRITE : this.access;
        }

        setAccess(access){
            access = parseInt(access, 10);
            let finalAccess = ACCESS_NO;
            switch (access){
                case ACCESS_READ:
                    finalAccess = ACCESS_READ;
                    break;
                case ACCESS_WRITE:
                    finalAccess = ACCESS_WRITE;
                    break;
                default:
                    finalAccess = ACCESS_NO;
            }
            this.access = finalAccess;
        }

        async save(){
            let isExist = ! isNaN( parseInt(this.id, 10) );
            let success = false;
            if( isExist ){
                //修改老权限
                success = await this.update();
            }else{
                //添加新权限
                const out = await mysqlClient.insert(TB_NAME, {
                    appId : this.appId,
                    userId : this.userId,
                    access : this.access
                });

                const results = out.results;

                if(  results && results.affectedRows === 1 ){
                    //插入成功，更新 id
                    this.id = results.insertId;
                    success = true;
                }
            }
            return success;
        }

        /**
         * 更新已经存在的权限信息到数据库
         * 只能更新 权限
         * @returns {Promise.<boolean>}
         */
        async update(){
            let success = false;

            let savedData = {
                access : this.access
            };

            const out = await mysqlClient.update(TB_NAME, savedData, {
                    where : {
                        id : this.id
                    }
                }
            );

            const results = out.results;

            if( results && results.changedRows === 1 ){

                success = true;
            }

            return success;
        }

        toJSON(){
            return {
                appId : this.appId,
                userId : this.userId,
                access : this.access,
                canRead : this.canRead,
                canWrite : this.canWrite,
                createdAt : this.createdAt,
                updatedAt : this.updatedAt
            };
        }
    }

    return UserApp;
};