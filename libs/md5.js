/*
 * author : towne
 * version : 0.0.1
 * date : 2015.4.16
 *
*/
var crypto = require("crypto");
var Buffer = require("buffer").Buffer;

module.exports = function(data){

    var buf = new Buffer(data);

    var str = buf.toString("binary");

    return crypto.createHash("md5").update(str).digest("hex");
}