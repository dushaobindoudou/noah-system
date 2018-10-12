/**
 * 测试解压 zip 文件
 * Created by Jess on 2018/1/10.
 */

'use strict';


const path = require('path');
const fse = require('fs-extra');

const FSHelper = require('../../utils/fs_helper');


const zipFile = path.join(__dirname, `../test_zips/v1.zip`);

const outputDir = path.join(__dirname, 'v1_output');

async function main(){
    fse.ensureDirSync(outputDir);
    try{
        await FSHelper.unzip2Dir(zipFile, outputDir, true);
    }catch(err){
        console.error(err);
    }
    process.exit();
}


main();

