/**
 *
 * Created by Jess on 2018/7/13.
 */

'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import axios from 'axios';

interface State1 {
    pwd: string,
    encodePwd: string
};

class PwdGenerator extends React.Component<any, State1>{

    constructor(props: any){
        super(props);

        this.state = {
            pwd: '',
            encodePwd: ''
        };

        this.updatePwd = this.updatePwd.bind( this );
        this.handleSubmit = this.handleSubmit.bind( this );
    }

    updatePwd(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            pwd: e.target.value
        });
    }

    handleSubmit(e: React.FormEvent){
        e.preventDefault();
        if( ! this.state.pwd ){
            alert('密码不能为空');
            return;
        }

        this.setState({
            encodePwd: ''
        });

        axios.post('/dash/demo/generatePwd', {
            password: this.state.pwd
        }).then( (res) => {
            this.setState({
                encodePwd: res.data
            });
        }).catch( (err: Error) => {
            alert(err.message);
        });
    }

    render(){

        return (
            <div>
                <h2>生成password</h2>
                <form onSubmit={ this.handleSubmit }>
                    <div>
                        <label htmlFor="pwd">输入密码：</label>
                        <input autoComplete="off" onChange={ this.updatePwd } value={ this.state.pwd } type="text" id="pwd"/>
                    </div>
                    <div>
                        <label htmlFor="genPwd">生成的密码：</label>
                        <textarea value={ this.state.encodePwd } id="genPwd" cols={30} rows={10}></textarea>
                    </div>
                    <div>
                        <input type="submit" value="提交"/>
                    </div>
                </form>
            </div>
        );
    }
}

class App extends React.Component{

    render(){
        return (
            <div>
                <h1>hello typescript</h1>
                <PwdGenerator />
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
