/**
 * 
 */

'use strict';

const send = require('koa-send');

const Controller = leek.Controller;

class TasksController extends Controller{

    async detailAction(){
        return this.render('dash/page/index/index.tpl');
    }

    /**
     * 获取某个任务详情
     * 因为发版任务是和APP关联的，所以必须提供 appId 和 taskId ，获取详情
     * appId 用来判断，当前用户是否有权限
     * @returns {Promise.<void>}
     */
    async taskDetailAction(){
        const ctx = this.ctx;
        const args = ctx.query;

        const task = ctx.state.task;
        const app = ctx.state.app;

        const User = ctx.app.model.User;

        let user = null;

        try{
            user = await User.findById(task.userId);
            if( user ){
                user = user.toJSON();
            }
        }catch(err){
            user = null;
            this.log.error(`[dash.tasks.taskDetailAction]根据任务的userId获取对应用户异常！ taskId[${task.id}] userId[${task.userId}]  错误信息： ${err.message}`);
        }

        this.ok({
            app: app,
            task : {
                id : task.id,
                branchName : task.branchName,
                uploadFullPackagePath: task.uploadFullPackagePath,
                uploadFullPackageMd5: task.uploadFullPackageMd5,
                status : task.status,
                desc : task.desc,
                abTest : task.abTest,
                packageId : task.packageId,
                user : user,
                createdAt : task.createdAt,
                updatedAt : task.updatedAt
            }
        });
    }

    /**
     * 查看某个APP的某一次发版任务的日志
     * @returns {Promise.<void>}
     */
    async taskLogAction(){

        const ctx = this.ctx;

        const task = ctx.state.task;
        const app = ctx.state.app;

        ctx.set('content-type', 'text/plain; charset=utf-8');

        let logFile = task.logFile;

        if( ! logFile ){
            return this.error(`该任务没有日志文件`);
        }

        this.log.info(`[User.taskLog]准备输出日志文件:  ${logFile}`);

        try{
            await send(ctx, logFile, {
                root: '/'
            });
        }catch(err){
            this.log.error(`[User.taskLog]读取日志文件流异常1 ！ 错误信息： ${err.message}`);
            this.error(`读取日志文件异常`);
        }
    }
}



module.exports = TasksController;

