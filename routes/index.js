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
			
			myart.push( [eval(strTwo[0])[0], markdown.toHTML(strTwo[1]) ] );
			/* GET home page. */
			router.get('/' ,function (req,  res, next){
				//console.log(myart);
				myart.sort(function(a, b){
					var firstD = new Date(), nextD = new Date();
					
					var first = a[0]["date"].split('-');
					var next = b[0]["date"].split('-');
					firstD.setFullYear(first[0],first[1],first[2]);
					nextD.setFullYear(next[0],next[1],next[2]);
					
					return nextD - firstD;
				});
				res.render('index', { "title" : "Towne's Blog", "myart" : myart });
				// next();
			})
		})
	}
});

module.exports = router;