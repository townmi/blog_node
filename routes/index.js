var router = require('express').Router();
var app = require("express")();
var log = require("../services/log.js");

var queryArts = require("../services/queryArticles.js");

var type = require("../libs/typeof.js");
var config = require("../libs/config.js");

// var md5 = require("../libs/md5.js");
// var Arts = require("../models/arts.js");

module.exports = router;

// get index "/"
router.get("/", function (req, res, next) {

	// log.info(req.headers["user-agent"]);

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

router.get("/category/:id", function (req, res) {

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


router.post("/search", function (req, res, next) {
	var data = req.body;
	console.log(data);
})