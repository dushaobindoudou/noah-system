/**
 *
 * Created by Jess on 2018/7/11.
 */

'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const sep = path.sep;

const utils = {};


/**
 * 读取某个目录下的内容, 只返回 文件和子目录
 * @param absolutePath {string} 某目录的绝对路径
 * @param prefix {string} 给文件或子目录要添加的路径前缀
 * @returns {Promise}
 */
utils.readDir = function (absolutePath, prefix) {
    return new Promise(function (resolve, reject) {
        fs.readdir(absolutePath, function (err, files) {
            if (err) {
                return reject(err);
            }
            let result = [];
            for (var i = 0, len = files.length; i < len; i++) {
                let fileName = files[i];
                if (fileName[0] === '.') {
                    //忽略隐藏文件
                    continue;
                }
                try {
                    let stat = fs.statSync(absolutePath + sep + fileName);
                    let isFile = stat.isFile();
                    let isDirectory = stat.isDirectory();
                    if (isFile || isDirectory) {
                        //只返回 文件/目录  两种类型
                        result.push({
                            name: fileName,
                            path: ( prefix + fileName),
                            isFile: isFile,
                            isDirectory: isDirectory
                        });
                    }
                } catch (e) {
                    return reject(e);
                }
            }

            resolve(result);
        });
    });
};

utils.ensureDirSync = function (path) {
    fse.ensureDirSync(path);
};

/**
 * 创建目录
 * @param path {string} 绝对路径
 * @returns {Promise}
 */
utils.mkdirp = function (path) {
    return fse.mkdirp(path);
};

/**
 * 判断某个 绝对路径 是否存在
 * @param filePath {string} 绝对路径
 * @returns {Promise}
 */
utils.isFileExist = function (filePath) {
    if (!path.isAbsolute(filePath)) {
        throw new Error('路径必须是绝对路径!!');
    }
    return new Promise(function (resolve, reject) {
        fs.stat(filePath, function (err, stats) {
            if (err) {
                if (err.code === 'ENOENT') {
                    //文件不存在
                    return resolve(false);
                }
                return reject(err);
            }
            //文件存在
            resolve(true);

        });
    });
};

/**
 * 移动指定的文件或目录, 到另一个地方
 * @param src {string} 原文件的绝对路径
 * @param dest {string} 移动之后, 文件的绝对路径
 * @param options
 * @returns {Promise}
 */
utils.move = function (src, dest, options) {
    options = options || {
        clobber: true,
        limit: 2
    };
    return fse.move(src, dest, options);
};

module.exports = utils;


