var path = require('path');
var http = require('http');

var express = require('express');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routes = require('./routes/index');
var users = require('./routes/user');
var edit = require('./routes/edit');
var resm = require('./routes/resm');

var mem = require("./routes/mem.js");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable("x-powered-by");


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
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({ 
    secret: 'keyboard cat', 
    key: 'sid', 
    cookie: { secure: false }
}));

// favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// 路由分发
app.get("/", routes);
app.get("/:id", routes);
app.get("/:id/:title", routes);

app.get("/edit", edit);
app.post("/edit", edit);
app.post("/change", edit);
app.post("/delete", edit);

app.get("/reg", users);
app.get("/login", users);
app.post("/reg", users);
app.post("/login", users);
app.post("/logout", users);

app.get("/resm", resm);
app.post("/resm", resm);
app.post("/deleteres", resm);

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

