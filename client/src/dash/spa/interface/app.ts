import { IUser } from "./user";
import { IExistTask } from "./task";

/**
 * 应用 相关的接口申明
 */


// app 平台
export const enum AppPlatform{
    android=1,
    ios=2,
}

//app 基本信息
export interface IApp{
    name: string;
    platform: AppPlatform;
    entryFile: string;
    bundleName: string;
    gitUrl: string;
    desc: string;
}

//创建好的APP信息
export interface IExistApp extends IApp{
    id: number;
    appKey: string;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
    owner: any;
}

//全量包对外开放的状态
export enum PackageStatus{
    //禁止下载
    DISABLE= 1,
    //开放下载
    ENABLE=2
}

//全量包对外开放的状态文案
export const PackageStatusMap = {
    [PackageStatus.DISABLE]: '[1]禁止下载',
    [PackageStatus.ENABLE]: '[2]开放下载'
};

//全量包是否强制更新
export enum PackageForceUpdate{
    //不强制更新
    NO_FORCE=0,
    //强制更新
    FORCE=1,
}

export const PackageForceUpdateText = {
    [PackageForceUpdate.FORCE]: `[${PackageForceUpdate.FORCE}]强制更新`,
    [PackageForceUpdate.NO_FORCE]: `[${PackageForceUpdate.NO_FORCE}]不强制更新`
};

//是否开放增量包下载
export enum PackageDisablePatch{
    //开放下载
    ENABLE=0,
    //禁止下载
    DISABLE=1
}

export const PackageDisablePatchText = {
    [PackageDisablePatch.ENABLE]: `[${PackageDisablePatch.ENABLE}]允许增量更新`,
    [PackageDisablePatch.DISABLE]: `[${PackageDisablePatch.DISABLE}]禁止增量更新`
};

//全量包
export interface IPackage{
    id: number;
    packageVersion: number;
    appVersion: string;
    desc: string;
    abTest: string;
    status: PackageStatus;
    md5: string;
    filePath: string;
    userId: number;
    forceUpdate: PackageForceUpdate;
    disablePatch: PackageDisablePatch;
    createdAt: string;
    updatedAt: string;
    //发布这个版本的用户
    publisher?: IUser;
    //这个版本对应的发布任务
    task?: IExistTask;
}

//增量包entity定义
export interface IPatch{
    id: number;
    appId: number;
    packageId: number;
    packageVersion: number;
    compareVersion: number;
    md5: string;
    filePath: string;
    createdAt: string;
    updatedAt: string;
}

//用户和APP的权限
export enum AppUserAccess{
    //没有权限
    NO=1,
    //读权限
    READ=2,
    //写权限
    WRITE=3
};

//各种权限对应文案
export const AppUserAccessText = {
    [AppUserAccess.NO]: `[${AppUserAccess.NO}]无权限`,
    [AppUserAccess.READ]: `[${AppUserAccess.READ}]只读`,
    [AppUserAccess.WRITE]: `[${AppUserAccess.WRITE}]写权限`
};

//APP对应用户权限列表中，每个用户的数据结构
export interface IAppUser extends IUser{
    canRead: boolean;
    canWrite: boolean;
    access: AppUserAccess;
}