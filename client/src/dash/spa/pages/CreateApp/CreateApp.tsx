/**
 * 创建应用页面
 * 
 */

import * as React from 'react';
import axios from 'axios';
import {Layout, message, Form, Input, Button, Select, Modal} from 'antd';
import { IApp, AppPlatform } from 'dash/spa/interface/app';

interface IState extends IApp{
    isLoad: boolean;
}

const FormItem = Form.Item;
const Option = Select.Option;
const TextArea = Input.TextArea;

export default class CreateApp extends React.Component<any, IState>{

    constructor(props: any){
        super(props);

        this.state = {
            isLoad: false,
            name: '',
            platform: AppPlatform.android,
            entryFile: '',
            bundleName: '',
            gitUrl: '',
            desc: ''
        };

        this.updatePlatform = this.updatePlatform.bind(this);
        this.updateName = this.updateName.bind(this);
        this.updateEntryFile = this.updateEntryFile.bind(this);
        this.updateBundleName = this.updateBundleName.bind(this);
        this.updateGitUrl = this.updateGitUrl.bind(this);
        this.updateDesc = this.updateDesc.bind(this);
        this.doCreate = this.doCreate.bind(this);
    }

    componentDidMount(){
        document.title = '创建APP';
    }

    updatePlatform(value: number){
        this.setState({
            platform: value
        });
    }

    updateName(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            name: e.target.value
        });
    }

    updateEntryFile(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            entryFile: e.target.value
        });
    }

    updateBundleName(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            bundleName: e.target.value
        });
    }

    updateGitUrl(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            gitUrl: e.target.value
        });
    }

    updateDesc(e: React.ChangeEvent<HTMLTextAreaElement>){
        this.setState({
            desc: e.target.value
        });
    }

    doCreate(e: React.FormEvent){
        e.preventDefault();
        if( this.state.isLoad ){
            return;
        }
        this.setState({
            isLoad: true
        });

        const state = this.state;

        axios.post('/dash/apps/doAdd', {
            name: state.name,
            platform: state.platform,
            entryFile: state.entryFile,
            bundleName: state.bundleName,
            gitUrl: state.gitUrl,
            desc: state.desc,
        }).then( ({data}) => {
            if( data.status === 0 ){
                const newAppId = data.data.appId;
                //TODO 跳转到应用详情页
                
                message.success('创建应用成功');
                return Promise.resolve();
            }
            return Promise.reject( new Error(data.message));
        })
        .catch( (err) => {
            this.setState({
                isLoad: false,
            });
            message.error(err.message);
        });
    }

    render(){

        const state = this.state;

        return (
            <div>
                <h1>创建APP</h1>
                <Form onSubmit={this.doCreate}>
                        <FormItem label="应用名">
                            <Input
                                type="text"
                                value={ state.name }
                                onChange={this.updateName}
                            />
                        </FormItem>
                        <FormItem label="所属平台">
                            <Select defaultValue={state.platform} style={{ width: 120 }} onSelect={this.updatePlatform}>
                                <Option value={AppPlatform.android}>Android</Option>
                                <Option value={AppPlatform.ios}>iOS</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="打包【入口】脚本">
                            <Input
                                type="text"
                                value={ state.entryFile}
                                onChange={this.updateEntryFile}
                            />
                        </FormItem>
                        <FormItem label="打包【产出】文件名">
                            <Input
                                type="text"
                                value={ state.bundleName}
                                onChange={this.updateBundleName}
                            />
                        </FormItem>
                        <FormItem label="Git仓库地址">
                            <Input
                                type="text"
                                value={ state.gitUrl}
                                onChange={this.updateGitUrl}
                            />
                        </FormItem>
                        <FormItem label="应用描述">
                            <TextArea
                                value={ state.desc}
                                onChange={this.updateDesc}
                            />
                        </FormItem>
                        <FormItem>
                            <Button type="primary" htmlType="submit">创建</Button>
                        </FormItem>
                    </Form>
            </div>
        );
    }
}