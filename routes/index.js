var express = require('express');

var Read = require("./readSQL.js");
var mem = require("./mem.js");

var app = express();
var router = express.Router();

module.exports = router;

// get index "/"
router.get("/", function (req, res){

	var page_i = req.query.page;

	if(!page_i) page_i = 0;

	page_i = parseInt(page_i);

	var SQL = 'SELECT * FROM title; SELECT * FROM art ORDER BY art.borth_date DESC limit '+page_i*5+',5; SELECT borth_date FROM art ORDER BY art.borth_date DESC';

	var read = new Read(SQL);

	read.get(function (rows){

		var arts = [], ds = [];

		rows[1].forEach(function (e, i){

			arts[i] = {};
			var date = new Date( e.borth_date );
			arts[i].title = e.title
			arts[i].title2 = e.title;
			arts[i].categories = e.categories;
			arts[i].body = e.body;
			arts[i].id = e.id;
			arts[i].borth_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

		});

		var date_collections = repeate(rows[2]);
		var page = {page_all: Math.floor(rows[2].length/5), page_current: page_i, page_source: ""}

		mem();

		res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, page: page,"login" : req.session.name, "simple" : true, title : "首页"});

	});

});

// get /css ~~~~~
router.get("/:id", function (req, res, next){

	var id = key = req.params.id , page_i = req.query.page;

	if(!page_i) page_i = 0;
	page_i = parseInt(page_i);

	if(key === "login" || key === "reg" || key === "edit" || key === "logout" || key === "topic" || key === "resm") return next();

	var d = new Date(key), dd;

	var d2 = d.getFullYear() +"-"+ (d.getMonth()+1) +"-"+ d.getDate();

	if(d == "Invalid Date"){

		key = 'categories="'+ key+'"';

	}else{

		var dd = d.getMonth() === 11 ? new Date( (d.getFullYear()+1)+"-"+(1) ) : new Date( d.getFullYear()+"-"+(d.getMonth()+2) );

		key = 'borth_date BETWEEN "'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'" AND "'+dd.getFullYear()+'-'+(dd.getMonth()+1)+'-'+dd.getDate()+'"';

	}

	var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE '+key+' ORDER BY art.borth_date DESC limit '+page_i*5+',5; SELECT borth_date FROM art ORDER BY art.borth_date DESC;  SELECT * FROM art WHERE '+key;

	var read = new Read(SQL);

	read.get(function (rows){

		var arts = [];

		rows[1].forEach(function (e, i){

			arts[i] = {};
			var date = new Date( e.borth_date );
			arts[i].title = e.title
			arts[i].title2 = e.title;
			arts[i].categories = e.categories;
			arts[i].body = e.body;
			arts[i].id = e.id;
			arts[i].borth_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

		});

		var date_collections = repeate(rows[2]);

		var all = rows[3].length/5 === Math.floor(rows[3].length/5) ? 0 : Math.floor(rows[3].length/5);

		var page = {page_all: all, page_current: page_i}

		mem();

		if(d == "Invalid Date"){

			res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, page: page,"login" : req.session.name, "simple" : true, title : req.params.id});

		}else{

			res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, page: page,"login" : req.session.name, "simple" : true, title : d2});

		}	

	});

});

// get like /css/xxxxxx   ~~~~~~
router.get("/:id/:title", function (req, res){

	var id = req.params.id, title = req.params.title;

	var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE title ="'+title+'"; SELECT borth_date FROM art ORDER BY art.borth_date DESC';

	var read = new Read(SQL);

	read.get(function (rows){

		var arts = [];

		rows[1].forEach(function (e, i){

			arts[i] = {};
			var date = new Date( e.borth_date );
			arts[i].title = e.title
			arts[i].title2 = e.title;
			arts[i].categories = e.categories;
			arts[i].body = e.body;
			arts[i].id = e.id;
			arts[i].borth_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

		});

		var date_collections = repeate(rows[2]);

		mem();

		res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, "login" : req.session.name, "simple" : false});

	});

});


function repeate(arr){
	var date = [];
	for(var i=0; i<arr.length; i++){

		var d = new Date( arr[i].borth_date );
		var obj = {};
		obj.date = d.getFullYear()+"-"+(d.getMonth()+1);
		obj.num = 1;

		for(var j=i+1; j<arr.length; j++){

			var d1 = new Date( arr[j].borth_date );
			var d2 = new Date( obj.date );
			if( d1>=d2 ){
				obj.num = obj.num + 1;
			}else{
				i=j-1;
				break;
			}

		}

		date.push(obj);

		if(j == arr.length){

			break;
		}

	}

	return date
}