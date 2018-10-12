/**
 * 测试 diff 两个目录，并对目录中的某些文本文件，产出 bsdiff
 * Created by Jess on 2018/1/10.
 */

'use strict';


const path = require('path');
const fse = require('fs-extra');

const diffPatch = require('../../utils/diff_patch');


const oldDir = path.join(__dirname, `v1`);
const newDir = path.join(__dirname, `v2`);
const outputDir = path.join(__dirname, `output`);


async function main(){

    fse.removeSync(outputDir);
    fse.ensureDirSync(outputDir);

    function shouldBSdiff(filePath){
        return /\.(txt|bundle|js|css)$/.test(filePath);
    }

    try{
        let result = await diffPatch.diffDir(newDir, oldDir, outputDir, shouldBSdiff);
        console.log(`目录diff结果：\n`);
        console.log(result);
    }catch(err){
        console.error(err);
    }

    console.log('end');
    process.exit();
}


main();


