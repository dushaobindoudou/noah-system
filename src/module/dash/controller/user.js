/**
 * 用户管理相关接口
 */

'use strict';

const moment = require('moment');
const bcrypt = require('bcrypt');

const Controller = leek.Controller;

class UserController extends Controller{

    //用户列表页面
    async indexAction(){
        return this.render('dash/page/index/index.tpl');
    }
    async listAction(){
        const ctx = this.ctx;
        const query = ctx.query;

        let result = await ctx.callService('user.getAllUser');

        if(result){

            const users = result.map( (obj) => {
                return {
                    id: obj.id,
                    name: obj.name,
                    updatedAt: moment(obj.updatedAt).format('YYYY-MM-DD HH:mm'),
                    status: obj.status,
                };
            });
            ctx.body = {
                status : 0,
                data : users,
                message : '成功'
            }
        }else{
            ctx.body = {
                status : -1,
                message : '查询失败'
            }

        }

    }

    /**
     * 修改某个用户的信息
     * 可以修改 name  pwd  status
     */
    async updateAction(){
        const ctx = this.ctx;
        const body = ctx.request.body;
        let {password='',name, userId, status} = body;

        status = parseInt(status, 10);

        if(password){
            password = bcrypt.hashSync(password, salt);
        }

        name = name.trim();
        if(!name){
            return this.error('修改用户名不能为空');
        }

        let targetUser = null;
        try{
            targetUser = await this.callService('user.getUserInfoById', userId);
        }catch(err){
            this.log.error(`[dash.user.updateAction]获取要编辑的用户信息失败  userId[${userId}]  错误信息： ${err.message}`);
            return this.error(`查询用户信息失败`);
        }

        if( ! targetUser ){
            return this.error(`要编辑的用户不存在`);
        }

        //如果当前修改了用户名字 就查找 是否有同名字
        if(name !== targetUser.name){
            const userInfo = await ctx.callService('user.getUserInfoByName',name);
            if(userInfo){
                return this.error('用户名已经存在');
            }
        }

        if( ! password ){
            password = targetUser.pwd;
        }

        if( password === targetUser.pwd && name === targetUser.name && status === targetUser.status){
            //没有改动，不用修改数据库
            return this.error('没有修改信息，不用更新');
        }

        //更新当前用户信息
        let result = await ctx.callService('user.updateUser', id,name, password, status);

        if(result){
            this.ok({
                success: true
            });
        }else{
            this.error('修改用户失败');
        }



    }
    //添加用户
    async addAction(){
        const ctx = this.ctx;
        const body = ctx.request.body;
        let {pwd,name} = body;
        const level = 1;
        name = name.trim();
        pwd = pwd.trim();
        if( ! name || ! pwd ){
            return this.error('用户名和密码必填');
        }
        //查询当前用户名 是否存在
        let userInfo = await ctx.callService('user.getUserInfoByName',name);

        if(!userInfo){
            const salt = bcrypt.genSaltSync(10);
            const password = bcrypt.hashSync(pwd, salt);
            let result = await ctx.callService('user.addUser',name, password,level);

            if(result){
                this.ok({
                    id: result
                });
            }else{
                this.error('添加用户失败');
            }
        }else{
            this.error('用户名已经存在');
        }

    }
}


module.exports = UserController;

