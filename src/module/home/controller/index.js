/**
 *
 * Created by Jess on 2018/6/11.
 */

'use strict';

class IndexController extends leek.Controller{

    async testErrorAction(){
        await this.ctx.render('fsda/fdaf');
    }
}



module.exports = IndexController;


