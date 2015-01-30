var express = require('express');
var Read = require("./readfile.js");

var router = express.Router();

router.get("/", function (req, res){

	var read = new Read();


	read.seach(function(){

		res.send(read.data);

		// res.render("index", { "title": "index"});

		//res.sendFile("/index.ejs");

		

	})

})

router.get("/css", function (req, res){

	var read = new Read("css");

	read.seach(function(){

		// res.send(read.data);

		res.render("index", { "title": "CSS","s":res});
		console.log(res.req);

	})

})



module.exports = router;

