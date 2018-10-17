/**
 * 全量包model
 */

'use strict';

const TB_NAME = 'tb_package';

module.exports = function(mysqlClient){


    //全量包所处的状态： 关闭下载(1)  对外开放下载(2)
    const STATUS = {};

    Object.defineProperty(STATUS, 'OFF', {
        value : 1,
        writable : false
    });

    Object.defineProperty(STATUS, 'ON', {
        value : 2,
        writable : false
    });

    //是否强制更新的标记
    const FORCE_UPDATE_STATUS = {
        //不强制更新
        NO_FORCE: 0,
        //强制更新
        FORCE: 1,
    };

    class Package{


        static get TABLE_NAME(){
            return TB_NAME;
        }

        static get STATUS(){
            return STATUS;
        }

        static get PATCH_STATUS(){
            return {
                ENABLE: 0,
                DISABLE: 1
            };
        }

        static get FORCE_UPDATE_STATUS(){
            return FORCE_UPDATE_STATUS;
        }

        static isPatchStatusValid(s){
            return Package.PATCH_STATUS.ENABLE === s || Package.PATCH_STATUS.DISABLE === s;
        }

        /**
         * 判断状态是否在合法的取值范围
         * @param s {int}
         * @returns {boolean}
         */
        static isStatusValid(s){
            return STATUS.ON === s || STATUS.OFF === s;
        }

        static isForceUpdateValid(s){
            return FORCE_UPDATE_STATUS.ENABLE === s || FORCE_UPDATE_STATUS.DISABLE === s;
        }

        /**
         * 直接执行SQL
         * 因为这个mysql库的 select 中，不支持 模糊查询，比如 < >
         * @param sql {string}
         * @param values {array}
         * @returns {Promise.<void>}
         */
        static async query(sql, values){
            return mysqlClient.query(sql, values);
        }

        /**
         * 根据 appId 查找该app下所有的RN版本数据
         * @param appId {int} appId
         * @param options {object} 可选的额外条件
         * @returns {Promise.<*>}
         */
        static async findByAppId(appId, options){
            options = options || {};
            options.where = options.where || {};
            options.where.appId = appId;
            let result = await mysqlClient.select(TB_NAME, options);
            return result.results.map( function(obj){
                return new Package(obj);
            });
        }

        /**
         * 根据 packageId 查找对应的 app
         * @param packageId {int} 某个全量版本，在mysql中的自增ID
         * @returns {Promise.<*>}
         */
        static async findByPackageId(packageId){
            let result = await mysqlClient.select(TB_NAME, {
                where : {
                    id : packageId
                }
            });
            let data = result.results[0];
            let obj = null;
            if( data ){
                obj = new Package( data );
            }
            return obj;
        }

        constructor(args){
            this.id = args.id;
            this.appId = args.appId;
            this.packageVersion = args.packageVersion;
            this.appVersion = args.appVersion;
            this.forceUpdate = args.forceUpdate;
            this.desc = args.desc;
            this.abTest = args.abTest;
            this.status = args.status;
            this.disablePatch = args.disablePatch;
            this.md5 = args.md5;
            this.filePath = args.filePath;
            this.userId = args.userId;
            this.createdAt = args.createdAt;
            this.updatedAt = args.updatedAt;
        }

        /**
         * 修改当前全量包的  status  abTest  disablePatch forceUpdate  字段，保存到数据库
         * @param pair {object} 包含要修改的 status  abTest  disablePatch forceUpdate 字段
         * @returns {Promise.<boolean>}
         */
        async update(pair){
            const sql = `UPDATE ${TB_NAME} SET status = ?, abTest = ?, disablePatch = ?, forceUpdate = ? WHERE id = ? AND status = ? AND abTest = ? `;
            let out = await mysqlClient.query(sql, [pair.status, pair.abTest, pair.disablePatch, pair.forceUpdate, this.id, this.status, this.abTest]);
            let results = out.results;
            let success = results.changedRows === 1;
            if( success ){
                this.status = pair.status;
                this.abTest = pair.abTest;
                this.disablePatch = pair.disablePatch;
                this.forceUpdate = pair.forceUpdate;
            }
            return success;
        }
    }

    return Package;
};