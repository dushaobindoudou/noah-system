/**
 * 简单封装 console.log
 * Created by Jess on 2017/12/18.
 */

'use strict';



function createLog(namespace){

    return {
        log(){
            const now = new Date();
            const args = [].slice.call(arguments);
            args.unshift( `${namespace}[${now.toLocaleString()}]` );
            console.log.apply(console, args);
        },

        error(){
            const now = new Date();
            const args = [].slice.call(arguments);
            args.unshift( `${namespace}[${now.toLocaleString()}]` );
            console.error.apply(console, args);
        }
    };
}


module.exports = createLog;

