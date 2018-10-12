/**
 * 负责代码的拉取
 * Created by Jess on 2017/12/20.
 */

'use strict';

const childProcess = require("child_process");
const clone = require('git-clone');


class SourceDownloader {

    constructor(args){
        this.logger = args.logger;
    }

    gitDownload(gitUrl, branchName, destDir){
        return new Promise( (resolve, reject) => {
            this.logger.log(`准备git拉取源代码： gitUrl[${gitUrl}] branchName[${branchName}] `);
            this.logger.log(`拉取源代码存放的目标目录为： ${destDir}`);
            try{
                clone(gitUrl, destDir, { checkout : branchName}, (err) => {
                    if( err ){
                        return reject(err);
                    }
                    this.logger.log(`git拉取代码完成！ gitUrl[${gitUrl}] branchName[${branchName}] 存放目录[${destDir}]`);
                    resolve();
                });
            }catch(err){
                this.logger.log(`调用 git-clone 失败 : ${err.message}`);
                reject(err);
            }
            
            // let reactNativeBundleProcess = null;
            // try{
            //     reactNativeBundleProcess = childProcess.spawn('node', cli, { cwd : destDir});
            // }catch(err){
            //     this.logger.error(`拉取git源代码异常！ 错误信息： ${err.message}`);
            //     return reject(err);
            // }
            //
            // reactNativeBundleProcess.stdout.on('data', (data) => {
            //     this.logger.log(data.toString().trim());
            // });
            //
            // reactNativeBundleProcess.stderr.on('data', (data) => {
            //     this.logger.error(data.toString().trim());
            // });
            //
            // reactNativeBundleProcess.on('close', (exitCode) => {
            //     if (exitCode) {
            //         return reject(new Error(`git 下载代码 exited with code ${exitCode}.`));
            //     }
            //
            //     resolve(null);
            // });
        });
    }
}


module.exports = SourceDownloader;

