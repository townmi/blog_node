var path = require('path');
var http = require('http');

var express = require('express');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var logger = require("tracer").colorConsole();

var log = require("./services/log.js");

// var routes = require('./routes/index');
// var users = require('./routes/user');
// var edit = require('./routes/edit');
// var resm = require('./routes/resm');

var index = require("./routes/index");
var admin = require("./routes/admin");

var mem = require("./routes/mem.js");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable("x-powered-by");

// logger.log('hello');
// logger.trace('hello', 'world');
// logger.debug('hello %s',  'world', 123);
// logger.info('hello %s %d',  'world', 123, {foo:'bar'});
// logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'});
// logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object);

// set port
app.set('port', process.env.PROT || 3000);

// body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))


app.use(cookieParser('keyboard cat'));
app.use(express.static(path.join(__dirname, 'views/public')));

// session
app.use(session({ 
    secret: 'keyboard cat', 
    key: 'sid', 
    cookie: { secure: false }
}));

// favicon
app.use(favicon(__dirname + '/views/public/favicon.ico'));

// 路由分发

app.use("/", index);
app.use("/admin", admin);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

http.createServer(app).listen(app.get('port'), function(){
    // console.log('Express server listening on port' + app.get('port'));
    mem();
    log.fatal('Express server listening on port' + app.get('port')+"<!log>");
});

