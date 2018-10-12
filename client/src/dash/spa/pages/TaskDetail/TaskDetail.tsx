/**
 * 发版任务详情
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps} from 'react-router';
import { Spin, Button, message } from 'antd';
import { IExistTask } from 'dash/spa/interface/task';
import { getTaskDetail } from 'dash/spa/service/task';

interface IState{
    isLoad: boolean;
    task: IExistTask | null;
}

class TaskDetail extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private taskId: number;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            task: null
        };

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
        .then( (task) => {
            this.setState({
                isLoad: false,
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

    render(){
        return (
            <div>
                <h1>发版任务详情</h1>
            </div>
        );
    }
}

export default withRouter(TaskDetail);

