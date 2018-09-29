/**
 * 
 */

'use strict';

const bcrypt = require('bcrypt');

class DemoController extends leek.Controller{

    async loginAction(){
        await this.ctx.render('dash/page/demo/login/index.tpl');
    }

    async generatePwdAction(){
        const { ctx } = this;
        const body = ctx.request.body;
        const password = (body.password || '').trim();
        if( ! password ){
            return this.error('密码不能为空')
        }
        const salt = bcrypt.genSaltSync(10);
        const newPassword = bcrypt.hashSync(password, salt);
        this.ctx.body = newPassword;
    }
}



module.exports = DemoController;


