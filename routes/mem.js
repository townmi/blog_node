var log = require("../services/log.js");

var showMen = function(){

	var mem = process.memoryUsage();
	var format = function (bytes){
		return (bytes / 1024 / 1024).toFixed(2) + "MB";
	}
	log.warn("process: heapTotal " + format(mem.heapTotal) + " heapUsed " + format(mem.heapUsed) + " rss " + format(mem.rss)+"<!log>");

}

module.exports = showMen;