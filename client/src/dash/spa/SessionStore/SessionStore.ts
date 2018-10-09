/**
 * 获取并维护页面中的登录态
 */

'use strict';


import {observable, computed, action} from "mobx";
import axios from 'axios';
import {message} from 'antd';

export class User{

    //管理员
    static readonly LEVEL_ADMIN = 99;
    //普通用户
    static readonly LEVEL_NORMAL = 1;

    //用户正常状态
    static readonly STATUS_OK = 1;
    //用户被禁用的状态
    static readonly STATUS_DISABLE = 2;

    name: string;
    private level: number;

    constructor(name: string, level: number){
        this.name = name;
        this.level = level;
    }

    get isAdmin(): boolean{
        return this.level === User.LEVEL_ADMIN;
    }
}

type CurrentUser = User | null;

export default class SessionStore {

    @observable isLoad: boolean = false;
    @observable user: CurrentUser = null;
    @observable error: string = '';

    //是否已经初始化了
    @observable private _inited = false;

    init(){
        if( this._inited || this.isLoad ){
            return;
        }

        this._inited = true;
        this.isLoad = true;

        axios.get('/dash/index/currentUser')
        .then( ({data}): any => {
            this.isLoad = false;
            if( data.status === 0){
                const userData = data.data.user;
                if( userData ){
                    //已登录
                    this.user = new User(userData.name, userData.level);
                }
                return this.user;
            }else{
                return Promise.reject( new Error(data.message));
            }
        })
        .catch( (err) => {
            this.isLoad = false;
            this.error = err.message;
            message.error(err.message);
        });
    }

    get inited(): boolean{
        return this._inited;
    }

    get isLogin(): boolean{
        return !! this.user;
    }

    get isAdmin(): boolean{
        return this.user && this.user.isAdmin;
    }

    get isReady(): boolean{
        return this._inited && ! this.isLoad;
    }
}


