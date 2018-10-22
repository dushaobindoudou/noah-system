/**
 * 修改自己的登录密码页面
 */

import * as React from 'react';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select, Table, Card, DatePicker } from 'antd';
import { inject } from 'mobx-react';
import { modifyPassword } from 'dash/spa/service/user';


const FormItem = Form.Item;

interface IState{
    isUpdating: boolean;
}

@inject('sessionStore')
class PasswordManage extends React.Component<any, IState>{

    private oldRef = React.createRef<Input>();
    private newRef = React.createRef<Input>();

    constructor(props: any){
        super(props);

        this.state = {
            isUpdating: false
        };

        this.updatePassword = this.updatePassword.bind( this );
    }

    updatePassword(e: React.FormEvent){
        e.preventDefault();

        if( this.state.isUpdating ){
            return;
        }
        const oldPassword = ( this.oldRef.current!.input.value || '').trim();
        const newPassword = ( this.newRef.current!.input.value || '').trim();

        if( ! oldPassword || ! newPassword ){
            return message.error(`新旧密码都必填`);
        }

        this.setState({
            isUpdating: true
        });

        modifyPassword({oldPassword: oldPassword, newPassword: newPassword})
        .then( () => {
            this.setState({
                isUpdating: false
            });
            message.success(`修改密码成功`);
        })
        .catch( (err) => {
            this.setState({
                isUpdating: false
            });
            message.error(err.message);
        });
    }

    render(){
        return (
            <div>
                <h1>密码修改</h1>
                <Form onSubmit={this.updatePassword}>
                    <FormItem label="当前密码">
                        <Input
                            ref={this.oldRef}
                            type="text"
                            defaultValue=""
                        />
                    </FormItem>
                    <FormItem label="新密码">
                        <Input
                            ref={this.newRef}
                            type="text"
                            defaultValue=""
                        />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" htmlType="submit">修改</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

export default PasswordManage;

