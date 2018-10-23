/**
 * 用户相关接口
 */

import axios from 'axios';


export interface IModifyPasswordParam{
    oldPassword: string;
    newPassword: string;
}

/**
 * 用户修改自己的登录密码
 * @param data 
 */
export function modifyPassword(data: IModifyPasswordParam): Promise<void>{
    return axios.post(`/dash/passport/modifyPassword`, data)
    .then( ({data}): any => {
        if( data.status === 0 ){
            
        }else{
            return Promise.reject( new Error(data.message));
        }
    });
}