var router = require('express').Router();
var app = require("express")();
var log = require("../services/log.js");

var queryArts = require("../services/queryArticles.js");

var type = require("../libs/typeof.js");
var config = require("../libs/config.js");

// var md5 = require("../libs/md5.js");
// var Arts = require("../models/arts.js");

module.exports = router;

/**
 * [index]
 * @method [get]
 */
router.get("/", function (req, res, next) {

	var viewList = {};

	var ip = req.connection.remoteAddress.split(":").pop();
    log.fatal(ip+" 用户正在访问,{'url': '/', 'methtod': 'get'}, controller in<!log>");

	viewList.basePath = config.basePath;

	viewList.title = "首页";

	viewList.device = type.device(req.headers["user-agent"]);

	var list = queryArts({
		category: {order : 'ID asc', group: "CATEGORY", attributes: ["CATEGORY"]},
		articles: {limit : 50, order : 'ID asc'}
	});

	list.then(function(){

		viewList.category = list._settledValue.queryData.categoryArray;
		viewList.articles = list._settledValue.queryData.articleArray;

		res.render("index", {viewList: viewList});
        log.fatal(ip+" 用户正在访问,{'url': '/', 'methtod': 'get'}, controller out<!log>");

	});
	
});

/**
 * [article]
 * @method [get]
 */
router.get("/category/:id", function (req, res) {

	var category = req.params.id;

    var ip = req.connection.remoteAddress.split(":").pop();
    log.fatal(ip+" 用户正在访问,{'url': '/category/"+category+"', 'methtod': 'get', 'argvs': {'id': '"+category+"'}}, controller in <!log>");

	var viewList = {};

	viewList.basePath = config.basePath;

	viewList.title = category;

	viewList.device = type.device(req.headers["user-agent"]);

	var list = queryArts({
		category: {order : 'ID asc', group: "CATEGORY", attributes: ["CATEGORY"]},
		articles: {where: {CATEGORY: category}, limit : 10, order : 'ID asc'}
	});

	list.then(function(){
		viewList.category = list._settledValue.queryData.categoryArray;
		viewList.articles = list._settledValue.queryData.articleArray;

		res.render("index", {viewList: viewList});
        log.fatal(ip+" 用户正在访问,{'url': '/category/"+category+"', 'methtod': 'get', 'argvs': {'id': '"+category+"'}}, controller out <!log>");

	});

});


router.get("/arts/:id", function (req ,res, next) {
	
	var titleHash = req.params.id;

    var ip = req.connection.remoteAddress.split(":").pop();
    log.fatal(ip+" 用户正在访问,{'url': '/arts/"+titleHash+"', 'methtod': 'get', 'argvs': {'id': '"+titleHash+"'}}, controller in <!log>");

	var viewList = {};

	viewList.basePath = config.basePath;

	viewList.device = type.device(req.headers["user-agent"]);

	var list = queryArts({
		category: {order : 'ID asc', group: "CATEGORY", attributes: ["CATEGORY"]},
		articles: {where: {TITLE_HASH: titleHash}, limit : 1, order : 'ID asc'}
	});

	list.then(function(){

		viewList.category = list._settledValue.queryData.categoryArray;
		viewList.articles = list._settledValue.queryData.articleArray;

		viewList.title = viewList.articles[0].TITLE;

		res.render("index", {viewList: viewList});
        log.fatal(ip+" 用户正在访问,{'url': '/arts/"+titleHash+"', 'methtod': 'get', 'argvs': {'id': '"+titleHash+"'}}, controller out <!log>");

	});

});

router.post("/search", function (req, res) {

	var keyword = req.body.key;

    var ip = req.connection.remoteAddress.split(":").pop();
    log.fatal(ip+" 用户正在访问,{'url': '/search', 'methtod': 'post', 'argvs': {'key': '"+keyword+"'}}, controller in <!log>");

    var send = {success: true, code: 0};

    var list = queryArts({
        category: null,
        articles: {limit : 10, offset: 10, order : 'ID asc', where: {"TITLE": {$like: "%"+keyword+"%"}}}
    });

    list.then(function(){

        send.category = null;
        send.articles = list._settledValue.queryData.articleArray;

        res.send(send);
        log.fatal(ip+" 用户正在访问,{'url': '/search', 'methtod': 'post', 'argvs': {'key': '"+keyword+"'}}, controller out <!log>");

    });

});