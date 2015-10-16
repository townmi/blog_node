var router = require('express').Router();
var app = require("express")();
var log = require("../services/log.js");

var queryArts = require("../services/queryArticles.js");

var type = require("../libs/typeof.js")
var config = require("../libs/config.js");

// var md5 = require("../libs/md5.js");
// var Arts = require("../models/arts.js");

module.exports = router;


// var title = "简洁、直观、强悍的前端开发框架，让web开发更迅速、简单";
// var category = "mysql";
// var titleHash = md5(title);


// logger.info(titleHash);


// Arts.sync({}).then(function () {
// 	return Arts.build({TITLE: title, TITLE_HASH: titleHash, CATEGORY: category}).save()
// }).then(
// 	function (data) {
// 		logger.info("成功读取数据库；共查找"+data.length+"条！");
// 	},
// 	function (err) {
// 		logger.warn(err)
// 	},
// 	function (chunk) {
// 		logger.info("body:"+chunk)
// 	}
// );


// get index "/"
router.get("/", function (req, res, next) {

	console.log("\n\n\n\n\n\n\n\n");

	// log.info(req.headers["user-agent"]);

	console.log("\n\n\n\n\n\n\n\n");

	var viewList = {};

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

	});
	
});

router.get("/category/:id", function (req, res, next) {

	var category = req.params.id;

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
	});

})


router.get("/arts/:id", function (req ,res, next) {
	
	var titleHash = req.params.id;

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
		console.log(viewList)

		res.render("index", {viewList: viewList});
	});


});