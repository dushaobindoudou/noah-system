/**
 * 任务相关后端接口
 */

import axios from 'axios';
import { IExistTask } from 'dash/spa/interface/task';
import { IExistApp } from '../interface/app';


interface ITaskListResult{
    app: IExistApp;
    list: IExistTask[];
}

/**
 * 获取某个APP下的所有发版任务列表
 * @param appId 
 */
export function getTaskList(appId: number): Promise<ITaskListResult>{
    return axios.get(`/dash/tasks/taskList`, {
        params: {
            appId: appId,
        }
    }).then( ( {data: out}) => {
        if( out.status === 0 ){
            return out.data;
        }
        return Promise.reject( new Error(out.message));
    });
}

interface TaskDetailResult {
    app: IExistApp,
    task: IExistTask
}

export function getTaskDetail(taskId: number, appId: number): Promise<TaskDetailResult>{
    return axios.get(`/dash/tasks/taskDetail`, {
        params: {
            appId: appId,
            taskId: taskId
        }
    }).then( ( {data: out}) => {
        if( out.status === 0 ){
            return out.data;
        }
        return Promise.reject( new Error(out.message));
    });
}

