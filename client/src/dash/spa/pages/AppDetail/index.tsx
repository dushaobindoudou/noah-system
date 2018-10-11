/**
 * APP详情页
 */

import * as React from 'react';
import * as qs from 'qs';
import axios from 'axios';
import { Spin, Button, Modal, message } from 'antd';

import { IExistApp, AppPlatform } from 'dash/spa/interface/app';

import AppEditor, { ICancel, ISubmitCallback, IUpdateAppInfo} from './AppEditor/AppEditor';

import './index.scss';

interface IExistDetail extends IExistApp{
    owner: any;
}

interface IState{
    isLoad: boolean;
    isUpdate: boolean;
    editorVisible: boolean;
    app: IExistDetail | null;
}

export default class AppDetail extends React.Component<any, IState>{

    private appId: number;

    constructor(props: any){
        super(props);

        this.state = {
            isLoad: true,
            isUpdate: false,
            editorVisible: false,
            app: null
        };

        this.showEditModal = this.showEditModal.bind( this );
        this.doUpdateApp = this.doUpdateApp.bind( this );
        this.cancelUpdate = this.cancelUpdate.bind( this );
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

    showEditModal(){
        this.setState({
            editorVisible: true
        });
    }

    doUpdateApp(app: IUpdateAppInfo){
        if( this.state.isUpdate ){
            return;
        }
        this.setState({
            isUpdate: true
        });
        axios.post('/dash/apps/doUpdate', {
            appId: app.id,
            name: app.name,
            entryFile: app.entryFile,
            gitUrl: app.gitUrl,
            ownerName: app.transferUserName,
            desc: app.desc,
        }).then( ({data: out}) => {
            if( out.status === 0 ){
                this.setState({
                    isUpdate: false,
                    app: out.data.app,
                    editorVisible: false,
                });
                message.success('修改APP成功');
                return;
            }
            return Promise.reject( new Error(out.message));
        })
        .catch( (err) => {
            this.setState({
                isUpdate: false,
            });
            message.error(err.message);
        });
    }

    cancelUpdate(){
        this.setState({
            editorVisible: false
        });
    }

    getOperationBar(){
        if( ! this.state.app ){
            return null;
        }
        return (
            <div className="app-op-bar">
                <Button type="danger" onClick={ this.showEditModal }>编辑APP信息</Button>
            </div>
        );
    }

    getAppEditorModal(){
        if( ! this.state.app ){
            return null;
        }

        return (
            <Modal title="编辑APP"
                width="700px"
                   visible={ this.state.editorVisible }
                   destroyOnClose={true}
                   footer={null}
                   onCancel={ this.cancelUpdate }
                   >
                   <AppEditor app={ this.state.app } onCancel={this.cancelUpdate} onSubmit={this.doUpdateApp} />
            </Modal>
        );
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
            <div className="app-info-list">
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
                    <dd className="info-item-value">{ app.owner ? app.owner.name : '' }</dd>
                </dl>
                <dl className="info-item">
                    <dt className="info-item-label">应用描述</dt>
                    <dd className="info-item-value">
                        <pre>{ app.desc }</pre>
                    </dd>
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
                { this.getOperationBar() }
                { loading }
                { this.getAppDom() }
                { this.getAppEditorModal() }
            </div>
        )
    }
}
