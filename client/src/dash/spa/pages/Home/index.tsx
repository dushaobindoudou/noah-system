/**
 * 后台首页
 */

'use strict';

import * as React from 'react';

export default class Home extends React.Component{

    componentDidMount(){
        document.title = '首页';
    }

    render(){
        return (
            <div>
                <h1>后台首页</h1>
            </div>
        );
    }
}

