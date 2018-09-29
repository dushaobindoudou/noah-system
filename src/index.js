/**
 * 应用入口
 * Created by Jess on 2018/6/5.
 */

'use strict';


const path = require('path');
const leek = require('leekjs');

const LeekApp = leek.LeekApp;

const app = new LeekApp({
    appRoot: __dirname,
    port: 9030,
    prefix: '/'
});

app.run();


