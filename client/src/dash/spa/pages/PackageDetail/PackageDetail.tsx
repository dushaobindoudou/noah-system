/**
 * 某个全量包版本的详情页
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select } from 'antd';
import { IPackage, IExistApp, PackageStatusMap, PackageForceUpdateText, PackageDisablePatchText, PackageStatus, PackageForceUpdate, PackageDisablePatch } from 'dash/spa/interface/app';
import { getPackageDetail, updatePackage } from 'dash/spa/service/app';

//可编辑的全量包部分属性
interface IPackageEditable{
    status: PackageStatus;
    forceUpdate: PackageForceUpdate;
    disablePatch: PackageDisablePatch;
    abTest: string;
    //必须要输入密码，才能修改
    password: string;
}

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    fullPackage: IPackage | null;
    editorVisible: boolean;
    editorData: IPackageEditable;
    //是否正在更新中
    isUpdating: boolean;
}

import './PackageDetail.scss';
import TextArea from 'antd/lib/input/TextArea';

const FormItem = Form.Item;
const Option = Select.Option;

class PackageDetail extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private packagId: number;
    private appVersion: string;
    private packageVersion: string;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            fullPackage: null,
            //编辑弹窗是否可见
            editorVisible: false,
            //弹窗中的编辑内容
            editorData: {
                status: PackageStatus.ENABLE,
                forceUpdate: PackageForceUpdate.NO_FORCE,
                disablePatch: PackageDisablePatch.ENABLE,
                abTest: '',
                password: ''
            },
            isUpdating: false,
        };

        this.showTaskDetail = this.showTaskDetail.bind( this );
        this.showPatchList = this.showPatchList.bind( this );
        this.doUpdatePackage = this.doUpdatePackage.bind( this );
        this.showEditor = this.showEditor.bind( this );
        this.closeEditor = this.closeEditor.bind( this );

        this.updateStatus = this.updateStatus.bind( this );
        this.updateForceUpdate = this.updateForceUpdate.bind( this );
        this.updateDisablePatch = this.updateDisablePatch.bind( this );
        this.updateAbTest = this.updateAbTest.bind( this );
        this.updatePassword = this.updatePassword.bind( this );
    }

    componentDidMount(){
        const searchConf = qs.parse(location.search.substring(1));
        this.appId = parseInt(searchConf.appId, 10);
        this.packagId = parseInt(searchConf.packageId, 10);
        this.appVersion = searchConf.appVersion;
        this.packageVersion = searchConf.packageVersion;

        if( isNaN(this.appId) 
        || ( isNaN(this.packagId) && ! this.appVersion && ! this.packageVersion ) ){
            message.error('appId packageId appVersion packageVersion非法！');
            this.setState({
                isLoad: false,
                fullPackage: null
            });
            return;
        }

        this.fetchPackageDetail();
    }

    fetchPackageDetail(){
        this.setState({
            isLoad: true,
        });
        getPackageDetail({
            appId: this.appId, 
            packageId: this.packagId || '', 
            appVersion: this.appVersion, 
            packageVersion: this.packageVersion
        })
        .then( ({fullPackage, app}) => {
            this.packagId = fullPackage.id;
            this.setState({
                isLoad: false,
                app: app,
                fullPackage: fullPackage,
                editorData: Object.assign({ password: ''}, fullPackage),
            });
        })
        .catch( (err: Error) => {
            message.error(err.message);
            this.setState({
                isLoad: false,
                fullPackage: null
            });
        });
    }

    showTaskDetail(){
        const fullPackage = this.state.fullPackage;
        if( ! fullPackage || ! fullPackage.task ){
            return;
        }
        this.props.history.push(`/dash/tasks/detail?appId=${this.state.app.id}&taskId=${fullPackage.task.id}`);
    }

    //跳转到增量包列表页
    showPatchList(){
        this.props.history.push(`/dash/apps/patches?appId=${this.appId}&packageId=${this.packagId}`);
    }

    doUpdatePackage(){
        if( this.state.isUpdating ){
            return;
        }
        this.setState({
            isUpdating: true
        });
        const { editorData } = this.state;
        const data = {
            appId: this.state.app.id,
            packageId: this.state.fullPackage.id,
            status: editorData.status,
            forceUpdate: editorData.forceUpdate,
            disablePatch: editorData.disablePatch,
            abTest: editorData.abTest,
            password: editorData.password,
        };
        updatePackage(data)
        .then( (fullPackage) => {
            this.setState({
                isUpdating: false,
                editorVisible: false,
                fullPackage: {
                    ... this.state.fullPackage,
                    ... fullPackage,
                }
            });
            message.success(`修改全量包状态成功`);
        })
        .catch( (err) => {
            this.setState({
                isUpdating: false,
            });
            message.error(err.message);
        });
    }

    showEditor(){
        this.setState({
            editorVisible: true,
            editorData: Object.assign({password: ''}, this.state.fullPackage)
        });
    }

    closeEditor(){
        this.setState({
            editorVisible: false
        });
    }

    updateStatus(status: PackageStatus){
        this.setState({
            editorData: {
                ... this.state.editorData,
                status: status
            }
        });
    }

    updateForceUpdate(forceUpdate: PackageForceUpdate){
        this.setState({
            editorData: {
                ... this.state.editorData,
                forceUpdate: forceUpdate
            }
        });
    }

    updateDisablePatch(disablePatch: PackageDisablePatch){
        this.setState({
            editorData: {
                ... this.state.editorData,
                disablePatch,
            }
        });
    }

    updateAbTest(e: React.ChangeEvent<HTMLTextAreaElement>){
        this.setState({
            editorData: {
                ... this.state.editorData,
                abTest: e.target.value
            }
        });
    }

    updatePassword(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            editorData: {
                ... this.state.editorData,
                password: e.target.value
            }
        });
    }

    getInfoDom(){
        const { isLoad, app, fullPackage} = this.state;
        if( isLoad ){
            return null;
        }
        if( ! fullPackage ){
            return (
                <div>全量包不存在，或者没有权限</div>
            );
        }

        return (
            <div>
                <div className="op-bar">
                    <Button onClick={ this.showPatchList }>查看增量包列表</Button>
                    <Button onClick={ this.showEditor } type="danger">修改版本状态</Button>
                </div>
                <div>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">数据库自增ID</dt>
                        <dd className="packageInfoValue">{fullPackage.id}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">app 版本</dt>
                        <dd className="packageInfoValue">{fullPackage.appVersion}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">全量包版本</dt>
                        <dd className="packageInfoValue">{fullPackage.packageVersion}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">状态</dt>
                        <dd className="packageInfoValue">{ PackageStatusMap[fullPackage.status]}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">是否强制更新</dt>
                        <dd className="packageInfoValue">{ PackageForceUpdateText[fullPackage.forceUpdate]}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">是否允许增量更新</dt>
                        <dd className="packageInfoValue">{ PackageDisablePatchText[fullPackage.disablePatch]}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">压缩包md5</dt>
                        <dd className="packageInfoValue">{fullPackage.md5}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">压缩包绝对路径</dt>
                        <dd className="packageInfoValue">{fullPackage.filePath}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">AB Test配置</dt>
                        <dd className="packageInfoValue"><pre>{fullPackage.abTest}</pre></dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">描述</dt>
                        <dd className="packageInfoValue"><pre>{fullPackage.desc}</pre></dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">发版用户</dt>
                        <dd className="packageInfoValue">{fullPackage.publisher ? fullPackage.publisher.name : '--'}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">创建时间</dt>
                        <dd className="packageInfoValue">{fullPackage.createdAt}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">最后更新时间</dt>
                        <dd className="packageInfoValue">{fullPackage.updatedAt}</dd>
                    </dl>
                    <dl className="packageInfoItem">
                        <dt className="packageInfoLabel">本次发版任务</dt>
                        <dd className="packageInfoValue">
                            {fullPackage.task ? <Button onClick={ this.showTaskDetail }>查看任务详情</Button> : '--'}
                        </dd>
                    </dl>
                </div>
            </div>
        );
    }

    getEditorModal(){

        const { editorData, fullPackage, app} = this.state;
        
        if( ! app || ! fullPackage  ){
            return null;
        }

        return (
            <Modal title="修改版本状态"
                    width="700px"
                   visible={ this.state.editorVisible }
                   onOk={ this.doUpdatePackage}
                   onCancel={ this.closeEditor }
                   destroyOnClose={true}
                   okText="确定修改"
                   cancelText="取消">
                <Form onSubmit={this.doUpdatePackage}>
                    <FormItem label="app名">
                        <Input
                            type="text"
                            disabled={true}
                            value={ app.name }
                        />
                    </FormItem>
                    <FormItem label="native版本号">
                        <Input
                            type="text"
                            disabled={true}
                            value={ fullPackage.appVersion }
                        />
                    </FormItem>
                    <FormItem label="当前全量包版本">
                        <Input
                            type="text"
                            disabled={true}
                            value={ fullPackage.packageVersion }
                        />
                    </FormItem>
                    <FormItem label="是否开放下载">
                        <Select defaultValue={editorData.status} style={{ width: 220 }} onChange={ this.updateStatus } >
                            <Option value={ PackageStatus.ENABLE}>开放</Option>
                            <Option value={ PackageStatus.DISABLE}>禁止下载</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="是否强制更新">
                        <Select defaultValue={editorData.forceUpdate} style={{ width: 220 }} onChange={ this.updateForceUpdate } >
                            <Option value={ PackageForceUpdate.NO_FORCE}>不强制</Option>
                            <Option value={ PackageForceUpdate.FORCE}>强制更新</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="是否允许增量更新">
                        <Select defaultValue={editorData.disablePatch} style={{ width: 220 }} onChange={ this.updateDisablePatch } >
                            <Option value={ PackageDisablePatch.ENABLE}>允许增量</Option>
                            <Option value={ PackageDisablePatch.DISABLE}>禁止增量更新</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="AB Test规则">
                        <Input.TextArea
                            value={editorData.abTest}
                            onChange={ this.updateAbTest }
                        />
                    </FormItem>
                    <FormItem label="登录密码">
                        <Input
                            placeholder="请输入账号登录密码"
                            type="password"
                            value={editorData.password}
                            onChange={ this.updatePassword }
                        />
                    </FormItem>
                
                </Form>
            </Modal>
        );
    }

    render(){

        const { isLoad } = this.state;

        let loading = null;
        if(isLoad){
            loading = <Spin />;
        }

        return (
            <div>
                <h1>全量包详情</h1>
                { loading }
                { this.getInfoDom() }
                { this.getEditorModal() }
            </div>
        );
    }
}

export default withRouter(PackageDetail);

