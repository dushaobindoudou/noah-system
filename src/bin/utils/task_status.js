/**
 * 任务表中的不同状态枚举
 * Created by Jess on 2017/12/18.
 */

'use strict';



module.exports = {

    //已提交
    INIT : 0,
    //进行中
    PROCESS : 1,
    //执行出错
    ERROR : 2,
    //全量包成功
    SUCCESS : 3,
    //增量包成功
    PATCH_SUCCESS : 4,
    //增量包异常
    PATCH_ERROR : 5
};
