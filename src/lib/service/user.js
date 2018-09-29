/**
 * 用户表的 数据库操作
 * Created by daifei on 2018/7/27
 */
'use strict';

const Service = leek.Service;

//用户表
const USER_TABLE = 'tb_user';

class UserService extends Service{
    //查询当前userId的用户信息
    async getUserInfoById(userId){
        let getUserSql = `SELECT * FROM  ${USER_TABLE} WHERE id= ? limit 1`;

        let result = await this.ctx.app.mysql.query(getUserSql,[userId]);
        return result.results[0];

    }
    //查询某个用户的密码
    async getUserInfoByName(userName){
        const { ctx } = this;
        let sql = `SELECT * FROM  ${USER_TABLE} WHERE name= ? `;
        let result = await ctx.app.mysql.query(sql,[userName]);
        return result.results[0];
    }
    /**
     * 创建用户
     * @param {string} name 用户名
     * @param {string} password 用户密码，加密之后的
     * @returns {boolean} 
     */
    async addUser(name, password){
        const { ctx } = this;
        const sql = `INSERT INTO ${USER_TABLE} (name,pwd) VALUES (?, ?)`;

        const result = await ctx.app.mysql.query(sql, [name, password]);
        return result.results.insertId === 1;
    }
    //查询所有用户信息
    async getAllUser(){
        let sql = `select * from ${USER_TABLE} order by createdAt desc`;
        let result = await this.ctx.app.mysql.query(sql);
        return result.results;
    }
    /**
     * 修改用户信息
     * @param {int} id 用户ID
     * @param {string} name 用户名
     * @param {string?} password 加密之后的密码
     * @returns {boolean}
     */
    async updateUser(id, name, password){
        let selectData = [name, id];
        let strData = ``
        if(password){
            selectData = [name, password, id];
            strData = `password = ?,`;
        }
        let sql = `UPDATE ${USER_TABLE} SET name = ?, ${strData}updatedAt = ? WHERE id = ?`;

        let result = await this.ctx.app.mysql.query(sql,selectData);
        return result.results.changedRows === 1;
    }
}

module.exports = UserService;