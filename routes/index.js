var express = require('express');
var Read = require("./readfile.js");

var router = express.Router();

router.get(/^\/{1}[^\_]\S+$/, function (req, res){

	var read = new Read();

	read.seach(function(){

		var send = {
			"title"  : decodeURIComponent(req.url ),
			"post" :  decodeURIComponent(req.url ),
			"categories" : read.titles
		};

		if(/-/g.test( req.url ) ){

			res.render("art", send);

		}else{

			res.render("index", send);

		}

	});

});
router.post(/^\/{1}[^\_]\S+$/, function (req, res){

	var read = new Read( decodeURIComponent( req.url ).replace(/\//g,""));

	read.seach(function(){

		res.send(read.data);

	})

});
router.get("/", function (req, res){

	var read = new Read();

	read.seach(function(){

		var send = {
			"title"  : "index",
			"post" :  "/",
			"categories" : read.titles
		};

		res.render("index", send);

	});

});

router.post("/", function (req, res){

	var read = new Read();

	read.seach(function(){


		res.send(read.data);


	})

});

router.get('/_login', function (req, res) {
	console.log("get/_login");
	var send = {
		"title"  : "login"
	};

	res.render("login", send);

});



// router.get("/", function (req, res){

// 	var send = {
// 		"title"  : "index",
// 		"post" : "/",

// 	};

// 	res.render("index", send);

// });

// router.post("/", function (req, res){

// 	var read = new Read();

// 	read.seach(function(){

// 		res.send(read.data);

// 	})
// })

// router.get("/css", function (req, res){

// 	var send = {
// 		"title"  : "index",
// 		"post" : "/css",

// 	};

// 	res.render("index", send);

// });

// router.post("/css", function (req, res){
	
// 	var read = new Read("css");

// 	read.seach(function(){

// 		res.send(read.data);

// 	});

// });
// router.get("/javascript", function (req, res){

// 	var send = {
// 		"title"  : "index",
// 		"post" : "/javascript",

// 	};

// 	res.render("index", send);

// });

// router.post("/javascript", function (req, res){
	
// 	var read = new Read("javascript");

// 	read.seach(function(){

// 		res.send(read.data);

// 	});

// });
// router.get("/nodejs", function (req, res){

// 	var send = {
// 		"title"  : "index",
// 		"post" : "/nodejs",

// 	};

// 	res.render("index", send);

// });

// router.post("/nodejs", function (req, res){
	
// 	var read = new Read("nodejs");

// 	read.seach(function(){

// 		res.send(read.data);

// 	});

// });



module.exports = router;

