var router = require('express').Router();
//var formidable = require('formidable');
var log = require("../services/log.js");

var queryArts = require("../services/queryArticles.js");
var updateArts = require("../services/updateArticles.js");

var queryResource = require("../services/queryResource.js");

var addResource = require("../services/addResource.js");

var queryLog = require("../services/queryLog.js");

var md5 = require("../libs/md5.js");
var config = require("../libs/config.js");



module.exports = router;

/**
 * [auth session]
 * @param  {[Object]} req [description]
 * @return {[Boolen]}     [description]
 */
var auth = function (req) {
	
	if(!req || !req.session || !req.session.auth || req.session.auth != md5(req.headers['user-agent'])){
		return true
	} else {
		return false;
	}

}

/**
 * [登陆]
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @return {[type]}       [description]
 */
router.get("/login", function (req, res, next) {

	var viewList = {};
	viewList.basePath = config.basePath;

	res.render("login", {viewList: viewList});

});

/**
 * [登陆]
 * @param  {[type]} req   [description]
 * @param  {[type]} res   [description]
 * @return {[type]}       [description]
 */
router.post("/login", function (req, res, next) {

	var send = {success: false, code: 0, msg: null};
	var username = req.body.username, password = req.body.password;

	if (!username || !password) {
		send.code = 1;
		send.msg = "用户名或者密码不能为空！";
	} else if (username === "admin"&&password === "admin") {
		send.success = true;
		req.session.auth = md5(req.headers['user-agent']);
	} else {
		send.code = 2;
		send.msg = "用户名或者密码错误！ ";
	}

	res.send(send);

});

/**
 * [description]
 * @param  {[type]} req  [description]
 * @param  {Object} res  [description]
 * @return {[type]}      [description]
 */
router.get("/", function (req, res) {

	if(auth(req)) res.redirect("admin/login");

	var viewList = {};
	viewList.basePath = config.basePath;

	res.render("admin", {viewList: viewList});

});

router.post("/", function (req, res) {

	if(auth(req)) res.redirect("admin/login");
	
	var page = req.body.start*1;
	var limit = req.body.length*1;

	var send = {success: true, code: 0, draw: null};

	send.data = [];

	var list = queryArts({
		category: {order : 'ID asc', attributes: ["CATEGORY"]},
		articles: {limit : limit, offset: page, order : 'ID asc'}
	});

	list.then(function(){

		send.data = list._settledValue.queryData.articleArray;

		send.recordsFiltered = list._settledValue.queryData.categoryArray.length;
		send.recordsTotal = list._settledValue.queryData.categoryArray.length;

		res.send(send);

	});
	
});

router.post("/arts/toUpdate", function (req, res, next) {

	if(auth(req)) res.redirect("login");

	var send = {success: true, code: 0, msg: ""};

	var ID = req.body.ID;

	send.data = [];

	var list = queryArts({
		articles: {where: {ID: ID}, limit : 1, order : 'ID asc'}
	});

	list.then(function(){

		send.data = list._settledValue.queryData.articleArray;

		res.send(send);

	});

});

router.post("/arts/edit", function (req, res, next) {

	if(auth(req)) res.redirect("login");

	var send = {success: true, code: 0, msg: ""};
	
	var config = {
		id: req.body.id,
		title: req.body.title,
		category: req.body.category,
		body: req.body.body
	};


	var result = updateArts(config);

	result.then(
		function(){

			var servicesResult = result._rejectionHandler0._settledValue.writeData;

			if(servicesResult.success){
				
			}else{
				send.success = false;
			}

			res.send(send);
		}
	);

});

router.post("/arts/delete", function (req, res, next) {

});

router.get("/resource", function (req, res, next) {

	if(auth(req)) res.redirect("login");

	var viewList = {};

	viewList.basePath = config.basePath;

	res.render("admin_resource", {viewList: viewList});

});

router.post("/resource", function (req, res, next) {

	var page = req.body.start*1;
	var limit = req.body.length*1;

	var send = {success: true, code: 0, draw: null};

	send.data = [];

	var result = queryResource({limit : limit, offset: page, order : 'ID asc'});

	result.then(function(){

		send.data = result._settledValue.queryData.resourceArray;

		send.recordsFiltered = result._settledValue.queryData.length;
		send.recordsTotal = result._settledValue.queryData.length;

		res.send(send);

	});

});

router.post("/resource/add", function (req, res, next) {

	addResource(req, function (result) {
        log.info(result);
		res.send(result);
	});

});

router.post("/resource/delete", function (req, res, next) {

	var send = {success: true, code: 0, msg: ""};

	res.send(send);

});

router.get("/log", function (req, res, next) {

	var viewList = {};

	viewList.basePath = config.basePath;

	res.render("admin_log", {viewList: viewList});

});

router.post("/log", function (req, res, next) {

    var date = req.body.date;
	var page = req.body.start*1;
	var limit = req.body.length*1;
	var startTime = req.body.startTime;
	var endTime = req.body.endTime;

    queryLog({date: date, page: page, limit: limit, startTime: startTime, endTime: endTime}, function (result) {
        res.send(result);
    });

});