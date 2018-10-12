/**
 * 任务相关后端接口
 */

import axios from 'axios';
import { IExistTask } from 'dash/spa/interface/task';

export function getTaskDetail(taskId: number, appId: number): Promise<IExistTask>{
    return axios.get(`/dash/apps/taskDetail`, {
        params: {
            appId: appId,
            taskId: taskId
        }
    }).then( ( {data: out}) => {
        if( out.status === 0 ){
            return out.data.task;
        }
        return Promise.reject( new Error(out.message));
    });
}

