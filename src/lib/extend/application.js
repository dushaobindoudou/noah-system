/**
 *
 * Created by Jess on 2018/7/11.
 */

'use strict';

const MODEL_SYMBOL = Symbol('app_model');

const utils = require('../../core/util.js');

//// 各种model
const appFactory = require('../../core/model/app.js');
const userFactory = require('../../core/model/user.js');
const userAppFactory = require('../../core/model/user_app.js');
const taskFactory = require('../../core/model/task.js');
const packageFactory = require('../../core/model/package.js');
const patchFactory = require('../../core/model/patch.js');

module.exports = {

  //工具函数
  get util(){
    return utils;
  },

  get model(){
    if( ! this[MODEL_SYMBOL]){
      this[MODEL_SYMBOL] = {
        App: appFactory(this.mysql),
        User: userFactory(this.mysql),
        UserApp: userAppFactory(this.mysql),
        Task: taskFactory(this.mysql),
        Package: packageFactory(this.mysql),
        Patch: patchFactory(this.mysql),
      };
    }
    return this[MODEL_SYMBOL];
  }

};