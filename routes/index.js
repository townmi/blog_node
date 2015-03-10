var crypto = require("crypto");
var Buffer = require("buffer").Buffer;

var express = require('express');
var mongodb = require('mongodb');
var markdown = require( "markdown" ).markdown;


// var validator = require('validator');

var config = require("../config/config.js");
var app = express();
var router = express.Router();

module.exports = router;

var server = new mongodb.Server('192.168.18.130', 27017, {auto_reconnect:true});
var db = new mongodb.Db('test', server, {safe:true});

console.log(db.close);


router.get("/", function (req, res){
	// res.send({});

	//连接db
	db.open(function(err, db){
	    if(!err){

	        console.log('connect db');
	        // 连接Collection（可以认为是mysql的table）
	        // 第1种连接方式
	        // db.collection('mycoll',{safe:true}, function(err, collection){
	        //     if(err){
	        //         console.log(err);
	        //     }
	        // });
	        // 第2种连接方式
	        db.createCollection('user', {safe:true}, function(err, collection){
	            if(err){

	                console.log(err,1);

	                db.close();

	            }else{
					// 新增数据
					// var tmp1 = {id:'1',title:'hello',number:1};
					// collection.insert(tmp1,{safe:true},function(err, result){
					// 	console.log(result);
					// }); 
					// 更新数据
					// collection.update({title:'hello'}, {$set:{number:3}}, {safe:true}, function(err, result){
					// 	console.log(result);
					// });
					// 删除数据
					// collection.remove({title:'hello'},{safe:true},function(err,result){
					// 	console.log(result);
					// });

					// console.log(collection);
					// 查询数据
					// var tmp1 = {title:'hello'};
					// var tmp2 = {title:'world'};
					// collection.insert([tmp1,tmp2],{safe:true},function(err,result){
					// 	console.log(result);
					// }); 
					// collection.find().toArray(function(err,docs){
					// 	console.log('find');
					// 	console.log(docs);
					// }); 
					// collection.findOne(function(err,doc){
					// 	console.log('findOne');
					// 	console.log(doc);
					// }); 
					db.close();
	            }

	        });

			// console.log('delete ...');
			//删除Collection
			// db.dropCollection('mycoll',{safe:true},function(err,result){

			// 	if(err){

			// 		console.log('err:');
			// 		console.log(err);
			// 	}else{
			// 		console.log('ok:');
			// 		console.log(result);
			// 	}
			// }); 
		
	    }else{

	        console.log(err,2);

	        db.close();
	    }

	    // db.close();
	});

})

router.get("/:id", function (req, res, next){

	var key = req.params.id
	
	if(key === "login" || key === "reg" || key === "edit") return next();

	// 'SELECT * FROM art'
	pool.getConnection(function (err, connection) {

		var SQL = 'SELECT * FROM title';

		connection.query(SQL, function (err, rows){

			var titles = rows;

			var SQL = 'SELECT * FROM art WHERE categories="'+key+'" ORDER BY art.change_date DESC';

			connection.query(SQL, function (err, rows){

				var arts = [];

				rows.forEach(function (e, i){

					arts[i] = {};

					var date = new Date( e.change_date );

					arts[i].title = e.title;
					arts[i].categories = e.categories;
					// arts[i].body = markdown.toHTML( e.body );
					arts[i].body = e.body;
					arts[i].id = e.id;
					arts[i].change_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();

				})

				connection.release();

				res.render("index",{"arts" : arts, "categories" : titles});

			});

		});

	});

})


router.get("/edit", function (req, res){

	// console.log(req.session);

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

	// console.log(req.session);

	res.render("login",{"title" : "注册"});

});

// console.log(md5("password"));

router.post("/reg", function (req, res){

	var name = req.body.name;

	var password = req.body.password;

	console.log(name, password)

	// console.log(isUsername(name), isPassword(password));

	if(!isPassword(password) || !isUsername(name)) return;

	db.open(function(err, db){

		if(!err){

			db.createCollection('user', {safe:true}, function(err, collection){

				collection.find().toArray(function(err,docs){
					
					if(!docs.length){

						var tmp1 = {"name": name,"password":password};

						collection.insert(tmp1,{safe:true},function(err, result){

							console.log(result);

							db.close();

						}); 

					}

				});

			});

		}else{

			console.log(err,2);

			db.close();

		}

		// db.close();

	})

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

	db.open(function(err, db){

		if(!err){

			db.createCollection('user', {safe:true}, function(err, collection){



				collection.find({"name" : name}).toArray(function(err,docs){

					// console.log(docs);
					
					if(docs.length){

						if(password === docs[0].password){

							req.session.user = name;
							req.session.password = password;

							console.log(2);

						}

					}

					db.close();

				});

			});

		}else{

			console.log(err,1);

			db.close();

		}

	})

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