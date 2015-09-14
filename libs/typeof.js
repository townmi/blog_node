/*
 * author : towne
 * version : 0.0.1
 * date : 2015.9.8
 *
*/


module.exports = {
	/**
	 * [isJson 判断数据类型是否是JSON格式]
	 * @param  {[type]}  obj [传入的数据]
	 * @return {Boolean}     [返回值]
	 */
	isJson: function (obj) {
		var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;    
		return isjson;
	},
	/**
	 * [device 判断设备是否是手机]
	 * @param  {[String]} str [user-Agent]
	 * @return {[Boolean]}     [description]
	 */
	device: function (str) {
		return /mobile/i.test(str);
	}
};