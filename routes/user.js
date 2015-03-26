var crypto = require("crypto");
var Buffer = require("buffer").Buffer;

var express = require('express');

var Read = require("./readSQL.js");
var mem = require("./mem.js");

var router = express.Router();

module.exports = router;

// 注册已经阉割掉了

// 登陆
router.get('/login', function (req, res){

	if(req.session.name === "admin_root"){

		res.redirect("/");

	}else{

		res.render("login", {"title" : "登陆"});

	}

	return mem();

});

router.post("/login", function abc(req, res){

	var b = new Base64();
	// 解码
	var arr = [{
		key : b.decode( req.body.username ),
		method : "username"
	},{
		key : b.decode( req.body.password ),
		method : "password"
	},{
		key : b.decode( req.body.captcha ),
		method : "captcha"
	}];

	// 校验传输后的数据合法性
	arr.forEach(function (e, i){
		if(!e.key){
			return res.send({"status": false, "method": e.method, "mesg": base.meassage[e.method][0]});
		}else if(!e.key.match(base[e.method])){
			return res.send({"status": false, "method": e.method, "mesg": base.meassage[e.method][1]});
		}
	});

	// 这里做验证码的校验

	// 验证码校验通过就是SQL查询；
	var SQL = 'SELECT username, password FROM user WHERE username="'+arr[0].key+'"';
	var read = new Read(SQL);

	read.get(function (rows){

		// 用户名输入错误
		if(!rows.length) return res.send({"status": false, "method": "username", "mesg": base.meassage["username"][2]});
		
		// 用户名正确，密码错误
		if(rows[0].password != md5( arr[1].key) ) return res.send({"status": false, "method": "password", "mesg": base.meassage["password"][2]});

		// 登陆成功，设置session
		req.session.name = "admin_root";
		req.session.username = rows[0].username;
		req.session.password = rows[0].password;

		return res.send({"status": true});

	});

})

router.post('/logout', function (req, res){

	req.session.name = null;
	req.session.user = null;
	req.session.password = null;

	res.send({"login" : false});

});


var base = {
	username : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$|^1[3,4,5,7,8]{1}[0-9]{9}$/,
	phone : /^1[3,4,5,7,8]{1}[0-9]{9}$/,
	email : /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
	password:/^(?!\d+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,18}$/,
	nickname : /^[A-Za-z0-9\u4E00-\u9FA5]+$/,
	identity : /^\d{17}[\d,x,X]$/,
	bankcard : /^\d{16,19}$/,
	chinname : /^[\u4E00-\u9FA5]{2,5}(?:·[\u4E00-\u9FA5]{2,5})*$/,
	captcha : /^\w{4}$/,
	meassage : {
		username : ["用户名不能为空","用户名格式错误","用户名输入错误"],
		phone : ["手机号码不能为空！", "请输入正确手机号！"],
		email : ["邮箱格式有误"],
		password : ["密码不能为空！","密码格式错误","密码不正确"],
		nickname : ["昵称只能用中文、英文、数字组合"],
		identity : ["身份证格式错误"],
		checkIdCard : ["身份证号码错误"],
		bankcard : ["银行卡格式错误"],
		chinname : ["中文姓名格式有误"],
		captcha : ["验证码不能为空！","验证码格式错误！"]
	}
};

function Base64() {  
	   
    // private property  
    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";  
   
    // public method for encoding  
    this.encode = function (input) {  
        var output = "";  
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;  
        var i = 0;  
        input = _utf8_encode(input);  
        while (i < input.length) {  
            chr1 = input.charCodeAt(i++);  
            chr2 = input.charCodeAt(i++);  
            chr3 = input.charCodeAt(i++);  
           enc1 = chr1 >> 2;  
           enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);  
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);  
            enc4 = chr3 & 63;  
            if (isNaN(chr2)) {  
                enc3 = enc4 = 64;  
            } else if (isNaN(chr3)) {  
                enc4 = 64;  
           }  
            output = output +  
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +  
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);  
        }  
        return output;  
    }  
   
    // public method for decoding  
    this.decode = function (input) {  
        var output = "";  
       var chr1, chr2, chr3;  
        var enc1, enc2, enc3, enc4;  
       var i = 0;  
       input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");  
       while (i < input.length) {  
           enc1 = _keyStr.indexOf(input.charAt(i++));  
           enc2 = _keyStr.indexOf(input.charAt(i++));  
           enc3 = _keyStr.indexOf(input.charAt(i++));  
            enc4 = _keyStr.indexOf(input.charAt(i++));  
            chr1 = (enc1 << 2) | (enc2 >> 4);  
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);  
           chr3 = ((enc3 & 3) << 6) | enc4;  
            output = output + String.fromCharCode(chr1);  
            if (enc3 != 64) {  
               output = output + String.fromCharCode(chr2);  
            }  
           if (enc4 != 64) {  
               output = output + String.fromCharCode(chr3);  
            }  
        }  
        output = _utf8_decode(output);  
        return output;  
    }  
   
    // private method for UTF-8 encoding  
   _utf8_encode = function (string) {  
        string = string.replace(/\r\n/g,"\n");  
        var utftext = "";  
       for (var n = 0; n < string.length; n++) {  
           var c = string.charCodeAt(n);  
            if (c < 128) {  
                utftext += String.fromCharCode(c);  
            } else if((c > 127) && (c < 2048)) {  
              utftext += String.fromCharCode((c >> 6) | 192);  
               utftext += String.fromCharCode((c & 63) | 128);  
            } else {  
                utftext += String.fromCharCode((c >> 12) | 224);  
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);  
               utftext += String.fromCharCode((c & 63) | 128);  
            }  
   
        }  
        return utftext;  
   }  
   
    // private method for UTF-8 decoding  
    _utf8_decode = function (utftext) {  
        var string = "";  
        var i = 0;  
       var c = c1 = c2 = 0;  
        while ( i < utftext.length ) {  
           c = utftext.charCodeAt(i);  
            if (c < 128) {  
               string += String.fromCharCode(c);  
                i++;  
            } else if((c > 191) && (c < 224)) {  
                c2 = utftext.charCodeAt(i+1);  
               string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));  
                i += 2;  
          } else {  
                c2 = utftext.charCodeAt(i+1);  
                c3 = utftext.charCodeAt(i+2);  
               string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));  
               i += 3;  
           }  
       }  
       return string;  
    }  
}

function md5(data) {

    var buf = new Buffer(data);

    var str = buf.toString("binary");

    return crypto.createHash("md5").update(str).digest("hex");

}