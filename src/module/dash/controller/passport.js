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

    //修改密码页面
    async passwordManageAction(){
        return this.render('dash/page/index/index.tpl');
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

    /**
     * 用户修改自己的登录密码
     */
    async modifyPasswordAction(){
        const {ctx} = this;
        const body = ctx.request.body;

        const user = ctx.user;
        let {name,id} = user;

        let {oldPassword,newPassword} = body;

        if( ! user.isPasswordCorrect(oldPassword) ){
            //校验当前密码错误
            return this.error(`密码错误`);
        }

        this.log.info(`用户 ${name} 用户id ${id} 修改密码 `);
        const salt = bcrypt.genSaltSync(10);
        newPassword = bcrypt.hashSync(newPassword, salt);
        
        user.pwd = newPassword;

        const success = await user.save();

        if( success ){
            this.ok({});
        }else{
            this.error(`修改密码异常`);
        }

    }
}

module.exports = PassportIndexController;

