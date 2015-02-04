var express = require('express');
var Read = require("./readfile.js");

var router = express.Router();

router.get("/", function (req, res){

	var send = {
		"title"  : "index",
		"post" : "/",

	};

	res.render("index", send);

});

router.post("/", function (req, res){

	var read = new Read();

	read.seach(function(){

		res.send(read.data);

	})
})

router.get("/css", function (req, res){

	var send = {
		"title"  : "index",
		"post" : "/css",

	};

	res.render("index", send);

});

router.post("/css", function (req, res){
	
	var read = new Read("css");

	read.seach(function(){

		res.send(read.data);

	});

});
router.get("/javascript", function (req, res){

	var send = {
		"title"  : "index",
		"post" : "/javascript",

	};

	res.render("index", send);

});

router.post("/javascript", function (req, res){
	
	var read = new Read("javascript");

	read.seach(function(){

		res.send(read.data);

	});

});
router.get("/nodejs", function (req, res){

	var send = {
		"title"  : "index",
		"post" : "/nodejs",

	};

	res.render("index", send);

});

router.post("/nodejs", function (req, res){
	
	var read = new Read("nodejs");

	read.seach(function(){

		res.send(read.data);

	});

});



module.exports = router;

