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
    status: TaskStatus;
    desc: string;
    abTest: string;
    packageId: number;
    user: IUser | null;
    createdAt: string;
    updatedAt: string;
};

//任务的各种状态
export enum TaskStatus{
    //已提交
    CREATED=0,
    //处理中
    PROCESS=1,
    //执行失败
    FAIL=2,
    //成功产出全量包
    FULL_PACKAGE_SUCCESS=3,
    //成功产出增量包
    DIFF_PACKAGE_SUCCESS=4,
    //删除增量包失败
    DIFF_PACKAGE_FAIL=5
};

//各种任务状态对应的文本
export const TaskStatusText = {
    [TaskStatus.CREATED]: '已提交',
    [TaskStatus.PROCESS]: '进行中',
    [TaskStatus.FAIL]: '失败',
    [TaskStatus.FULL_PACKAGE_SUCCESS]: '全量包OK',
    [TaskStatus.DIFF_PACKAGE_SUCCESS]: '增量包OK',
    [TaskStatus.DIFF_PACKAGE_FAIL]: '增量包失败'
};

