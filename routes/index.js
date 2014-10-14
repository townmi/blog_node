var express = require('express');
var fs = require('fs');
var markdown = require('markdown').markdown;
var router = express.Router();
var myart = [];


fs.readdir('md/fs', function (err, all){
	if (err) throw err;
	for(i in all){
		fs.readFile('md/fs/'+all[i], function (err, data){
			if(err) throw err;
			var strTwo = data.toString().split("======");
			
			myart.push( [eval(strTwo[0]), strTwo[1]] );
			/* GET home page. */
			router.get('/' ,function (req,  res, next){
				res.render('index', { "title" : "Towne's Blog", "art" : markdown.toHTML( myart[0][1] ) });
			})
		})
	}
});

module.exports = router;