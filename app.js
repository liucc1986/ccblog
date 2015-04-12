var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoStore=require('connect-mongo')(session);
var settings=require('./settings');
var flash = require('connect-flash');
var routes = require('./routes/index');
var users = require('./routes/users');
var article=require('./routes/article')
var forbidden=require('./middleWare/forbidden');
var app = express();
app.use(session({
    cookie: { maxAge: 6000000 },
    secret:"hadha",
    resave:false,
    saveUninitialized:false,
    store:new mongoStore(//设置session的存储
        {
            db:settings.mongoConfig.db,
            host:settings.mongoConfig.host,
            port:settings.mongoConfig.port
        }
    )
}));
app.use(flash());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(forbidden({
    "mustLogin":['/users/logout','/article/add'],
    "mustNotLogin":['/users/reg','/users/cclogin']
}));
app.use(function(req,res,next){
    //req.session.cookie.maxAge=1000;
    res.locals.error = req.flash('error').toString() || "";
    res.locals.success = req.flash('success').toString() || "";
    res.locals.title = "";
    res.locals.user = req.session.user;
    res.locals.keyword="";
    res.locals.navActive="";
    res.locals.tags=[];
    next();
});
app.use('/', routes);
app.use('/users', users);
app.use('/article', article);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlerszuot

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
