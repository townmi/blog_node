
/*
 * author : towne
 * version : 0.0.3
 * date : 2015.1.20
 *
 */
define(function (require, exports, module){

	var $ = jQuery = require("jquery");

	var showdown = require("src/showdown");

	var prettify       = require("src/extensions/prettify");
	
	var highlight       = require("src/highlight");

	module.exports = function(){

		// $(window).on("load", function(){

			$("pre code").each(function (i, block){

				console.log(i, block);
				// hljs.highlightBlock(block);
			})

		// })


		$("#control p a").on("click", function(){


			// alert(1);

			if(!$("#title").val() || !$("#categories").val() || !$("#body").val()) return;

			$.ajax({
				type: "post",
				url: "http://127.0.0.1:3000/edit",
				data: {
					"title" : $("#title").val(),
					"categories": $("#categories").val(),
					"body": $("#body").val(),
					"date" : new Date()
				},

				dataType: "json",
				success: function (data) {
					if(data.target){

						window.location.reload();

					}
				},
				error: function (msg) {
				   	
				}
			})

		})


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