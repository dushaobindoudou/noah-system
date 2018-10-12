/**
 * app相关的后端接口
 */

import axios from 'axios';
import { IExistApp } from "../interface/app";

/**
 * 获取APP详情
 * @param appId {number}
 */
export function getAppDetail(appId: number): Promise<IExistApp>{
    return axios.get(`/dash/apps/appDetail?appId=${appId}`)
    .then( ({data}) => {
        if( data.status === 0 ){
            return data.data.app;
        }
        return Promise.reject( new Error(data.message));
    });
}

/**
 * 发布版本
 * @param data {object}
 */
export function publishApp(data: object): Promise<number>{
    return axios.post(`/dash/apps/publishApp`, data)
    .then( ({data}) => {
        if( data.status === 0 ){
            return data.data.taskId;
        }
        return Promise.reject( new Error(data.message));
    });
}