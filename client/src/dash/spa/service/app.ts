/**
 * app相关的后端接口
 */

import axios from 'axios';
import { IExistApp, IPackage, IPatch, IAppUser } from "../interface/app";

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

//全量包列表返回数据结构
export interface PackageListResult{
    app: IExistApp;
    list: IPackage[];
}

/**
 * 按照某些条件，查询某个APP的全量包列表
 * @param data 
 */
export function getPackageList(data: any): Promise<PackageListResult>{
    return axios.get(`/dash/apps/versionList`, { params: data})
    .then( ({data}): any => {
        if( data.status === 0 ){
            return {
                app: data.data.app,
                list: data.data.list
            };
        }
        return Promise.reject( new Error(data.message));
    });
}

export interface PackageDetailResult{
    app: IExistApp;
    fullPackage: IPackage;
}

/**
 * 获取全量包信息
 * @param data 
 */
export function getPackageDetail(data: object): Promise<PackageDetailResult>{
    return axios.get(`/dash/apps/versionDetail`, { params: data})
    .then( ({data}): any => {
        if( data.status === 0 ){
            return {
                app: data.data.app,
                fullPackage: data.data.package
            };
        }
        return Promise.reject( new Error(data.message));
    });
}

/**
 * 更新某个全量包的一些字段
 * @param data 
 */
export function updatePackage(data: any): Promise<IPackage>{
    return axios.post(`/dash/apps/updatePackage`, data)
    .then( ({data}) => {
        if( data.status === 0 ){
            return data.data.fullPackage;
        }
        return Promise.reject( new Error(data.message));
    });
}

type PatchList = Array<IPatch>;

export interface IPatchListResult{
    app: IExistApp;
    fullPackage: IPackage;
    patchList: PatchList;
}

/**
 * 获取某个APP下，某个全量包对应的增量包列表
 * @param data 
 */
export function getPatchList(data: any): Promise<IPatchListResult>{
    return axios.get(`/dash/apps/patchList`, { params: data})
    .then( ({data}): any => {
        if( data.status === 0 ){
            return {
                app: data.data.app,
                fullPackage: data.data.fullPackage,
                patchList: data.data.patchList
            };
        }
        return Promise.reject( new Error(data.message));
    });
}

export interface IAppUserListResult{
    app: IExistApp;
    users: IAppUser[];
} 

/**
 * 获取某个APP下，有权限的用户列表
 * @param data 
 */
export function getAppUsers(appId: number): Promise<IAppUserListResult>{
    const data = {
        appId,
    };
    return axios.get(`/dash/apps/userList`, { params: data})
    .then( ({data}): any => {
        if( data.status === 0 ){
            return {
                app: data.data.app,
                users: data.data.users,
            };
        }
        return Promise.reject( new Error(data.message));
    });
}

/**
 * 修改某个APP下，某个用户的权限
 * @param data 
 */
export function updateUserAccess(data: any): Promise<void>{
    return axios.post(`/dash/apps/updateUser`, data)
    .then( ({data}): any => {
        if( data.status === 0 ){
            
        }else{
            return Promise.reject( new Error(data.message));
        }
    });
}