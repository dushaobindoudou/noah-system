/**
 * dash 后台单页入口
 */

import * as React from 'react';
import {observer, Provider} from "mobx-react";
import {Layout, Menu, Breadcrumb, Icon,Button, Spin} from 'antd';
import {
    Router,
    Route,
    Link
} from 'react-router-dom';

import history from 'common/ui/history/history';

import SessionStore from './SessionStore/SessionStore';
import SideMenu from './SideMenu/SideMenu';

///页面
import Home from './pages/Home/index';
import UserManage from './pages/UserManage/index';
import CreateApp from './pages/CreateApp/CreateApp';
import {OwnAppList, ReadAppList, WriteAppList} from './pages/AppList/AppList';
import AppDetail from './pages/AppDetail/index';
import AppUsers from './pages/AppUsers/AppUsers';
import PublishApp from './pages/PulibshApp/PublishApp';
import TaskList from './pages/TaskList/TaskList';
import TaskDetail from './pages/TaskDetail/TaskDetail';
import PackageList from './pages/PackageList/PackageList';
import PackageDetail from './pages/PackageDetail/PackageDetail';
import PatchList from './pages/PatchList/PatchList';
import PasswordManage from './pages/PasswordManage/PasswordManage';


const {Header, Content, Sider} = Layout;

import './index.scss';

@observer
export default class App extends React.Component<any, any> {

    private sessionStore: SessionStore;

    constructor(props: any){
        super(props);

        this.sessionStore = new SessionStore();     
        
        this.showPasswordManage = this.showPasswordManage.bind( this );
    }

    componentDidMount(){
        this.sessionStore.init();
    }

    //跳转到修改密码页面
    showPasswordManage(){
        history.push(`/dash/passport/passwordManage`);
    }

    render() {

        const sessionStore = this.sessionStore;

        if( ! sessionStore.isReady ){
            //正在请求登录信息，显示加载中
            return (
                <Spin size="large"></Spin>
            );
        }

        if( ! sessionStore.isLogin ){
            //未登录
            return (
                <a href="/dash/passport">请先登录</a>
            );
        }

        const user = sessionStore.user!;
        const name = user.name;
        return (
            <Provider sessionStore={sessionStore}>
                <Router history={history}>
                    <div className="app">
                        <Layout style={{height: '100vh'}}>
                            <Header>
                                <a className="logo" href="/">Noah System</a>
                                <div className="header-right-box">
                                    <span className="user-name">登录用户：{name}</span>
                                    <Button onClick={ this.showPasswordManage } style={{marginRight: '10px'}}>修改密码</Button>
                                    <Button type="danger" href="/dash/passport/out">退出</Button>
                                </div>
                            </Header>
                            <Layout style={{flex: 1}}>
                                <SideMenu/>
                                <Content style={{background: '#fff'}}>
                                    <Route path="/" exact component={Home}/>
                                    <Route path="/dash/user" exact component={UserManage}/>
                                    <Route path="/dash/apps/own" exact component={OwnAppList}/>
                                    <Route path="/dash/apps/read" exact component={ReadAppList}/>
                                    <Route path="/dash/apps/write" exact component={WriteAppList}/>
                                    <Route path="/dash/apps/create" exact component={CreateApp}/>
                                    <Route path="/dash/apps/detail" exact component={AppDetail}/>
                                    <Route path="/dash/apps/users" exact component={AppUsers}/>
                                    <Route path="/dash/apps/publish" exact component={PublishApp}/>
                                    <Route path="/dash/apps/packageList" exact component={PackageList}/>
                                    <Route path="/dash/apps/packageDetail" exact component={PackageDetail}/>
                                    <Route path="/dash/apps/patches" exact component={PatchList}/>
                                    <Route path="/dash/tasks/list" exact component={TaskList}/>
                                    <Route path="/dash/tasks/detail" exact component={TaskDetail}/>
                                    <Route path="/dash/passport/passwordManage" exact component={ PasswordManage }/>
                                </Content>
                            </Layout>
                        </Layout>
                    </div>
                </Router>
            </Provider>
        );
    }
};



