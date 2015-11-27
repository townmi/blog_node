var md5 = require("../libs/md5.js");
var type = require("../libs/typeof.js");

var log = require("./log.js");

var Arts = require("../models/arts.js");


var categoryArray = null;
var articleArray = null;

module.exports = function(select){

	return Arts.sync({logging: false}).then(function () {

		if(!select.category || !type.isJson(select.category)) return Arts;
		return Arts.findAll(select.category);

	}).then(
		function (data) {

			if(!select.category || !type.isJson(select.category)) return Arts;

			log.info("成功读取数据库, 查找category|分类, 共查找分类"+data.length+"条信息"+"<!log>");
			categoryArray = [];
			for(i in data){
				categoryArray.push(data[i].dataValues.CATEGORY)
			}
			return Arts;

		},
		function (err) {
			if(!select.category || !type.isJson(select.category)) return Arts;

			log.error(err+"<!log>");
			return Arts;
		}
	).then(function () {
		if(!select.articles || !type.isJson(select.articles)) return Arts.findAll({limit : 10, order : 'ID asc', paranoid: true});

		return Arts.findAll(select.articles);
	}).then(
		function (data) {

			log.info("成功读取数据库, 查找文章集合, 共查找文章"+data.length+"条信息"+"<!log>");
			articleArray = [];
			for(i in data){
				delete data[i].dataValues._previousDataValues;
				articleArray.push(data[i].dataValues);
			}
			Arts.queryData = {articleArray: articleArray, categoryArray: categoryArray};
			return Arts;

		},
		function (err) {

			log.error(err+"<!log>");
			Arts.queryData = {articleArray: articleArray, categoryArray: categoryArray};
			return Arts;

		}
	);

}
	