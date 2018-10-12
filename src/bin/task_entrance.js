/**
 * 任务类，负责处理离线任务中的各个子步骤
 * Created by Jess on 2018/1/15.
 */

'use strict';

const path = require('path');
const os = require('os');
const yargs = require('yargs');
const mysql = require('mysql');
const fse = require('fs-extra');
const moment = require('moment');
const fsDiff = require('fs-diff');
const uuidV4 = require('uuid/v4');


const bundler = require('./utils/bundler.js');
const loggerFactory = require('./utils/log.js');
const TASK_STATUS = require('./utils/task_status.js');

const Model = require('./model/mysql_model.js');
const TaskModel = require('./model/task_model.js');
const AppModel = require('./model/app_model.js');
const PackageModel = require('./model/package_model.js');
const PatchModel = require('./model/patch_model.js');


const SourceDownloader = require('./utils/source_downloader.js');
const FSHelper = require('./utils/fs_helper.js');
const DependencyInstaller = require('./utils/dependency_installer.js');
const DiffPatch = require('./utils/diff_patch.js');
const childProcess = require("child_process");


const sep = path.sep;


/**
 * 根据mysql配置，创建连接
 * @param config {object} mysql配置
 * @returns {Promise}
 */
function createMysqlClient(config){
    return new Promise( function(resolve, reject){
        let client = null;
        try{
            client = mysql.createConnection(config);
        }catch(err){
            return reject(err);
        }

        client.query('SELECT 1', function(err, results){
            if( err ){
                return reject(err);
            }
            resolve(client);
        });
    } );
}

class TaskEntrance {

    constructor(args){

        this.startTime = new Date();

        this.today = moment().format('YYYYMMDD');

        //获取任务ID
        this.taskId = args.taskId;
        //当前任务
        this.task = null;
        //当前任务所处的状态
        this.currentStatus = TASK_STATUS.INIT;

        ///////////////////////mysql 相关
        this.mysqlHost = args.mysqlHost;
        this.mysqlUser = args.mysqlUser;
        this.mysqlPassword = args.mysqlPassword;
        this.mysqlDatabase = args.mysqlDatabase;

        this.mysqlClient = null;

        ///////////////////////存储目录相关
        //全量包的根目录
        this.packageRootDir = args.packageRootDir;
        //增量包的根目录
        this.diffRootDir = args.diffRootDir;
        //源代码目录
        this.sourceDir = '';
        //react-native bundle 产出目录
        this.outputDir = '';

        this.logger = args.logger || console;

        //各种与mysql读写的model实例
        this.model = null;
        this.taskModel = null;
        this.appModel = null;
        this.packageModel = null;

        //当前任务关联的app
        this.app = null;
        //当前app所属的平台：ios android
        this.platform = '';
        //本次发版对应的APP 原生的版本号
        this.nativeVersion = 0;
        //本次发版的RN版本号
        this.rnVersion = 0;
        //本次生成的全量包，在mysql中的 id
        this.packageId = 0;

    }

    /**
     * 初始化，获取 mysql 连接，读取当前任务
     * @returns {Promise.<*>}
     */
    async init(){

        const logger = this.logger;

        logger.log(`当前执行环境 process.env.NODE_ENV=[${process.env.NODE_ENV}]`);

        //init mysql client
        try{
            let config = {
                host: this.mysqlHost,
                user: this.mysqlUser,
                password: String(this.mysqlPassword),
                database: this.mysqlDatabase,
                charset: 'utf8mb4',
                timezone: 'local',
            };
            logger.log(`mysql连接配置信息： ${JSON.stringify(config)}`);
            this.mysqlClient = await createMysqlClient(config);
        }catch(err){
            logger.error(`连接mysql异常！ 错误信息： ${err.message}`);
            return this.exit(1);
        }

        const model = new Model({
            connection : this.mysqlClient,
            logger : logger
        });
        this.model = model;

        let taskModel = new TaskModel({
            model : model
        });
        this.taskModel = taskModel;

        const taskId = this.taskId;

        //根据任务ID，获取详情
        let task = null;
        try{
            task = await taskModel.getTaskById( taskId);
        }catch(err){
            logger.error(`根据任务ID获取任务详情异常！ taskId[${taskId}]  错误信息： ${err.message}`);
            return this.exit(1);
        }

        if( ! task ){
            logger.error(`未找到对应的任务详情！ taskId[${taskId}]`);
            return this.exit(1);
        }

        if( task.status !== TASK_STATUS.INIT ){
            //当前任务状态不是 初始化，可能正在被其他进程执行，或者执行过程异常！
            logger.error(`当前任务状态不是已提交，不能执行该任务！ status[${task.status}]`);
            return this.exit(1);
        }

        this.task = task;

        const success = await this.initContext();
        if( ! success ){
            return;
        }

        if( task.uploadFullPackagePath){
            //走的是上传全量包方式发版
            logger.log(`通过上传全量包的方式发版！全量包绝对路径： ${task.uploadFullPackagePath}`);
            await this.moveFullPackage();
        }else if( task.branchName ){
            //走  服务器上拉取git代码打包方式发版
            logger.log(`通过 git拉取代码 的方式发版！git tag/branch/commit： ${task.branchName}`);
            await this.downloadSource();
        }
    }

