var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var routes = require('./routes/index');
var root = require('./routes/root');
var session = require('express-session');

// var mysql = require("mysql");
var SessionStore = require('express-mysql-session');

var config = require("./config/config.js");


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


app.use(cookieParser('likeshan'));
app.use(express.static(path.join(__dirname, 'public')));

// session
var options = {
	host: config.host,
	port: config.port,
	user: config.user,
	password: config.password,
	database: "session"
}
// var connection = mysql.createConnection(options)
// var sessionStore = new SessionStore({}, connection)

var sessionStore = new SessionStore(options);

// console.log(sessionStore);
app.use(session({
    key: 'likeshan',
    secret: 'likeshan',
    store: sessionStore,
    resave: true,
    saveUninitialized: true
}));


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