var mysql = require("mysql");
var config = require("../config/config.js");

var pool = mysql.createPool({
	connectionLimit : 10,
	host : config.host,
	port : config.port,
	user : config.user,
	database : 'test',
	password : config.password,
	multipleStatements : true
});

module.exports = Read;

function Read(sql){

	this.sql = sql;

};


Read.prototype.get = function (cb){

	var _this = this;

	pool.getConnection(function (err, connection){
	
		if(typeof _this.sql === "string"){

			connection.query(_this.sql, function (err, rows){

				connection.release();

				cb(rows);

			});

		}else{



		}

	});

};