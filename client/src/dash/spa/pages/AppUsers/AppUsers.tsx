/**
 * APP和该APP下的用户列表
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select, Table, Card, DatePicker } from 'antd';
import * as moment from 'moment';
import { IAppUser, AppUserAccess, AppUserAccessText, IExistApp } from 'dash/spa/interface/app';
import { getAppUsers, updateUserAccess } from 'dash/spa/service/app';

interface IUserAccessSimple{
    //是否新创建的权限
    isNew: boolean;
    userName: string;
    access: AppUserAccess;
}

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    users: IAppUser[];
    //是否正在更新某个用户权限
    isUpdating: boolean;
    //编辑弹窗是否可见
    editorVisible: boolean;
    editorData: IUserAccessSimple;
}

const FormItem = Form.Item;
const Option = Select.Option;

class AppUsers extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private columns: any;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            users: [],
            isUpdating: false,
            editorVisible: false,
            editorData: {
                isNew: true,
                userName: '',
                access: AppUserAccess.NO
            }
        };

        this.updateEditorUserName = this.updateEditorUserName.bind( this );
        this.updateEditorAccess = this.updateEditorAccess.bind( this );
        this.doUpdateAccess = this.doUpdateAccess.bind( this );
        this.closeEditor = this.closeEditor.bind( this );

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
                dataIndex: 'access',
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
            {
                title: '操作',
                key: 'op',
                render: (_: any, row: IAppUser) => {
                    return (
                        <Button type="danger" onClick={ this.showEditor.bind(this, row)}>修改权限</Button>
                    );
                }
            }
        ];
    }

    componentDidMount(){

        document.title = 'APP用户权限管理';

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

    closeEditor(){
        this.setState({
            editorVisible: false,
            editorData: {
                isNew: true,
                userName: '',
                access: AppUserAccess.NO
            }
        });
    }

    showEditor(data?: IAppUser){
        const isNew = ! data;
        const userName = data ? data.name : '';
        const access = data ? data.access : AppUserAccess.NO;
        const editorData = {
            isNew,
            userName: userName,
            access: access
        }
        
        this.setState({
            editorVisible: true,
            editorData: editorData
        });
    }

    updateEditorUserName(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            editorData: {
                ... this.state.editorData,
                userName: e.target.value
            }
        });
    }

    updateEditorAccess(v: AppUserAccess){
        this.setState({
            editorData: {
                ... this.state.editorData,
                access: v
            }
        });
    }

    //提交用户权限修改
    doUpdateAccess(){
        if( this.state.isUpdating ){
            return;
        }
        const editorData = this.state.editorData;
        if( ! editorData.userName ){
            message.error('用户名不能为空');
            return;
        }
        this.setState({
            isUpdating: true
        });
        updateUserAccess({
            appId: this.appId, 
            userName: editorData.userName, 
            access: editorData.access
        }).then( () => {
            //修改成功
            this.setState({
                isUpdating: false,
                editorVisible: false,
                editorData: {
                    isNew: true,
                    userName: '',
                    access: AppUserAccess.NO,
                }
            });
            message.success(`修改权限成功`);
            this.fetchUserList();
        })
        .catch( (err) => {
            this.setState({
                isUpdating: false
            });
            message.error(err.message);
        });
    }

    getEditorModal(){

        const { editorData } = this.state;

        return (
            <Modal title={ editorData.isNew ? '新增权限' : '修改权限'}
                width="700px"
                visible={ this.state.editorVisible }
                onOk={ this.doUpdateAccess}
                onCancel={ this.closeEditor }
                destroyOnClose={true}
                okText="确定修改"
                cancelText="取消">
                <Form onSubmit={this.doUpdateAccess}>
                    <FormItem label="用户名">
                        <Input
                            type="text"
                            disabled={ ! editorData.isNew }
                            value={ editorData.userName }
                            onChange={ this.updateEditorUserName }
                        />
                    </FormItem>
                    <FormItem label="权限">
                        <Select defaultValue={editorData.access} style={{ width: 220 }} onChange={ this.updateEditorAccess } >
                            <Option value={ AppUserAccess.NO}>{ AppUserAccessText[AppUserAccess.NO] }</Option>
                            <Option value={ AppUserAccess.READ}>{ AppUserAccessText[AppUserAccess.READ] }</Option>
                            <Option value={ AppUserAccess.WRITE}>{ AppUserAccessText[AppUserAccess.WRITE] }</Option>
                        </Select>
                    </FormItem>
                </Form>
            </Modal>
        );
    }

    render(){
        return (
            <div>
                <h1>APP关联的用户</h1>
                <Spin size="large" spinning={this.state.isLoad}>
                    <div>
                        <Button type="primary" onClick={ () => { this.showEditor(); } }>新增用户权限</Button>
                    </div>
                    <Table 
                        bordered
                        rowKey="id"
                        dataSource={this.state.users} 
                        columns={this.columns} />
                </Spin>
                { this.getEditorModal() }
            </div>
        );
    }
}


export default withRouter(AppUsers);

