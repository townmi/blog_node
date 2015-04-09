var fs = require("fs");

var express = require('express');
var formidable = require('formidable');
var EventProxy = require("eventproxy");

var mem = require("./mem.js");

var app = express();
var router = express.Router();
var ep = new EventProxy();

module.exports = router;

router.get("/resm", function (req, res){

	//if(!req.session.name){

		//res.redirect("/");

	//}else{

		// 读取图片
		fs.readdir("public/upload/imgs", function (err, files){
			ep.emit("imgs", files);
		});
		// 读取音乐
		fs.readdir("public/upload/mp3", function (err, files){
			ep.emit("mp3", files);
		});


		// 处理异步回流
		ep.all("imgs", "mp3", function (imgs, mp3){
			// console.log(imgs, mp3)
			var newImgs = [], newMp3 = [];
			imgs.forEach(function (e){
				e = "http://127.0.0.1:3000/upload/imgs/"+e;
				newImgs.push(e);
			});
			mp3.forEach(function (e){
				e = "http://127.0.0.1:3000/upload/mp3/"+e;
				newMp3.push(e);
			});

			res.render("resm",{login: true, imgs: newImgs, mp3: newMp3});
		});
		
	//}

});

router.post("/resm", function (req, res){
	
	var form = new formidable.IncomingForm();

	form.uploadDir = "./public/upload/";

    form.parse(req, function (err, fields, files){
    	
    	console.log(files.file)

    	var dir;

    	if(/image/gi.test(files.file.type)){
    		dir = "./public/upload/imgs/"
    	}else if(/audio/gi.test(files.file.type)){
    		dir = "./public/upload/mp3/"
    	}else{
    		return;
    	}

    	fs.renameSync(files.file.path, dir+files.file.name);



    });

})