    /**
     * 初始化本次任务相关数据
     * @returns {Promise.<void>}
     */
    async initContext(){
        const logger = this.logger;

        logger.log(`CALL initContext`);

        //修改任务状态未 执行中
        try{
            let out = await this.taskModel.updateTaskStatus(this.taskId, TASK_STATUS.PROCESS, TASK_STATUS.INIT);
            if( out.results.changedRows !== 1 ){
                //更新失败
                logger.error(`修改任务状态为  进行中  异常！ `);
                this.exit(1);
                return false;
            }
        }catch(err){
            logger.error(`修改任务状态为 进行中  异常！  错误信息： ${err.message}`);
            this.exit(1);
            return false;
        }

        //current task status
        this.currentStatus = TASK_STATUS.PROCESS;

        const appModel = new AppModel({
            model : this.model
        });
        this.appModel = appModel;

        //本次发版对应的app
        let app = null;
        let platform = '';
        const task = this.task;

        try{
            app = await appModel.getAppById(task.appId);
            platform = AppModel.getAppPlatformStr(app);
        }catch(err){
            logger.error(`根据app ID获取任务详情异常！ appId[${task.appId}]  错误信息： ${err.message}`);
            this.exit(1);
            return false;
        }

        this.app = app;
        this.platform = platform;

        const packageModel = new PackageModel({
            model : this.model
        });
        this.packageModel = packageModel;

        let rnVersion = 0;

        try{
            rnVersion = await this.getNextPackageVersionNumber();
        }catch(err){
            logger.error(`计算当前发布的RN版本号异常 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return false;
        }

        this.nativeVersion = task.appVersion;
        this.rnVersion = rnVersion;

        return true;
    }

    /**
     * 获取当前发版的RN，对应的全量包版本号
     * 从数据库里读取appVersion对应的最大的RN版本号，+1得到下一个可用的版本号
     * @returns {number} 当前发版对应的RN版本号
     */
    async getNextPackageVersionNumber(){
        const latestPackage = await this.packageModel.getLatestPackage(this.app.id, this.task.appVersion);
        if( latestPackage ){
            return latestPackage.packageVersion + 1;
        }
        return 1;
    }

    /**
     * 向产出目录中，写入 hot.json 文件，包含 { appVersion: string, rnVersion: int}
     * @returns {boolean} 成功返回 true；失败返回false
     */
    async addVersionJsonFile(){
        const filePath = path.join(this.outputDir, '/hot.json');
        const data = {
            appVersion: this.task.appVersion,
            rnVersion: this.rnVersion
        };
        try{
            fse.writeJsonSync(filePath, data);
        }catch(err){
            logger.error(`写入 hot.json 文件异常  生成文件路径[${filePath}] 写入内容[${JSON.stringify(data)}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return false;
        }
        return true;
    }

    /**
     * 
     * 下载源代码
     * @returns {Promise.<void>}
     */
    async downloadSource(){

        const logger = this.logger;

        logger.log(`CALL downloadSource`);

        //本次发版对应的app
        let app = this.app;
        let platform = this.platform;
        const appModel = this.appModel;
        const task = this.task;

        //源码下载的临时目录
        let sourceDir = '';
        try{
            sourceDir = await FSHelper.generateTempDir(`node_lemon_`);
        }catch(err){
            logger.error(`生成源代码的下载临时目录异常！ 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        this.sourceDir = sourceDir;

        const sourceDownloader = new SourceDownloader({
            logger : logger
        });

        try{
            await sourceDownloader.gitDownload(app.gitUrl, task.branchName, sourceDir);
            await this.logCommitInfo();
        }catch(err){
            logger.error(`拉取代码异常！ 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //读取分支对应的native和RN版本
        const nativeVersion = task.appVersion;
        let rnVersion = this.rnVersion;

        const packageModel = this.packageModel;

        //源代码下载完成，进入下一步
        await this.dependenceInstall();

    }

    /**
     * 【废弃】
     * 安装依赖的 node_modules
     * @returns {Promise.<void>}
     */
    async dependenceInstall(){

        const logger = this.logger;
        const sourceDir = this.sourceDir;

        logger.log(`CALL dependenceInstall`);

        logger.log(`拉取代码完成，准备执行 yarnpkg install`);
        try{
            await DependencyInstaller.yarnInstall(sourceDir);
        }catch(err){
            logger.error(`执行yarnpkg install安装依赖异常！ 源码目录[${sourceDir}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }
        logger.log(`准备执行 yarn run install`);
        try {
            await DependencyInstaller.yarnRunBuild(sourceDir);
        } catch (err) {
            logger.error(`执行 yarn run build 安装依赖异常！ 源码目录[${sourceDir}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        await this.reactBundle();
    }

    async logCommitInfo() {
        const logger = this.logger;
        const destDir = this.sourceDir;
        logger.log(`=========================================`);
        logger.log(`打印  git commit， 执行目录为： ${destDir}`);

        return new Promise((resolve, reject) => {
            let process = null;
            try {
                process = childProcess.exec('echo `git log -1`', {
                    cwd: destDir
                });
            } catch (err) {
                logger.error(`启动异常！ 错误信息： ${err.message}`);
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
                    return reject(new Error(`"git log -1" command exited with code ${exitCode}.`));
                }
                resolve(null);
            });
        });
    }

    /**
     * 具体打包脚本命令，不在后台拼，改为调用代码中的入口脚本文件
     * 执行 react-native bundle
     * @returns {Promise.<void>}
     */
    async reactBundle(){
        const logger = this.logger;
        const sourceDir = this.sourceDir;
        const app = this.app;
        const platform = this.platform;

        logger.log(`CALL reactBundle`);

        //react native bundle 产出的目录
        let outputDir = '';
        try{
            outputDir = await FSHelper.generateTempDir(`node_lemon_output_`);
        }catch(err){
            logger.error(`生成react bundle临时目录异常！ 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        this.outputDir = outputDir;

        logger.log(`bundle产出的目录为： ${outputDir}`);

        ////// 具体打包脚本，放给代码里维护，不在后台维护 ////
        // logger.log(`准备执行 react-native bundle 打包:`);
        // try{
        //     await bundler.bundleReactNative({
        //         cwd : sourceDir,
        //         assetsDest : outputDir,
        //         bundleOutput : path.join(outputDir, app.bundleName),
        //         entryFile : app.entryFile,
        //         platform : platform,
        //         dev : Boolean(app.dev).toString()
        //     });
        // }catch(err){
        //     logger.error(`打包异常！ 错误信息： ${err.message}`);
        //     await this.taskFail(TASK_STATUS.ERROR);
        //     return;
        // }

        logger.log(`准备执行 ${app.entryFile} 打包:`);
        try{
            await bundler.callBundleShell({
                cwd : sourceDir,
                assetsDest : outputDir,
                bundleOutput : path.join(outputDir, app.bundleName),
                entryFile : app.entryFile,
                platform : platform,
                dev : Boolean(app.dev).toString()
            });
        }catch(err){
            logger.error(`打包异常！ 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //写入 hot.json 文件
        const addJsonFile = await this.addVersionJsonFile();
        if( ! addJsonFile ){
            return;
        }

        //下一步
        await this.generateFullPackage();
    }

    /**
     * 
     * 生成 全量包
     * @returns {Promise.<void>}
     */
    async generateFullPackage(){

        const logger = this.logger;
        const packageRootDir = this.packageRootDir;
        const today = this.today;
        const app = this.app;
        const task = this.task;
        const outputDir = this.outputDir;
        const packageModel = this.packageModel;
        const nativeVersion = this.nativeVersion;
        const rnVersion = this.rnVersion;

        logger.log(`CALL generateFullPackage`);

        //全量包生成目录
        logger.log(`准备生成全量包zip的文件路径: 全量包根目录[${packageRootDir}]`);
        const fullZipPath = path.join(packageRootDir, `app_${app.id}`, `native_${nativeVersion}`);
        const finalZipFile = path.join(fullZipPath, `rn_${rnVersion}_${today}__${uuidV4()}.zip`);
        try{
            fse.ensureDirSync(fullZipPath);
        }catch(err){
            logger.error(`创建全量包保存目录异常！ 全量包目录[${fullZipPath}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //zip
        logger.log(`准备生成全量包 zip 文件`);
        try{
            let files = fsDiff.read.getFilesSync(outputDir, `${outputDir}${sep}`);
            logger.log(`将要添加到全量zip包中的文件列表：\n\n${files.join('\n')}`);
            
            await FSHelper.zipDir(outputDir, finalZipFile);
        }catch(err){
            logger.error(`保存全量zip包异常！ 全量包[${finalZipFile}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //写入全量包的数据库
        logger.log(`准备写入全量包路径到数据库  zipFile[${finalZipFile}]`);
        let packageId = 0;
        try{
            //file md5
            const md5 = await fsDiff.sign.fileMd5(finalZipFile);

            packageId = await packageModel.insertPackage({
                appId : app.id,
                packageVersion : rnVersion,
                appVersion : nativeVersion,
                desc : task.desc,
                abTest : task.abTest,
                //默认不对外开放下载
                status : 1,
                md5 : md5,
                filePath : finalZipFile,
                userId : task.userId
            });
        }catch(err){
            logger.error(`写入全量包mysql数据库异常！ 全量包[${finalZipFile}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //更新任务状态：  保存全量包成功
        logger.log(`全量包记录更新成功，准备修改当前任务状态:`);
        try{
            let success = await this.taskModel.updateTaskById(this.taskId, {
                status : TASK_STATUS.SUCCESS,
                packageId : packageId
            });
            if( ! success ){
                throw new Error(`更新任务状态到 全量包成功  失败！`);
            }
        }catch(err){
            //TODO 这里有点问题，这时候全量包已经写入mysql了，但是更新任务状态失败，要不要删除掉mysql里的全量包记录呢。
            //TODO 应该是要删除的，但是目前还没做……因为不清楚什么情况会导致这样！
            logger.error(`更新任务状态为 [${TASK_STATUS.SUCCESS}] 异常！ 全量记录ID[${packageId}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        this.currentStatus = TASK_STATUS.SUCCESS;
        this.packageId = packageId;

        //全量包都搞定了，需要搞增量包了
        logger.log(`全量包搞定，准备开始增量包的生成： packageId[${packageId}]`);


        //
        await this.generateDiffPackage();
    }

    /**
     * 针对线上服务器不能访问 内网gitlab的情况 ，需要在线下，打好包治好，rsync到线上服务的某个目录下
     * 因此，线上不用自己产出全量包了，只需要把全量包拷贝到对外暴露的目录下即可
     * 由于还需要后台产出 hot.json 文件，因此还是需要先解压，写入 hot.json 之后，再压缩生成全量包
     * 由于还需要产出增量包，因此需要把全量包解压到某个临时目录，方便下一次增量包对比
     * @returns {Promise.<void>}
     */
    async moveFullPackage(){

        const logger = this.logger;

        const packageRootDir = this.packageRootDir;
        const today = this.today;
        const app = this.app;
        const task = this.task;
        const platform = this.platform;
        // const packageModel = this.packageModel;
        // const nativeVersion = this.nativeVersion;
        // const rnVersion = this.rnVersion;

        logger.log(`CALL moveFullPackage`);

        //对比上传全量包的md5
        let realMd5 = 0;
        try{
            realMd5 = await fsDiff.sign.fileMd5(task.uploadFullPackagePath);
            logger.log(`上传全量包的md5是： ${realMd5}`);
            if( realMd5 !== task.uploadFullPackageMd5 ){
                //md5 校验失败
                throw new Error(`上传全量包的md5校验失败！`);
            }
        }catch(err){
            logger.error(`对比上传全量包的md5失败！ 上传全量包路径[${task.uploadFullPackagePath}] 用户填写md5[${task.uploadFullPackageMd5}] 实际计算的md5[${realMd5}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //全量包解压之后的临时目录
        let outputDir = '';
        try{
            outputDir = await FSHelper.generateTempDir(`node_lemon_output_`);
        }catch(err){
            logger.error(`生成 全量包的临时解压目录异常！ 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.PATCH_ERROR);
            return;
        }

        this.outputDir = outputDir;

        logger.log(`准备解压上传的全量包到指定目录: ${outputDir}`);

        try{
            await FSHelper.unzip2Dir(task.uploadFullPackagePath, outputDir, true);
        }catch(err){
            logger.error(`解压全量包到临时目录异常！ 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.PATCH_ERROR);
            return;
        }

        //写入 hot.json 文件
        const addJsonFile = await this.addVersionJsonFile();
        if( ! addJsonFile ){
            return;
        }

        const nativeVersion = this.nativeVersion;
        const rnVersion = this.rnVersion;
        const packageModel = this.packageModel;

        //全量包生成目录
        logger.log(`准备生成全量包zip的文件路径: 全量包根目录[${packageRootDir}]`);
        const fullZipPath = path.join(packageRootDir, `app_${app.id}`, `native_${nativeVersion}`);
        const finalZipFile = path.join(fullZipPath, `rn_${rnVersion}_${today}__${uuidV4()}.zip`);
        try{
            fse.ensureDirSync(fullZipPath);
        }catch(err){
            logger.error(`创建全量包保存目录异常！ 全量包目录[${fullZipPath}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //zip 这里 **不能** 直接使用上传的zip包，需要重新打包包含 hot.json 文件的全量包
        logger.log(`准备生成全量包 zip 文件`);
        try{
            let files = fsDiff.read.getFilesSync(outputDir, `${outputDir}${sep}`);
            logger.log(`将要添加到全量zip包中的文件列表：\n\n${files.join('\n')}`);
            
            await FSHelper.zipDir(outputDir, finalZipFile);
        }catch(err){
            logger.error(`保存全量zip包异常！ 全量包[${finalZipFile}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //写入全量包的数据库
        logger.log(`准备写入全量包路径到数据库  zipFile[${finalZipFile}]`);
        let packageId = 0;
        try{
            //file md5
            const md5 = await fsDiff.sign.fileMd5(finalZipFile);

            packageId = await packageModel.insertPackage({
                appId : app.id,
                packageVersion : rnVersion,
                appVersion : nativeVersion,
                desc : task.desc,
                abTest : task.abTest,
                //默认不对外开放下载
                status : 1,
                md5 : md5,
                filePath : finalZipFile,
                userId : task.userId
            });
        }catch(err){
            logger.error(`写入全量包mysql数据库异常！ 全量包[${finalZipFile}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        //更新任务状态：  保存全量包成功
        logger.log(`全量包记录更新成功，准备修改当前任务状态:`);
        try{
            let success = await this.taskModel.updateTaskById(this.taskId, {
                status : TASK_STATUS.SUCCESS,
                packageId : packageId
            });
            if( ! success ){
                throw new Error(`更新任务状态到 全量包成功  失败！`);
            }
        }catch(err){
            //TODO 这里有点问题，这时候全量包已经写入mysql了，但是更新任务状态失败，要不要删除掉mysql里的全量包记录呢。
            //TODO 应该是要删除的，但是目前还没做……因为不清楚什么情况会导致这样！
            logger.error(`更新任务状态为 [${TASK_STATUS.SUCCESS}] 异常！ 全量记录ID[${packageId}] 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.ERROR);
            return;
        }

        this.currentStatus = TASK_STATUS.SUCCESS;
        this.packageId = packageId;

        //全量包都搞定了，需要搞增量包了
        logger.log(`全量包搞定，准备开始增量包的生成： packageId[${packageId}]`);

        //
        await this.generateDiffPackage();
    }

    /**
     * 生成 增量包
     * @returns {Promise.<void>}
     */
    async generateDiffPackage(){

        const logger = this.logger;
        const app = this.app;
        const task = this.task;
        const nativeVersion = this.nativeVersion;
        const rnVersion = this.rnVersion;
        const platform = this.platform;
        const packageModel = this.packageModel;
        const diffRootDir = this.diffRootDir;
        const today = this.today;
        const packageId = this.packageId;
        const outputDir = this.outputDir;

        logger.log(`CALL generateDiffPackage`);

        logger.log(`获取旧的全量包记录： appId[${app.id}] nativeVersion[${nativeVersion}] rnVersion[${rnVersion}] packageId[${packageId}] `);
        let oldPackageList = [];
        try{
            oldPackageList = await packageModel.getPackageList(app.id, nativeVersion, rnVersion);
        }catch(err){
            logger.error(`获取旧的全量包发版记录异常！ 错误信息： ${err.message}`);
            await this.taskFail(TASK_STATUS.PATCH_ERROR);
            return;
        }

        if( oldPackageList.length > 0 ){
            let patchModel = new PatchModel({
                model : this.model
            });
            //存在老版本的全量包，需要生成增量包，针对下列文件，会进行 bsdiff 
            const bsdiffArray = [ app.bundleName, `index.android.bundle`, `index.ios.bundle`, `main.ios.jsbundle` ];
            //增量zip文件根目录
            const diffZipRootDir = path.join(diffRootDir, `app_${app.id}`, `native_${nativeVersion}`, `rn_${rnVersion}`);
            try{
                fse.ensureDirSync(diffZipRootDir);
            }catch(err){
                logger.error(`创建本次发版的增量包根目录异常！ 错误信息： ${err.message}`);
                await this.taskFail(TASK_STATUS.PATCH_ERROR);
                return;
            }

            for( let i = 0, len = oldPackageList.length; i < len; i++ ){
                let obj = oldPackageList[i];

                //单个版本的diff，都 try-catch，避免一个错误，导致后面的都不执行了
                try{
                    //zip包解压的临时目录
                    let tempUnzipPath = await FSHelper.generateTempDir(`rn_full_${obj.appId}_${obj.appVersion}_${obj.packageVersion}`);
                    fse.removeSync(tempUnzipPath);
                    await FSHelper.unzip2Dir(obj.filePath, tempUnzipPath, true);
                    //临时的diff产出目录
                    let tempDiffOutput = await FSHelper.generateTempDir(`rn_diff_${obj.appId}_${obj.appVersion}_${obj.packageVersion}`);
                    let tempDiffMetaFile = path.join(tempDiffOutput, `diff_meta.json`);
                    let diffResult = await DiffPatch.diffDir(outputDir, tempUnzipPath, tempDiffOutput, bsdiffArray);
                    fse.writeJsonSync(tempDiffMetaFile, diffResult);
                    //产出 zip 包到最终目录
                    let finalZipFile = path.join(diffZipRootDir, `native_${nativeVersion}_diff_${rnVersion}_${obj.packageVersion}_${today}__${uuidV4()}.zip`);
                    await FSHelper.zipDir(tempDiffOutput, finalZipFile);
                    //计算 增量zip包 的 md5
                    let md5 = await fsDiff.sign.fileMd5(finalZipFile);
                    //插入增量包记录到mysql
                    await patchModel.insert({
                        appId : app.id,
                        packageId : packageId,
                        packageVersion : rnVersion,
                        compareVersion : obj.packageVersion,
                        md5 : md5,
                        filePath : finalZipFile
                    });

                    //删除临时目录
                    fse.removeSync(tempUnzipPath);
                    fse.removeSync(tempDiffOutput);

                    logger.log(`增量包计算完成 appId[${obj.appId}] nativeVersion[${nativeVersion}] fromRN[${obj.packageVersion}] toRN[${rnVersion}]`);
                }catch(err){
                    logger.error(`增量包计算异常！ appId[${obj.appId}] nativeVersion[${nativeVersion}] fromRN[${obj.packageVersion}] toRN[${rnVersion}]  错误信息： ${err.message}`);
                }


            }
        }else{
            //
            logger.log(`不存在低版本的RN全量包，跳过增量包生成过程  appId[${app.id}] nativeVersion[${nativeVersion}] rnVersion[${rnVersion}] `);
        }

        //更新任务状态
        try{
            await this.updateTaskStatus(TASK_STATUS.PATCH_SUCCESS, this.currentStatus);
        }catch(err){
            logger.error(`修改任务状态失败！ toStatus[${TASK_STATUS.PATCH_SUCCESS}]  错误信息：${err.message}`);
        }

        //任务终于都执行成功了
        await this.taskSucceed();
    }

    /**
     * 启动任务流
     * @returns {Promise.<void>}
     */
    async run(){
        try{
            await this.init();
        }catch(err){
            this.logger.error(`任务执行异常！ 错误信息： ${err.message}`);
            await this.cleanup();
            this.exit(1);
        }

    }

    /**
     * 任务成功执行
     * @returns {Promise.<void>}
     */
    async taskSucceed(){

        const logger = this.logger;

        logger.log(`CALL taskSucceed`);

        const now = new Date();

        try{
            await this.cleanup();
        }catch(err){

        }

        logger.log(`\n\n终于，任务执行结束了，完美登陆诺曼底. Congratulations!\n\n`);
        logger.log(`任务执行时间： [${ now.getTime() - this.startTime.getTime() }] 毫秒\n`);

        this.exit(0);
    }

    /**
     * 设置任务的状态未 failStatus ，清理临时目录，并退出进程
     * @param failStatus {int} 异常的任务状态
     * @param exitCode {int} 进程退出值
     * @returns {Promise.<void>}
     */
    async taskFail(failStatus, exitCode){

        const logger = this.logger;

        logger.log(`CALL taskFail`);

        try{
            await this.tryUpdateTaskStatus(failStatus, this.currentStatus);
            await this.cleanup();
        }catch(err){
            logger.error(`taskFail 调用失败   failStatus[${failStatus}] exitCode[${exitCode}]  异常信息：${err.message}`);
        }
        this.exit( exitCode || 1);

    }

    async tryUpdateTaskStatus(toStatus, fromStatus){
        try{
            await this.updateTaskStatus(toStatus, fromStatus);
        }catch(err){

        }
    }

    /**
     * 修改任务状态
     * @param toStatus {int}新的任务状态
     * @param fromStatus {int} 旧的任务状态
     * @returns {Promise.<boolean>}
     */
    async updateTaskStatus(toStatus, fromStatus){

        const logger = this.logger;

        let success = false;
        let out = await this.taskModel.updateTaskStatus(this.taskId, toStatus, fromStatus);
        success = out.results.changedRows === 1;
        if( ! success  ){
            //更新失败
            logger.error(`updateTaskStatus 修改任务状态异常！ taskId[${this.taskId}] fromStatus[${fromStatus}] toStatus[${toStatus}]`);
        }
        return success;
    }

    /**
     * 进程退出时，清理各种临时目录
     * @returns {Promise.<void>}
     */
    async cleanup(){

        const logger = this.logger;

        logger.log(`CALL cleanup`);

        if( this.sourceDir ){
            //清除源代码目录
            logger.log(`cleanup 清除源代码目录： ${this.sourceDir}`);
            try{
                fse.removeSync(this.sourceDir);
            }catch(err){
                logger.error(`cleanup 删除源代码目录异常！ sourceDir[${this.sourceDir}] 错误信息： ${err.message}`);
            }
            this.sourceDir = '';
        }

        if( this.outputDir ){
            //清除react-native bundle产出目录
            logger.log(`cleanup 清除react-native产出目录： ${this.outputDir}`);
            try{
                fse.removeSync(this.outputDir);
            }catch(err){
                logger.error(`cleanup 删除react-native bundle产出目录异常！ sourceDir[${this.outputDir}] 错误信息： ${err.message}`);
            }
            this.outputDir = '';
        }
    }


    /**
     * 结束进程
     * @param code {int} 进程退出的状态码
     */
    exit(code){

        const mysqlClient = this.mysqlClient;
        const logger = this.logger;

        logger.log(`CALL exit code[${code}]`);

        if( mysqlClient ){
            mysqlClient.end(function(err){
                if( err ){
                    logger.error(`exit 结束mysql连接异常！ 错误信息： ${err.message}`);
                }
                process.exit(code);
            });
        }else{
            process.exit(code);
        }
    }
}



module.exports = TaskEntrance;


