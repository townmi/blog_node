var fs = require('fs');

function Read(name){
	this.data = [];
	this.tag = [];
	this.name = name;
	this.basePath = "md";
	this.num = 0;
	this.titles = [];
}

Read.prototype.seach = function(callback) {

	var _this = this;

	if(this.name && this.name.split("-").length>1){
		
		fs.readFile(_this.basePath +"/"+ _this.name +".md", function (err, data){

			if (err) return callback();

			_this.data.push(data.toString("UTF-8"));
			
			callback();

		})

	}else{

		fs.readdir(this.basePath, function (err, files){

			if(_this.name){

				files.forEach(function (i, k){

					var tagArr = i.split('-');

					if(tagArr[0] == _this.name){
						_this.tag.push(i);
					}

				})
				_this.tag.forEach(function (i, k){

					fs.readFile(_this.basePath +"/"+ i, function (err, data){

						if (err) return callback();

						_this.num++;

						_this.data.push(data.toString("UTF-8"));

						if(_this.num >= _this.tag.length){
							callback();
						}

					})

				})

			}else{

				files.forEach(function (i, k){

					fs.readFile(_this.basePath +"/"+ i, function (err, data){

						if (err) return callback();

						_this.num++;

						_this.data.push(data.toString("UTF-8"));

						if(_this.num >= files.length){

							_this.sort();

							callback();

						}

					})
				})

			}

		});

	}
}


Read.prototype.sort = function(){
	
	var _this = this;

	var __unique = function(data){

		data.sort();

		var array = [{
			"title" : data[0],
			"num"	: 1
		}];

		for(var i=0; i<data.length; i++){

			if( data[i] !== array[array.length-1].title){

				array.push({"title" : data[i], "num" : 1});

			}

			array[array.length-1].num++;

		}

		return array;
	}

	this.data.sort(function (a,b){

		return  new Date( JSON.parse( b.split("<<====>>")[0] ).date ) - new Date( JSON.parse( a.split("<<====>>")[0] ).date );

	});

	this.data.forEach(function (a){

		_this.titles.push( JSON.parse( a.split("<<====>>")[0] ).categories );

	});

	this.titles = __unique( this.titles );

}

module.exports = Read;
