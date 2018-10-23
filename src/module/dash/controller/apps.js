/**
 * app 列表相关接口
 */

'use strict';

const path = require('path');
const fs = require('fs');
const childProcess = require("child_process");
const fse = require('fs-extra');
const uuidV4 = require('uuid/v4');
const moment = require('moment');
const send = require('koa-send');

const Controller = leek.Controller;


//全量包存放根目录
const packageDir = leek.getConfig( 'packageDir');
//增量包存放根目录
const diffDir = leek.getConfig('diffDir');
//发版任务日志的根目录
const publishLogDir = leek.getConfig('publishLogDir');
//离线的发版任务bin目录
const offlineBinDir = leek.getConfig('binDir');
//mysql config
const mysqlConfig = leek.getConfig('mysql');


class AppsController extends Controller{

    //当前用户，拥有的APP列表页
    async ownAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //当前用户，读权限的APP列表页
    async readAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //当前用户，写权限的APP列表页
    async writeAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //创建APP页面
    async createAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //APP详情页
    async detailAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //app发版页
    async publishAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //全量包列表页
    async packageListAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //全量包详情页
    async packageDetailAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //增量包列表页
    async patchesAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //某个APP下有权限的用户列表页
    async usersAction(){
        return this.render('dash/page/index/index.tpl');
    }

    /**
     * 异步接口
     * 当前登录用户拥有的APP列表
     */
    async ownListAction(){
        const App = this.ctx.app.model.App;

        const ctx = this.ctx;

        const user = ctx.user

        let list = [];

        try{
            list = await App.findByOwnerId(user.id);
        }catch(err){
            this.log.error(`[dash.apps.ownListAction]查找当前用户拥有的app列表异常 userId[${user.id}] 错误信息：${err.message}`);
            return this.error('获取APP列表异常');
        }

        this.ok({
            apps: list
        })
    }

    /**
     * 获取当前用户拥有的，可读、可写 的app列表
     * @returns {Promise.<void>}
     */
    async relateAppsAction(){
        const App = this.ctx.app.model.App;
        const UserApp = this.ctx.app.model.UserApp;

        const ctx = this.ctx;

        //read/write
        const access = ctx.query.access;

        const user = ctx.user;

        let list = [];

        try{
            list = await UserApp.findByUserIdWithAccess(user.id, access);
        }catch(err){
            this.log.error(`[dash.apps.relateApps]查找当前用户可读写的app列表异常 userId[${user.id}] 错误信息：${err.message}`);
            
            return this.error('获取app列表异常');
        }

        //根据列表的 appId，获取单个 app详情
        list = list.map(function(obj){
            return App.findByAppId(obj.appId)
                .then(function(app){
                    if( app ){
                        app = app.toJSON();
                        app.canRead = obj.canRead;
                        app.canWrite = obj.canWrite;
                    }
                    return app;
                })
                .catch(function(){
                    return null;
                })
        });

        try{
            list = await Promise.all(list);
        }catch(err){
            this.log.error(`[dash.apps.relateAppsAction]根据当前用户可读写的app列表读取app详情异常 userId[${user.id}] 错误信息：${err.message}`);
            
            return this.error('获取app列表内的详情异常');
        }

        this.ok({
            apps: list
        });
    }

