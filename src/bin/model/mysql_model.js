/**
 * mysql常用帮助函数
 * Created by Jess on 2017/12/18.
 */

'use strict';

const mysql = require('mysql');


class Model {

    constructor(args){
        this.conn = args.connection;
        this.logger = args.logger;
    }

    query(sql, values) {
        return new Promise((resolve, reject) => {
            let finalSQL = sql;
            if (arguments.length === 2) {
                finalSQL = mysql.format(sql, values);
            }
            this.logger.log('执行MySQL的SQL语句:', finalSQL);
            this.conn.query(finalSQL, (err, results, fields) => {
                if (err) {
                    this.logger.error(`mysql执行异常！ 错误信息： ${err.message}`);
                    return reject(err);
                }
                this.logger.log(`mysql执行结果： `, results);
                resolve({
                    results: results,
                    fields: fields
                });
            });
        });
    }

    async insert(table, rows, options) {
        options = options || {};
        let firstObj;
        // insert(table, rows)
        if (Array.isArray(rows)) {
            firstObj = rows[0];
        } else {
            // insert(table, row)
            firstObj = rows;
            rows = [rows];
        }
        if (!options.columns) {
            options.columns = Object.keys(firstObj);
        }

        let params = [table, options.columns];
        let strs = [];
        for (let i = 0; i < rows.length; i++) {
            var values = [];
            var row = rows[i];
            for (let j = 0; j < options.columns.length; j++) {
                values.push(row[options.columns[j]]);
            }
            strs.push('(?)');
            params.push(values);
        }

        let sql = this.format('INSERT INTO ??(??) VALUES' + strs.join(', '), params);
        let out = await this.query(sql);
        return out.results;
    }

    async select(table, options) {
        options = options || {};
        let sql = this._selectColumns(table, options.columns) +
            this._where(options.where) +
            this._orders(options.orders) +
            this._limit(options.limit, options.offset);

        let out = await this.query(sql);
        return out.results;
    }

    async update(table, row, options) {
        options = options || {};
        if (!options.columns) {
            options.columns = Object.keys(row);
        }
        if (!options.where) {
            if (!('id' in row)) {
                throw new Error('Can\'t not auto detect update condition, please set options.where, or make sure obj.id exists');
            }
            options.where = {
                id: row.id
            };
        }

        let sets = [];
        let values = [];
        for (let i = 0; i < options.columns.length; i++) {
            var column = options.columns[i];
            if (column in options.where) {
                continue;
            }
            sets.push('?? = ?');
            values.push(column);
            values.push(row[column]);
        }
        let sql = this.format('UPDATE ?? SET ', [table]) +
            this.format(sets.join(', '), values) +
            this._where(options.where);

        let out = await this.query(sql);
        return out.results;
    }

    async deleteRows(table, where) {
        let sql = this.format('DELETE FROM ??', [table]) +
            this._where(where);
        let out = await this.query(sql);
        return out.results;
    }

    format(sql, values) {
        return mysql.format(sql, values);
    }

    escapeId(id) {
        return mysql.escapeId(id);
    }

    escape(value) {
        return mysql.escape(value);
    }


    /////////////// 下面这几个格式化函数, 来自 ali-sdk/ali-rds

    _selectColumns(table, columns) {
        if (!columns) {
            columns = '*';
        }
        let sql;
        if (columns === '*') {
            sql = this.format('SELECT * FROM ??', [table]);
        } else {
            sql = this.format('SELECT ?? FROM ??', [columns, table]);
        }
        return sql;
    }

    _where(where) {
        if (!where) {
            return '';
        }

        const wheres = [];
        const values = [];
        for (let key in where) {
            const value = where[key];
            if (Array.isArray(value)) {
                wheres.push('?? IN (?)');
            } else {
                wheres.push('?? = ?');
            }
            values.push(key);
            values.push(value);
        }
        if (wheres.length > 0) {
            return this.format(' WHERE ' + wheres.join(' AND '), values);
        } else {
            return '';
        }
    }

    _orders(orders) {
        if (!orders) {
            return '';
        }
        if (typeof orders === 'string') {
            orders = [orders];
        }
        let values = [];
        for (let i = 0; i < orders.length; i++) {
            let value = orders[i];
            if (typeof value === 'string') {
                values.push(this.escapeId(value));
            } else if (Array.isArray(value)) {
                // value format: ['name', 'desc'], ['name'], ['name', 'asc']
                let sort = String(value[1]).toUpperCase();
                if (sort !== 'ASC' && sort !== 'DESC') {
                    sort = null;
                }
                if (sort) {
                    values.push(this.escapeId(value[0]) + ' ' + sort);
                } else {
                    values.push(this.escapeId(value[0]));
                }
            }
        }
        return ' ORDER BY ' + values.join(', ');
    }

    _limit(limit, offset) {
        if (!limit || typeof limit !== 'number') {
            return '';
        }
        if (typeof offset !== 'number') {
            offset = 0;
        }
        return ' LIMIT ' + offset + ', ' + limit;
    }

}



module.exports = Model;

