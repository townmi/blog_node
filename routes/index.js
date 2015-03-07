var express = require('express');
var mysql = require("mysql");
var markdown = require( "markdown" ).markdown;
var crypto = require("crypto");
var Buffer = require("buffer").Buffer;

// var validator = require('validator');

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
});

router.get("/", function (req, res){

	// console.log(req.session);

	pool.getConnection(function (err, connection) {

		// 'SELECT * FROM art'

		connection.query('SELECT * FROM art ORDER BY art.change_date DESC', function (err, rows){

			var categories = [];

			var arts = [];

			rows.forEach(function (e, i){

				arts[i] = {};

				var date = new Date( e.change_date );

				arts[i].title = e.title;
				arts[i].categories = e.categories;
				arts[i].body = markdown.toHTML( e.body );
				arts[i].id = e.id;
				arts[i].change_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

				categories.push(e.categories);

			})

			// if(arts.length>4){

			// 	arts = arts.slice(0,5);

			// }

			// console.log(arts);

			var categories = unique(categories);

			connection.release();

			res.render("index",{"arts" : arts, "categories" : categories});

		});

	});

})

router.get("/edit", function (req, res){

	console.log(req.session);

	pool.getConnection(function (err, connection) {

		// 'SELECT * FROM art WHERE title="'+req.query.key+'"'

		connection.query('SELECT * FROM art WHERE title="'+req.query.key+'"', function (err, rows) {

			connection.release();

			// res.redirect(301,"/");

			// console.log(rows);

			res.render("edit", {"title" : "编辑", data : rows});

		});

	});

	

});

router.post("/edit", function (req, res){

	var STR = '"'+req.body.title +'","'+ req.body.categories +'","'+ req.body.body +'"';

	// var SQL = "INSERT INTO art(title, categories, body) values('" & req.body.title & "','" & req.body.categories & "','" & req.body.body &"')";

	var SQL = 'INSERT INTO art(title, categories, body) values('+STR+')';

	console.log(SQL);

	pool.getConnection(function (err, connection) {

		// 'INSERT INTO art(title, categories, body) values('+STR+')'

		connection.query(SQL, function (err, rows) {

			connection.release();

			// res.redirect(301,"/");

			res.send({"target" : true});

		});

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

			console.log(rows);

			// res.redirect(301,"/");

			res.send({"target" : true});

		});

	});

});

// 删除
router.post('/delete', function (req, res){

	var SQL = 'DELETE FROM art WHERE title="'+req.body.key+'"';

	pool.getConnection(function (err, connection) {

		connection.query(SQL, function (err, rows) {

			connection.release();

			// res.redirect(301,"/");

			res.send({"target" : true});

		});

	});

});

// 用户登录
router.get('/reg', function (req, res){

	console.log(req.session);

	res.render("login",{"title" : "注册"});

});

// console.log(md5("password"));

router.post("/reg", function (req, res){

	var name = req.body.name;

	var password = req.body.password;

	// console.log(isUsername(name), isPassword(password));

	if(!isPassword(password) || !isUsername(name)) return;

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

				res.send({"target" : true});

				return;

			}

			connection.query(InsertSQL, function (err, rows){

				connection.release();

				res.send({"target" : true});

			})

		});

	});

})

router.get('/login', function (req, res){

	console.log(req.session);

	res.render("login", {"title" : "登陆"});

});

router.post('/login', function (req, res){
	
	var name = req.body.name;

	var password = req.body.password;

	// console.log(isUsername(name), isPassword(password));

	if(!isPassword(password) || !isUsername(name)) return;

	var FoundSQL = 'SELECT * FROM user WHERE username="'+name+'"';

	pool.getConnection(function (err, connection) {

		connection.query(FoundSQL, function (err, rows){

			connection.release();

			if(rows.length){

				if(md5(password) == rows[0].password){

					res.send({"login" : true});

					// console.log(res.redirect);

					// res.render("login", {"title" : "登陆"});

					// return res.redirect("/");

				}else{

					res.send({"login" : false});

				}

			}else{

				res.send({"login" : false});

			}

		});

	});

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
		username : ["手机或邮箱格式错误",""],
		phone : ["手机号码不能为空！", "请输入正确手机号！"],
		email : ["邮箱格式有误"],
		password : ["密码不能为空！","密码格式错误"],
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