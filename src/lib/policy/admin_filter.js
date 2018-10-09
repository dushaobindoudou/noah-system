/**
 * 检测当前用户是否 管理员, 未登录跳转登录页面
 * Created by daifei on 2018/7/30
 */

'use strict';

class AdminFilterPolicy extends leek.Policy{
    async execute(){
        const {ctx} = this;
        await ctx.initUser();

        if(! ctx.user){
            if( ctx.xhr ){
                //ajax 请求，返回JSON
                ctx.body = {
                    status: 1001,
                    message: '登录态已过期'
                };
            }else{
                //用户没有登录跳转登录页面
                const session = ctx.session;
                const loginJumpUrl = ctx.originalUrl || '/';
                session.loginJump = loginJumpUrl;
                ctx.redirect('/dash/passport');
            }

            return false;
        }

        if( ctx.user.level !== 99 ){
            //非管理员
            if( ctx.xhr ){
                //ajax 请求，返回JSON
                ctx.body = {
                    status: 403,
                    message: '没有权限'
                };
            }else{
                ctx.status = 403;
            }

            return false;
        }

    }
}

module.exports = AdminFilterPolicy;