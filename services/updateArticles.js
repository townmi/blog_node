var md5 = require("../libs/md5.js");
var type = require("../libs/typeof.js");

var log = require("./log.js");

var Arts = require("../models/arts.js");


module.exports = function(settings){

	if(!settings.id || settings.id == "0"){
		return Arts.sync({}).then(function () {

			log.warn("进入service，目前是写入操作"+"<!log>");

			return Arts.build({TITLE: settings.title, TITLE_HASH: md5(settings.title), CATEGORY: settings.category, BODY: settings.body}).save().then(

				function (data) {

					log.info("成功写入数据库, 写入文章, 共查找文章"+data.length+"条信息"+"<!log>");

					Arts.writeData = {success: true, code: 0, msg: "success insert sql", data: data};
					return Arts;

				},
				function (err) {

					log.error(err+"<!log>");
					Arts.writeData = {success: false, code: 1, msg: "fail insert sql", data: data};
					return Arts;

				}

			);

		});
	}else{
		return Arts.sync({}).then(function () {

			log.warn("进入service，目前是更新操作"+"<!log>");

			return Arts.update({TITLE: settings.title, TITLE_HASH: md5(settings.title), CATEGORY: settings.category, BODY: settings.body, UPDATEAT: Date.now()}, {where: {id : settings.id} }).then(

				function (data) {

					log.info("成功更新数据库, 更新文章, 共查找文章"+data.length+"条信息"+"<!log>");

					Arts.writeData = {success: true, code: 0, msg: "success update sql", data: data};
					return Arts;

				},
				function (err) {

					log.error(err+"<!log>");
					Arts.writeData = {success: false, code: 1, msg: "fail update sql", data: {}};
					return Arts;

				}

			);

		});
	}

};
	