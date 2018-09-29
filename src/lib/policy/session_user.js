/**
 * 获取请求中的登录态
 * Created by Jess on 2018/6/6.
 */

'use strict';

const Policy = leek.Policy;

class SessionPolicy extends Policy{

    async execute(data){
        // console.log(`data in session_user policy: `, data);
        //
        // let user = await new Promise( (resolve, reject) => {
        //     setTimeout( () => {
        //         resolve({
        //             name: 'kassie',
        //             age: 19,
        //             school: 'nwpu'
        //         });
        //     }, 10);
        // });
        //
        // this.ctx.user = user;
        // this.ctx.params.through = 'session_user';

        let {ctx} = this;
        await ctx.initUser();
    }
}


module.exports = SessionPolicy;


