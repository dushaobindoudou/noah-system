/**
 * 获取请求中的登录态
 * Created by Jess on 2018/6/6.
 */

'use strict';

const Policy = leek.Policy;

class SessionPolicy extends Policy{

    async execute(data){

        const {ctx} = this;
        await ctx.initUser();
    }
}


module.exports = SessionPolicy;


