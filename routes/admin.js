var fs = require("fs");
var router = require('express').Router();
var formidable = require('formidable');
var log = require("../services/log.js");

var queryArts = require("../services/queryArticles.js");
var updateArts = require("../services/updateArticles.js");

var queryResource = require("../services/queryResource.js");
var updateResource = require("../services/updateResource.js");

var md5 = require("../libs/md5.js");
var fs = require("fs");
var path = require("path");

module.exports = router;


router.get("/", function (req, res) {
	var viewList = {};
	viewList.basePath = "http://10.106.89.64:3000/";
	res.render("admin", {viewList: viewList});
});


router.post("/", function (req, res) {
	
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

	var viewList = {};

	viewList.basePath = "http://10.106.89.64:3000/";

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

	var send = {success: true, code: 0, msg: ""};

	var config = {};

	var form = new formidable.IncomingForm();

	form.uploadDir = "./views/public/upload/";

    form.parse(req, function (err, fields, files){

    	var oldPath = files.resource.path;

    	config.category = files.resource.type;

    	config.name = files.resource.name.split(".");
    	var fileType = "."+config.name.pop();
    	config.name = config.name.join("");

    	var newPath = form.uploadDir + md5(config.name) + fileType;

    	config.url = "http://10.106.89.64:3000/upload/" + md5(config.name) + fileType;

    	try {
    		log.info("文件上传成功，正在写入......."+"<!log>");
		    fs.renameSync(oldPath, newPath);

		    log.info("文件上传成功，写入成功！"+"<!log>");
		    
		} catch(err) {
		    log.info("文件上传成功，写入失败！"+"<!log>");
		    send.success = false;
		    send.code = 1;
		    send.msg = "文件写入失败，服务器程序报错！"
		}

		if(!send.success) return res.send(send);

		var result = updateResource(config);

		result.then(function(){

			var servicesResult = result._rejectionHandler0._settledValue.writeData;

			if(servicesResult.success){
				
			}else{
				send.success = false;
				send.code = 2;
				send.msg = "文件写入成功，但是数据库写入失败，服务器程序报错！"
			}

			res.send(send);
		})

    });

});

router.get("/log", function (req, res, next) {

	var viewList = {};

	viewList.basePath = "http://10.106.89.64:3000/";

	res.render("admin_log", {viewList: viewList});

});

router.post("/log", function (req, res, next) {

	var send = {success: true, code: 0, msg: ""};

	var page = req.body.start*1;
	var limit = req.body.length*1;
	var startTime = req.body.startTime;
	var endTime = req.body.endTime;


	// fs.open(path.join(__dirname, "../logs/cheese.log"),'r',function (err, fd) {
	//     var buf = new Buffer(256);

	//     fs.read(fd, buf, 0, 9, 3, function (err, bytesRead, buffer) {

	//         console.log(buffer.length, bytesRead);

	//     });
	// })
	// 

	fs.readFile(path.join(__dirname, "../logs/cheese.log"), {encoding: "UTF-8" }, function (err, bytesRead) {

		var oldLogArray = bytesRead.split("<!log>");
		oldLogArray.pop();
		var logArray = [];

		oldLogArray.forEach(function (e) {

			var string = e.replace(/^\s/gi, "").replace(/^\n/gi, "");

			var type = string.split("] ")[1].replace(/\[/gi, "");;

			var eTime = string.split("] ")[0].replace(/\[/gi, "");

			if(startTime && (new Date(startTime).getTime()>new Date(eTime).getTime()) ) return;

			if(endTime && !(new Date(endTime).getTime()>new Date(eTime).getTime()) ) return;

			logArray.push({info: string, type: type, time: eTime});

		});

		send.data = [];

		send.recordsFiltered = logArray.length;
		send.recordsTotal = logArray.length;

		send.data = logArray.splice(page,limit);

		res.send(send);

	});

	// var send = {success: true, code: 0, draw: null};

	// send.data = [];

	// var result = queryResource({limit : limit, offset: page, order : 'ID asc'});

	// result.then(function(){

	// 	send.data = result._settledValue.queryData.resourceArray;

	// 	send.recordsFiltered = result._settledValue.queryData.length;
	// 	send.recordsTotal = result._settledValue.queryData.length;

	// 	res.send(send);

	// });

});