/**
 *
 * Created by Jess on 2017/12/20.
 */

'use strict';

const mysql = require('mysql');

const Model = require('./mysql_model.js');

//mysql table name
const TB_NAME = 'tb_app';


const PLATFORM_ANDROID = 1;
const PLATFORM_IOS = 2;

class AppModel {

    /**
     * 根据数据库中存储的 platform 字段，获取对应的string
     * @param app {object}
     * @returns {*}
     */
    static getAppPlatformStr(app){
        switch(app.platform){
            case PLATFORM_ANDROID:
                return 'android';
                break;
            case PLATFORM_IOS:
                return 'ios';
                break;
            default:
                throw new Error(`[AppModel.getAppPlatformStr]非法的platform: ${app.platform}`);
                return '';
        }
    }

    constructor(args){
        this.model = args.model;
    }

    /**
     * 根据app ID，获取app详情
     * @param appId {int} app ID
     * @returns {Promise.<void>}
     */
    async getAppById( appId){
        return this.model.query(`SELECT * from ${TB_NAME} WHERE id=${mysql.escape(appId)}`)
            .then( (out) => {
                return out.results[0];
            });
    }
}


module.exports = AppModel;