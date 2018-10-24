/**
 * 
 */

'use strict';

const send = require('koa-send');

const Controller = leek.Controller;

class TasksController extends Controller{

    //任务列表页
    async listAction(){
        return this.render('dash/page/index/index.tpl');
    }

    //任务详情页
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

    /**
     * 获取某个APP下的所有任务记录
     * @returns {Promise.<void>}
     */
    async taskListAction(){
        const ctx = this.ctx;
        const args = ctx.query;

        const appId = args.appId;

        const User = ctx.app.model.User;
        const Task = ctx.app.model.Task;

        const user = ctx.user;
        const app = ctx.state.app;

        let list = [];

        try{
            list = await Task.findByAppId(app.id, {
                orders : [ [ 'id', 'desc'] ]
            });
        }catch(err){
            this.log.error(`[dash.apps.taskListAction]获取APP的所有任务记录异常！ appId[${app.id}]  错误信息： ${err.message}`);
            return this.error(`获取任务列表失败！`);
        }

        //获取每次任务对应的用户信息
        list = list.map( (obj) => {
            return User.findById(obj.userId).then( (user) => {
                if( user ){
                    obj.user = user.toJSON();
                }
                return obj;
            }).catch( () => {
                return obj;
            }).then( (data) => {
                return {
                    id : data.id,
                    appId: data.appId,
                    userId: data.userId,
                    branchName : data.branchName,
                    appVersion: data.appVersion,
                    packageId: data.packageId,
                    uploadFullPackagePath: data.uploadFullPackagePath,
                    uploadFullPackageMd5: data.uploadFullPackageMd5,
                    status : data.status,
                    abTest: data.abTest,
                    desc: data.desc,
                    logFile: data.logFile,
                    publisher : data.user,
                    createdAt : data.createdAt,
                    updatedAt : data.updatedAt
                };
            });
        });

        try{
            list = await Promise.all( list );
        }catch(err){
            this.log.error(`[dash.apps.taskListAction]获取APP的所有任务记录对应的操作用户异常！ appId[${app.id}]  错误信息： ${err.message}`);
            return this.error(`获取任务列表中的用户信息失败！`);
        }

        this.ok({
            app,
            list,
        });
    }
}



module.exports = TasksController;

