/**
 *
 * Created by Jess on 2018/6/6.
 */

'use strict';

const Controller = leek.Controller;
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

class PassportIndexController extends Controller{

    async indexAction(){
        const {ctx} = this;
        let userId = ctx.session.userId;

        if(userId){
            //已经登录
            ctx.response.redirect('/')
            return ;
        }
        //读取上一次登陆的错误信息
        let loginError = ctx.session.loginError;

        ctx.session.loginError = null;
        this.ctx.assign({
            loginError,
        });
        //let addUser = await ctx.callService('user.addUser',{name: 'test1',password:'123456',role:1});
        //var hash = bcrypt.hashSync("123456", salt);

        return this.render('passport/page/login/login.tpl')
    }
    //退出登录
    async outAction(){
        const {ctx} = this;
        ctx.session.userId = null;
        //跳转到登陆页
        return ctx.response.redirect('/passport/index/index');
    }
    //登录
    async doLoginAction(){
        const {ctx} = this;
        const body = ctx.request.body;

        const {password,userName} = body;

        const result = await ctx.callService('user.findOne',userName);

        if(result){
            //登录成功
            let oldPassword = result.password || '';

            let validate = bcrypt.compareSync(password, oldPassword);

            //密码是否正确
            if(validate){
                const userId = result.id;
                ctx.session.userId = userId;
                this.afterLoginJump();
                return;
            }else{
                ctx.session.loginError = '账号或密码错误';
            }
        }else{
            ctx.session.loginError = '用户不存在';
        }

        return ctx.redirect('/passport/index/index');
    }
    //登陆之后, 跳转页面逻辑
    afterLoginJump(){
        let {ctx} = this;
        let session = ctx.session;
        let url = session.loginJump || '/';

        ctx.redirect( url );

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

        let {oldPassword,newPassword,updatedAt} = body;

        this.log.info(`用户 ${name} 用户id ${id} 在 ${updatedAt} 修改密码 `);

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

