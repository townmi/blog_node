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
				console.log(myart);
				res.render('index', { "title" : "Towne's Blog", "myart" : myart[0][1] });
				// next();
			})
		})
	}
});

module.exports = router;