var express = require('express');
// var Read = require("./readfile.js");

var basePath = "md";
var fs = require('fs');
var router = express.Router();
var myart = [], art_js = [], art_html = [], art_css = [], art_node = [], art_db = [], art_c = [], art_life = [];

fs.readdir(basePath, function (err, all){
	if (err) throw err;
	var i_num = 0;
	all.forEach(function(i){
		fs.readFile(basePath+'/'+i, function (err, data){
			if(err) throw err;
			i_num++;
			var strTwo = data.toString().split("======");
			myart.push( [eval(strTwo[0])[0], markdown.toHTML(strTwo[1]) ] );
			if(i_num === all.length){
				myart.sort(function(a, b){
					// 按日期排序
					var firstD = new Date(), nextD = new Date();
					var first = a[0]["date"].split('-');
					var next = b[0]["date"].split('-');
					firstD.setFullYear(first[0],first[1],first[2]);
					nextD.setFullYear(next[0],next[1],next[2]);
					return nextD - firstD;
				});
				
				myart.forEach(function(i){
					// 抽取javascript分类
					if(i[0]['kate'] === "javascript"){
						art_js.push(i);
					}
					// 抽取html分类
					if(i[0]['kate'] === "html"){
						art_html.push(i);
					}
					// 抽取css分类
					if(i[0]['kate'] === "css"){
						art_css.push(i);
					}
					// 抽取node分类
					if(i[0]['kate'] === "nodejs"){
						art_node.push(i);
					}
					// 抽取db分类
					if(i[0]['kate'] === "db"){
						art_db.push(i);
					}
					// 抽取c分类
					if(i[0]['kate'] === "c"){
						art_c.push(i);
					}
					// 抽取life分类
					if(i[0]['kate'] === "life"){
						art_life.push(i);
					}
				});
				// route contorl
				// get /
				router.get('/' ,function (req,  res, next){
					
					res.render('index', { "title" : "Towne's Blog", "myart" : myart });
					
				})
				// get /js
				router.get('/js' ,function (req,  res, next){
					
					res.render('index', {"title" : "Towne's Blog - javascript", "myart" : art_js });
					
				})
				// get /html
				router.get('/html' ,function (req,  res, next){
					
					res.render('index', { "title" : "Towne's Blog - html", "myart" : art_html });
					
				})
				// get /css
				router.get('/css' ,function (req,  res, next){
					
					res.render('index', { "title" : "Towne's Blog - css", "myart" : art_css });
					
				})
				// get /node
				router.get('/node' ,function (req,  res, next){
					
					res.render('index', { "title" : "Towne's Blog - node.js", "myart" : art_node });
					
				})
				// get /db
				router.get('/db' ,function (req,  res, next){
					
					res.render('index', { "title" : "Towne's Blog - MongoDB", "myart" : art_db });
					
				})
				// get /c
				router.get('/c' ,function (req,  res, next){
					
					res.render('index', { "title" : "Towne's Blog - c++", "myart" : art_c });
					
				})
				// get /life
				router.get('/life' ,function (req,  res, next){
					
					res.render('index', { "title" : "Towne's Blog - life", "myart" : art_life });
					
				})
			}
		});
	});

});

module.exports = router;

			
			