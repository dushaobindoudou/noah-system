/**
 * 针对两个目录，生成差异
 * 并且特殊处理 index.android.bundle 或 index.ios.bundle，如果这两个文件有变化，生成对应的 bsdiff
 * Created by Jess on 2018/1/10.
 */

'use strict';

const path = require('path');
const fse = require('fs-extra');
const fsDiff = require('fs-diff');
const bsdp = require('bsdp');

const dirDiff = fsDiff.diff;
const DiffStatus = dirDiff.DiffStatus;


function noop(){}

class DiffPatch{

    /**
     * 对比新旧目录，并且针对 一些文本文件，使用 bsdiff 生成差异
     * @param oldDir {string} 旧目录的绝对路径
     * @param newDir {string} 新目录的绝对路径
     * @param outputDir {string} 产出目录
     * @param textFileList {array} 需要 bsdiff 的文件列表
     * @returns {Promise.<object>}
     */
    static async diffDir( newDir, oldDir, outputDir, textFileList){

        let type = Object.prototype.toString.call(textFileList);
        let shouldTextDiff = noop;
        if( type === '[object Array]'){
            shouldTextDiff = function(file){
                return textFileList.indexOf(file) >= 0;
            };
        }else if( type === '[object Function]'){
            shouldTextDiff = textFileList;
        }

        let result = await dirDiff.diffDirResult(newDir, oldDir, outputDir);
        let keys = Object.keys(result);
        for( let i = 0, len = keys.length; i < len; i++ ){
            let filePath = keys[i];
            let obj = result[filePath];
            if( obj.status === DiffStatus.UPDATE && shouldTextDiff(filePath) ){
                //只处理 修改 的文件
                //是文本文件，需要进行 bsdiff，先删除产出目录里的文件
                DiffPatch.logger.log(`计算文件的bsdiff: ${filePath}`);
                let absolutePathInOutput = path.join(outputDir, filePath);
                fse.removeSync(absolutePathInOutput);
                //计算 bsdiff
                let oldFilePath = path.join(oldDir, filePath);
                let newFilePath = path.join(newDir, filePath);
                let outputPatchFile = path.join(outputDir, `${filePath}.patch`);
                bsdp.diff(oldFilePath, newFilePath, outputPatchFile);
            }
        }

        //过滤掉输出JSON中，被删除的文件，
        //剩下的文件，native都需要校验合并之后的全量包，每个文件md5是否能对应上
        let diffResult = {};
        for( let j = 0, len = keys.length; j < len; j++){
            let filePath = keys[j];
            let obj = result[filePath];
            if( obj.status !== DiffStatus.DELETE){
                diffResult[filePath] = obj;
            }
        }

        return diffResult;
    }
}


DiffPatch.logger = console;


module.exports = DiffPatch;

