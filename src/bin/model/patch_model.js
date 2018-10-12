/**
 * 增量包 模型
 * Created by Jess on 2018/1/15.
 */

'use strict';


const mysql = require('mysql');

const Model = require('./mysql_model.js');

//mysql table name
const TB_NAME = 'tb_patch';


class PatchModel {

    constructor(args){
        this.model = args.model;
    }

    /**
     * 插入一条心的 增量包 记录
     * @param args {object}
     * @returns {Promise.<Promise.<TResult>|*>}
     */
    async insert(args){
        return this.model.insert(TB_NAME, {
            appId : args.appId,
            packageId : args.packageId,
            packageVersion : args.packageVersion,
            compareVersion : args.compareVersion,
            md5 : args.md5,
            filePath : args.filePath
        }).then( (results) => {
            if(  results && results.affectedRows === 1 ){
                //插入成功，更新 id
                return results.insertId;
            }else{
                return Promise.reject( new Error(`插入增量表异常！`));
            }
        });
    }
}


PatchModel.TABLE_NAME = TB_NAME;

module.exports = PatchModel;



