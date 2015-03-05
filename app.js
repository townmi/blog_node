var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var routes = require('./routes/index');
var root = require('./routes/root');
var session = require('express-session');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set port
app.set('port', process.env.PROT || 3000);

// body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session
// app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: true }
}))

// favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// 路由分发
app.use(routes);

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
    console.log('Express server listening on port' + app.get('port'));
});