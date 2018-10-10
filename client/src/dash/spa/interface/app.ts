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
}

