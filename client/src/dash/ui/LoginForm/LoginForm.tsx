/**
 * 登录form
 */

import * as React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import axios from 'axios';

const FormItem = Form.Item;

interface ILoginState{
  userName: string;
  password: string;
  isRequest: boolean;
}

class LoginForm extends React.Component<any, ILoginState>{

  constructor(props: any){
    super(props);

    this.state = {
      userName: '',
      password: '',
      isRequest: false,
    };

    this.handleNameInput = this.handleNameInput.bind( this );
    this.handlePwdInput = this.handlePwdInput.bind(this);
    this.handleSubmit = this.handleSubmit.bind( this );
  }

  handleNameInput(e: React.ChangeEvent<HTMLInputElement>){
    this.setState({
      userName: e.target.value
    });
  }

  handlePwdInput(e: React.ChangeEvent<HTMLInputElement>){
    this.setState({
      password: e.target.value
    });
  }

  handleSubmit(e: React.FormEvent){
    e.preventDefault();
    if( this.state.isRequest ){
      return;
    }
    this.setState({
      isRequest: true
    });

    axios.post('/dash/passport/doLogin', {
      userName: this.state.userName,
      password: this.state.password
    }).then( ( { data}) => {
      this.setState({
        isRequest: false
      });
      if( data.status === 0){
        return location.href = data.data.url;
      }
      return Promise.reject( new Error(data.message));
    }).catch( (err: Error) => {
      this.setState({
        isRequest: false
      });
      message.error(err.message);
    });
  }

  render(){

    const { userName, password } = this.state;

    return (
      <Card title="登录">
        <Form onSubmit={this.handleSubmit}>
          <FormItem label="用户名">
            <Input
              type="text"
              placeholder="用户名"
              value={ userName }
              onChange={this.handleNameInput}
              style={{ marginRight: '3%' }}
            />
          </FormItem>
          <FormItem label="密码">
            <Input
              type="password"
              placeholder="密码"
              value={ password }
              onChange={this.handlePwdInput}
              style={{ marginRight: '3%' }}
            />
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit">登录</Button>
          </FormItem>
        </Form>
      </Card>
    );
  }
}


export default LoginForm;

