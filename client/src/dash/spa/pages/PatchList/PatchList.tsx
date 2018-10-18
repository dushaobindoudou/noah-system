/**
 * 增量包列表页
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select, Table } from 'antd';
import { IExistApp, IPatch, IPackage } from 'dash/spa/interface/app';
import { getPatchList } from 'dash/spa/service/app';

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    fullPackage: IPackage | null;
    list: IPatch[];
}

class PatchList extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private packagId: number;
    private columns: any;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: true,
            app: null,
            fullPackage: null,
            list: []
        };

        this.columns = [
            {
                title: '数据库 id',
                dataIndex: 'id',
                key: 'id',
                width: '100px'
            },
            {
                title: '全量包版本',
                key: 'packageVersion',
                dataIndex: 'packageVersion',
                render: (packageVersion: number, row: IPatch) => {
                    return <Button onClick={ this.showPackageDetailByVersion.bind(this, packageVersion)}>{packageVersion}</Button>;
                    
                }
            },
            {
                title: '低版本的全量包',
                dataIndex: 'compareVersion',
                key: 'compareVersion',
                render: (compareVersion: number, row: IPatch) => {
                    return (
                        <Button onClick={ this.showPackageDetailByVersion.bind(this, compareVersion)}>{compareVersion}</Button>
                    );
                }
            },
            {
                title: '增量包md5',
                dataIndex: 'md5',
                key: 'md5',
            },
            {
                title: '增量包绝对路径',
                dataIndex: 'filePath',
                key: 'filePath',
                width: '400px',
            },
            {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
            },
            {
                title: '上次更新时间',
                dataIndex: 'updatedAt',
                key: '上次更新时间',
            },
            // {
            //     title: '是否禁用',
            //     dataIndex: 'status',
            //     key: 'status',
            //     render: (status: number, row: IPatch) => {
                    
            //         return '--';
            //     }
            // },
            // {
            //     title: '操作',
            //     dataIndex: 'id',
            //     key: 'id',
            //     render: (id: number,row: IPatch) => {
            //         return '--';
            //     }
            // }
        ];
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

    //跳转到对应全量包详情页
    showPackageDetail(packageId?: number){
        packageId = packageId || this.packagId;
        this.props.history.push(`/dash/apps/packageDetail?appId=${this.appId}&packageId=${packageId}`);
    }

    /**
     * 根据全量包版本号，跳转到对应的详情页
     * @param packageVersion 
     */
    showPackageDetailByVersion(packageVersion: number){
        this.props.history.push(`/dash/apps/packageDetail?appId=${this.appId}&appVersion=${encodeURIComponent(this.state.fullPackage.appVersion)}&packageVersion=${packageVersion}`);
    }

    fetchPatchList(){
        this.setState({
            isLoad: true
        });

        getPatchList({appId: this.appId, packageId: this.packagId})
        .then( ({app, fullPackage, patchList}) => {
            this.setState({
                isLoad: false,
                app,
                fullPackage,
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
                <Table 
                bordered
                rowKey="id"
                pagination={false}
                dataSource={this.state.list} 
                columns={this.columns} />
            </div>
        );
    }
}


export default withRouter(PatchList);


