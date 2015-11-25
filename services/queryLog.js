/**
 * @Created by Administrator
 * @Date 2015/11/25.
 * @author [haixiangtang@creditease.cn]
 */

var fs = require("fs");
var path = require("path");

var log = require("./log.js");

module.exports = function (select, callback) {

    var send = {success: true, code: 0, msg: ""};

    var date = !select.date ? "" : "-"+select.date;

    fs.readFile(path.join(__dirname, "../logs/log.log"+date), {encoding: "UTF-8" }, function (err, bytesRead) {

        if(err){
            send.success = false;
            send.msg = "日志文件读取失败！";
            return callback.apply(this, [send]);
        }

        var oldLogArray = bytesRead.split("<!log>");
        oldLogArray.pop();
        var logArray = [];

        oldLogArray.forEach(function (e) {

            var string = e.replace(/^\s/gi, "").replace(/^\n/gi, "");

            var type = string.split("] ")[1].replace(/\[/gi, "");

            var eTime = string.split("] ")[0].replace(/\[/gi, "");

            if(select.startTime && (new Date(select.startTime).getTime()>new Date(eTime).getTime()) ) return;

            if(select.endTime && !(new Date(select.endTime).getTime()>new Date(eTime).getTime()) ) return;

            logArray.push({info: string, type: type, time: eTime});

        });

        send.data = [];
        send.recordsFiltered = logArray.length;
        send.recordsTotal = logArray.length;

        send.data = logArray.splice(select.page, select.limit);

        callback.apply(this, [send]);

    });

};
