/**
 * 发版任务详情
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps} from 'react-router';
import { Spin, Button, message } from 'antd';
import { IExistTask } from 'dash/spa/interface/task';
import { getTaskDetail } from 'dash/spa/service/task';
import { IExistApp } from 'dash/spa/interface/app';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    task: IExistTask | null;
}

import styles from './TaskDetail_.scss';

class TaskDetail extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private taskId: number;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            task: null
        };

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

    fetchTask(){
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

    }

    //查看任务日志
    showTaskLog(){

    }

    //跳转到RN版本详情页
    showRelateVersionDetail(){

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
                    <Button>查看日志</Button>
                </div>
                <div className="taskDetailInfoWrap">
                    <dl className={styles.taskInfoItem}>
                        <dt className={styles.taskInfoLabel}>任务ID</dt>
                        <dd className={styles.taskInfoValue}>{task.id}</dd>
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

