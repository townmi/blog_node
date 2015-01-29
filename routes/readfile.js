var fs = require('fs');

function Read(){
	this.data = [];
	this.basePath = "md";
}

Read.prototype.init = function() {
	var _this = this;
	fs.readdirSync(this.basePath, function (err, data ){

		data.forEach(function (i, k){

			fs.readFileSync(_this.basePath +"/"+ i, function (err, data){

				_this.data.push(data);

			})
		})

	});

}

module.exports = Read;
