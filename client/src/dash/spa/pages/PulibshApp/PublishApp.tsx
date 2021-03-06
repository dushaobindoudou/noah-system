/**
 * APP发版页面
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps} from 'react-router';
import { Spin, Button, Tabs, Form, Input, message } from 'antd';
// import * as clipboard from 'clipboard-polyfill';
const clipboard = require('clipboard-polyfill');
import { getAppDetail, publishApp } from 'dash/spa/service/app';
import { IExistApp } from 'dash/spa/interface/app';

import './PublishApp.scss';

interface IState{
    isLoad: boolean;
    isRequest: boolean;
    app: IExistApp | null;
}

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

//发版方式
enum PublishType{
    BY_GIT='git',
    BY_UPLOAD='upload'
}

const PUBLISH_TYPE_STORE_KEY = '__publish_type__';

export default class PublishApp extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private activeTabKey: PublishType;

    private gitAppVersionRef = React.createRef<Input>();
    private gitBranchRef = React.createRef<Input>();
    private gitAbtestRef = React.createRef<HTMLTextAreaElement>();
    private gitDescRef = React.createRef<HTMLTextAreaElement>();

    private uploadAppVersionRef = React.createRef<Input>();
    private uploadPathRef = React.createRef<Input>();
    private uploadMd5Ref = React.createRef<Input>();
    private uploadAbtestRef = React.createRef<HTMLTextAreaElement>();
    private uploadDescRef = React.createRef<HTMLTextAreaElement>();

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            isRequest: false,
            app: null
        };

        this.readInfoFromClipboard = this.readInfoFromClipboard.bind( this );
        this.savePublishType = this.savePublishType.bind( this );
        this.doGitPublish = this.doGitPublish.bind( this );
        this.doUploadPublish = this.doUploadPublish.bind( this );
    }

    componentDidMount(){

        document.title = 'APP发版';

        const searchConf = qs.parse(location.search.substring(1));
        this.appId = parseInt(searchConf.appId, 10);
        if( isNaN(this.appId)){
            this.setState({
                isLoad: false,
                app: null
            });
            return;
        }

        //默认选中上次用户用过的tab
        this.activeTabKey = PublishType.BY_GIT;
        try{
            const v = localStorage.getItem(PUBLISH_TYPE_STORE_KEY);
            if(v){
                this.activeTabKey = v as PublishType;
            }
        }catch(err){
            console.error(err);
        }

        this.refreshAppDetail();

        //默认尝试自动写入 abTest desc
        this.readInfoFromClipboard();
    }

    refreshAppDetail(){
        this.setState({
            isLoad: true
        });
        getAppDetail(this.appId)
        .then( (app) => {
            this.setState({
                isLoad: false,
                app: app
            });
        })
        .catch( (err) => {
            this.setState({
                isLoad: false,
                app: null
            });
            message.error(err.message);
        });
    }

    //用户上次用的发版方式，保存下，下次默认选中
    savePublishType(k: PublishType){
        try{
            localStorage.setItem(PUBLISH_TYPE_STORE_KEY, k);
        }catch(err){
            console.error(err);
        }
    }

    //读取剪贴板的发版配置，写入 abTest  desc
    readInfoFromClipboard(){
        clipboard.readText()
        .then( (text: string) => {
            if( text ){
                try{
                    let obj = JSON.parse(text);
                    if( obj && obj.hasOwnProperty('abTest') && obj.hasOwnProperty('desc') ){
                        this.gitAbtestRef.current && (this.gitAbtestRef.current.value = obj.abTest);
                        this.gitDescRef.current && (this.gitDescRef.current.value = obj.desc);
                        this.uploadAbtestRef.current && (this.uploadAbtestRef.current.value = obj.abTest);
                        this.uploadDescRef.current && (this.uploadDescRef.current.value = obj.desc);
                    }
                }catch(err){
                    console.warn(err);
                }
            }
        })
        .catch( (err: Error) => {
            message.error(`读取剪贴板失败`);
        });
    }

    //通过 git 在服务端拉取代码方式发版
    doGitPublish(e: React.FormEvent){
        e.preventDefault();
        if( this.state.isRequest ){
            return;
        }
        this.setState({
            isRequest: true
        });
        const app = this.state.app!;
        const data = {
            appVersion: this.gitAppVersionRef.current!.input.value,
            appId: app.id,
            branchName: this.gitBranchRef.current!.input.value,
            desc: this.gitDescRef.current!.value,
            abTest: this.gitAbtestRef.current!.value,
        };
        this.doPublish(data);
    }

    //通过上传全量包方式发版
    doUploadPublish(e: React.FormEvent){
        e.preventDefault();
        if( this.state.isRequest ){
            return;
        }
        this.setState({
            isRequest: true
        });
        const app = this.state.app!;
        const data = {
            appVersion: this.uploadAppVersionRef.current!.input.value,
            appId: app.id,
            uploadFullPackagePath: this.uploadPathRef.current!.input.value,
            uploadFullPackageMd5: this.uploadMd5Ref.current!.input.value,
            desc: this.uploadDescRef.current!.value,
            abTest: this.uploadAbtestRef.current!.value,
        };
        this.doPublish(data);
    }

    doPublish(data: any){
        publishApp(data)
        .then( (taskId) => {
            this.setState({
                isRequest: false
            });
            message.success('任务提交成功，正在发布中...');
            //跳转到任务详情页
            this.props.history.push(`/dash/tasks/detail?appId=${this.state.app!.id}&taskId=${taskId}`);
        })
        .catch( (err) => {
            this.setState({
                isRequest: false
            });
            message.error(err.message);
        });
    }

    getAppInfoDom(){
        const { isLoad, app } = this.state;
        if( isLoad ){
            return null;
        }
        if( ! app ){
            return (
                <div>APP不存在或没有权限</div>
            );
        }
        return (
            <div>
                <span>APP名：</span>{ app.name }
            </div>
        );
    }

    //通过GIT发版表单
    getGitPublishDom(){
        return (
            <div>
                <h2>通过Git发版</h2>
                <Form onSubmit={this.doGitPublish}>
                    <FormItem label="APP版本号(native版本号)">
                        <Input
                            placeholder="输入该RN适用的native版本号"
                            type="text"
                            defaultValue=""
                            ref={this.gitAppVersionRef}
                        />
                    </FormItem>
                    <FormItem label="Git分支/tag/commit">
                        <Input
                            type="text"
                            defaultValue=""
                            ref={this.gitBranchRef}
                        />
                    </FormItem>
                    <FormItem label="ABTest配置">
                        <textarea
                            defaultValue=""
                            ref={this.gitAbtestRef}
                        />
                    </FormItem>
                    <FormItem label="发版描述信息">
                        <textarea
                            defaultValue=""
                            ref={this.gitDescRef}
                        />
                    </FormItem>
                    <FormItem>
                        <Button type="danger" htmlType="submit">确认发布</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }

    //通过上传方式发版
    getUploadPublishDom(){
        return (
            <div>
                <h2>通过上传全量包发版</h2>
                <Form onSubmit={this.doUploadPublish}>
                    <FormItem label="APP版本号(native版本号)">
                        <Input
                            placeholder="输入该RN适用的native版本号"
                            type="text"
                            defaultValue=""
                            ref={this.uploadAppVersionRef}
                        />
                    </FormItem>
                    <FormItem label="上传的全量包绝对路径">
                        <Input
                            type="text"
                            defaultValue=""
                            ref={this.uploadPathRef}
                        />
                    </FormItem>
                    <FormItem label="上传的全量包md5">
                        <Input
                            type="text"
                            defaultValue=""
                            ref={this.uploadMd5Ref}
                        />
                    </FormItem>
                    <FormItem label="ABTest配置">
                        <textarea
                            defaultValue=""
                            ref={this.uploadAbtestRef}
                        />
                    </FormItem>
                    <FormItem label="发版描述信息">
                        <textarea
                            defaultValue=""
                            ref={this.uploadDescRef}
                        />
                    </FormItem>
                    <FormItem>
                        <Button type="danger" htmlType="submit">确认发布</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }

    getPublishTabDom(){
        if( ! this.state.app ){
            return null;
        }

        return (
            <Tabs defaultActiveKey={ this.activeTabKey } onChange={ this.savePublishType }>
                <TabPane tab="Git发版" key={PublishType.BY_GIT}>{ this.getGitPublishDom() }</TabPane>
                <TabPane tab="上传全量包发版" key={PublishType.BY_UPLOAD}>{ this.getUploadPublishDom() }</TabPane>
            </Tabs>
        );
    }

    render(){
        const { isLoad, app } = this.state;
        let loading = null;
        if( isLoad ){
            loading = <Spin />;
        }
        return (
            <div className="app-publish-page">
                <h1>APP发版</h1>
                { loading }
                { this.getAppInfoDom() }
                <div>
                    <Button onClick={ this.readInfoFromClipboard } icon="snippets" type="primary">粘贴发版配置</Button>
                </div>
                { this.getPublishTabDom() }
            </div>
        );
    }
}