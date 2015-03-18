var crypto = require("crypto");
var Buffer = require("buffer").Buffer;

var express = require('express');

var Read = require("./readSQL.js");
var mem = require("./mem.js");

var router = express.Router();

module.exports = router;


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