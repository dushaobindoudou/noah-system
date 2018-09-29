/**
 * 用户表的 数据库操作
 * Created by daifei on 2018/7/27
 */
'use strict';

const Service = leek.Service;

class UserService extends Service{
    //查询当前userId的用户信息
    async getUserInfo(userId){
        let getUserSql = `SELECT id,name,role,updatedAt FROM  user WHERE id= ? limit 1`;

        let result = await this.ctx.app.mysql.query(getUserSql,[userId]);
        return result.results[0];

    }
    //查询某个用户的密码
    async findOne(userName){
        const { ctx } = this;
        let sql = `SELECT password,id FROM  user WHERE name= ? `;
        let result = await ctx.app.mysql.query(sql,[userName]);
        return result.results[0];
    }
    //添加用户  //addUser',name, password,role
    async addUser(name,password,role){
        const { ctx } = this;
        let sql = `INSERT INTO user (name,password,role) VALUES ("${name}","${password}","${role}")`;

        let result = await ctx.app.mysql.query(sql);
        return result.results;
    }
    //查询所有用户信息
    async getAllUser(){
        let sql = `select id,name,role,updatedAt from  user order by createdAt desc`;
        let result = await this.ctx.app.mysql.query(sql);
        return result.results;
    }
    //更新用户
    async updateUser(name, password, updatedAt, id){
        let selectData = [name,updatedAt,id];
        let strData = ``
        if(password){
            selectData = [name,password,updatedAt,id];
            strData = `password = ?,`;
        }
        let sql = `UPDATE user SET name = ?, ${strData}updatedAt = ? WHERE id = ?`;

        let result = await this.ctx.app.mysql.query(sql,selectData);
        return result.results;
    }
}

module.exports = UserService;