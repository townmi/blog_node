var express = require('express');
var mysql = require("mysql");
var markdown = require( "markdown" ).markdown;

var config = require("../config/config.js");
var app = express();
var router = express.Router();

module.exports = router;


function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}


var pool = mysql.createPool({
	connectionLimit : 10,
	host : config.host,
	port : config.port,
	user : config.user,
	database : 'test',
	password : config.password
})

router.get("/", function (req, res){

	pool.getConnection(function (err, connection) {

		// 'SELECT * FROM art'

		connection.query('SELECT * FROM art ORDER BY art.date DESC', function (err, rows){

			var categories = [];

			var arts = [];

			rows.forEach(function (e, i){

				arts[i] = {};

				arts[i].title = e.title;
				arts[i].categories = e.categories;
				arts[i].body = markdown.toHTML( e.body );
				arts[i].id = e.id;
				arts[i].date = e.date.getFullYear()+"-"+(e.date.getMonth()+1)+"-"+e.date.getDate();

				categories.push(e.categories);

			})

			if(arts.length>4){

				arts = arts.slice(0,5);

			}

			console.log(arts);

			var categories = unique(categories);

			connection.release();

			res.render("index",{"arts" : arts, "categories" : categories});

		});

	});

})

router.get("/edit", function (req, res){

	res.render("edit", {"title" : "编辑"});

})

router.post("/edit", function (req, res){

	var STR = '"'+req.body.title +'","'+ req.body.date +'","'+ req.body.categories +'","'+ req.body.body +'"';

	pool.getConnection(function (err, connection) {

		// 'INSERT INTO test(name, sex) values("hanmeimei", "1"),("lilie", "0")'

		connection.query('INSERT INTO art(title, date, categories, body) values('+STR+')', function (err, rows) {

			connection.release();

			// res.redirect(301,"/");

			res.send({"target" : true});

		});

	});

})