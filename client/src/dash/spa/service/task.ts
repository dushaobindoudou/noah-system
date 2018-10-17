/**
 * 任务相关后端接口
 */

import axios from 'axios';
import { IExistTask } from 'dash/spa/interface/task';
import { IExistApp } from '../interface/app';

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

