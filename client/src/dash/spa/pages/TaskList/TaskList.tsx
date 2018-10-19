/**
 * 任务列表页
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select, Table, Card, DatePicker } from 'antd';
import * as moment from 'moment';
import { IExistTask, TaskStatus, TaskStatusText } from 'dash/spa/interface/task';
import { IExistApp } from 'dash/spa/interface/app';
import { getTaskList } from 'dash/spa/service/task';
import { IUser } from 'dash/spa/interface/user';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    list: IExistTask[];
}

class TaskList extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private columns: any;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            list: []
        };

        this.columns = [
            {
                title: '任务自增ID',
                dataIndex: 'id',
                key: 'id',
                width: '100px',
                render: (id: number) => {
                    return <Button title="查看任务详情" onClick={ this.showTaskDetailPage.bind( this, id)}>{id}</Button>
                }
            },
            {
                title: 'native版本',
                dataIndex: 'appVersion',
                key: 'appVersion',
                width: '150px'
            },
            {
                title: '任务状态',
                dataIndex: 'status',
                render: (status: TaskStatus, row: IExistTask) => {
                    const style = {
                        color: ''
                    };
                    if( status === TaskStatus.FULL_PACKAGE_SUCCESS || status === TaskStatus.DIFF_PACKAGE_SUCCESS){
                        style.color = `green`;
                    }else if( status === TaskStatus.FAIL ){
                        style.color = `red`;
                    }else if( status === TaskStatus.DIFF_PACKAGE_FAIL ){
                        style.color = `pink`;
                    }
                    
                    return <div style={style}>{ TaskStatusText[status] }</div>;       
                }
            },
            {
                title: '发版人',
                dataIndex: 'publisher',
                key: 'publisher',
                render: (publisher: IUser | null, row: IExistTask) => {
                    return publisher ? publisher.name : '--';         
                }
            },
            {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (createdAt: string) => {
                    return moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
                }
            },
            {
                title: '最后更新时间',
                dataIndex: 'updatedAt',
                key: '最后更新时间',
                render: (updatedAt: string) => {
                    return moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
                }
            },
            
        ];
    }

    componentDidMount(){
        const searchConf = qs.parse(location.search.substring(1));

        this.appId = parseInt(searchConf.appId, 10);

        if( isNaN(this.appId) ){
            message.error(`appId错误`);
            this.setState({
                isLoad: false
            });
            return;
        }

        this.fetchTaskList();
    }

    fetchTaskList(){
        this.setState({
            isLoad: true
        });
        getTaskList(this.appId)
        .then( ({app, list}) => {
            this.setState({
                isLoad: false,
                app,
                list
            });
        })
        .catch( (err) => {
            this.setState({
                isLoad: false
            });
            message.error(err.message);
        });
    }

    /**
     * 跳转到任务详情页
     * @param taskId 任务ID
     */
    showTaskDetailPage(taskId: number){
        this.props.history.push(`/dash/tasks/detail?appId=${this.appId}&taskId=${taskId}`);
    }

    render(){
        return (
            <div>
                <h1>任务列表</h1>
                <Spin size="large" spinning={this.state.isLoad}>
                    <Table 
                        bordered
                        rowKey="id"
                        dataSource={this.state.list} 
                        columns={this.columns} />
                </Spin>
            </div>
        );
    }
}


export default withRouter(TaskList);


