/**
 * APP和该APP下的用户列表
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select, Table, Card, DatePicker } from 'antd';
import * as moment from 'moment';
import { IAppUser, AppUserAccess, AppUserAccessText, IExistApp } from 'dash/spa/interface/app';
import { getAppUsers } from 'dash/spa/service/app';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    users: IAppUser[];
}

class AppUsers extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private columns: any;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            users: []
        };

        this.columns = [
            {
                title: '用户ID',
                dataIndex: 'id',
                key: 'id',
                width: '100px',
            },
            {
                title: '用户名',
                dataIndex: 'name',
                key: 'name',
                width: '150px'
            },
            {
                title: '权限',
                key: 'access',
                render(access: AppUserAccess, row: IAppUser){
                    return AppUserAccessText[access];
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

        this.fetchUserList();
    }

    fetchUserList(){
        this.setState({
            isLoad: true
        });

        getAppUsers(this.appId)
        .then( ({app, users}) => {
            this.setState({
                isLoad: false,
                app,
                users
            });
        })
        .catch( (err) => {
            this.setState({
                isLoad: false,
                app: null,
                users: []
            });
            message.error(err.message);
        });
    }

    render(){
        return (
            <div>
                <h1>APP关联的用户</h1>
                <Spin size="large" spinning={this.state.isLoad}>
                    <Table 
                        bordered
                        rowKey="id"
                        dataSource={this.state.users} 
                        columns={this.columns} />
                </Spin>
            </div>
        );
    }
}


export default withRouter(AppUsers);

