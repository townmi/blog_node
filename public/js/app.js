
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
		
		$("body").css({"height" : $(window).height()});

		var url = $('body').attr('url');

		var converter = new Showdown.converter({ extensions: ['prettify'] });

		var basePath = "http://10.100.50.139:3000";

		console.log(url, decodeURIComponent(url ) )

		$.ajax({
			type  	    : "post",
			url 	    :  decodeURIComponent( url ),
			dataType :  "json",
			success    : function (data){

				console.log(data.length);

				$.each(data, function (k,s){

					var arr = s.split("<<====>>");

					var info = $.parseJSON(arr[0]);

					var Li = $("<li>"), Div_head = $("<div>"), Div_body = $('<div>'), Div_foot = $("<div>"), H2 = $("<h2>");
	
					H2.addClass("ui_art_title").html("<a href='/"+ info.categories +"-"+ info.title+" '>"+info.title+"</a>");

					Div_head.addClass("ui_art_head").append(H2);

					$("<p>").addClass("clear").html("<a href='/" +info.categories+"' class='target fl'>"+info.categories+"</a><span class='date fr'>"+ info.date +"</span>").appendTo(Div_head);
					
					Div_head.appendTo(Li);

					if(/-/g.test(decodeURIComponent( url ))){
						arr[2] && Div_body.html( converter.makeHtml( arr[1]+arr[2] ) + "<hr>" );
					}else{
						Div_body.html( converter.makeHtml( arr[1] ) + "<hr>" );
					}
					
					Div_body.addClass("ui_art_body").appendTo(Li);
					
					if(/-/g.test(decodeURIComponent( url ))){
						Div_foot.addClass("ui_art_foot").html("<p class='clear'><span></span></p>").appendTo(Li);
					}else{

						Div_foot.addClass("ui_art_foot").html("<p class='clear'><span></span><a href='/"+ info.categories +"-"+ info.title+"' class='fr'>>ReadMore</a></p>").appendTo(Li);

					}


					$("#art_list").append(Li);

					Div_body.find("pre code").each(function (i, block){
						hljs.highlightBlock(block);
					})

				})

			}
		})

		$(window).on('resize', function(){

			$("body").css({"height" : $(window).height()});

		});

		$(window).on('scroll', function(){

			if($(window).scrollTop()>34){

				$(".js_side").css({"position" : "fixed"});

			}else{

				$(".js_side").css({"position" : "absolute"});

			}

		})

	}

})