/**
 * 发版任务详情
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps} from 'react-router';
import { Spin, Button, message } from 'antd';
import { IExistTask, TaskStatus, TaskStatusText } from 'dash/spa/interface/task';
import { getTaskDetail } from 'dash/spa/service/task';
import { IExistApp } from 'dash/spa/interface/app';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    task: IExistTask | null;
}

import './TaskDetail.scss';

class TaskDetail extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private taskId: number;

    //如果任务是进行中，自动轮训任务
    private refreshTimer: number | null;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            task: null
        };

        this.fetchTask = this.fetchTask.bind( this );
        this.showAppDetail = this.showAppDetail.bind( this );
        this.showTaskLog = this.showTaskLog.bind( this );
        this.showRelateVersionDetail = this.showRelateVersionDetail.bind( this );
    }

    componentDidMount(){
        const searchConf = qs.parse(location.search.substring(1));
        this.appId = parseInt(searchConf.appId, 10);
        this.taskId = parseInt(searchConf.taskId, 10);

        if( isNaN(this.appId) || isNaN(this.taskId)){
            message.error('appId taskId非法！');
            this.setState({
                isLoad: false,
                task: null
            });
            return;
        }

        this.fetchTask();
    }

    componentWillUnmount(){
        if( this.refreshTimer ){
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    fetchTask(){

        if( this.refreshTimer ){
            window.clearTimeout(this.refreshTimer);
        }
        this.refreshTimer = null;

        this.setState({
            isLoad: true
        });
        getTaskDetail(this.taskId, this.appId)
        .then( ({ app, task}) => {
            this.setState({
                isLoad: false,
                app: app,
                task: task
            });

            if( [TaskStatus.CREATED, TaskStatus.PROCESS, TaskStatus.FULL_PACKAGE_SUCCESS].indexOf(task.status) >= 0 ){
                //任务没有完成，轮训
                this.refreshTimer = window.setTimeout( this.fetchTask, 1000);
            }

        }).catch( (err) => {
            this.setState({
                isLoad: false,
                task: null
            });
            message.error(err.message);
        });
    }

    //跳转到APP详情页
    showAppDetail(){
        if( ! this.state.app ){
            return;
        }
        this.props.history.push(`/dash/apps/detail?appId=${this.state.app.id}`);
    }

    //查看任务日志
    showTaskLog(){
        if( ! this.state.task ){
            return;
        }

        window.open(`/dash/tasks/taskLog?appId=${this.state.app!.id}&taskId=${this.state.task!.id}`);
    }

    //跳转到RN版本详情页
    showRelateVersionDetail(){
        const task = this.state.task;
        if( ! task ){
            return;
        }
        if( task.packageId < 1 ){
            //没有生成对应的全量包
            return message.error(`没有生成对应的全量包`);
        }
        this.props.history.push(`/dash/apps/packageDetail?appId=${this.state.app!.id}&packageId=${task.packageId}`);

    }

    getInfoDom(){
        const { isLoad, task } = this.state;
        if( isLoad ){
            return null;
        }
        if( ! task ){
            return (
                <div>任务不存在，或没有权限</div>
            );
        }

        return (
            <div >
                <div>
                    <Button onClick={this.showTaskLog}>查看日志</Button>
                    <Button type="primary" onClick={this.showRelateVersionDetail}>查看版本详情</Button>
                    <Button onClick={this.showAppDetail}>查看应用详情</Button>
                </div>
                <div className="taskDetailInfoWrap">
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">任务ID</dt>
                        <dd className="taskInfoValue">{task.id}</dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">当前状态</dt>
                        <dd className="taskInfoValue">{ TaskStatusText[task.status]}</dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">AB Test配置</dt>
                        <dd className="taskInfoValue">
                            <pre>{task.abTest}</pre>
                        </dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">发版描述</dt>
                        <dd className="taskInfoValue">
                            <pre>{task.desc}</pre>
                        </dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">代码分支、tag、commit</dt>
                        <dd className="taskInfoValue">{task.branchName}</dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">上传全量包路径</dt>
                        <dd className="taskInfoValue">{task.uploadFullPackagePath}</dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">上传全量包md5</dt>
                        <dd className="taskInfoValue">{task.uploadFullPackageMd5}</dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">发版人</dt>
                        <dd className="taskInfoValue">{task.user ? task.user.name : '--'}</dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">任务提交时间</dt>
                        <dd className="taskInfoValue">{task.createdAt}</dd>
                    </dl>
                    <dl className="taskInfoItem">
                        <dt className="taskInfoLabel">任务最后更新时间</dt>
                        <dd className="taskInfoValue">{task.updatedAt}</dd>
                    </dl>
                </div>
            </div>
        );
    }

    render(){

        const { isLoad } = this.state;

        let loading = null;
        if(isLoad){
            loading = <Spin />;
        }

        return (
            <div>
                <h1>发版任务详情</h1>
                { loading }
                { this.getInfoDom() }
            </div>
        );
    }
}

export default withRouter(TaskDetail);

