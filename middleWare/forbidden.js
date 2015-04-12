/**
 * Created by i on 2015/3/30.
 */
var url=require('url');
module.exports=function(options){
    options=options || {};
    return function(req,res,next){
        var pathname=url.parse(req.url).pathname;
        if(pathname!=='/'){
            if(options.mustLogin && new RegExp(pathname,'i').test(options.mustLogin)){
                if(!req.session.user){

                    req.flash('error','你尚未登录，请登录');
                    return res.redirect('/users/login');
                }
            }
            if(options.mustNotLogin && new RegExp(pathname,'i').test(options.mustNotLogin)){
                if(req.session.user){
                    req.flash('error',"您已登录,不鞥呢执行此操作");
                    return res.redirect('back');
                }
            }
        }
        next();
    }
}