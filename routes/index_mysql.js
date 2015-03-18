var express = require('express');
// var markdown = require( "markdown" ).markdown;

// var validator = require('validator');
var Read = require("./readSQL.js");
var mem = require("./mem.js");

var app = express();
var router = express.Router();

module.exports = router;


// get index "/"
router.get("/", function (req, res){

	var SQL = 'SELECT * FROM title; SELECT * FROM art ORDER BY art.change_date DESC; SELECT borth_date FROM art ORDER BY art.borth_date DESC';

	var read = new Read(SQL);

	read.get(function (rows){

		var arts = [], ds = [];

		rows[1].forEach(function (e, i){

			arts[i] = {};
			var date = new Date( e.change_date );
			arts[i].title = e.title;
			arts[i].categories = e.categories;
			arts[i].body = e.body;
			arts[i].id = e.id;
			arts[i].change_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

		});

		var date_collections = repeate(rows[2]);

		mem();

		res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections,"login" : req.session.user, "simple" : true});

	});

});

// get /css ~~~~~
router.get("/:id", function (req, res, next){

	var key = req.params.id;

	if(key === "login" || key === "reg" || key === "edit" || key === "logout") return next();

	var d = new Date(key);

	if(d == "Invalid Date"){

		key = 'categories="'+ key+'"';

	}else{

		var dd = d.getMonth() === 11 ? new Date( (d.getFullYear()+1)+"-"+(1) ) : new Date( d.getFullYear()+"-"+(d.getMonth()+2) );

		key = '(borth_date>'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' AND borth_date<'+dd.getFullYear()+'-'+(dd.getMonth()+1)+'-'+dd.getDate()+')';

	}

	if(req.query.key){

		var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE title ="'+req.query.key+'"; SELECT borth_date FROM art ORDER BY art.borth_date DESC';

	}else{

		var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE '+key+' ORDER BY art.change_date DESC; SELECT borth_date FROM art ORDER BY art.borth_date DESC';

	}

	console.log(SQL);

	var read = new Read(SQL);

	read.get(function (rows){

		var arts = [];

		rows[1].forEach(function (e, i){

			arts[i] = {};
			var date = new Date( e.change_date );
			arts[i].title = e.title;
			arts[i].categories = e.categories;
			arts[i].body = e.body;
			arts[i].id = e.id;
			arts[i].change_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

		});

		var date_collections = repeate(rows[2]);

		mem();

		if(req.query.key){

			res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, "login" : req.session.user, "simple" : false});

		}else{

			res.render("index",{"arts" : arts, "categories" : rows[0], "date" : date_collections, "login" : req.session.user, "simple" : true});

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