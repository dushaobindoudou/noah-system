/**
 * 调用 react-native-cli 命令，生成全量包
 * Created by Jess on 2017/12/18.
 */

'use strict';

const path = require('path');
const os = require('os');
const childProcess = require("child_process");

const logger = require('./log.js')('complete_publish');

/**
 * 新起一个进程来调用 react-native-cli 执行打包动作
 * @param args {object} 调用react-native-cli 的参数
 * @returns {Promise}
 */
function bundleReactNative(args){

    logger.log(`begin bundleReactNative`);

    return new Promise( function(resolve, reject){

        const cli = [
            './node_modules/react-native/local-cli/cli.js', 'bundle',
            '--assets-dest', args.assetsDest,
            '--bundle-output', args.bundleOutput,
            '--dev', args.dev,
            '--entry-file', args.entryFile,
            '--platform', args.platform
        ];

        if( args.sourcemapOutput ){
            cli.push( '--sourcemap-output', args.sourcemapOutput );
        }

        logger.log(`执行的打包命令为： ${cli.join(' ')}`);

        let reactNativeBundleProcess = null;

        try{
            reactNativeBundleProcess = childProcess.spawn('node', cli, { cwd : args.cwd});
        }catch(err){
            logger.error(`新开进程执行react-native bundle异常  错误信息： ${err.message}`);
            return reject( err );
        }

        reactNativeBundleProcess.stdout.on('data', (data) => {
            logger.log(data.toString().trim());
        });

        reactNativeBundleProcess.stderr.on('data', (data) => {
            logger.error(data.toString().trim());
        });

        reactNativeBundleProcess.on('close', (exitCode) => {
            if (exitCode) {
                return reject(new Error(`"react-native bundle" command exited with code ${exitCode}.`));
            }

            logger.log(`react-native bundle 子进程执行完毕 exitCode[${exitCode}]`);
            resolve(null);
        });

    });
}

/**
 * 调用源代码中的打包脚本
 * @param {object} args 
 */
function callBundleShell(args){
    logger.log(`begin callBundleShell`);

    return new Promise( function(resolve, reject){

        const cli = [
            args.entryFile,
            '-d', args.assetsDest,
            '-b', args.bundleOutput,
            '-p', args.platform
        ];

        logger.log(`执行的打包命令为： ${cli.join(' ')}`);

        let reactNativeBundleProcess = null;

        try{
            reactNativeBundleProcess = childProcess.spawn('node', cli, { cwd : args.cwd});
        }catch(err){
            logger.error(`新开进程执行 ${args.entryFile} 异常  错误信息： ${err.message}`);
            return reject( err );
        }

        reactNativeBundleProcess.stdout.on('data', (data) => {
            logger.log(data.toString().trim());
        });

        reactNativeBundleProcess.stderr.on('data', (data) => {
            logger.error(data.toString().trim());
        });

        reactNativeBundleProcess.on('close', (exitCode) => {
            if (exitCode) {
                return reject(new Error(`"${args.entryFile}" command exited with code ${exitCode}.`));
            }

            logger.log(`${args.entryFile} 子进程执行完毕 exitCode[${exitCode}]`);
            resolve(null);
        });

    });
}

module.exports = {
    bundleReactNative,
    callBundleShell
};