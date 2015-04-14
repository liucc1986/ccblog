var express = require('express');
var User = require('../model/user');
var router = express.Router();
var crypto = require('crypto');

/* GET users listing. */
router.get('/logout', function(req, res, next) {
    req.session.user=null;
    req.flash('success','成功退出');
    res.redirect('/');
});
router.get('/cclogin', function(req, res, next) {
    if(req.session.user){
      return  res.redirect('/');
    }

    res.render('user/login',{
        title:"请登录",
        navActive:"login"
    });
});
router.post('/login', function(req, res, next) {
    if(req.session.user){
        return  res.redirect('/');
    }
    var md5=crypto.createHash('md5');
    var userName=req.body.username;
    var passWord=md5.update(req.body.password).digest('hex');
    User.get(userName,function(err,user){
        if(err){
            req.flash('error','查询出错');
            return res.redirect('back');
        }
        if(user){
            if(user.password !=passWord){
                req.flash('error','密码错误');
                return res.redirect('back');
            }else{
                req.flash('success','登陆成功,欢迎'+user.username);
                req.session.user=user;
                res.redirect('/');
            }
        }else{
            req.flash('error','用户名错误');
            res.redirect('back');
        }
    });
});
router.get('/reg', function(req, res, next) {
    res.render('user/reg',{
        title:"欢迎注册"

    });
});
router.post('/reg', function(req, res, next) {
    var userName=req.body.username;
    var email=req.body.email;
    var passWord=req.body.password;
    var passWord_repeat=req.body.password_repeat;
    if(!userName){
        req.flash('error','用户名不能为空');
        return res.redirect('back');
    }
    if(!passWord || passWord !=passWord_repeat ){
        req.flash('error','两次输入的密码不一致，请重新输入');
        return res.redirect('back');
    }
    var md5 = crypto.createHash('md5');
    passWord = md5.update(passWord).digest('hex');
    var newUser = new User({
        username:userName,
        password:passWord,
        email:email
    });
    User.get(userName,function(err,user){
        if(err){
            req.flash('error','查询出错');
            return res.redirect('back');
        }
        if(user){
            req.flash('error','用户名已经存在,请重新输入');
            return res.redirect('back');
        }else{
            newUser.save(function(err,user){
                if(err){
                    req.flash('error','注册失败');
                    return res.redirect('back');
                }else{
                    req.session.user = user;
                    req.flash('success','注册成功');
                    res.redirect('/');
                }

            });

        }
    });

});
module.exports = router;
