
'use strict';


module.exports = {

    policy: {
        index: {
            '*': [ 'login_filter' ]
        },
        passport: {
            'index': [ 'session_user']
        },
        user: {
            '*': [ 'admin_filter']
        }
    }
};