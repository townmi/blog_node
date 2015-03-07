
/*
 * author : towne
 * version : 0.0.3
 * date : 2015.1.20
 *
 */
define(function (require, exports, module){

	var $ = jQuery = require("jquery");

	// var ace = require("src/ace");

	var showdown = require("src/showdown");

	var prettify = require("src/extensions/prettify");
	
	var highlight = require("src/highlight");

	module.exports = function(){

		

		var converter = new Showdown.converter({ extensions: ['prettify'] });

		$(".js_body").each(function (e){

			$(this).html( converter.makeHtml( $(this).prev().html() ) );

			$(this).prev().remove();

		})

		// converter.makeHtml( arr[1] );

		$("code").each(function (i, block){

			hljs.highlightBlock(block);

		});



		// $("#control .js_edit_update").on("click", function(){

		// 	if(!$("#title").val() || !$("#categories").val() || !$("#body").val()) return;

		// 	$.ajax({
		// 		type: "post",
		// 		url: "/edit",
		// 		data: {
		// 			"title" : $("#title").val(),
		// 			"categories": $("#categories").val(),
		// 			"body": editor.getValue()
		// 		},

		// 		dataType: "json",

		// 		success: function (data){
		// 			if(data.target){

		// 				window.location.reload();

		// 			}
		// 		},
		// 		error: function (msg){
				   	
		// 		}
		// 	})

		// });

		// // 修改
		// $(".js_change").on("click", function(){

		// 	console.log($(this).attr("key"));

		// 	$.ajax({

		// 		type: "get",
		// 		url: "/edit",
		// 		data: {"key" : $(this).attr("key")},
		// 		dataType: "json",

		// 		success: function (data){
		// 			// if(data.target){

		// 			// 	window.location.reload();

		// 			// }
		// 		},
		// 		error: function (msg){
				   	
		// 		}

		// 	})

		// });

		// // 删除
		// $(".js_delete").on("click", function(){

		// 	var key = $(this).attr("key");

		// 	if( window.confirm('你确定要删除<<'+key+'>>吗？') ){

		// 		$.ajax({

		// 			type: "post",
		// 			url: "/delete",
		// 			data: {"key" : key},
		// 			dataType: "json",

		// 			success: function (data){
		// 				if(data.target){

		// 					window.location.reload();

		// 				}
		// 			},
		// 			error: function (msg){
					   	
		// 			}

		// 		})


		// 	}else{
		// 		return
		// 	}

		// });

		// $("#control .js_change_update").on("click", function(){

		// 	if(!$("#title").val() || !$("#categories").val() || !editor.getValue() return;

		// 	var key = $(this).attr("key");

		// 	console.log(key);

		// 	$.ajax({
		// 		type: "post",
		// 		url: "/change",
		// 		data: {
		// 			"title" : $("#title").val(),
		// 			"categories": $("#categories").val(),
		// 			"body": editor.getValue(),
		// 			"key": key
		// 		},

		// 		dataType: "json",

		// 		success: function (data){
		// 			if(data.target){

		// 				window.location.reload();

		// 			}
		// 		},
		// 		error: function (msg){
				   	
		// 		}
		// 	})

		// });

		// // 注册

		// $(".js_reg").on("click", function(){

		// 	if(!$("#name").val() || !$("#password").val()) return;

		// 	$.ajax({
		// 		type: "post",
		// 		url: "/reg",
		// 		data: {
		// 			"name": $("#name").val(),
		// 			"password": $("#password").val()
		// 		},

		// 		dataType: "json",

		// 		success: function (data){
		// 			if(data.target){

		// 				// window.location.reload();

		// 			}
		// 		},
		// 		error: function (msg){
				   	
		// 		}
		// 	})

		// })


		// // 登陆

		// $(".js_login").on("click", function(){

		// 	if(!$("#name").val() || !$("#password").val()) return;

		// 	$.ajax({
		// 		type: "post",
		// 		url: "/login",
		// 		data: {
		// 			"name": $("#name").val(),
		// 			"password": $("#password").val()
		// 		},

		// 		dataType: "json",

		// 		success: function (data){

		// 			if(data.login){

		// 				window.location.href = '/';

		// 			}

		// 		},
		// 		error: function (msg){
				   	
		// 		}
		// 	})

		// })

		
		// $(window).on('resize', function(){

		// 	$("body").css({"height" : $(window).height()});

		// });

		// $(window).on('scroll', function(){

		// 	if($(window).scrollTop()>34){

		// 		$(".js_side").css({"position" : "fixed"});

		// 	}else{

		// 		$(".js_side").css({"position" : "absolute"});

		// 	}

		// })

	}

})