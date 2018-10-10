/**
 * APP详情页
 */

import * as React from 'react';
import * as qs from 'qs';
import axios from 'axios';
import { Spin, message } from 'antd';

import { IExistApp, AppPlatform } from 'dash/spa/interface/app';

import './index.scss';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
}

export default class AppDetail extends React.Component<any, IState>{

    private appId: number;

    constructor(props: any){
        super(props);

        this.state = {
            isLoad: true,
            app: null
        };
    }

    componentDidMount(){
        const searchConf = qs.parse(location.search.substring(1));
        this.appId = parseInt(searchConf.appId, 10);
        if( isNaN(this.appId)){
            this.setState({
                isLoad: false,
                app: null
            });
            return;
        }
        this.refreshAppDetail();
    }

    refreshAppDetail(){
        this.setState({
            isLoad: true
        });
        axios.get(`/dash/apps/appDetail?appId=${this.appId}`)
        .then( ({data}) => {
            if( data.status === 0 ){
                this.setState({
                    isLoad: false,
                    app: data.data.app
                });
                return;
            }
            return Promise.reject( new Error(data.message));
        })
        .catch( (err) => {
            this.setState({
                isLoad: false,
                app: null
            });
            message.error(err.message);
        });
    }

    getAppDom(){
        const { isLoad, app } = this.state;
        if( ! isLoad && ! app ){
            //没找到对应APP
            return (
                <div>
                    未找到对应APP
                </div>
            );
        }
        if( ! app ){
            return null;
        }
        return (
            <div className="info-list">
                <dl className="info-item">
                    <dt className="info-item-label">APP id</dt>
                    <dd className="info-item-value">{ app.id }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">APP Key</dt>
                    <dd className="info-item-value">{ app.appKey }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">应用名</dt>
                    <dd className="info-item-value">{ app.name }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">所属平台</dt>
                    <dd className="info-item-value">{ app.platform === AppPlatform.android ? 'Android' : 'iOS' }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">打包【入口】脚本</dt>
                    <dd className="info-item-value">{ app.entryFile }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">打包【产出】文件名</dt>
                    <dd className="info-item-value">{ app.bundleName }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">Git仓库地址</dt>
                    <dd className="info-item-value">{ app.gitUrl }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">应用创建者</dt>
                    <dd className="info-item-value">{ app.id }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">应用描述</dt>
                    <dd className="info-item-value">{ app.desc }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">应用创建时间</dt>
                    <dd className="info-item-value">{ app.createdAt }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">最后更新时间</dt>
                    <dd className="info-item-value">{ app.updatedAt }</dd>
                </dl>
            </div>
        );
    }

    render(){

        const { isLoad, app } = this.state;

        let loading = null;
        if( isLoad ){
            loading = <Spin />;
        }

        return (
            <div>
                <h1>APP详情</h1>
                { loading }
                { this.getAppDom() }
            </div>
        )
    }
}

