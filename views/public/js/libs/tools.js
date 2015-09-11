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
		 * [getALLNums 表格头部总信息]
		 * @param  {[json]} data [服务器返回数据]
		 * @return {[type]}      [description]
		 */
		getALLNums: function(data){
			
			var type = $("#js_form").attr("dtype");

			if(data.success && data.info ){

				if(type == "trade"){
					$("#js_panel_head").html('交易总额：<span class="ui_red">'+data.info.totalTradeAmount+'</span> 佣金总额：<span class="ui_red">'+data.info.totalFeeAmount+'</span>');
				}else if(type == "payment"){
					$("#js_panel_head").html('交易总额：<span class="ui_red">'+data.info.totalPaysum+'</span>');
				}else if(type == "settled" && $("#js_user_type").length && $("#js_user_type").val() == "yes"){
					$("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;已结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元&nbsp;&nbsp;已结算交易总额：<span class="ui_red">'+data.info.fmsumamount+'</span>元');
				}else if(type == "settled" && $("#js_user_type").length && $("#js_user_type").val() == "no"){
					$("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;已结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元&nbsp;&nbsp;已结算交易总额：<span class="ui_red">'+data.info.fmsumamount+'</span>元');
				}else if(type == "nosettle" && $("#js_user_type").length && $("#js_user_type").val() == "yes"){
					$("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;未结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元&nbsp;&nbsp;未结算交易总额：<span class="ui_red">'+data.info.fmsumamount+'</span>元');
				}else if(type == "nosettle" && $("#js_user_type").length && $("#js_user_type").val() == "no"){
					$("#js_panel_head").html('<span class="ui_red">'+$("#js_month").val()+'</span>&nbsp;未结算总额(税前)：<span class="ui_red">'+data.info.fmsumunsettled+'</span>元&nbsp;&nbsp;未结算交易总额：<span class="ui_red">'+data.info.fmsumamount+'</span>元');
				}else if(type == "dataproduct"){
					$("#js_panel_head").html('总销售额：<span class="ui_red">'+data.info.fmsumamount+'</span>元,&nbsp;&nbsp;已到期销售额：<span class="ui_red">'+data.info.fmsumcalltime+'</span>元,&nbsp;&nbsp;未到期销售额：<span class="ui_red">'+data.info.fmsumuncalltime+'</span>元');
				}else if(type == "datared"){
					$("#js_panel_head").html('红包总额：<span class="ui_red">'+data.info.fmallred+'</span>元,&nbsp;&nbsp;新注册交易用户数：<span class="ui_red">'+data.info.validdealnum+'</span>');
				}else if(type == "storeRegister"){
					$("#js_panel_head").html('红包总额：<span class="ui_red">'+data.info.allred+'</span>元,&nbsp;&nbsp;理财经理数：<span class="ui_red">'+data.info.storeuserNum+'</span>,&nbsp;&nbsp;店铺首页注册用户数：<span class="ui_red">'+data.info.shopindexRegNum+'</span>,&nbsp;&nbsp;实名认证用户数：<span class="ui_red">'+data.info.realnamevalidateNum+'</span>');
				}else if(type == "redempt"){
					// var cash = data.info? data.info: 0;
					$("#js_panel_head").html('赎回总金额：<span class="ui_red">'+data.info.totalRedeemSum+'</span>元');
				}else if(type == "settledInfo"){
					$("#js_panel_head").find(".js_trade").html(data.info.totalTradeAmount+"元");
					$("#js_panel_head").find(".js_fee").html(data.info.totalFeeAmount+"元");
				}
				
			}
		},
		/**
		 * [createModal 创建公用弹层框]
		 * @return {[type]} [description]
		 */
		createModal: function () {
			if(!$("#js_dialog").length){
                $("body").append($("<div>",{
                    "id": "js_dialog",
                    "class": "modal fade ui_modal_long",
                    "tabindex": "-1",
                }).html('<div class="modal-dialog js_content"></div>'))
            }
		},
		/**
		 * [createModal 创建修改密码弹层框]
		 * @return {[type]} [description]
		 */
		createModalUser: function () {
			if(!$("#js_dialog_passport").length){
                $("body").append($("<div>",{
                    "id": "js_dialog_passport",
                    "class": "modal fade",
                    "tabindex": "-1",
                    "style": "width: 700px; left: 50%; margin-left: -350px; top: 20%;"
                }).html('<div class="modal-dialog js_content"></div>'))
            }
		},
		/**
		 * [createModalProgress 加载进度条]
		 * @return {[type]} [description]
		 */
		createModalProgress: function (){
			if(!$("#js_dialog_progress").length){
				var progress = '<div style="padding: 20px; border-radius: 8px; background-color: #ffffff;"><div class="progress progress-striped active" style="margin:0;"><div class="progress-bar progress-bar-success" '+
                        'role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%"><span '+
                        'class="sr-only">80% Complete (danger)</span></div></div></div>';

                // 
                progress = '<span style="width:66px; height: 66px; border-radius: 33px;  display: inline-block; overflow: hidden;"><img src="http://xh.creditease.corp/admin2/build/images/loding.gif" style="width:66px;">'
                $("body").append($("<div>",{
                    "id": "js_dialog_progress",
                    "class": "modal fade",
                    "tabindex": "-1"
                }).html('<div class="modal-dialog js_content" style="width: 500px; text-align: center;">'+progress+'</div>'));

            }
		},
		/**
		 * [export 导出公共方法]
		 * @param  {[object]} obj [description]
		 * @return {[type]}    	  [description]
		 */
		export: function (obj) {
			var originalAction = $("#js_form").attr("action");
            $("#js_form").attr({"action": $(obj).attr("action"), "method": "post"}).submit();
            $("#js_form").attr({"action": originalAction, "method": ""});
		},
		/**
		 * [twoNum 单数转多位数]
		 * @param  {[String]} str [description]
		 * @return {[String]}     [description]
		 */
		twoNum: function (str) {
			var num = parseInt(str);
			return num<10? "0"+num : ""+num;
		},
		/**
		 * [linkSelect 产品联动Select]
		 * @param  {[type]} obj [配置参数]
		 * @return {[type]}     [description]
		 */
		linkSelect: function (obj) {

			var self = this;
			var config = {
				"p": $("#js_selelct_productid"),
				"subp": $("#js_select_subproductid"),
				"pname": $("#productname"),
				"subpname": $("#subproductname")
			};
			$.extend(true, config, obj);

			var objPname = config.p.parents("form").find(config.pname.selector),
				objSubPname = config.p.parents("form").find(config.subpname.selector);

			config.p.on("change", function(){
				
	            if(objPname.length){
	            	if(!$(this).val()){
	            		objPname.val("");
	            		objSubPname.val("");
	            	}else{
	                	objPname.val( this.options[this.selectedIndex].text );
	            	}
	            }

	            var data = {};

	            if(config.subp.attr("status")){
	                $.extend(true, data, {"status": config.subp.attr("status")});
	            }

	            if(config.subp.attr("querytype")){
	                $.extend(true, data, {"querytype": config.subp.attr("querytype")});
	            }
	            $.ajax({
	                type: "post",
	                url: "/xinghuoproduct/subprducts/"+$(this).val()+".shtml",
	                data: data,
	                dataType: "json",
	                success: function(data){
	                    self.interceptor(data);
	                    if(data.success){
	                        var str = '<option value="">请选择</option>';
	                        $.each(data.data, function (i, e) {
	                            str += '<option value="'+e.key+'">'+e.value+'</option>';
	                        });
	                        config.subp.html(str);
	                    }
	                    
	                },
	                error: function(err){
	                    self.ajaxError(err);
	                }
	            })
	        });
			
			config.subp.on("change", function(){
				
				// 交易管理 不传子产品名称
				if($(this).parents("#js_form").length && $(this).parents("#js_form").attr("dtype") == "trade") return;

	            if(objSubPname.length){
	            	if(!$(this).val()){
	            		objSubPname.val("");
	            	}else{
	                	objSubPname.val( this.options[this.selectedIndex].text );
	            	}
	            }
			})
		},
		/**
		 * [linkSelectThree 新产品联动Select(三联动)]
		 * @param  {[type]} obj [配置参数]
		 * @return {[type]}     [description]
		 */
		linkSelectThree: function (obj) {

			var self = this;
			var config = {
				"type": $("#js_new_select_type"),
				"sery": $("#js_new_select_sery"),
				"product": $("#js_new_select_product"),
				"typeStr": $("#new_typeStr"),
				"seryStr": $("#new_seryStr"),
				"productStr": $("#new_productStr")
			};
			
			$.extend(true, config, obj);

			var typeStr = config.type.parents("form").find(config.typeStr.selector),
				seryStr = config.type.parents("form").find(config.seryStr.selector),
				productStr = config.type.parents("form").find(config.productStr.selector);

			config.type.on("change", function(){
				
	            if(typeStr.length){
	            	if(!$(this).val()){
	            		typeStr.val("")
	            		seryStr.val("");
	            		productStr.val("");
	            	}else{
	                	typeStr.val( this.options[this.selectedIndex].text );
	            	}
	            }

	            var data = {
	            	"category" : config.type.val(),
	            	"series" : config.sery.val(),
	            }

	            $.ajax({
	                type: "post",
	                url: "/xinghuoproduct/productSelector.shtml",
	                data: data,
	                dataType: "json",
	                success: function(data){
	                    self.interceptor(data);
	                    if(data.success){
	                        if(data.data.seriesList && data.data.seriesList.length){
	                        	var str = '<option value="">请选择</option>';
	                        	$.each(data.data.seriesList, function (i, e) {
	                            	str += '<option value="'+e.key+'">'+e.value+'</option>';
	                        	});
	                        	config.sery.html(str);
	                        	config.product.html("");
	                        }else{
	                        	config.sery.html("");
	                        	config.product.html("");
	                        }
	                    }
	                    
	                },
	                error: function(err){
	                    self.ajaxError(err);
	                }
	            })
	        });

	        config.sery.on("change", function(){
				
	            if(typeStr.length){
	            	if(!$(this).val()){
	            		seryStr.val("");
	            		productStr.val("");
	            	}else{
	                	typeStr.val( this.options[this.selectedIndex].text );
	            	}
	            }

	            var data = {
	            	"category" : config.type.val(),
	            	"series" : config.sery.val(),
	            }

	            $.ajax({
	                type: "post",
	                url: "/xinghuoproduct/productSelector.shtml",
	                data: data,
	                dataType: "json",
	                success: function(data){
	                    self.interceptor(data);
	                    if(data.data.nameList && data.data.nameList.length){
                        	var str = '<option value="">请选择</option>';
                        	$.each(data.data.nameList, function (i, e) {
                            	str += '<option value="'+e.key+'">'+e.value+'</option>';
                        	});
                        	config.product.html(str);
                        }else{
                        	config.product.html("");
                        }
	                    
	                },
	                error: function(err){
	                    self.ajaxError(err);
	                }
	            })
	        });
			
			config.product.on("change", function(){
				
				// 交易管理 不传子产品名称
				// if($(this).parents("#js_form").length && $(this).parents("#js_form").attr("dtype") == "trade") return;

	            if(productStr.length){
	            	if(!$(this).val()){
	            		productStr.val("");
	            	}else{
	                	productStr.val( this.options[this.selectedIndex].text );
	            	}
	            }
			})
		},
		/**
		 * [Validator 验证是否通过]
		 * @param {[type]} obj [验证对象]
		 * @return {[Boolean]} [验证结果]
		 */
		Validator: function (obj) {
			var isSubmit = true;
			obj.each(function(){
				if(!$(this).trigger("blur",[1]).data("Validator")){
					isSubmit=false;
				}
			})
			return isSubmit;
        },
        /**
         * [addRateTemplate 添加费率模板]
         * @param {Function} callback [添加成功的回掉]
         */
        addRateTemplate: function (callback) {
        	var self = this;
        	$("#js_dialog").off("click");
        	$("#js_dialog").on("click", "#js_add_rate_ran", function(){

                if($(this).attr("key") == "open") return ;
                $(this).attr("key", "open");

                var trs =  $("#js_save_raterang_table tbody").find("tr"),
                    firstVlaue = 0;
                if(trs.length){
                    var str = trs.eq(trs.length-1).find('td').eq(1).text();
                    firstVlaue = str.substring(1, str.length);
                }

                var tr = $("<tr>");
                var td1 = $("<td>").html('<input type="text" class="form-control" readonly value="'+firstVlaue+'">');
                var td2 = $("<td>").html('<input type="text" class="form-control js_need_validator">');
                var td3 = $("<td>").html('<div class="col-xs-10"><input type="text" class="form-control js_need_validator"></div><span class="fn-ms" style="line-height: 34px; color: #cc0000;">%</span>');
                var td4 = $("<td>").html('<div class="col-lg-12 col-xs-12 ui_center"><a href="javascript:;" class="btn btn-success btn-xs js_add">保存</a>'+
                    '<a href="javascript:;" class="btn btn-danger btn-xs js_delete" style="margin-left:10%">删除</a></div>');

                tr.append(td1).append(td2).append(td3).append(td4);

                $("#js_save_raterang_table tbody").append(tr);

                tr.find(".js_need_validator").eq(0).Validator({hmsg: "请输入推荐费基数", regexp: /^([1-9]{1}[0-9]{0,8})$/, showok: false, style: {placement: "top"}, emsg: "推荐费基数不能为空", rmsg: "推荐费基数不能超过9位整数",
                fn: function (v, tag) {return (td1.find("input").val()*1 < v*1);}, fnmsg: "最高推荐费基数必须大与起始推荐基数"});

                tr.find(".js_need_validator").eq(1).Validator({hmsg: "请输入费率系数", regexp: /^((10|10\.00)|([1-9]{1})|([0-9]{1}\.[0-9]{1,2}))$/, showok: false, style: {placement: "top"}, emsg: "费率系数不能为空", rmsg: "费率系数必须小于等于10，小数只保留2位小数"});
            });
            
            $("#js_dialog").on("click", "#js_save_raterang_table .js_delete", function(){

                var p = $(this).parents("tr");

                if(p.index() != p.parent().find("tr").length-1 ) return $("#js_dialog #js_add_rate_ran").attr("key","close");

                p.remove();
                return $("#js_dialog #js_add_rate_ran").attr("key","close");

            });

            $("#js_dialog").on("click", "#js_save_raterang_table .js_add", function(){
                var p = $(this).parents("tr");
                var inputs = p.find("input");
                if(false == self.Validator( p.find(".js_need_validator") )) return false;
                
                var str = '<tr class="js_rate_template_row"><td val="'+inputs[0].value+'">&gt;='+inputs[0].value+'</td><td val="'+inputs[1].value+'">&lt;'+inputs[1].value+'</td><td val="'+inputs[2].value+'">'+inputs[2].value+'%</td><td><a href="javascript:;" class="btn btn-danger btn-sm js_delete">删除</a></td></tr>'

                $(this).parents("tbody").append(str);
                p.remove();
                return $("#js_dialog #js_add_rate_ran").attr("key","close");
            });

            $("#js_dialog").on("click", "#js_save_ratetemplate_submit", function(){

                var templateRow = [];
                $("#js_save_raterang_table .js_rate_template_row").each(function (i, e) {
                    var tds = $(this).find("td");
                    templateRow.push({"startamount": tds.eq(0).attr("val"), "endamount": tds.eq(1).attr("val"), "chargerate": tds.eq(2).attr("val")});
                });

                if(false == self.Validator($("#js_dialog #js_save_template_form [name]"))) return false;
                if(!templateRow.length) return alert("费率不能为空！");

                var data = self.getFormele({}, $("#js_dialog #js_save_template_form"));

                $.extend(true, data, {"rateRangeList": templateRow});

                var _this = this;
                if(!self.ajaxLocked(_this)) return;

                $.ajax({
                    type: "post",
                    url: "/xinghuoproduct/addRatetemplate.shtml",
                    data: JSON.stringify(data),
                    dataType: "json",
                    contentType: 'application/json',
                    mimeType: 'application/json',
                    success: function(data){
                        if(data.success && typeof callback == "function"){
                        	$("#js_dialog").modal("hide");
                        	self.ajaxOpened(_this)
                            callback(data);

                        }else if(!data.success){
                        	if(data.errorcode == "101") return window.location.reload();
                        	alert(data.msg);
	                		self.ajaxOpened(_this)
                        }
                    },
                    error: function(err){
                    	self.ajaxOpened(_this);
                        self.ajaxError(err);
                    }
                })

            })
        },
        /**
         * [resetCmsSelect 发布内容的三个select、动态添加的]
         * @param  {[Object]} obj [description]
         * @return {[type]}     [description]
         */
        resetCmsSelect: function (obj) {

        	/**
             * [productStr 产品select]
             * @type {String}
             */
            var productStr = '<option value="">请选择</option>';
            $.each(obj.products, function (i, e) {
                productStr += '<option value="'+e.key+'">'+e.value+'</option>';
            });
            $("#js_webcms_add_form #selectProduct").html(productStr);

            /**
             * [subTypeStr 子类select]
             * @type {String}
             */
            var subTypeStr = '<option value="">请选择</option>';
            $.each(obj.subtypes, function (i, e) {
                subTypeStr += '<option value="'+e.key+'">'+e.value+'</option>';
            });
            $("#js_webcms_add_form #subCmsType").html(subTypeStr);

            /**
             * [levelStr 级别select]
             * @type {String}
             */
            var levelStr = '<option value="">请选择</option>';
            $.each(obj.userlevels, function (i, e) {
                levelStr += '<option value="'+e.id+'">'+e.levelname+'</option>';
            });
            $("#js_webcms_add_form #js_webcms_levelid").html(levelStr);
            
        },
        /**
         * [chartNumFormat 图表数据去小数点]
         * @param  {[Array]} 	 [原始数据]
         * @return {[Array]}     [格式化完的数据]
         */
        chartNumFormat: function (strArr) {

        	var arr = [];

        	$.each(strArr, function (i, e) {

        		arr.push((e*1).toFixed(0))

        	});

        	return arr
        }

	}

});