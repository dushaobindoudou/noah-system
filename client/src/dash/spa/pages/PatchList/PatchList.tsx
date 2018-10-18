/**
 * 增量包列表页
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select } from 'antd';
import { IExistApp, IPatch } from 'dash/spa/interface/app';
import { getPatchList } from 'dash/spa/service/app';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    list: IPatch[];
}

class PatchList extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private packagId: number;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            list: []
        };
    }

    componentDidMount(){
        const searchConf = qs.parse(location.search.substring(1));
        this.appId = parseInt(searchConf.appId, 10);
        this.packagId = parseInt(searchConf.packageId, 10);

        if( isNaN(this.appId) || isNaN(this.packagId)){
            message.error('appId packageId非法！');
            this.setState({
                isLoad: false,
                app: null
            });
            return;
        }

        this.fetchPatchList();
    }

    fetchPatchList(){
        this.setState({
            isLoad: true
        });

        getPatchList({appId: this.appId, packageId: this.packagId})
        .then( ({app, patchList}) => {
            this.setState({
                isLoad: false,
                app,
                list: patchList
            });
        })
        .catch( (err) => {
            this.setState({
                isLoad: false
            });
            message.error(err.message);
        });
    }

    render(){

        const { isLoad } = this.state;

        let loading = null;
        if(isLoad){
            loading = <Spin />;
        }

        return (
            <div>
                <h1>增量包列表</h1>
                { loading }
            </div>
        );
    }
}


export default withRouter(PatchList);


