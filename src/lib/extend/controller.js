/**
 *
 * Created by Jess on 2018/7/11.
 */

'use strict';

const LOG_KEY = Symbol('controller.log');

function extendLog(originArgs, user){
    let out = {};
    if( typeof originArgs === 'string' ){
        out.message = originArgs;
    }else{
        out = Object.assign({}, originArgs);
    }
    if( user ){
        out['OP_USER_NAME'] = user.name;
        out['OP_USER_ID'] = user.id;
    }else{
        out['OP_USER_NAME'] = '';
        out['OP_USER_ID'] = '';
    }
    return out;
}

module.exports = {

    async render(...args) {
        return this.ctx.render(...args);
    },

    json(data) {
        this.ctx.body = data;
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

    get log() {
        if( ! this[LOG_KEY] ){
            const ctx = this.ctx;
            const logObj = {};
            ['log', 'debug', 'info', 'warn', 'error', 'fatal'].forEach( (method) => {
                logObj[method] = function(args){
                    const finalArgs = extendLog(args, ctx.user);
                    return ctx.log[method](finalArgs);
                };
            });
            this[LOG_KEY] = logObj;
        }
        return this[LOG_KEY];
    }

};