/**
 * 应用列表
 */

import * as React from 'react';
import axios from 'axios';
import { message, Table, Button } from 'antd';
import {withRouter, RouteComponentProps} from 'react-router';
import * as app from 'dash/spa/interface/app';

//用户APP列表不同的权限
enum ListType{
    //拥有的
    OWN='own',
    //可读的app
    READ='read',
    //可写的
    WRITE='write'
}

interface IState{
    isLoad: boolean;
    list: app.IExistApp[];
}

function factory(type: ListType): React.ComponentClass<RouteComponentProps, IState>{
    return class AppList extends React.Component<RouteComponentProps, IState>{

        private title: string;
        private columns: Array<object>;

        constructor(props: RouteComponentProps){
            super(props);

            this.state = {
                isLoad: false,
                list: []
            };

            this.title = this.getTitle();

            this.columns = [
                {
                    title: 'app名',
                    dataIndex: 'name',
                    key: 'name',
                    render: (name: string, row: app.IExistApp) => {
                        return <Button type="primary" onClick={ this.showAppDetail.bind(this, row.id)}>{ row.name }</Button>;
                    }
                },
                {
                    title: 'app key',
                    dataIndex: 'appKey',
                    key: 'appKey',
                },
                {
                    title: '所属平台',
                    dataIndex: 'platform',
                    key: 'platform',
                    render: (platform: number,text: app.IExistApp) => {
                        return platform === app.AppPlatform.android ? 'Android': 'iOS';
                    }
                }
            ];

        }

        componentDidMount(){
            document.title = this.title;
            this.refreshList();
        }

        /**
         * 跳转到APP详情页
         * @param appId {number}
         */
        showAppDetail(appId: number){
            this.props.history.push(`/dash/apps/detail?appId=${appId}`);
        }

        refreshList(){
            if( this.state.isLoad ){
                return;
            }
            this.setState({
                isLoad: true,
            });

            let url = '/dash/apps/ownList';
            if( type === ListType.READ ){
                url = '/dash/apps/relateApps?access=read';
            }else if( type === ListType.WRITE){
                url = '/dash/apps/relateApps?access=write';
            }
            axios.get(url)
            .then( ( {data}) => {
                if( data.status === 0 ){
                    this.setState({
                        isLoad: false,
                        list: data.data.apps || []
                    });
                    return Promise.resolve();
                }
                return Promise.reject( new Error(data.message));
            })
            .catch( (err) => {
                this.setState({
                    isLoad: false,
                    list: []
                });
                message.error(err.message);
            });
        }

        getTitle(){
            switch(type){
                case ListType.OWN:
                    return '我拥有的APP';
                case ListType.READ:
                    return '可读的APP';
                case ListType.WRITE:
                    return '可写的APP';
            }
        }

        render(){
            return (
                <div>
                    <h1>{ this.title }</h1>
                    <Table dataSource={this.state.list} columns={this.columns} />
                </div>
            );
        }
    }
}

export const OwnAppList = withRouter(factory(ListType.OWN));
export const ReadAppList = withRouter(factory(ListType.READ));
export const WriteAppList = withRouter(factory(ListType.WRITE));

