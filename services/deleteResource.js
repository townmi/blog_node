var md5 = require("../libs/md5.js");
var type = require("../libs/typeof.js");

var log = require("./log.js");

var Resource = require("../models/resource.js");

var resourceLength = null;
var resourceArray = null;


module.exports = function(select){

	return Resource.sync({}).then(function () {
		return Resource.findAll({order : 'ID asc', attributes: ["CATEGORY"]});
	}).then(
		function (data) {

			log.info("成功读取数据库, 查找category|分类, 共查找分类"+data.length+"条信息"+"<!log>");

			resourceLength = data.length;
			return Resource;

		},
		function (err) {

			log.error(err+"<!log>");
			return Resource;
		}
	).then(function () {
		if(!select || !type.isJson(select)) return Resource.findAll({limit : 10, order : 'ID asc', paranoid: true});

		return Resource.findAll(select);
	}).then(
		function (data) {

			log.info("成功读取数据库, 查找资源集合, 共查找资源"+data.length+"条信息"+"<!log>");

			resourceArray = [];
			for(i in data){
				delete data[i].dataValues._previousDataValues;
				resourceArray.push(data[i].dataValues);
			}
			Resource.queryData = {resourceArray: resourceArray, length: resourceLength};
			return Resource;

		},
		function (err) {

			log.error(err+"<!log>");
			Resource.queryData = {resourceArray: resourceArray, length: resourceLength};
			return Resource;

		}
	);


}
	