    /**
     * 新增一个app
     * @returns {Promise.<void>}
     */
    async doAddAction(){
        const App = this.ctx.app.model.App;

        const ctx = this.ctx;
        const body = ctx.request.body;

        const user = ctx.user;

        const name = ( body.name || '').trim();
        const desc = ( body.desc || '').trim();
        const gitUrl = ( body.gitUrl || '').trim();
        const entryFile = ( body.entryFile || '').trim();
        const bundleName = ( body.bundleName || '').trim();

        if( ! name || ! desc  || ! entryFile || ! bundleName ){
            return this.error('app名、描述、入口文件、产出文件名 都不能为空！');
        }

        try{
            let isExist = await App.isAppNameExist(name);
            if( isExist ){
                return this.error('app名已经存在！');
            }
        }catch(err){
            this.log.error(`[AppController.doAdd]新增app判断name是否可用异常 name[${name}]: ${err.message}`);
            return this.error('判断app名是否可用异常');
        }

        const platform = body.platform;
        if( platform !== App.PLATFORM.ANDROID && platform !== App.PLATFORM.IOS){
            return this.error('platform错误');
        }

        let app = new App({
            appKey : App.generateAppKey(),
            name : name,
            desc : desc,
            gitUrl : gitUrl,
            ownerId : user.id,
            platform : platform,
            entryFile : entryFile,
            bundleName : bundleName,
        });

        let success = false;

        try{
            success = await app.save();
        }catch(err){
            this.log.error(`[dash.apps.doAdd]保存app信息到数据库异常 name[${name}] ownerId[${user.id}] : ${err.message}`);
        }

        if( success ){
            this.ok({
                appId: app.id,
            });
        }else{
            this.error('保存应用信息到数据库异常！');
        }
    }

    /**
     * 获取当前用户有权限的某个APP详情
     * @returns {Promise.<void>}
     */
    async appDetailAction(){
        const ctx = this.ctx;
        const User = ctx.app.model.User;

        const user = ctx.user;

        let app = ctx.state.app;

        let access = ctx.state.appAccess;

        app = app.toJSON();

        app.canRead = access.canRead;
        app.canWrite = access.canWrite;
        app.canModify = access.canModify;

        //查找该APP创建者的信息
        try{
            let ownerUser = await User.findById(app.ownerId);
            app.owner = ownerUser;
        }catch(err){
            this.log.error(`[User.appDetail]查找APP创建者信息失败！  appId[${app.id}]  错误信息：${err.message}`);
        }

        this.ok({
            app: app
        });

    }

    /**
     * 更新应用信息
     * @returns {Promise.<void>}
     */
    async doUpdateAction(){
        const ctx = this.ctx;
        const App = ctx.app.model.App;

        const body = ctx.request.body;

        const user = ctx.user;
        const userId = user.id;

        const appId = String( body.appId || '').trim();
        const name = ( body.name || '').trim();
        const desc = ( body.desc || '').trim();
        const gitUrl = ( body.gitUrl || '').trim();
        const entryFile = ( body.entryFile || '').trim();
        //要转让给的用户名
        const ownerName = ( body.ownerName || '').trim();

        if( ! appId ){
            return this.erro('appId不能为空！');
        }

        let app = null;
        try{
            app = await App.findByAppId(appId);
        }catch(err){
            this.log.error(`[dash.apps.doUpdateAction]根据appId查找app异常 appId[${appId}] : ${err.message}`);
        }

        if( ! app ){
            return this.error('应用不存在！');
        }

        if( app.ownerId !== userId && ! user.isAdmin() ){
            //管理员可以修改任何app的信息
            //除了管理员，只有app拥有者能够修改app信息
            this.log.warn(`[dash.apps.doUpdateAction]用户尝试非法修改他人的app信息 非法的userId[${user.id}] appId[${appId}]`);
            return this.error('没有权限');
        }

        if( name && name !== app.name ){
            //尝试修改 app 名，需要先检查该app名是否存在
            try{
                let isExist = await App.isAppNameExist(name);
                if( isExist ){
                    return this.error('要修改的app名字已经存在！');
                }
            }catch(err){
                this.log.error(`[dash.apps.doUpdateAction]判断新的app.name是否存在异常  newName[${name}] ： ${err.message}`);
            }

            app.name = name;
        }

        if( desc ){
            app.desc = desc;
        }

        if( gitUrl ){
            app.gitUrl = gitUrl;
        }

        if( entryFile && entryFile !== app.entryFile ){
            app.entryFile = entryFile;
        }

        const User = ctx.app.model.User;

        //要讲app转让给的目标用户
        let targetUser = null;

        if( ownerName  ){
            try{
                targetUser = await User.findByName(ownerName);
            }catch(err){
                targetUser = null;
                this.log.error(`[dash.apps.doUpdateAction]判断新的app.owner_id用户是否存在异常 ownerName[${ownerName}] ： ${err.message}`);
                return this.error('判断要转让的目标用户是否存在异常！');
            }

            if( ! targetUser ){
                return this.error('要转让的目标用户不存在！');
            }
        }

        if( targetUser && targetUser.id !== app.ownerId ){
            //将当前app转让给其他用户
            app.ownerId = targetUser.id;
        }

        let success = false;

        try{
            success = await app.save();
        }catch(err){
            this.log.error(`[dash.apps.doUpdateAction]更新app信息到数据库异常 appId[${appId}] ownerId[${user.id}] : ${err.message}`);
        }

        if( success ){

            this.log.info(`[dash.apps.doUpdateAction]用户更新APP信息成功  user[${user.name}] 修改后的APP数据[${JSON.stringify(app)}]`);

            try{
                app = await App.findByAppId(appId);
            }catch(err){
                this.log.error(`[dash.apps.doUpdateAction]根据appId再次查找app异常 appId[${appId}] : ${err.message}`);
            }

            this.ok({
                app: app
            });
        }else{
            this.error('更新应用信息到数据库异常！');
        }
    }

