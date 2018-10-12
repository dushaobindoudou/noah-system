/**
 * 封装针对mysql中的 任务表 的操作
 * Created by Jess on 2017/12/18.
 */

'use strict';

const mysql = require('mysql');

const Model = require('./mysql_model.js');

//mysql table name
const TB_NAME = 'tb_task';


class TaskModel{

    constructor(args){
        this.model = args.model;
    }

    /**
     * 根据任务ID，获取任务详情
     * @param taskId {int} 任务ID
     * @returns {Promise.<void>}
     */
    async getTaskById( taskId){
        return this.model.query(`SELECT * from tb_task WHERE id=${mysql.escape(taskId)}`)
            .then( (out) => {
                return out.results[0];
            });
    }

    /**
     * 更新某个taskId对应的数据
     * @param taskId {int} 任务ID
     * @param fields {object} 要修改的字段
     * @param where {object} 筛选条件
     * @returns {Promise.<boolean>}
     */
    async updateTaskById(taskId, fields, where){
        where = where || {};
        where.id = taskId;
        let temp = await this.model.update(TB_NAME, fields, {
            where : where
        });
        return temp.changedRows === 1;
    }

    /**
     * 修改某个任务对应的状态
     * @param taskId {int} 任务ID
     * @param toStatus {int} 修改之后的状态
     * @param fromStatus {int} 当前状态
     * @returns {Promise.<void>}
     */
    async updateTaskStatus(taskId, toStatus, fromStatus){
        let sql = `UPDATE \`tb_task\` SET status=${toStatus}  WHERE \`status\` = ${fromStatus} AND \`id\` = ${mysql.escape(taskId)}`;
        return this.model.query(sql);
    }
}

TaskModel.TABLE_NAME = TB_NAME;


module.exports = TaskModel;

