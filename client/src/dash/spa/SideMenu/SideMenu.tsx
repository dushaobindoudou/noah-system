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
                    <SubMenu key="" title={<span><Icon type="idcard" /><span>白名单管理</span></span>}>
                        <Menu.Item key="/dash/whitelist">白名单规则列表</Menu.Item>
                        <Menu.Item key="/dash/addwhitelist">新增白名单</Menu.Item>
                        <Menu.Item key="/dash/whitelist/userIdList">userId白名单查询</Menu.Item>
                    </SubMenu>
                    <SubMenu key="prizeGroup" title={<span><Icon type="trophy" /><span>抽奖管理</span></span>}>
                        <Menu.Item key="/dash/prize">奖品组列表</Menu.Item>
                        <Menu.Item key="/dash/prize/drawRecord">中奖记录查询</Menu.Item>
                        <Menu.Item key="/dash/prize/drawTimes">用户抽奖次数查询</Menu.Item>
                        {editPrizeMenu}
                    </SubMenu>
                    <Menu.Item key="/dash/activity">
                        <Icon type="profile" />
                        <span>活动列表</span>
                    </Menu.Item>
                    <Menu.Item key="/dash/resource">
                        <Icon type="upload"/>
                        <span>文件上传</span>
                    </Menu.Item>
                </Menu>
            </Sider>
        );
    }
}


export default withRouter(SideBar);
