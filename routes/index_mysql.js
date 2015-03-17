var express = require('express');
var mysql = require("mysql");
// var markdown = require( "markdown" ).markdown;
var crypto = require("crypto");
var Buffer = require("buffer").Buffer;

// var validator = require('validator');

var config = require("../config/config.js");
var Read = require("./readSQL.js");
var mem = require("./mem.js");
var app = express();
var router = express.Router();

module.exports = router;


// get index "/"
router.get("/", function (req, res){

	var SQL = 'SELECT * FROM title; SELECT * FROM art ORDER BY art.change_date DESC';

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

		mem();

		res.render("index",{"arts" : arts, "categories" : rows[0], "login" : req.session.user, "simple" : true});

	});

});

// get /css ~~~~~
router.get("/:id", function (req, res, next){

	var key = req.params.id;
	
	if(key === "login" || key === "reg" || key === "edit" || key === "logout") return next();

	if(req.query.key){

		var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE title ="'+req.query.key+'"';

	}else{

		var SQL = 'SELECT * FROM title; SELECT * FROM art WHERE categories="'+key+'" ORDER BY art.change_date DESC';

	}

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

		mem();

		if(req.query.key){

			res.render("index",{"arts" : arts, "categories" : rows[0], "login" : req.session.user, "simple" : false});

		}else{

			res.render("index",{"arts" : arts, "categories" : rows[0], "login" : req.session.user, "simple" : true});

		}	

	});

});


router.get("/edit", function (req, res){

	if(!req.session.user && !req.session.password){

		res.redirect("/login");

	}else{

		var SQL = 'SELECT * FROM art WHERE title="'+req.query.key+'"';

		var read = new Read(SQL);

		read.get(function (rows){

			res.render("edit", {"title" : "编辑", data : rows});

		});

	}

});

router.post("/edit", function (req, res){

	var STR = '"'+req.body.title +'","'+ req.body.categories +'","'+ req.body.body +'"';

	// var SQL = 'INSERT INTO art(title, categories, body) values('+STR+')';

	var SQL = 'SELECT title,num form title WHERE title="'+req.body.categories+'"';

	var read = new Read(SQL);

	read.get(function (rows){

		console.log(rows);

		// res.send({"target" : true});

	});

});

router.post("/change", function (req, res){

	var date = new Date();

	var day = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

	var body = req.body.body.replace(/"/g, "'");

	var SQL = 'UPDATE art SET title="'+req.body.title+'",categories="'+req.body.categories+'",change_date="'+day+'",body="'+body+'" WHERE id="'+req.body.key+'"';



	// var SQL = 'UPDATE art SET change_date="'+day+'" WHERE id="4"';

	// 'UPDATE art SET body="``` var str = "abcd"; console.log('+"'"+'abcd'+"'"+');```" WHERE id="4"';

	// var str = "``` var  console.log('abcd');```";
	// str.replace(/'/g, ''+"'"+'');

	pool.getConnection(function (err, connection) {

		// 'INSERT INTO test(name, sex) values("hanmeimei", "1"),("lilie", "0")'

		connection.query(SQL, function (err, rows) {

			connection.release();

			// res.redirect(301,"/");

			res.send({"target" : true});

		});

	});

});

// 删除
router.post('/delete', function (req, res){

	var SQL = 'DELETE FROM art WHERE title="'+req.body.key+'"';

	var read = Read(SQL);

	read.get(function (){

		res.send({"target" : true});

	});

});

// 用户登录
router.get('/reg', function (req, res){

	if(req.session.name === "admin_root"){

		res.redirect("/");

	}else{

		res.render("login",{"title" : "注册"});

	}

});

router.post("/reg", function (req, res){

	var name = req.body.name;

	var password = req.body.password;

	if(!isUsername(name)){

		return res.send({"resCode": 0, "title" : base.meassage.username[0]});

	}else if(!isPassword(password)){

		return res.send({"resCode": 1, "title" : base.meassage.password[1]});

	}

	var FoundSQL = 'SELECT * FROM user WHERE username="'+name+'"';

	// console.log(md5(password));

	var InsertSQL = 'INSERT INTO user(username, password) values('+'"'+name +'","'+ md5(password) +'"'+')';

	// console.log(InsertSQL);

	pool.getConnection(function (err, connection) {

		// 'INSERT INTO art(title, categories, body) values('+STR+')'

		connection.query(FoundSQL, function (err, rows){

			// connection.release();

			// res.redirect(301,"/");

			if(rows.length){

				// console.log(md5("abcd1234") == rows[0].password);

				connection.release();

				return res.send({"resCode": 2, "title" : base.meassage.username[1]});

			}

			connection.query(InsertSQL, function (err, rows){

				connection.release();

				req.session.name = "admin_root";

				req.session.user = name;

				req.session.password = password;

				return res.send({"resCode": 3, "title" : "success"});

			})

		});

	});

})

router.get('/login', function (req, res){

	if(req.session.name === "admin_root"){

		res.redirect("/");

	}else{

		res.render("login", {"title" : "登陆"});

	}

	return mem();

});

router.post('/login', function (req, res){
	
	var name = req.body.name;

	var password = req.body.password;

	if(!isUsername(name)){

		return res.send({"resCode": 0, "title" : base.meassage.username[0]});

	}else if(!isPassword(password)){

		return res.send({"resCode": 1, "title" : base.meassage.password[1]});

	}

	var SQL = 'SELECT * FROM user WHERE username="'+name+'"';

	var read = new Read(SQL);

	read.get(function (rows){

		if(rows.length){

			if(md5(password) == rows[0].password){

				req.session.name = "admin_root";

				req.session.user = name;

				req.session.password = password;

				return res.send({"resCode": 3, "title" : "success"});

			}else{

				return res.send({"resCode": 1, "title" : base.meassage.password[2]});

			}

		}else{

			return res.send({"resCode": 2, "title" : base.meassage.username[2]});

		}

		mem();

	});

});

router.post('/logout', function (req, res){

	req.session.name = null;
	req.session.user = null;
	req.session.password = null;

	res.send({"login" : false});

});



var base = {
	username : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$|^1[3,4,5,7,8]{1}[0-9]{9}$/,
	phone : /^1[3,4,5,7,8]{1}[0-9]{9}$/,
	email : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
	password:/^(?!\d+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,18}$/,
	nickname : /^[A-Za-z0-9\u4E00-\u9FA5]+$/,
	identity : /^\d{17}[\d,x,X]$/,
	bankcard : /^\d{16,19}$/,
	chinname : /^[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*$/,
	captcha : /^\w{4}$/,
	meassage : {
		username : ["手机或邮箱格式错误","手机或邮箱已注册","手机或邮箱未注册"],
		phone : ["手机号码不能为空！", "请输入正确手机号！"],
		email : ["邮箱格式有误"],
		password : ["密码不能为空！","密码格式错误","密码不正确"],
		nickname : ["昵称只能用中文、英文、数字组合"],
		identity : ["身份证格式错误"],
		checkIdCard : ["身份证号码错误"],
		bankcard : ["银行卡格式错误"],
		chinname : ["中文姓名格式有误"],
		captcha : ["验证码不能为空！","验证码输入有误"]
	}
};

function isPassword(str){
	return base.password.test(str);
}

function isUsername(str){
	return base.username.test(str);
}


function md5(data) {

    var buf = new Buffer(data);

    var str = buf.toString("binary");

    return crypto.createHash("md5").update(str).digest("hex");

}

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