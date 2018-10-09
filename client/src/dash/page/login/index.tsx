/**
 *
 * Created by Jess on 2018/7/13.
 */

'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import axios from 'axios';
import LoginForm from 'dash/ui/LoginForm/LoginForm';

class App extends React.Component{

    render(){
        return (
            <div>
                <h1>登录noah</h1>
                <LoginForm />
            </div>
        );
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
