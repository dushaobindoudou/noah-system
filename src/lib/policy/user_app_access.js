/**
 * 过滤当前登录用户对某个APP，是否有对应权限
 */

'use strict';

class UserAppAccessFilter extends leek.Policy{
    async execute(args){
        const {ctx} = this;

        const user = ctx.user;

        if( ! user ){
            ctx.body = {
                status: 1001,
                message: '未登录'
            };
            return false;
        }

        const query =  (ctx.method === 'GET' ? ctx.query : ctx.request.body) || {};
        const appId = query.appId;

        if( ! appId ){
            ctx.error('appId不能为空');
            return false;
        }

        const App = ctx.app.model.App;
        const UserApp = ctx.app.model.UserApp;

        //获取app详情
        let app = null;
        try{
            app = await App.findByAppId(appId);
        }catch(err){
            ctx.log.error(`[UserAppAccessFilter.execute]查找app详情异常 appId[${appId}] 错误信息: ${err.message}`);
        }

        if( ! app ){
            ctx.error(`未找到appId[${appId}]对应的应用！`);
            return false;
        }

        //保留APP对象，后面action里可能会访问到
        ctx.state.app = app;

        //判断用户是否对当前APP有读权限
        try{
            let temp = await UserApp.getUserAppAccess(user, app);
            if( ! temp[args] ){
                ctx.error('您没有权限');
                return false;
            }

            //保留权限对象，后面action里可能会访问到
            ctx.state.appAccess = temp;

        }catch(err){
            ctx.log.error(`[UserController.taskDetail]查找用户对app的权限详情异常  userId[${user.id}] appId[${appId}] 错误信息: ${err.message}`);
            ctx.error('判断用户对APP的权限异常！')
            return false;
        }

    }
}

module.exports = UserAppAccessFilter;