    /**
     * 读取对某个app拥有的所有用户列表
     * 
     * @returns {Promise.<void>}
     */
    async userListAction(){
        const ctx = this.ctx;
        const App = ctx.app.model.App;

        const query = ctx.query;
        // let access = (query.access || '').trim();

        const app = ctx.state.app;
        const appAccess = ctx.state.appAccess;
        const appId = app.id;

        const UserApp = ctx.app.model.UserApp;

        let arr = [];

        try{
            arr = await UserApp.findByAppId(app.id);
        }catch(err){
            this.log.error(`[dash.apps.usersAction]查找app下某个权限的数据异常 appId[${appId}] access[${access}] 错误信息：${err.message}`);
            return this.error(`获取权限列表异常`);
        }

        const User = ctx.app.model.User;

        //读取每一条权限所对应的用户信息
        let usersRequest = arr.map(function(obj){
            return User.findById(obj.userId).then(function(user){
                if( user ){
                    user = user.toJSON();
                    user.canRead = obj.canRead;
                    user.canWrite = obj.canWrite;
                    user.access = obj.access;
                    user.createdAt = obj.createdAt;
                    user.updatedAt = obj.updatedAt;
                }
                return user;
            }).catch(function(){
                return null;
            });
        });

        let users = [];

        try{
            users = await Promise.all(usersRequest);
        }catch(err){
            this.log.error(`[dash.apps.usersAction]批量获取用户数据异常 appId[${appId}] access[${access}] 错误信息：${err.message}`);
            return this.error(`获取权限列表异常`);

        }

        //过滤掉通过 userId 没找到用户的数据，过滤掉 admin 账号
        users = users.filter(function(obj){
            return  obj && ! obj.isAdmin;
        });

        this.ok({
            app,
            users,
        });
    }

    /**
     * 某个app，给某个用户添加权限，可以是 ： 无权限、读、写
     * @returns {Promise.<void>}
     */
    async updateUserAction(){
        const ctx = this.ctx;
        const App = ctx.app.model.App;
        const body = ctx.request.body;

        const userName = ( body.userName || '' ).trim();
        const access = body.access;

        if(! userName || ! access ){
            return this.error('userName/access不能为空！');
        }

        const app = ctx.state.app;
        const user = ctx.user;

        const appId = app.id;

        const UserApp = ctx.app.model.UserApp;

        const User = ctx.app.model.User;

        let targetUser = null;
        try{
            targetUser = await User.findByName(userName);
        }catch(err){
            this.log.error(`[dash.apps.updateUserAction]查找目标用户异常 appId[${appId}] userName[${userName}] 错误信息：${err.message}`);
        }

        if( ! targetUser ){
            return this.error(`未找到对应的用户`);
        }

        let userApp = await UserApp.findByUserIdAndAppId(targetUser.id, app.id);
        if( ! userApp ){
            userApp = new UserApp({
                userId : targetUser.id,
                appId : app.id
            });
        }

        //更新权限
        userApp.setAccess(access);

        let success = false;

        try{
            success = await userApp.save();
        }catch(err){
            success = false;
            this.log.error(`[dash.apps.updateUserAction]保存权限异常 appId[${appId}] userName[${userName}] 错误信息：${err.message}`);
        }

        if( success ){
            this.log.info(`[dash.apps.updateUserAction]用户修改APP的权限信息  appId[${appId}] user[${user.name}] targetUser[${targetUser.name}] 修改后的权限是[${access}]`);
            this.ok({});
        }else{
            this.error(`保存权限异常`);
        }

    }

