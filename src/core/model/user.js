/**
 * 用户实体
 */

'use strict';

const bcrypt = require('bcrypt');

module.exports = function(mysqlClient){


    //用户表
    const TB_USER = 'tb_user';

    //管理员级别
    const LEVEL_ADMIN = 99;
    //普通用户级别
    const LEVEL_NORMAL = 1;

    //允许登录状态
    const STATUS_ENABLE = 1;
    //账户被禁用状态
    const STATUS_DISABLE = 2;

    class User {

        /**
         * 加密用户的密码原文
         * @param password {string} 原文密码
         * @returns {string} 加密之后的密码
         */
        static encryptPassword(password){
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            return hash;
        }

        /**
         * 根据 用户ID 查找用户
         * @param userId {int} 用户ID
         * @returns {Promise.<User>}
         */
        static async findById(userId){
            let result = await mysqlClient.select(TB_USER, {
                where : {
                    id : userId
                }
            });
            let data = result.results[0];
            let user = null;
            if( data ){
                user = new User( data );
            }
            return user;
        }

        /**
         * 根据 用户ID 批量查找用户
         * @param userIdList {Array} 用户ID数组
         * @returns {Promise.<User>}
         */
        static async findByIdList(userIdList){
            let result = await mysqlClient.select(TB_USER, {
                where : {
                    id : userIdList
                }
            });
            return result.results.map( function(obj){
                return new User(obj);
            });
        }

        /**
         * 根据用户名和密码，获取匹配的用户
         * @param userName {string} 用户名
         * @param password {string} 密码
         * @returns {Promise.<User>}
         */
        static async findByNamePassword(userName, password){
            let result = await mysqlClient.select(TB_USER, {
                where : {
                    name : userName
                }
            });
            let data = result.results[0];
            let user = null;
            if( data ){
                //对比数据库中的密码，和用户提供的密码
                if( bcrypt.compareSync(password, data.pwd) ){
                    user = new User( data );
                }
            }
            return user;
        }

        /**
         * 根据用户名来获取用户
         * @param userName {string} 用户名
         * @returns {Promise.<User>}
         */
        static async findByName(userName){
            let result = await mysqlClient.select(TB_USER, {
                where : {
                    name : userName
                }
            });
            let data = result.results[0];
            if( data ){
                return new User(data);
            }
            return null;
        }

        /**
         * 判断用户名是否已经存在
         * @param userName {string} 用户名
         * @returns {Promise.<boolean>}
         */
        static async isUserNameExist(userName){
            let user = await User.findByName(userName);
            return !! user;
        }

        /**
         * 读取mysql中用户总数
         * @returns {Promise.<number>}
         */
        static async count(){
            let total = 0;

            let temp = await mysqlClient.query(`select count(id) as num from ${TB_USER}`);
            let results = temp.results[0];
            total = results.num;

            return total;
        }

        /**
         * 获取用户列表数据
         * @param start {int} 偏移量
         * @param num {int} 返回数量
         * @returns {Promise.<Array>}
         */
        static async getList(start, num){
            let out = [];

            let arr = await mysqlClient.select(TB_USER, {
                orders : [
                    [ 'name', 'ASC' ]
                ],
                offset : start,
                limit : num
            });

            out = arr.results.map( function(obj){
                return new User(obj);
            });

            return out;
        }

        constructor(props){
            props = props || {};

            this.id = props.id;
            this.name = props.name;
            //用来判断用户是否修改了名字
            this.oldName = this.name;
            this.pwd = props.pwd;
            this.status = props.status || STATUS_ENABLE;
            this.level = props.level || LEVEL_NORMAL;
            this.createdAt = props.createdAt;
            this.updatedAt = props.updatedAt;
        }

        /**
         * 是否为管理员
         * @returns {boolean}
         */
        isAdmin(){
            return this.level === LEVEL_ADMIN;
        }

        /**
         * 设置用户是否为管理员
         * @param isAdmin {boolean} 管理员为true
         */
        setAdmin( isAdmin ){
            this.level = isAdmin ? LEVEL_ADMIN : LEVEL_NORMAL;
        }

        /**
         * 用户是否允许访问系统
         * @returns {boolean}
         */
        isEnable(){
            return this.status === STATUS_ENABLE;
        }

        /**
         * 设置用户是否启用
         * @param isEnable {boolean} 启用用户 true
         */
        setStatus(isEnable){
            this.status = isEnable ? STATUS_ENABLE : STATUS_DISABLE;
        }

        /**
         * 判断密码是否匹配
         * @param password {string} 密码
         * @returns {boolean}
         */
        isPasswordCorrect(password){
            return bcrypt.compareSync(password, this.pwd);
        }

        async save(){
            let isExist = ! isNaN( parseInt(this.id, 10) );
            let success = false;
            if( isExist ){
                //修改老用户
                success = await this.update();
            }else{
                //添加新用户
                let out = await mysqlClient.insert(TB_USER, {
                    name : this.name,
                    pwd : this.pwd,
                    status : this.status || STATUS_ENABLE,
                    level : this.level || LEVEL_NORMAL
                }, {
                    columns : [ 'name', 'pwd', 'status', 'level']
                } );
                const results = out.results;
                if(  results && results.affectedRows === 1 ){
                    //插入成功，更新 id
                    this.id = results.insertId;
                    success = true;
                }
            }
            return success;
        }

        /**
         * 更新已经存在的用户信息到数据库
         * @returns {Promise.<boolean>}
         */
        async update(){
            let success = false;

            let data = {
                pwd : this.pwd,
                status : this.status || STATUS_ENABLE,
                level : this.level || LEVEL_NORMAL
            };

            if( this.oldName !== this.name ){
                data.name = this.name;
            }

            let out = await mysqlClient.update(TB_USER, data, {
                    where : {
                        id : this.id
                    }
                }
            );
            const results = out.results;
            if( results && results.changedRows === 1 ){

                success = true;
            }

            return success;
        }

        toJSON(){
            return {
                id : this.id,
                name : this.name,
                isAdmin : this.isAdmin(),
                isEnable : this.isEnable()
            };
        }
    }

    return User;

};