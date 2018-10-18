/**
 * 全量包列表页
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select, Table } from 'antd';

import { getPackageList, PackageListResult } from 'dash/spa/service/app';
import { IExistApp, IPackage } from 'dash/spa/interface/app';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    list: IPackage[];
}

class PackageList extends React.Component<RouteComponentProps, IState>{

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            list: []
        };
    }

    componentDidMount(){

    }

    render(){

        return (
            <div>
                <h1>全量包列表</h1>

            </div>
        );
    }

}


export default withRouter(PackageList);

