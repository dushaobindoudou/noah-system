/**
 * 封装常用的文件系统相关方法
 * Created by Jess on 2017/12/18.
 */

'use strict';


const path = require('path');
const os = require('os');
const fs = require('fs');
const uuidV4 = require('uuid/v4');
const fse = require('fs-extra');
const archiver = require('archiver');
const AdmZip = require('adm-zip');


class FSHelper{

    /**
     * 创建临时目录
     * @param prefix {string} 临时目录名的前缀
     * @returns {Promise.<string>|*}
     */
    static generateTempDir(prefix){
        prefix = prefix || '';
        const random = uuidV4();
        const tempDir = path.join(os.tmpdir(), `${prefix}_${random}`);
        FSHelper.logger.log(`创建临时目录为： ${tempDir}`);
        return fse.mkdirs(tempDir)
            .then( () => {
                return tempDir;
            });
    }

    /**
     * 将某个目录的内容，压缩到zip文件
     * @param targetDir {string} 目标目录的绝对路径
     * @param outputZipFile {string} 输出zip文件
     * @returns {Promise}
     */
    static zipDir(targetDir, outputZipFile){
        return new Promise( function(resolve, reject){

            // create a file to stream archive data to.
            const output = fs.createWriteStream(outputZipFile);
            const archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });

            // listen for all archive data to be written
            // 'close' event is fired only when a file descriptor is involved
            output.on('close', function() {
                console.log('zip ' + archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                resolve();
            });

            // This event is fired when the data source is drained no matter what was the data source.
            // It is not part of this library but rather from the NodeJS Stream API.
            // @see: https://nodejs.org/api/stream.html#stream_event_end
            output.on('end', function() {
                console.log('Data has been drained');
            });

            // good practice to catch warnings (ie stat failures and other non-blocking errors)
            archive.on('warning', function(err) {
                return reject(err);
                // if (err.code === 'ENOENT') {
                //     // log warning
                // } else {
                //     // throw error
                //     reject(err);
                // }
            });

            // good practice to catch this error explicitly
            archive.on('error', function(err) {
                reject(err);
            });

            // pipe archive data to the file
            archive.pipe(output);

            archive.directory(targetDir, false);

            // finalize the archive (ie we are done appending files but streams have to finish yet)
            // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
            archive.finalize();
        } );
    }

    /**
     * 解压某个 zip 文件，到指定的目录
     * @param zipFilePath {string} zip文件的绝对路径
     * @param outputDir {string} 输出目录的绝对路径
     * @param override {boolean} 是否覆盖目录中存在的同名文件
     * @returns {Promise}
     */
    static unzip2Dir(zipFilePath, outputDir, override){
        return new Promise( function(resolve, reject){
            try{
                const zip = new AdmZip(zipFilePath);
                zip.extractAllTo(outputDir, override);
            }catch(err){
                return reject(err);
            }
            resolve();
        });
    }

}

FSHelper.logger = console;



module.exports = FSHelper;