    /**
     * APP发版
     * @returns {Promise.<void>}
     */
    async publishAppAction(){
        const ctx = this.ctx;
        const body = ctx.request.body;

        const appId = body.appId;
        const appVersion = ( body.appVersion || '').trim();
        const uploadFullPackagePath = ( body.uploadFullPackagePath || '').trim();
        const uploadFullPackageMd5 = ( body.uploadFullPackageMd5 || '').trim();
        const branchName = ( body.branchName || '').trim();
        const desc = ( body.desc || '').trim();
        const abTest = ( body.abTest || '').trim();

        if( ! appVersion || ! desc ){
            return this.error('app版本、发版描述必填！');
        }

        if( (! uploadFullPackagePath || ! uploadFullPackageMd5) && ! branchName ){
            return this.error('上传全量包路径/全量包md5、分支号不能同时为空');
        }

        const user = ctx.user;
        const app = ctx.state.app;

        const today = moment().format(`YYYYMMDD`);

        ////////////////////准备离线任务//////////
        let logFile = path.join( publishLogDir, `app_${app.id}`, `${today}`, `${uuidV4()}.log`);

        try{
            fse.ensureFileSync(logFile);
        }catch(err){
            this.log.error(`[dash.apps.publishAppAction]创建离线发版任务的日志文件异常  userId[${user.id}] appId[${appId}] logFile[${logFile}] 错误信息: ${err.message}`);
            return this.error('创建发版任务的日志文件异常！');
        }

        const Task = ctx.app.model.Task;

        //写入任务表
        let taskId = 0;

        let task = new Task({
            appId : appId,
            userId : user.id,
            appVersion: appVersion,
            uploadFullPackagePath: uploadFullPackagePath,
            uploadFullPackageMd5: uploadFullPackageMd5,
            branchName : branchName,
            logFile : logFile,
            desc : desc,
            abTest : abTest
        });

        let taskSaved = false;

        try{
            taskSaved = await task.save();
        }catch(err){
            taskSaved = false;
            this.log.error(`[dash.apps.publishAppAction]insert离线发版任务到mysql异常！ 错误信息：${err.message}`);
        }

        if( ! taskSaved ){
            //任务写入mysql失败，删除日志文件并返回错误
            this.log.error(`[dash.apps.publishAppAction]保存任务失败，准备删除日志文件，并返回错误`);
            try{
                fse.removeSync(logFile);
            }catch(err){
                this.log.error(`[dash.apps.publishAppAction]保存任务失败时，删除日志文件异常！ 错误信息：${err.message}`);
            }
            return this.error('写入发版任务到数据库异常！');
        }

        //更新为新插入mysql的id
        taskId = task.id;


        //启动离线任务进程
        const cli = [
            './index.js',
            '--task_id', taskId,
            '--mysql_host', mysqlConfig.host,
            '--mysql_user', mysqlConfig.user,
            '--mysql_password', mysqlConfig.password,
            '--mysql_database', mysqlConfig.database,
            '--package_dir', packageDir,
            '--diff_dir', diffDir
        ];

        this.log.info(`准备调用的离线发版命令为： ${cli.join(' ')}`);
        this.log.info(`本次发版的日志文件为： ${logFile}`);

        let logFd = -1;
        let publishProcess = null;

        try{
            logFd = fs.openSync(logFile, 'w');
            publishProcess = childProcess.spawn('node', cli, {
                cwd : offlineBinDir,
                //环境变量传给脚本，脚本里会读取 NODE_ENV
                env: process.env,
                detached : true,
                stdio: [ 'ignore', logFd, logFd ]
            });
            publishProcess.on('error', (err) => {
                this.log.error(`[dash.apps.publishAppAction]新开进程执行离线任务error  user[${user.name}]   错误信息： ${err.message}`);
            });
            publishProcess.unref();
        }catch(err){
            this.log.error(`新开进程执行离线发版异常  错误信息： ${err.message}`);
            return this.error('启动离线发版任务子进程失败！');
        }

        this.log.info(`[dash.apps.publishAppAction]创建离线发版任务的成功  userId[${user.id}] appId[${appId}] uploadFullPackagePath[${uploadFullPackagePath}] uploadFullPackageMd5[${uploadFullPackageMd5}] branchName[${branchName}] abTest[${abTest}] logFile[${logFile}] `);

        this.ok({
            taskId : taskId
        });
    }

