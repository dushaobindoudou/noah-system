/**
 * 
 */

'use strict';

const Controller = leek.Controller;

class DashController extends Controller{

    async indexAction(){
        return this.render('dash/page/index/index.tpl')
    }

    /**
     * 返回当前登录用户数据
     */
    async currentUserAction(){
        let user = null;
        if( this.ctx.user ){
            user = Object.assign({}, this.ctx.user);
            delete user.pwd;
        }
        this.ok({
            user: user
        });
    }
}


module.exports = DashController;

