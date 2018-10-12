/**
 * 用户管理页面
 */

'use strict';

import * as React from 'react';
import {observer, inject} from "mobx-react";
import {Layout, message, Form, Input, Button, Select, Modal} from 'antd';
import axios from 'axios';
const {Header, Content} = Layout;
import UserList from './UserList/UserList';
import SessionStore, { User } from 'dash/spa/SessionStore/SessionStore';
import { IUser } from 'dash/spa/interface/user';

const FormItem = Form.Item;
const Option = Select.Option;

interface IUserManageProps{
    sessionStore?: SessionStore;
}

interface INewUser{
    name: string;
    pwd: string;
}

interface IUserManagerState{
    users: IUser[];
    isLoad: boolean;
    editUser: IUser | null;
    newUser: INewUser;
}

import './index.scss';

@inject('sessionStore')
@observer
export default class UserManage extends React.Component<IUserManageProps, IUserManagerState>{

    constructor(props: IUserManageProps){
        super(props);

        this.state = {
            users: [],
            isLoad: false,
            //当前编辑的用户
            editUser: null,
            //创建新用户信息
            newUser: {
                name: '',
                pwd: ''
            }
        };

        this.editUser = this.editUser.bind( this);
        this.updateNewUserName = this.updateNewUserName.bind( this );
        this.updateNewUserPwd = this.updateNewUserPwd.bind( this );
        this.doCreateUser = this.doCreateUser.bind( this );
        this.updateEditUserName = this.updateEditUserName.bind( this );
        this.updateEditUserPwd = this.updateEditUserPwd.bind( this );
        this.updateEditUserStatus = this.updateEditUserStatus.bind( this );
        this.doUpdateUser = this.doUpdateUser.bind( this );
    }

    componentDidMount(){
        this.refreshList();
    }

    //获取所有用户列表
    refreshList(){
        this.setState({
            isLoad: true
        });
        axios.get('/dash/user/list').then((res)=>{
            const out = res.data || {};
            if( out.status === 0 ){
                this.setState({
                    isLoad: false,
                    users: out.data || []
                });
                return;
            }
            return Promise.reject(new Error(out.message));

        }).catch( (err) => {
            this.setState({
                isLoad: false,
                users: []
            });
            message.error(err.message);
        });
    }

    updateNewUserName(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            newUser: Object.assign({}, this.state.newUser, {
                name: e.target.value
            })
        });
    }

    updateNewUserPwd(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            newUser: Object.assign({}, this.state.newUser, {
                pwd: e.target.value
            })
        });
    }

    doCreateUser(e: React.FormEvent){
        e.preventDefault();
        if( this.state.isLoad ){
            return;
        }
        this.setState({
            isLoad: true
        });
        axios.post('/dash/user/add',this.state.newUser).then((res)=>{
            const out = res.data || {};
            if( out.status === 0 ){
                this.setState({
                    isLoad: false,
                    newUser: {
                        name: '',
                        pwd: ''
                    }
                });
                //刷新列表
                this.refreshList();
                message.success('创建用户成功');
                return;
            }
            return Promise.reject(new Error(out.message));

        }).catch( (err) => {
            this.setState({
                isLoad: false,
            });
            message.error(err.message);
        });
    }

    get sessionStore(): SessionStore{
        return this.props.sessionStore as SessionStore;
    }

    editUser(user: IUser | null): void{
        this.setState({
            editUser: user,
        });
    }

    createUserDom(){

        const { newUser } = this.state;

        return (
            <Form layout="inline" onSubmit={this.doCreateUser}>
                <FormItem label="用户名">
                    <Input
                        type="text"
                        value={ newUser.name }
                        onChange={this.updateNewUserName}
                        style={{ width: '65%', marginRight: '3%' }}
                    />
                </FormItem>
                <FormItem label="密码">
                    <Input
                        type="text"
                        value={ newUser.pwd}
                        onChange={this.updateNewUserPwd}
                        style={{ width: '65%', marginRight: '3%' }}
                    />
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit">创建用户</Button>
                </FormItem>
            </Form>
        );
    }

    updateEditUserName(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            editUser: Object.assign({}, this.state.editUser, {
                name: e.target.value
            })
        });
    }

    updateEditUserPwd(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            editUser: Object.assign({}, this.state.editUser, {
                pwd: e.target.value
            })
        });
    }

    updateEditUserStatus(value:number){
        this.setState({
            editUser: Object.assign({}, this.state.editUser, {
                status: value
            })
        });
    }

    doUpdateUser(e: React.FormEvent){
        e.preventDefault();
        if( this.state.isLoad ){
            return;
        }
        this.setState({
            isLoad: true
        });
        axios.post('/dash/user/update',{
            userId: this.state.editUser.id,
            name: this.state.editUser.name,
            password: this.state.editUser.pwd,
            status: this.state.editUser.status,
        }).then((res)=>{
            const out = res.data || {};
            if( out.status === 0 ){
                this.setState({
                    isLoad: false,
                    editUser: null
                });
                //刷新列表
                this.refreshList();
                message.success('编辑用户成功');
                return;
            }
            return Promise.reject(new Error(out.message));

        }).catch( (err) => {
            this.setState({
                isLoad: false,
            });
            message.error(err.message);
        });
    }

    editUserModal(){

        const { editUser } = this.state;

        if( ! editUser ){
            return null;
        }

        return (
            <Modal title="编辑用户"
                   visible={true}
                   onOk={ this.doUpdateUser}
                   onCancel={ () => { this.editUser(null)}}
                   destroyOnClose={true}
                   okText="确定修改"
                   cancelText="取消">
                <Form onSubmit={this.doUpdateUser}>
                        <FormItem label="用户名">
                            <Input
                                type="text"
                                value={ editUser.name }
                                onChange={this.updateEditUserName}
                            />
                        </FormItem>
                        <FormItem label="密码">
                            <Input
                                type="text"
                                value={ editUser.pwd}
                                onChange={this.updateEditUserPwd}
                            />
                        </FormItem>
                        <FormItem label="是否启用账号">
                            <Select defaultValue={editUser.status} style={{ width: 120 }} onSelect={this.updateEditUserStatus}>
                                <Option value={User.STATUS_OK}>正常</Option>
                                <Option value={User.STATUS_DISABLE}>禁用</Option>
                            </Select>
                        </FormItem>
                    </Form>
            </Modal>
        );
    }

    render(){

        const createUserDom = this.createUserDom();
        const udpateUserDom = this.editUserModal();

        return (
            <div className="admin-user">
                <div>
                    { createUserDom }
                </div>
                <div className="user-list">
                    <UserList 
                    list={ this.state.users } 
                    sessionStore={ this.sessionStore } 
                    onEditUser={ this.editUser }
                    />
                </div>
                { udpateUserDom }
            </div>
        );
    }
}