/**
 * 菜单栏
 */

import * as React from 'react';
import {Layout, Menu, Breadcrumb, Icon} from 'antd';
import {observer, inject} from "mobx-react";
import {withRouter, RouteComponentProps} from 'react-router'
import { ClickParam } from 'antd/lib/menu';
import SessionStore from '../SessionStore/SessionStore';

const {SubMenu} = Menu;
const {Header, Content, Sider} = Layout;

interface ISideMenuProps extends RouteComponentProps{
    sessionStore?: SessionStore;
}

@inject('sessionStore')
@observer
class SideBar extends React.Component<ISideMenuProps, any> {

    constructor(props: ISideMenuProps) {
        super(props);

        this.menuItemClick = this.menuItemClick.bind(this);
    }

    get sessionStore(): SessionStore{
        return this.props.sessionStore as SessionStore;
    }

    menuItemClick({item, key, keyPath}: ClickParam) {
        const {history, location} = this.props;
        if (key === location.pathname) {
            return;
        }
        if( key === '/dash/whiteList'){
            //白名单规则管理，暂时没时间迁移到dash首页，先页面跳转吧
            window.location.href = '/whitelist/index/list';
            return;
        }
        history.push(key);
    }

    render() {

        const {location} = this.props;
        const sessionStore = this.sessionStore;
        const user = sessionStore.user;
        let userMenu = null;
        let editPrizeMenu = null;
        //如果当前用户是管理员的话就显示 用户管理模块
        if(user.isAdmin){
            userMenu = (
                <Menu.Item key="/dash/user">
                    <Icon type="user"/>
                    <span>用户管理</span>
                </Menu.Item>
            )
            editPrizeMenu = (
                <Menu.Item key="/dash/editPrize">奖品编辑</Menu.Item>
            )

        }
        return (
            <Sider width={200}>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    style={{height: '100%', borderRight: 0}}
                    onClick={this.menuItemClick}
                >
                    <Menu.Item key="/">
                        <Icon type="shop" />
                        <span>首页</span>
                    </Menu.Item>
                    {userMenu}
                    <SubMenu key="" title={<span><Icon type="idcard" /><span>APP管理</span></span>}>
                        <Menu.Item key="/dash/apps/own">我拥有的APP</Menu.Item>
                        <Menu.Item key="/dash/apps/write">我可写的APP</Menu.Item>
                        <Menu.Item key="/dash/apps/read">我可读的APP</Menu.Item>
                        <Menu.Item key="/dash/apps/create">创建APP</Menu.Item>
                        <Menu.Item key="/dash/apps/detail">APP详情</Menu.Item>
                    </SubMenu>
                </Menu>
            </Sider>
        );
    }
}


export default withRouter(SideBar);
