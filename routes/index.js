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

})



module.exports = router;

