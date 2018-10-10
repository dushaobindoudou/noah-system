/**
 * 应用列表
 */

import * as React from 'react';
import axios from 'axios';
import { message, Table } from 'antd';
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

function factory(type: ListType): React.ComponentClass{
    return class AppList extends React.Component<any, IState>{

        private title: string;
        private columns: Array<object>;

        constructor(props: any){
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
                    return;
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

export const OwnAppList = factory(ListType.OWN);
export const ReadAppList = factory(ListType.READ);
export const WriteAppList = factory(ListType.WRITE);

