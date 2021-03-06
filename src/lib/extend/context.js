/**
 * 扩展框架默认的 Context 对象
 * Created by Jess on 2018/6/5.
 */

'use strict';

const USER_KEY = Symbol('user');

module.exports = {

    get clientInfo() {
        return {
            ua: this.header['user-agent'],
            ip: this.ip
        };
    },

    json(data) {
        this.body = data;
    },

    error(msg) {
        this.json({
            status: -1,
            message: msg,
        });
    },

    ok(data, msg) {
        this.json({
            status: 0,
            message: msg || 'ok',
            data: data
        });
    },

    /**
     * 判断当前请求，是否是 Ajax 的
     * @return {boolean}
     */
    get xhr(){
        return this.header['x-requested-with'] === 'XMLHttpRequest';
    },

    //初始化 当前的用户信息
    async initUser() {

        const User = this.app.model.User;
        let userId = this.session.userId || '';

        let result = null;
        if (userId) {
            result = await User.findById(userId);
        }

        this.assign({"user": result});
        this[USER_KEY] = result;
    },

    //获取用户信息
    get user() {
        return this[USER_KEY];
    }
};


