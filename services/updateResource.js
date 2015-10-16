var md5 = require("../libs/md5.js");
var type = require("../libs/typeof.js");

var log = require("./log.js");

var Resource = require("../models/resource.js");

module.exports = function(settings){

	return Resource.sync({}).then(function () {

		log.warn("进入service/updateResource，目前是写入操作"+"<!log>");

		return Resource.build({NAME: settings.name, URL: settings.url, CATEGORY: settings.category}).save().then(

			function (data) {

				log.info("成功写入数据库, 写入资源, "+data.length+"条信息"+"<!log>");

				Resource.writeData = {success: true, code: 0, msg: "success insert sql", data: data};
				return Resource;

			},
			function (err) {

				log.error(err+"<!log>");
				Resource.writeData = {success: false, code: 1, msg: "fail insert sql", data: {}};
				return Resource;

			}

		);

	});

};
	