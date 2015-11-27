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

    var color = {
        "ERROR": "#FF5500",
        "INFO": "#259812",
        "FATAL": "#8A0BA9",
        "WARN": "#9FA207"
    };

    $(document).ready(function() {

        if(!$("#js_dialog").length){
            $("body").append($("<div>",{
                "id": "js_dialog",
                "class": "modal fade ui_modal_long",
                "tabindex": "-1",
            }).html('<div class="modal-dialog js_content"></div>'));
        }

        var draw = $('#js_dataTables').DataTable({
            "searching": false,
            "processing": true,
            "serverSide": true,
            "scrollX": true,
            "ajax": {
                "url": "/admin/log",
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
                {"data": "type", "sTitle": "日志类型", "sWidth": "58px",
                    mRender: function (data, type, rowdata) {
                        return  '<div class="ui_center"><span style="color:'+color[rowdata.type]+'">'+data+'</span></div>';
                    }
                },
                {"data": "time", "sTitle": "日志时间", "sWidth": "120px",
                    mRender: function (data, type, rowdata){
                        return  '<span style="color:'+color[rowdata.type]+'">'+tools.toJSDate(data)+'<span>';
                    }
                },
                {"data": "info", "sTitle": "日志信息",
                    mRender: function (data, type, rowdata){
                        return  '<span style="color:'+color[rowdata.type]+'">'+data+'<span>';
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
                    })

                });

            },
            /**
             * [drawCallback 每次绘制完成回掉]
             * @return {[type]} [description]
             */
            drawCallback: function(){
                // $('[data-toggle="tooltip"]').tooltip({viewport: {selector: 'body', padding: 0, width: "auto"}})
            },
            // "order": data[dType]["order"],
            "ordering": false
        });

    });
    

});