    //获取某个APP的RN版本列表
    async versionListAction(){

        const ctx = this.ctx;
        const query = ctx.query;

        //native版本号
        let appVersion = query.appVersion;
        //筛选发版的用户名
        let publishUserName = ( query.publishUserName || '').trim();
        //限制发版的时间范围 (start, end )
        let startTimestamp = parseInt(query.startTimestamp, 10);
        let endTimestamp = parseInt(query.endTimestamp, 10);

        const app = ctx.state.app;
        const appId = app.id;

        const User = ctx.app.model.User;
        const Package = ctx.app.model.Package;

        let targetUser = null;
        if( publishUserName ){
            //根据用户名，查找对应用户
            try{
                targetUser = await User.findByName(publishUserName);
            }catch(err){
                targetUser = null;
                this.log.error(`[dash.apps.versionListAction]根据用户名查找用户异常！  userName[${publishUserName}]  错误信息：${err.message}`);
            }
            if( ! targetUser ){
                return this.error(`未找到对应的用户`);
            }
        }

        let sql = `SELECT * FROM ${Package.TABLE_NAME} WHERE appId = ? `;
        let values = [ appId ];

        if( appVersion ){
            sql += ` AND appVersion = ? `;
            values.push( appVersion );
        }

        if( targetUser ){
            sql += ` AND userId = ? `;
            values.push( targetUser.id );
        }

        if( ! isNaN(startTimestamp) ){
            sql += ` AND UNIX_TIMESTAMP(createdAt) > ? `;
            values.push( Math.floor( startTimestamp / 1000) );
        }

        if( ! isNaN(endTimestamp) ){
            sql += ` AND UNIX_TIMESTAMP(createdAt) < ? `;
            values.push( Math.floor( endTimestamp / 1000) );
        }

        //按照发版时间，倒序
        sql += ` ORDER BY createdAt DESC`;

        let list = [];

        try{
            let temp = await Package.query(sql, values);
            list = temp.results || [];
        }catch(err){
            list = [];
            this.log.error(`[dash.apps.versionListAction]查找APP版本列表异常！  appId[${app.id}] userName[${publishUserName}]  错误信息：${err.message}`);
        }

        //获取版本对应的发版人
        try{
            let ids = list.map( (obj) => {
                return obj.userId;
            });
            if( ids.length > 0 ){
                ids = ids.filter( (id, index, arr) => {
                    return arr.indexOf(id) === index;
                });
                let users = await User.findByIdList(ids);
                let userMap = {};
                users.forEach( (user) => {
                    let obj = user.toJSON();
                    userMap[user.id] = obj;
                });

                list.forEach( (obj) => {
                    obj.publisher = userMap[obj.userId];
                });
            }

        }catch(err){
            this.log.error(`[dash.apps.versionListAction]查找各个版本对应的发版用户异常！  appId[${app.id}] userName[${publishUserName}]  错误信息：${err.message}`);
        }

        this.ok({
            app,
            list,
        });
    }

