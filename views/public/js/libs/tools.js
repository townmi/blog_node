define(function(require, exports, module){

	var $ = require("jquery");

	module.exports = {
		/**
		 * [ajaxError ajax出错(500, 400)]
		 * @param {[json]} [err] [错误信息]
		 * @return {[type]} [description]
		 */
		ajaxError: function ( err ) {
			console.log(err);
			alert("网络服务出错，请稍后再试！！");
		},
		/**
     	 * [toJSDate 日期格式转换]
    	 * @param  {[String]} s [后台传来的时间格式]
    	 * @return {[String]}   [本地日期格式]
    	 */
		toJSDate: function(s){
			var self = this;
	        if(!s) return "";
	        var D = new Date(s);
	        var date = [D.getFullYear(), self.twoNum(D.getMonth()+1), self.twoNum(D.getDate())];
	        var time = D.toTimeString().split(" ")[0];
	        return date.join("-")+" "+time;
    	},
		/**
	     * [getFormele  遍历form表单的字段信息，拼接返回后端]
	     * @param  {[json]} conf   [grid的默认json]
	     * @param  {[object]} sel  [form选择器]
	     * @param  {[json]} extend [可扩展的json，放特殊字段]
	     * @return {[json]}        [返回json数据]
	     */
		getFormele: function (conf, sel, extend) {

			var json = {};

	        sel.find("input[name]").each(function (i, e){

				var type = $(this).attr("type");

	        	if(type == "radio" && !this.checked) return;
            	if(type == "checkbox" && !this.checked) return;

	            if(e.value && type != "checkbox"){
	            	json[e.name] = e.value;
	            }else if(e.value && type == "checkbox"){
	            	json[e.name] = json[e.name] ? json[e.name] : [];
	            	json[e.name].push(e.value);
	            }

	        });

	        sel.find("select[name]").each(function (i, e){
	        	if(e.value){
	            	json[e.name] = e.value;
	            }
	        });

	        sel.find("textarea[name]").each(function (i ,e) {
	        	if(e.value){
	            	json[e.name] = e.value;
	            }
	        })

	        if(conf.order && conf.order[0] && conf.columns){
	        	json["orderColumn"] = conf.columns[conf.order[0]["column"]]["data"];
	        	json["orderType"] = conf.order[0]["dir"];
	        }
	        

	        if(extend){
	            $.extend(true, json, extend);
	        }
	        
	        $.extend(true, conf, json);

	        return conf;

		},
		/**
		 * [ajaxForm formAJAX提交]
		 * @param  {[Object]} conf.ele [提交Form元素]
		 * @param  {[String]} conf.action [提交地址]
		 * @param  {[Function]} conf.onStart []
		 * @param  {[Function]} conf.onComplete [提交回掉函数]
		 * @return {[type]}      [description]
		 */
		ajaxForm: function (conf) {
			var settings = {
				"ele": null,
				"action": '',
                onStart: function() { },
                onComplete: function(response) { },
                onCancel: function() { }
			}

			var uploading_file = false;

            if ( conf ) { 
                $.extend(true, settings, conf);
            }

			if(!settings.ele || !settings.action) return console.log("error: application");

			$element = $(settings.ele);

			// if($element.data('ajaxUploader-setup') === true) return;

			var handleResponse = function(loadedFrame, element) {

	            var response, responseStr = $(loadedFrame).contents().find('body').text();

	            try {
	                //response = $.parseJSON($.trim(responseStr));
	                response = JSON.parse(responseStr);
	            } catch(e) {
	                response = responseStr;
	            }

	            uploading_file = false;

	            // 返回回掉
	            settings.onComplete.apply(loadedFrame, [response, settings.params]);
	        };


	        var wrapElement = function(element) {

	            var frame_id = 'ajaxUploader-iframe-' + Math.round(new Date().getTime() / 1000);
	            
	            if($("body iframe").length && /ajaxUploader-iframe/g.test($("body iframe").attr("id"))){
	                frame_id = $("body iframe").attr("id");
	            }else{
	                $('body').after('<iframe width="0" height="0" style="display:none;" name="'+frame_id+'" id="'+frame_id+'"/>');
	            }

	            $('#'+frame_id).get(0).onload = function() {
	                handleResponse(this, element);
	            };

	            $element.attr({"target": frame_id, "action": settings.action, "method": "POST", "enctype": "multipart/form-data"});
	        }


	        var upload_file = function() {

	            uploading_file = true;

	            wrapElement($element);

	            var ret = settings.onStart.apply($element, [settings.params]);

	            if(ret !== false) {
	                $element.submit(function(e) {
                        if(e.stopPropagation) {
                            e.stopPropagation();
                        }
	                	e.cancelBubble = true;
	                	e.returnValue = false;
	                }).submit();
	            }
	        };

	        if (!uploading_file) {
	            upload_file();
	        }

	        // Mark this element as setup
	        // $element.data('ajaxUploader-setup', true);

		},
		/**
		 * [ajaxLocked ajax提交锁，防止重复提交]
		 * @param  {[Object]} obj [触发ajax的DOM对象]
		 * @return {[type]}       [description]
		 */
		ajaxLocked: function (obj) {
			if($(obj).attr("key_ajax_lock") == "close"){
				return false;
			}
			$(obj).attr("key_ajax_lock", "close");
			return true;
		},
		/**
		 * [ajaxOpened ajax提交锁释放，防止无法提交]
		 * @param  {[Object]} obj [触发ajax的DOM对象]
		 * @return {[type]}       [description]
		 */
		ajaxOpened: function (obj) {
			$(obj).attr("key_ajax_lock", "open");
		},
		/**
		 * [interceptor 权限拦截器]
		 * @param  {[json]} data [ 服务器返回数据]
		 * @return {[type]}      [description]
		 */
		interceptor: function (data) {

			var KEY_CAN_PARSE_JSON = true, toData;

			if(typeof data == "string"){
				try {
					toData = $.parseJSON(data);
					KEY_CAN_PARSE_JSON = true;
			　　} catch(error) {
					KEY_CAN_PARSE_JSON = false;
					return true;
			　　} finally {
					KEY_CAN_PARSE_JSON = true;
			　　}
				if(KEY_CAN_PARSE_JSON = true && !toData.success){
					if(toData.errorcode == "101") return window.location.reload();
	                $("#js_dialog_permission .js_content").html('<span class="ui_red">'+toData.msg+'</span>');
	                $("#js_dialog_permission").modal("show");
	                return false;
				}
			}else{
				if(!data.success){
					if(data.errorcode == "101") return window.location.reload();
					if(data.callback && typeof data.callback == "function"){
						data.callback();
					}
	                $("#js_dialog_permission .js_content").html('<span class="ui_red">'+data.msg+'</span>');
	                $("#js_dialog_permission").modal("show");
	                return false;
				}else{
					return true;
				}
			}
			
		},
		/**
		 * [twoNum 单数转多位数]
		 * @param  {[String]} str [description]
		 * @return {[String]}     [description]
		 */
		twoNum: function (str) {
			var num = parseInt(str);
			return num<10? "0"+num : ""+num;
		}
	}

});