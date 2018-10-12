/**
 * 全量包 的model
 * Created by Jess on 2018/1/8.
 */

'use strict';


const mysql = require('mysql');

const Model = require('./mysql_model.js');

//mysql table name
const TB_NAME = 'tb_package';


class PackageModel{

    constructor(args){
        this.model = args.model;
    }

    /**
     * 插入全量包记录
     * @param args {object}
     * @returns {Promise.<Promise.<TResult>|*>}
     */
    async insertPackage(args){
        return this.model.insert(TB_NAME, {
            appId : args.appId,
            packageVersion : args.packageVersion,
            appVersion : args.appVersion,
            desc : args.desc,
            abTest : args.abTest,
            status : args.status,
            md5 : args.md5,
            filePath : args.filePath,
            userId : args.userId
        }).then( (results) => {
            if(  results && results.affectedRows === 1 ){
                //插入成功，更新 id
                return results.insertId;
            }else{
                return Promise.reject( new Error(`插入全量表异常！`));
            }
        });
    }

    /**
     * 判断某个app下，native+RN版本是否已经存在
     * @param appId {int} app id
     * @param nativeVersion {int} app native 版本号
     * @param rnVersion {int} rn 版本号
     * @returns {Promise.<boolean>}
     */
    async isExist(appId, nativeVersion, rnVersion){
        let result = await this.model.select(TB_NAME, {
            where : {
                appId : appId,
                appVersion : nativeVersion,
                packageVersion : rnVersion
            }
        });

        return result.length > 0;
    }

    /**
     * 获取全量包数据中，某个app的某个 native 版本，对应的 小于 某个 RN版本的全部记录
     * @param appId {int} APP ID
     * @param nativeVersion {string} native版本
     * @param maxRNVersion {int} 最高的RN版本（不包含）
     * @returns {Promise.<Promise.<TResult>|*>}
     */
    async getPackageList(appId, nativeVersion, maxRNVersion){
        return this.model.query(`SELECT * from ${TB_NAME} WHERE appId=${mysql.escape(appId)} AND appVersion=${mysql.escape(nativeVersion)} AND packageVersion<${mysql.escape(maxRNVersion)}`)
            .then( (out) => {
                return out.results;
            });
    }

    /**
     * 查找某个APP的某个native版本下，最新的全量包记录
     * @param {int} appId app ID
     * @param {string} appVersion native版本号
     */
    async getLatestPackage(appId, appVersion){
        return this.model.query(`SELECT * from ${TB_NAME} WHERE appId=${mysql.escape(appId)} AND appVersion=${mysql.escape(appVersion)} ORDER BY packageVersion desc limit 1`)
            .then( (out) => {
                return out.results[0];
            });
    }
}

PackageModel.TABLE_NAME = TB_NAME;


module.exports = PackageModel;