    //获取某个RN全量版本的详情
    //必须传  appId，因为权限判定是用 appId 来判断的
    //可以根据 packageId 查询；也可以根据 appVersion+packageVersion查询
    async versionDetailAction(){

        const ctx = this.ctx;
        //全量包在数据库表中的自增ID
        const packageId = ctx.query.packageId;
        const appVersion = ctx.query.appVersion;
        const packageVersion = ctx.query.packageVersion;

        const app = ctx.state.app;

        const Package = ctx.app.model.Package;

        let rnPackage = null;

        if( packageId ){
            //通过 packageId 查询详情
            try{
                rnPackage = await Package.findByPackageId(packageId);
            }catch(err){
                rnPackage = null;
                this.log.error(`[dash.apps.versionDetailAction]根据packageId获取全量包记录异常！ packageId[${packageId}]  错误信息： ${err.message}`);
            }
        }else if( appVersion && packageVersion){
            //通过 appVersion  packageVersion 查询详情
            try{
                rnPackage = await Package.findByAppPackageVersion(appVersion, packageVersion);
            }catch(err){
                rnPackage = null;
                this.log.error(`[dash.apps.versionDetailAction]根据appVersin/packageVersion获取全量包记录异常！ appVersion[${appVersion}] packageVersion[${packageVersion}]  错误信息： ${err.message}`);
            }
        }

        if( ! rnPackage ){
            return this.error(`未找到对应的全量包`);
        }

        if( rnPackage.appId !== app.id ){
            //用户构造非法的 appId，尝试读取没有权限的全量包记录！
            return this.error(`全量包不属于该APP`);
        }

        const User = ctx.app.model.User;

        //获取发版人信息
        try{
            let publisher = await User.findById(rnPackage.userId);
            rnPackage.publisher = publisher;
        }catch(err){
            this.log.error(`[dash.apps.versionDetailAction]根据user_id获取全量包的发版人信息异常！ packageId[${packageId}] userId[${rnPackage.userId}]  错误信息： ${err.message}`);
        }

        const Task = ctx.app.model.Task;
        //获取本次版本对应的任务信息
        try{
            let task = await Task.findByPackageId(rnPackage.id);
            rnPackage.task = task;
        }catch(err){
            this.log.error(`[dash.apps.versionDetailAction]根据package_id获取全量包的任务信息异常！ packageId[${packageId}] userId[${rnPackage.userId}]  错误信息： ${err.message}`);
        }

        this.ok({
            app: app,
            package : rnPackage
        });
    }

    /**
     * 允许用户更新某个全量包的  status  abTest disablePatch forceUpdate 字段！
     * 属于危险操作，因此，需要额外校验用户的 登录密码
     * @returns {Promise.<void>}
     */
    async updatePackageAction(){
        const ctx = this.ctx;

        const User = ctx.app.model.User;
        const Package = ctx.app.model.Package;

        const user = ctx.user;
        const app = ctx.state.app;

        const body = ctx.request.body;
        const packageId = body.packageId;
        const password = body.password;
        const status = parseInt(body.status, 10);
        const abTest = body.abTest || '';
        const disablePatch = parseInt(body.disablePatch, 10);
        const forceUpdate = parseInt(body.forceUpdate, 10);

        let dangerUser = null;

        try{
            dangerUser = await User.findByNamePassword(user.name, password);
        }catch(err){
            this.log.warn(`[App.updatePackage]查找匹配用户异常 userName[${user.name}] password[${password}]: ${err.message}`);
            dangerUser = null;
        }

        if( ! dangerUser ){
            return this.error(`密码错误`);
        }

        let rnPackage = null;

        try{
            rnPackage = await Package.findByPackageId(packageId);
        }catch(err){
            rnPackage = null;
            this.log.error(`[dash.apps.updatePackageAction]根据packageId获取全量包记录异常！ packageId[${packageId}]  错误信息： ${err.message}`);
        }

        if( ! rnPackage ){
            return this.error(`未找到对应的全量包`);
        }

        if( rnPackage.appId !== app.id ){
            //用户构造非法的 appId，尝试读取没有权限的全量包记录！
            return this.error(`全量包不属于该APP`);
        }

        if( ! Package.isStatusValid(status) ){
            return this.error(`status值非法！`);
        }

        if( ! Package.isPatchStatusValid(disablePatch)){
            return this.error(`disablePatch值非法！`);
        }

        if( ! Package.isForceUpdateValid(forceUpdate) ){
            return this.error(`forceUpdate值非法！`);
        }

        if( status === rnPackage.status 
            && abTest === rnPackage.abTest 
            && disablePatch === rnPackage.disablePatch 
            && forceUpdate === rnPackage.forceUpdate ){
            //用户未做修改，直接返回
            return this.error(`没有改动，无需保存`);
        }

        let success = false;
        let msg = '';
        try{
            success = await rnPackage.update({
                status: status,
                abTest: abTest,
                disablePatch: disablePatch,
                forceUpdate: forceUpdate
            });
        }catch(err){
            this.log.error(`[dash.apps.updatePackageAction]更新package全量包记录异常！ packageId[${packageId}]  错误信息： ${err.message}`);
            success = false;
            msg = err.message;
        }

        if( success ){
            this.log.info(`[dash.apps.updatePackageAction]更新package全量包记录成功！appId[${app.id}] user[${user.name}] packageId[${packageId}]  修改后status[${status}] 修改后ab_test[${abTest}]  `);
            this.ok({
                fullPackage: rnPackage
            });
        }else{
            this.error(msg || `更新全量包异常`);
        }

    }

