var express = require('express');

var Read = require("./readSQL.js");
var mem = require("./mem.js");

var app = express();
var router = express.Router();

module.exports = router;


router.get("/edit", function (req, res){

	if(!req.session.user && !req.session.password){

		res.redirect("/login");

	}else{

		var SQL = 'SELECT * FROM art WHERE title="'+req.query.key+'"';

		var read = new Read(SQL);

		read.get(function (rows){

			res.render("edit", {"title" : "编辑", "login" : req.session.name, data : rows});

		});

	}

});

router.post("/edit", function (req, res){

	var cate = req.body.categories;

	var STR = '"'+req.body.title +'","'+ cate +'","'+ req.body.body +'"';

	var SQL = 'SELECT title,num FROM title WHERE title="'+cate+'"';

	var read = new Read(SQL);

	read.get(function (rows){

		if(rows.length){

			var SQL = 'INSERT INTO art(title, categories, body) values('+STR+'); UPDATE title SET num="'+(rows[0].num+1)+'" WHERE title="'+cate+'"';

		}else{

			var SQL = 'INSERT INTO art(title, categories, body) values('+STR+'); INSERT INTO title(title, num) values("'+cate+'", 1)';

		}

		read.get(function (rows){

			res.send({"target" : true});

		}, SQL);

	});

});

router.post("/change", function (req, res){

	var date = new Date();

	var day = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

	var body = req.body.body.replace(/"/g, "'");

	var SQL = 'UPDATE art SET title="'+req.body.title+'",categories="'+req.body.categories+'",change_date="'+day+'",body="'+body+'" WHERE id="'+req.body.key+'"';

	var read = new Read(SQL);

	read.get(function (){

		res.send({"target" : true});

	});

});

// 删除
router.post('/delete', function (req, res){

	var title = req.body.key;

	var SQL = 'SELECT title,categories FROM art WHERE title="'+title+'"';

	var read = new Read(SQL);

	read.get(function (rows){

		if(rows.length){

			var categories = rows[0].categories

			var SQL = 'SELECT title,num FROM title WHERE title="'+categories+'"';

			read.get(function (rows){

				var num = rows[0].num-1;

				if(num<1){

					var SQL = 'DELETE FROM art WHERE title="'+title+'"; DELETE FROM title WHERE title="'+categories+'"';

				}else{

					var SQL = 'DELETE FROM art WHERE title="'+title+'"; UPDATE title SET num="'+num+'" WHERE title="'+categories+'"';
				}

				read.get(function (){

					res.send({"target" : true});

				}, SQL)

			}, SQL);

		}else{

			res.send({"target" : false});

		}

	});

});