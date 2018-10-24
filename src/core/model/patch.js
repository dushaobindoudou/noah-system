/**
 * 增量包model
 */

'use strict';


module.exports = function(mysqlClient){

    const TB_NAME = 'tb_patch';


    class Patch {

        /**
         * 根据 appId 查找满足条件的增量包
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
                return new Patch(obj);
            });
        }

        constructor(args){
            this.id = args.id;
            this.appId = args.appId;
            //当前增量包所对应的全量包版本，在全量包表中的自增ID
            this.packageId = args.packageId;
            this.packageVersion = args.packageVersion;
            this.compareVersion = args.compareVersion;
            this.md5 = args.md5;
            this.filePath = args.filePath;
            this.createdAt = args.createdAt;
            this.updatedAt = args.updatedAt;
        }
    }

    return Patch;

};