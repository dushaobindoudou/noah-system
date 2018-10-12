/**
 * 负责在源代码目录下，执行 yarnpkg install 或者 npm install 安装源码对应的依赖
 * Created by Jess on 2017/12/20.
 */

'use strict';


const childProcess = require("child_process");


class DependencyInstaller {

    /**
     * 在某个目录下执行 yarnpkg install
     * @param destDir {string} 某个包含源代码的目录
     */
    static yarnInstall(destDir) {

        const logger = DependencyInstaller.logger;

        logger.log(`准备执行 yarnpkg install， 执行目录为： ${destDir}`);

        return new Promise((resolve, reject) => {
            let process = null;
            try {
                process = childProcess.exec('yarnpkg install', {
                    cwd: destDir
                });
            } catch (err) {
                logger.error(`启动子进程执行 yarnpkg install 异常！ 错误信息： ${err.message}`);
                return reject(err);
            }
            process.stdout.on('data', (data) => {
                logger.log(data.toString().trim());
            });

            process.stderr.on('data', (data) => {
                logger.error(data.toString().trim());
            });

            process.on('close', (exitCode) => {
                if (exitCode) {
                    return reject(new Error(`"yarnpkg install" command exited with code ${exitCode}.`));
                }
                logger.log(`yarnpkg install 执行完成， 执行目录: ${destDir}`);
                resolve(null);
            });
        });
    }

    static yarnRunBuild(destDir) {
        const logger = DependencyInstaller.logger;
        const command = 'yarn run build';
        return new Promise((resolve, reject) => {
            let process = null;
            try {
                process = childProcess.exec(command, {
                    cwd: destDir
                });
            } catch (err) {
                logger.error(`启动子进程执行 ${command} 异常！ 错误信息： ${err.message}`);
                return reject(err);
            }
            process.stdout.on('data', (data) => {
                logger.log(data.toString().trim());
            });

            process.stderr.on('data', (data) => {
                logger.error(data.toString().trim());
            });

            process.on('close', (exitCode) => {
                if (exitCode) {
                    return reject(new Error(`"${command}" command exited with code ${exitCode}.`));
                }
                logger.log(`${command} 执行完成， 执行目录: ${destDir}`);
                resolve(null);
            });
        });
    }
}


DependencyInstaller.logger = console;


module.exports = DependencyInstaller;


