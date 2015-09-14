define(function(require, exports, module){

	/**
     * @module [admin]
     * @requires [jquery, datatables, bootstrap]
     * @author [towne]
     * @time [2015-9-09]
     */

    var $ = require("jquery");
    var datatables = require("datatables")($);
    var datatables_ext = require("datatables_ext")($, datatables);
    var bootstrap = require("bootstrap")($);

    var tools = require("tools");

    $(document).ready(function() {

        if(!$("#js_dialog").length){
            $("body").append($("<div>",{
                "id": "js_dialog",
                "class": "modal fade",
                "style": "top:10%;",
                "tabindex": "-1",
            }).html('<div class="modal-dialog js_content" style="transform:none;"></div>'));
        }

        if(!$("#js_dialog_confirm").length){
            $("body").append($("<div>",{
                "id": "js_dialog_confirm",
                "class": "modal fade",
                "style": "top:20%;",
                "tabindex": "-1",
            }).html('<div class="modal-dialog js_content" style="transform:none;"></div>'));
        }

        var defaultVal = $("#js_edit").html();
        
        var editor = null;

        $("#js_ace").attr("src", "https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.0/ace.js");

        $("#js_ace").on("load", function(data){
            editor = ace.edit("js_edit");
        });

    	var draw = $('#js_dataTables').DataTable({
            "searching": false,
            "processing": true,
            "serverSide": true,
            "scrollX": false,
            "ajax": {
                "url": "/admin",
                "type": "post",
                data: function (d){
                    // tools.getFormele(d, $("#js_form"));
                },
                success: function(data, a, b){
                	$.fn.dataTableExt.oApi._fnAjaxUpdateDraw(draw.context[0],data);
                },
                error: function (err) {
                    // tools.ajaxError(err);
                }
            },
            "columns": [
	            {"data": "TITLE", "sTitle": "文章标题",
                    mRender: function (data, type, rowdata){
                        return '<a href="/arts/'+rowdata.TITLE_HASH+'" class="ui_ellipsis" style="width:130px;text-decoration:none;" data-toggle="tooltip" data-placement="top" title="'+data+'" target="_blank">'+data+'</a>';
                        
                    }
                },
	            {"data": "TITLE_HASH", "sTitle": "文章标题hash值"},
                {"data": "CATEGORY", "sTitle": "文章分类"},
                {"data": "CREATEDAT", "sTitle": "创建时间",
                    mRender: function (data, type, rowdata) {
                        return new Date(data);
                    }
                },
                {"data": "UPDATEAT", "sTitle": "修改时间",
                    mRender: function (data, type, rowdata) {
                        return new Date(data);
                    }
                },
                {"data": "ID", "sTitle": "操作",
                    mRender: function (data, type, rowdata){
                        /**
                         * [操作关键key]
                         * @type {String} key_id [目前使用主键ID作为操作键，可以使用TITLE_HASH]
                         */
                        return '<div class="col-lg-12 col-xs-12 ui_center"><a href="javascript:;" class="btn btn-danger btn-xs js_article_delete" key_id="'+data+'">删除</a>&nbsp;&nbsp;&nbsp;'+
                            '&nbsp;&nbsp;&nbsp;<a href="javascript:;" class="btn btn-success btn-xs js_article_update" key_id="'+data+'">修改</a></div>';
                        
                    }
                }
            ],
            /**
             * [initComplete 表格初始化完成回掉]
             * @return {[type]} [description]
             */
            initComplete: function(){
                $("#js_dataTables").off("click");

                /**
                 * [删除文章]
                 * @param  {[String]} id [该文章在数据库的主键]
                 * @return {[type]}      [description]
                 */
                $("#js_dataTables").on("click", ".js_article_delete", function(){
                    var showHtml = ['<div class="modal-content"><div class="modal-header">',
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>',
                        '<h4 class="modal-title fn-ms">确认是否删除该文章</h4></div>',
                        '<div class="modal-footer" style="text-align: center; border: none;"><button type="button" class="btn btn-success fn-ms" id="js_trade_status_update_sure">确认</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                        '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button></div></div>'].join("");

                    $("#js_dialog_confirm .js_content").css({"width": 300}).html(showHtml);

                    $("#js_dialog_confirm").modal("show");

                });

                /**
                 * [修改文章]
                 * @param  {[String]} id [该文章在数据库的主键]
                 * @return {[type]}      [description]
                 */
                $("#js_dataTables").on("click", ".js_article_update", function(){

                    $.ajax({
                        type: "post",
                        url: "/admin/arts/toUpdate",
                        data: {
                            ID: $(this).attr("key_id")
                        },
                        dataType: "json",
                        success: function (data){
                            console.log(data);
                            if(data.success){
                                $(".js_add_hide").stop().hide();
                                $(".js_add_show").stop().show();

                                $("#js_artitle_id").val(data.data[0].ID);
                                $("#js_artitle_title").val(data.data[0].TITLE);
                                $("#js_artitle_category").val(data.data[0].CATEGORY);

                                ace.require("ace/ext/chromevox");
                                editor.setTheme("ace/theme/monokai");
                                editor.setValue(data.data[0].BODY);
                                editor.setHighlightActiveLine(true);
                            }
                        },
                        error: function (msg){
                        }
                    });

                });

            },
            /**
             * [drawCallback 每次绘制完成回掉]
             * @return {[type]} [description]
             */
            drawCallback: function(){
                $('[data-toggle="tooltip"]').tooltip({viewport: {selector: 'body', padding: 0, width: "auto"}});
            },
            // "order": data[dType]["order"],
            "ordering": false
        });

        $("#js_add_new_article").on("click", function(){
            $(".js_add_hide").stop().hide();
            $(".js_add_show").stop().show();

            ace.require("ace/ext/chromevox");

            editor.setTheme("ace/theme/monokai");
            editor.setValue(defaultVal);
            editor.setHighlightActiveLine(false);

        });

        $(".js_cancel").on("click", function(){
            window.location.reload();
        });


        var previewTemplet = function (title, body) {

            return ['<section class="ui_content">',
                        '<div class="ui_article_list" style="box-shadow:none; border-radius:4px;">',
                            '<div class="ui_article">',
                                '<div class="ui_article_title">',
                                    '<h3><a href="">'+title+'</a></h3>',
                                '</div>',
                                '<div class="ui_article_body">',
                                    '<div class="preview">'+body+'</div>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</section>'].join("");
        };

        $("#js_add_new_article_see").on("click", function(){
            $("#js_dialog .js_content").html(previewTemplet($("#js_artitle_title").val(), marked(editor.getValue()))).find("pre code").each(function (i, block){
                hljs.highlightBlock(block);
            });

            $("#js_dialog").modal("show");
        });


        $("#js_add_new_article_save").on("click", function(){

            $.ajax({
                type: "post",
                url: "/admin/arts/edit",
                data: {
                    "id": $("#js_artitle_id").val(),
                    "title" : $("#js_artitle_title").val(),
                    "category": $("#js_artitle_category").val(),
                    "body": editor.getValue()
                },
                dataType: "json",
                success: function (data){
                    if(data.success){
                        alert("文章添加成功");
                        return window.location.reload();
                    }
                },
                error: function (msg){
                }
            });

        });

    });

});