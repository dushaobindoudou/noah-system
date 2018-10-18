/**
 * 全量包列表页
 */

import * as React from 'react';
import * as qs from 'qs';
import {withRouter, RouteComponentProps, Route} from 'react-router';
import { Spin, Button, message, Modal, Form, Input, Select, Table, Card, DatePicker } from 'antd';

import { getPackageList, PackageListResult } from 'dash/spa/service/app';
import { IExistApp, IPackage, PackageStatusMap, PackageStatus, PackageDisablePatch, PackageDisablePatchText, PackageForceUpdate, PackageForceUpdateText } from 'dash/spa/interface/app';
import * as moment from 'moment';
import { IUser } from 'dash/spa/interface/user';

const FormItem = Form.Item;

//查询条件
interface IQueryForm{
    //APP native版本
    appVersion: string;
    //发版的用户名
    publishUserName: string;
    //发版起始时间
    startDate: moment.Moment | undefined;
    //发版结束时间
    endDate: moment.Moment | undefined;
}

interface IState{
    isLoad: boolean;
    app: IExistApp | null;
    list: IPackage[];
    query: IQueryForm;
}

class PackageList extends React.Component<RouteComponentProps, IState>{

    private appId: number;
    private columns: any;

    constructor(props: RouteComponentProps){
        super(props);

        this.state = {
            isLoad: false,
            app: null,
            list: [],
            query: {
                appVersion: '',
                publishUserName: '',
                startDate: undefined,
                endDate: undefined
            }
        };

        this.columns = [
            // {
            //     title: '数据库 id',
            //     dataIndex: 'id',
            //     key: 'id',
            //     width: '100px'
            // },
            {
                title: 'native版本',
                dataIndex: 'appVersion',
                key: 'appVersion',
                width: '150px'
            },
            {
                title: '全量包版本',
                key: 'packageVersion',
                dataIndex: 'packageVersion',
                render: (packageVersion: number, row: IPackage) => {
                    return <Button type="primary" onClick={ this.showPackageDetail.bind(this, row)}>{packageVersion}</Button>;
                    
                }
            },
            {
                title: '发版人',
                dataIndex: 'publisher',
                render: (publisher: IUser | null, row: IPackage) => {
                    return publisher ? publisher.name : '--';         
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (status: PackageStatus, row: IPackage) => {
                    const style = {
                        color: ''
                    };
                    if( status === PackageStatus.DISABLE ){
                        style.color = 'red';
                    }
                    return <div style={style}>{ PackageStatusMap[status] }</div>;       
                }
            },
            {
                title: '是否允许增量更新',
                dataIndex: 'disablePatch',
                render: (disablePatch: PackageDisablePatch, row: IPackage) => {
                    const style = {
                        color: ''
                    };
                    if( disablePatch === PackageDisablePatch.DISABLE ){
                        style.color = 'red';
                    }
                    return <div style={style}>{ PackageDisablePatchText[disablePatch] }</div>;       
                }
            },
            {
                title: '是否强制更新',
                dataIndex: 'forceUpdate',
                render: (forceUpdate: PackageForceUpdate, row: IPackage) => {
                    const style = {
                        color: ''
                    };
                    if( forceUpdate === PackageForceUpdate.FORCE ){
                        style.color = 'red';
                    }
                    return <div style={style}>{ PackageForceUpdateText[forceUpdate] }</div>;       
                }
            },
            {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (createdAt: string) => {
                    return moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
                }
            },
            {
                title: '上次更新时间',
                dataIndex: 'updatedAt',
                key: '上次更新时间',
                render: (updatedAt: string) => {
                    return moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
                }
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

        this.searchResult = this.searchResult.bind( this );
        this.updateAppVersion = this.updateAppVersion.bind( this );
        this.updatePublisherName = this.updatePublisherName.bind( this );
    }

    componentDidMount(){
        const searchConf = qs.parse(location.search.substring(1));

        this.appId = parseInt(searchConf.appId, 10);
        const query = {
            appVersion: searchConf.appVersion,
            publishUserName: searchConf.publisherName,
            startDate: searchConf.startTimestamp ? moment(searchConf.startTimestamp) : undefined,
            endDate: searchConf.endTimestamp ? moment(searchConf.endTimestamp) : undefined
        };

        this.setState({
            query: query
        });

        if( query.appVersion || query.publishUserName || query.startDate || query.endDate){
            this.fetchPackageList();
        }
    }

    fetchPackageList(){
        this.setState({
            isLoad: true
        });
        const query = this.state.query;
        getPackageList({
            appId: this.appId, 
            appVersion: query.appVersion, 
            publishUserName: query.publishUserName,
            startTimestamp: query.startDate ? query.startDate.valueOf(): '',
            endTimestamp: query.endDate ? query.endDate.valueOf() : ''
        }).then( ({ app, list}) => {
            this.setState({
                isLoad: false,
                app,
                list,
            });
        })
        .catch( (err) => {
            this.setState({
                isLoad: false,
                list: []
            });
            message.error(err.message);
        });
    }

    searchResult(e: React.FormEvent){
        e.preventDefault();
        this.fetchPackageList();
    }

    /**
     * 跳转到全量包详情页
     * @param obj 
     */
    showPackageDetail(obj: IPackage){
        this.props.history.push(`/dash/apps/packageDetail?appId=${this.appId}&packageId=${obj.id}`);
    }

    updateAppVersion(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            query: {
                ... this.state.query,
                appVersion: e.target.value
            }
        });
    }

    updatePublisherName(e: React.ChangeEvent<HTMLInputElement>){
        this.setState({
            query: {
                ... this.state.query,
                publishUserName: e.target.value
            }
        });
    }

    updateQueryDate(key: string, date: moment.Moment, dateString: string){
        this.setState({
            query: {
                ... this.state.query,
                [key]: date,
            }
        });
    }

    //查询表单
    getQueryForm(){

        const query = this.state.query;

        return (
            <Card title="查询条件">
                <Form 
                layout="inline"
                onSubmit={this.searchResult}>
                    <FormItem label="native版本号">
                        <Input
                            type="text"
                            value={ query.appVersion }
                            onChange={this.updateAppVersion}
                        />
                    </FormItem>
                    <FormItem label="发版人">
                        <Input
                            type="text"
                            value={ query.publishUserName}
                            onChange={this.updatePublisherName}
                        />
                    </FormItem>
                    <FormItem>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="选择起始时间"
                            value={ query.startDate }
                            onChange={ this.updateQueryDate.bind( this, 'startDate')}
                            />
                    </FormItem>
                    <FormItem>
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="选择结束时间"
                            value={ query.endDate }
                            onChange={ this.updateQueryDate.bind( this, 'endDate')}
                            />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" htmlType="submit">查询</Button>
                    </FormItem>
                </Form>
            </Card>
        );
    }

    render(){

        const { isLoad } = this.state;

        return (
            <div>
                <h1>全量包列表</h1>
                <Spin size="large" spinning={isLoad}>
                    { this.getQueryForm() }
                    <Table 
                        bordered
                        rowKey="id"
                        pagination={false}
                        dataSource={this.state.list} 
                        columns={this.columns} />
                </Spin>
            </div>
        );
    }

}


export default withRouter(PackageList);

