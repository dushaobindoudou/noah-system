/**
 *
 * Created by Jess on 2018/6/6.
 */

'use strict';

const Controller = leek.Controller;
const bcrypt = require('bcrypt');

class PassportIndexController extends Controller{

    async indexAction(){
        const {ctx} = this;
        let userId = ctx.session.userId;

        if(userId){
            //已经登录
            ctx.response.redirect('/')
            return ;
        }

        return this.render('dash/page/login/index.tpl')
    }
    //退出登录
    async outAction(){
        const {ctx} = this;
        ctx.session.userId = null;
        //跳转到登陆页
        ctx.response.redirect('/dash/passport');
    }
    //登录，异步接口
    async doLoginAction(){
        const {ctx} = this;
        const body = ctx.request.body;

        const {password,userName} = body;

        const result = await ctx.callService('user.getUserInfoByName',userName);

        if(result){
            //登录成功
            let oldPassword = result.pwd || '';

            let validate = bcrypt.compareSync(password, oldPassword);

            //密码是否正确
            if(validate){

                if(result.status === 2 ){
                    return this.error('用户被禁用');
                }

                const userId = result.id;
                ctx.session.userId = userId;
                const url = ctx.session.loginJump || '/';
                this.ok({
                    url: url
                });
                return;
            }else{
                this.error('密码错误');
            }
        }else{
            this.error('用户不存在');
        }
    }
   
    async modifyAction(){
        return this.render('passport/page/modify/modify.tpl')
    }

    async modifyPasswordAction(){
        const {ctx} = this;
        const body = ctx.request.body;

        await ctx.initUser();
        const user = ctx.user || {};
        let {name,id} = user;

        let {oldPassword,newPassword} = body;

        this.log.info(`用户 ${name} 用户id ${id} 修改密码 `);
        const salt = bcrypt.genSaltSync(10);
        newPassword = bcrypt.hashSync(newPassword, salt);
        if(name){
            let result = await ctx.callService('user.findOne',name);
            //查询当前用户是否成功
            if(result){
                let dbPassword = result.password || '';

                let validate = bcrypt.compareSync(oldPassword, dbPassword);

                //密码是否正确
                if(validate){

                    let modifyResult = await ctx.callService('user.updateUser',name, newPassword, updatedAt, id);
                    if(modifyResult && modifyResult.affectedRows == 1){
                        ctx.body = {
                            message : '成功',
                            status : 0
                        }
                    }else{
                        ctx.body = {
                            message : '密码修改失败',
                            status : -1
                        }
                    }
                }else{
                    ctx.body = {
                        message : '用户输入原密码不正确',
                        status : -1
                    }
                }
            }
        }else{
            ctx.body = {
                message : '请用户重新登录',
                status : -1
            }
        }

    }
}

module.exports = PassportIndexController;

