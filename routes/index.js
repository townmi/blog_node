var express = require('express');

var Read = require("./readSQL.js");
var mem = require("./mem.js");

var app = express();
var router = express.Router();

module.exports = router;

// get index "/"
router.get("/", function (req, res){

	var SQL = 'SELECT * FROM title; SELECT * FROM art ORDER BY art.change_date DESC limit 0,5; SELECT borth_date FROM art ORDER BY art.borth_date DESC';

	var read = new Read(SQL);

	read.get(function (rows){

		var arts = [], ds = [];

		rows[1].forEach(function (e, i){

			arts[i] = {};
			var date = new Date( e.change_date );
			arts[i].title = e.title
			arts[i].title2 = e.title;
			arts[i].categories = e.categories;
			arts[i].body = e.body;
			arts[i].id = e.id;
			arts[i].change_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

		});

		var date_collections = repeate(rows[2]);

		mem();

		res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, pages: Math.ceil(rows[2].length/5),"login" : req.session.name, "simple" : true, title : "首页"});

	});

});

// get /css ~~~~~
router.get("/:id", function (req, res, next){

	var key = req.params.id;

	for(var i in req.query){
		var key_title = i;
		break;
	}
	// console.log(key_title)
	if(key === "login" || key === "reg" || key === "edit" || key === "logout" || key === "topic") return next();

	var d = new Date(key), dd;

	var d2 = d.getFullYear() +"-"+ (d.getMonth()+1) +"-"+ d.getDate();

	if(d == "Invalid Date"){

		key = 'categories="'+ key+'"';

	}else{

		var dd = d.getMonth() === 11 ? new Date( (d.getFullYear()+1)+"-"+(1) ) : new Date( d.getFullYear()+"-"+(d.getMonth()+2) );

		key = 'borth_date BETWEEN "'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'" AND "'+dd.getFullYear()+'-'+(dd.getMonth()+1)+'-'+dd.getDate()+'"';

	}

	if(key_title){

		var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE title ="'+key_title+'"; SELECT borth_date FROM art ORDER BY art.borth_date DESC';

	}else{

		var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE '+key+' ORDER BY art.change_date DESC limit 0,5; SELECT borth_date FROM art ORDER BY art.borth_date DESC;  SELECT * FROM art WHERE '+key;

	}

	var read = new Read(SQL);

	read.get(function (rows){

		var arts = [];

		rows[1].forEach(function (e, i){

			arts[i] = {};
			var date = new Date( e.change_date );
			arts[i].title = e.title
			arts[i].title2 = e.title;
			arts[i].categories = e.categories;
			arts[i].body = e.body;
			arts[i].id = e.id;
			arts[i].change_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

		});

		var date_collections = repeate(rows[2]);

		mem();

		if(key_title){

			res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, "login" : req.session.name, "simple" : false});

		}else if(d == "Invalid Date"){

			res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, pages: Math.ceil(rows[3].length/5),"login" : req.session.name, "simple" : true, title : req.params.id});

		}else{

			res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, pages:  Math.ceil(rows[3].length/5),"login" : req.session.name, "simple" : true, title : d2});

		}	

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