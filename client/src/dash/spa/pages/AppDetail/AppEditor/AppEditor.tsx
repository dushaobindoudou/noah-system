/**
 * 编辑应用信息
 */

import * as React from 'react';
import {Layout, message, Form, Input, Button, Select, Modal} from 'antd';
import { IExistApp, AppPlatform } from 'dash/spa/interface/app';

const FormItem = Form.Item;
const Option = Select.Option;

export interface IUpdateAppInfo extends IExistApp{
    //要转账给的用户名
    transferUserName: string;
}

export interface ISubmitCallback{
    (app: IUpdateAppInfo):void;
}

export interface ICancel{
    ():void;
}

interface IProps{
    app: IExistApp;
    onSubmit: ISubmitCallback;
    onCancel: ICancel;
}

export default class AppEditor extends React.Component<IProps>{

    private nameRef = React.createRef<Input>();
    private entryFileRef = React.createRef<Input>();
    private transferUserRef = React.createRef<Input>();
    private gitUrlRef = React.createRef<Input>();
    private descRef = React.createRef<HTMLTextAreaElement>();

    constructor(props: IProps){
        super(props);

        this.onSubmit = this.onSubmit.bind( this );
    }

    private onSubmit(e: React.FormEvent){
        e.preventDefault();
        const data = Object.assign({}, this.props.app, {
            name: this.nameRef.current.input.value,
            entryFile: this.entryFileRef.current.input.value,
            transferUserName: this.transferUserRef.current.input.value,
            gitUrl: this.gitUrlRef.current.input.value,
            desc: this.descRef.current.value
        });
        this.props.onSubmit(data);
    }

    render(){

        const app = this.props.app;

        return (
            <div>
                <Form onSubmit={this.onSubmit}>
                    <FormItem label="应用名">
                        <Input
                            type="text"
                            defaultValue={ app.name }
                            ref={this.nameRef}
                        />
                    </FormItem>
                    <FormItem label="所属平台">
                        <Select disabled={true} defaultValue={app.platform} style={{ width: 120 }}>
                            <Option value={AppPlatform.android}>Android</Option>
                            <Option value={AppPlatform.ios}>iOS</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="打包【入口】脚本">
                        <Input
                            type="text"
                            defaultValue={ app.entryFile}
                            ref={this.entryFileRef}
                        />
                    </FormItem>
                    <FormItem label="打包【产出】文件名">
                        <Input
                            disabled={true}
                            type="text"
                            value={ app.bundleName}
                        />
                    </FormItem>
                    <FormItem label="Git仓库地址">
                        <Input
                            type="text"
                            defaultValue={ app.gitUrl}
                            ref={this.gitUrlRef}
                        />
                    </FormItem>
                    <FormItem label="转让APP给其他人">
                        <Input
                            type="text"
                            defaultValue=""
                            placeholder="要转让的用户名"
                            ref={this.transferUserRef}
                        />
                    </FormItem>
                    <FormItem label="应用描述">
                        <textarea
                            style={ {width: '100%', lineHeight: '24px', height: '100px'}}
                            defaultValue={ app.desc}
                            ref={this.descRef}
                        />
                    </FormItem>
                    <FormItem>
                        <Button type="dashed" onClick={ this.props.onCancel }>取消</Button>
                        <Button type="primary" htmlType="submit">保存</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}