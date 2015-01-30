var fs = require('fs');

function Read(name){
	this.data = [];
	this.tag = [];
	this.name = name;
	this.basePath = "md";
	this.num = 0;
}

Read.prototype.seach = function(callback) {

	var _this = this;

<<<<<<< HEAD
	this.name = "javascript";

	if(this.name && this.name.split("-").length>1){
		
		fs.readFile(_this.basePath +"/"+ _this.name+".md", function (err, data){
=======
	fs.readdirSync(this.basePath, function (err, files){

		files.forEach(function (i, k){
>>>>>>> 343610165ebdec3b731397711a06cbfc0d4faa2c

			_this.data.push(data);

<<<<<<< HEAD
			callback();

=======
				_this.num++;

				_this.data.push(data);

				if(_this.num >= files.length){
					callback();
				}

			})
>>>>>>> 343610165ebdec3b731397711a06cbfc0d4faa2c
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

						_this.num++;

						_this.data.push(data);

						if(_this.num >= _this.tag.length){
							callback();
						}

					})

				})

			}else{

				files.forEach(function (i, k){

					fs.readFile(_this.basePath +"/"+ i, function (err, data){

						_this.num++;

						_this.data.push(data);

						if(_this.num >= files.length){
							callback();
						}

					})
				})

			}

		});

	}

}

module.exports = Read;
