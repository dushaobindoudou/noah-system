/**
 * 任务相关的interface
 */

import { IUser } from './user';

export interface IExistTask{
    //任务ID
    id: number;
    branchName: string;
    uploadFullPackagePath: string;
    uploadFullPackageMd5: string;
    status: number;
    desc: string;
    abTest: string;
    packageId: number;
    user: IUser | null;
    createdAt: string;
    updatedAt: string;
};