    //某个APP下，某个RN版本的增量包列表
    async patchListAction(){
        const ctx = this.ctx;
        //全量包在数据库表中的自增ID
        const packageId = ctx.query.packageId;

        if( ! packageId ){
            return this.error(`packageId不能为空`);
        }

        const app = ctx.state.app;

        const Package = ctx.app.model.Package;
        const Patch = ctx.app.model.Patch;

        let rnPackage = null;

        try{
            rnPackage = await Package.findByPackageId(packageId);
        }catch(err){
            rnPackage = null;
            this.log.error(`[dash.apps.patchListAction]根据packageId获取全量包记录异常！ packageId[${packageId}]  错误信息： ${err.message}`);
        }

        if( ! rnPackage ){
            return this.error(`未找到对应的全量包`);
        }

        let list = [];

        try{
            list = await Patch.findByAppId(app.id, {
                where : {
                    packageId : packageId
                },
                orders : [ [ 'compareVersion', 'desc'] ]
            });
        }catch(err){
            this.log.error(`[dash.apps.patchListAction]读取增量包列表异常！ appId[${app.id}] packageId[${packageId}]  错误信息：${err.message}`);
            list = [];
        }

        this.ok({
            app: app,
            fullPackage: rnPackage,
            patchList: list,
        });
    }

    /**
     * 下载某个APP下，某个native版本的最新的全量包
     */
    async downloadLatestPackageAction(){
        const ctx = this.ctx;
        const query = ctx.query;
        const appKey = query.appKey;
        const appVersion = query.appVersion;

        const App = ctx.app.model.App;
        const Package = ctx.app.model.Package;

        let app = null;
        try{
            app = await App.findByAppKey(appKey);
        }catch(err){
            this.log.error(`[dash.apps.downloadLatestPackageAction]查找app详情异常 appId[${app.id}] 错误信息: ${err.message}`);
        }

        if( ! app ){
            ctx.status = 404;
            ctx.body = `appKey对应的APP不存在`;
            return;
        }

        let fullPackage = null;
        try{
            fullPackage = await Package.findLatest(app.id, appVersion);
        }catch(err){
            this.log.error(`[dash.apps.downloadLatestPackageAction]查找app的某个native对应最新的全量包异常 appId[${app.id}] appVersion[${appVersion}] 错误信息: ${err.message}`);
        }

        if( ! fullPackage ){
            ctx.status = 404;
            ctx.body = `未找到对应的全量包`;
            return;
        }

        ctx.set('x-package-md5', fullPackage.md5);

        try{
            await send(ctx, fullPackage.filePath, {
                root: '/'
            });
        }catch(err){
            this.log.error(`[dash.apps.downloadLatestPackageAction]输出全量包文件异常 ！ filePath[${fullPackage.filePath}] 错误信息： ${err.message}`);
            ctx.status = 500;
            ctx.body = `输出文件流失败`;
        }
    }

}


module.exports = AppsController;

