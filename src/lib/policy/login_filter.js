/**
 * 检测当前用户是否登录, 未登录跳转登录页面
 * Created by daifei on 2018/7/30
 */

'use strict';

class LoginPolicy extends leek.Policy{
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
                ctx.redirect('/passport/index/index');
            }

            return false;
        }

    }
}

module.exports = LoginPolicy;