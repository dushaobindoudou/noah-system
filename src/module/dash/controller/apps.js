/**
 * app 列表相关接口
 */

'use strict';

const Controller = leek.Controller;

class AppsController extends Controller{

    async ownAction(){
        return this.render('dash/page/index/index.tpl');
    }

    async readAction(){
        return this.render('dash/page/index/index.tpl');
    }

    async writeAction(){
        return this.render('dash/page/index/index.tpl');
    }

    async createAction(){
        return this.render('dash/page/index/index.tpl');
    }

    async detailAction(){
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
}


module.exports = AppsController;

