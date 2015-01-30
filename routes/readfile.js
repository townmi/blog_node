var fs = require('fs');

function Read(){
	this.data = [];
	this.basePath = "md";
	this.num = 0;
}

Read.prototype.seach = function(callback) {

	var _this = this;

	fs.readdirSync(this.basePath, function (err, files){

		files.forEach(function (i, k){

			fs.readFileSync(_this.basePath +"/"+ i, function (err, data){

				_this.num++;

				_this.data.push(data);

				if(_this.num >= files.length){
					callback();
				}

			})
		})

	});

}

module.exports = Read;
