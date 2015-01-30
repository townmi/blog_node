'use strict';
/*
 * author : towne
 * version : 0.0.3
 * date : 2015.1.20
 *
 */

define(function (require, exports, module){

	var $ = jQuery = require("jquery");

	// var mousewheel = require("mousewheel");
	// var jscrollpane = require("jscrollpane");

	module.exports = function(){


		$("body").css({"height" : $(window).height()});

		// $("body").jScrollPane();

		console.log(data);

		$(window).on('resize', function(){

			$("body").css({"height" : $(window).height()});

			// $("body").jScrollPane();

		});

		$(window).on('scroll', function(){

			///console.log($(window).scrollTop());

			if($(window).scrollTop()>34){
				// $(".js_side").stop().animate({top: $(window).scrollTop()-34},100)
				$(".js_side").css({"position" : "fixed"})
			}else{
				$(".js_side").css({"position" : "absolute"})
			}

			//$(".js_side").stop().animate({top: },100)

		})

	}

})