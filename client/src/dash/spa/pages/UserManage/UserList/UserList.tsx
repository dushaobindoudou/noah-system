/**
 * 用户列表
 */

import * as React from 'react';
import { Table, Button, Spin, Modal,  Form, Input, Icon, InputNumber, Row, Col, message } from 'antd';
import SessionStore, { User } from 'dash/spa/SessionStore/SessionStore';
import { IUser } from 'dash/spa/interface/user';

export interface IEditUserCallback{
    (user: IUser): void;
}

export interface IUserListProps{
    list: IUser[];
    onEditUser: IEditUserCallback;
    sessionStore: SessionStore;
}


export default class UserList extends React.Component<IUserListProps>{

    private columns: any;

    constructor(props: IUserListProps){
        super(props);

        const user = this.props.sessionStore.user;

        this.columns = [
            {
                title: '用户名',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '上次更新时间',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
            },
            {
                title: '是否禁用',
                dataIndex: 'status',
                key: 'status',
                render: (status: number, row: IUser) => {
                    if( row.status === User.STATUS_DISABLE){
                        return <span style={ {color: 'red'}}>禁用</span>;
                    }
                    return '--';
                }
            },
            {
                title: '操作',
                dataIndex: 'id',
                key: 'id',
                render: (id: number,text: IUser) => {
                    if( text.level !== User.LEVEL_ADMIN){
                        return (
                            <a href="javascript:" onClick={()=> this.props.onEditUser(text)}>编辑</a>
                        );
                    }else{
                        return '--';
                    }

                }
            }
        ];
    }

    render(){
        return (
            <div>
                <Table dataSource={this.props.list} columns={this.columns} />
            </div>
        );
    }
}

