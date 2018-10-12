/**
 * 根据请求中的 taskId ，读取详情
 * 因为目前有几处都会用到类似的获取任务详情，提到policy来，统一处理，避免拷贝代码
 * Created by Jess on 2018/1/18.
 */

'use strict';

class TaskFetchFilter extends leek.Policy{

    async execute(args){

        const ctx = this.ctx;

        const query =  (ctx.method === 'GET' ? ctx.query : ctx.request.body) || {};
        const taskId = query.taskId;

        if(  ! taskId ){
            ctx.error('taskId 不能为空');
            return false;
        }

        const app = ctx.state.app;

        const Task = ctx.app.model.Task;

        let task = null;

        //根据 taskId 读取详情
        try{
            task = await Task.findByTaskId(taskId);
        }catch(err){
            task = null;
            ctx.log.error(`[TaskFetchFilter]根据任务ID读取mysql异常  taskId[${taskId}] 错误信息: ${err.message}`);
        }

        if( ! task ){
            ctx.error(`未找到taskId[${taskId}]对应的任务！`);
            return false;
        }

        if( task.appId !== app.id ){
            ctx.error('taskId和appId不对应');
            return false;
        }

        ctx.state.task = task;
    }
}


module.exports = TaskFetchFilter;

