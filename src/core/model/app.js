/**
 * app entity
 */

const uuidV4 = require('uuid/v4');

const TB_APP = 'tb_app';

//app所属平台: android
const PLATFORM_ANDROID = 1;
//app 属于 iOS
const PLATFORM_IOS = 2;

const PLATFORM = {
    ANDROID : PLATFORM_ANDROID,
    IOS : PLATFORM_IOS
};

module.exports = function(mysqlClient){
    class App {

        //APP所属平台
        static get PLATFORM(){
            return PLATFORM;
        }
    
        /**
         * 根据数据库中的 platform 返回对应的 平台英文
         * @param platform {int} 平台CODE
         * @returns {string} 用户可读的平台名
         */
        static getPlatformString(platform){
            switch (platform){
                case PLATFORM_IOS:
                    return 'ios';
                case PLATFORM_ANDROID:
                    return 'android';
                default:
                    return '';
            }
        }
    
        /**
         * 生成随机的app key
         * @returns {string} app key
         */
        static generateAppKey(){
            return uuidV4();
        }
    
        /**
         * 根据 appId 查找对应的 app
         * @param appId {int} appId
         * @returns {Promise.<*>}
         */
        static async findByAppId(appId){
            let out = await mysqlClient.select(TB_APP, {
                where : {
                    id : appId
                }
            });
            const result = out.results;
            let data = result[0];
            let app = null;
            if( data ){
                app = new App( data );
            }
            return app;
        }
    
        /**
         * 根据 appKey 查找对应的 app
         * @param appKey {string} appKey
         * @returns {Promise.<*>}
         */
        static async findByAppKey(appKey){
            let out = await mysqlClient.select(TB_APP, {
                where : {
                    appKey : appKey
                }
            });
            const result = out.results;
            let data = result[0];
            let app = null;
            if( data ){
                app = new App( data );
            }
            return app;
        }
    
        /**
         * 根据 ownerId 查找对应的 app
         * @param ownerId {int} 用户ID
         * @returns {Promise.<*>}
         */
        static async findByOwnerId(ownerId){
            let out = await mysqlClient.select(TB_APP, {
                where : {
                    ownerId : ownerId
                }
            });
            const result = out.results;
            return result.map(function(obj){
                return new App(obj);
            });
        }
    
        /**
         * 判断app名是否已经存在
         * @param name {string} APP名
         * @returns {Promise.<boolean>}
         */
        static async isAppNameExist(name){
            let out = await mysqlClient.select(TB_APP, {
                where : {
                    name : name
                }
            });
            const result = out.results;
            let data = result[0];
            return !! data;
        }
    
        /**
         * 读取mysql中app总数
         * @returns {Promise.<number>}
         */
        static async count(){
            let total = 0;
    
            let temp = await mysqlClient.query(`select count(id) as num from ${TB_APP}`);
            let results = temp.results[0];
            total = results.num;
    
            return total;
        }
    
        /**
         * 获取app列表数据
         * @param start {int} 偏移量
         * @param num {int} 返回数量
         * @returns {Promise.<Array>}
         */
        static async getList(start, num){
            let out = [];
    
            let arr = await mysqlClient.select(TB_APP, {
                orders : [
                    [ 'name', 'ASC' ]
                ],
                offset : start,
                limit : num
            });

            const result = arr.results;
    
            out = result.map( function(obj){
                return new App(obj);
            });
    
            return out;
        }
    
        constructor(data){
            data = data || {};
    
            this.id = data.id;
            this.appKey = data.appKey;
            this.name = data.name;
            //用来判断用户是否修改过name
            this.oldName = this.name;
            this.desc = data.desc;
            this.ownerId = data.ownerId;
            //平台一旦保存了，就不能修改！！
            this.platform = data.platform;
            this.gitUrl = data.gitUrl;
    
            //该平台下打包时的入口文件，比如  src/entry/index.android.js
            this.entryFile = data.entryFile;
            //打包后产出文件的名字，比如 index.android.bundle
            this.bundleName = data.bundleName;
    
            this.createdAt = data.createdAt;
            this.updatedAt = data.updatedAt;
        }
    
        get platformName(){
            return App.getPlatformString(this.platform);
        }
    
        async save(){
            let isExist = ! isNaN( parseInt(this.id, 10) );
            let success = false;
            if( isExist ){
                //修改老app
                success = await this.update();
            }else{
                //添加新app
                const out = await mysqlClient.insert(TB_APP, {
                    appKey : this.appKey,
                    name : this.name,
                    desc : this.desc,
                    ownerId : this.ownerId,
                    platform : this.platform,
                    gitUrl : this.gitUrl,
                    entryFile : this.entryFile,
                    bundleName : this.bundleName
                }, {
                    columns : [ 'appKey', 'name', 'desc', 'ownerId', 'platform', 'gitUrl', 'entryFile', 'bundleName']
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
    
        /**
         * 更新已经存在的app信息到数据库
         * @returns {Promise.<boolean>}
         */
        async update(){
            let success = false;
    
            let savedData = {};
    
            if( this.name !== this.oldName ){
                savedData.name = this.name;
            }
            savedData.desc = this.desc;
            savedData.ownerId = this.ownerId;
            savedData.gitUrl = this.gitUrl;
            savedData.entryFile = this.entryFile;
    
            //产出的文件名，一旦保存，就不允许修改！！因为在计算diff包时，是通过这个文件名来找以前的产出包，所以必须固定
            // savedData.bundleName = this.bundleName;
    
            const out = await mysqlClient.update(TB_APP, savedData, {
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
            const { oldName, ...data} = this;
            return data;
        }
    
    }

    return App;
};

