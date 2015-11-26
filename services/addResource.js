var fs = require("fs");
var path = require("path");

var formidable = require('formidable');

var md5 = require("../libs/md5.js");
var type = require("../libs/typeof.js");
var basePath = require("../libs/config.js").basePath;

var updateResource = require("./updateResource.js");

var log = require("./log.js");

var config = {}, callbackJson = {success: true, code: 0, msg: ""};
var sql_resource = {};
var form = new formidable.IncomingForm();

form.uploadDir = "./views/public/upload/";

/**
 * [添加资源]
 * @param iostream [req]
 * @param callback
 */
module.exports = function(iostream, callback) {

	form.parse(iostream, function (err, fields, files){

		var oldPath = files.resource.path;

		sql_resource.category = files.resource.type;

		sql_resource.name = files.resource.name.split(".");
		var fileType = "."+sql_resource.name.pop();
		sql_resource.name = sql_resource.name.join("");

		var newPath = form.uploadDir + md5(sql_resource.name) + fileType;
		sql_resource.url = basePath + "upload/" + md5(sql_resource.name) + fileType;

		try {
			log.info("文件上传成功，正在写入......."+"<!log>");
		    fs.renameSync(oldPath, newPath);
		    log.info("文件上传成功，写入成功！"+"<!log>");
		    
		} catch(err) {
		    log.info("文件上传成功，写入失败！"+"<!log>");
		    callbackJson.success = false;
		    callbackJson.code = 1;
		    callbackJson.msg = "文件写入失败，服务器程序报错！";
		}

		if(!callbackJson.success) {
			return callback.apply(this, [callbackJson]);
		} 

		var result = updateResource(sql_resource);

		return result.then(function(){

			var servicesResult = result._rejectionHandler0._settledValue.writeData;

			if(!servicesResult.success){
				callbackJson.success = false;
				callbackJson.code = 2;
				callbackJson.msg = "文件写入成功，但是数据库写入失败，服务器程序报错！";
			}

			return callback.apply(this, [callbackJson]);

		});

	});
}

