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
                "class": "modal fade ui_modal_long",
                "tabindex": "-1",
            }).html('<div class="modal-dialog js_content"></div>'))
        }
        
        if(!$("#js_dialog_confirm").length){
            $("body").append($("<div>",{
                "id": "js_dialog_confirm",
                "class": "modal fade",
                "style": "top:20%;",
                "tabindex": "-1",
            }).html('<div class="modal-dialog js_content" style="transform:none;"></div>'))
        }



        var draw = $('#js_dataTables').DataTable({
            "searching": false,
            "processing": true,
            "serverSide": true,
            "scrollX": false,
            "ajax": {
                "url": "/admin/resource",
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
                {"data": "NAME", "sTitle": "资源名称",
                    mRender: function (data, type, rowdata){
                        return '<a href="'+rowdata.URL+'" class="ui_ellipsis" style="max-width:130px;text-decoration:none;" data-toggle="tooltip" data-placement="top" title="'+data+'" target="_blank">'+data+'</a>'
                        
                    }
                },
                {"data": "URL", "sTitle": "资源地址"},
                {"data": "CATEGORY", "sTitle": "资源分类"},
                {"data": "CREATEDAT", "sTitle": "创建时间",
                    mRender: function (data, type, rowdata) {
                        return tools.toJSDate(data);
                    }
                },
                {"data": "UPDATEAT", "sTitle": "修改时间",
                    mRender: function (data, type, rowdata) {
                        return tools.toJSDate(data);
                    }
                },
                {"data": "ID", "sTitle": "操作",
                    mRender: function (data, type, rowdata){
                        return '<div class="col-lg-12 col-xs-12 ui_center"><a href="javascript:;" class="btn btn-danger btn-xs js_article_delete" key_id="'+data+'">删除</a></div>';
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
                $('[data-toggle="tooltip"]').tooltip({viewport: {selector: 'body', padding: 0, width: "auto"}})
            },
            // "order": data[dType]["order"],
            "ordering": false
        });


        $("#js_add_new_resource").on("click", function(){
            
            var showHtml = ['<div class="modal-content"><div class="modal-header">',
                '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>',
                '<h4 class="modal-title fn-ms">添加资源</h4></div><div class="modal-body clearfix">',
                '<form role="form" class="form-horizontal" id="js_resource_add_form">',
                '<input type="hidden" name="id" value="17">',
                '<div class="form-group col-lg-12">',
                    '<label for="inputEmail3" class="col-sm-3 control-label">上传资源:</label>',
                    '<div class="col-sm-9">',
                        '<input name="resource" type="file" style="height: 34px; padding-top:5px;">',
                    '</div>',
                '</div>',
                '</form></div>',
                '<div class="modal-footer"><button type="button" class="btn btn-primary fn-ms" data-dismiss="modal">取消</button>',
                '<button type="button" class="btn btn-success fn-ms" id="js_resource_add_sure">确认</button></div></div>'].join("");

            $("#js_dialog").removeClass("ui_modal_long").find(".js_content").css({"width": 560}).html(showHtml);
            $("#js_dialog").css({"top": "20%"}).modal({backdrop: 'static', keyboard: false});

        });

        $("#js_dialog").on("click", "#js_resource_add_sure", function(){


            var data = new FormData($("#js_resource_add_form")[0]);

            $.ajax({
                type: "post",
                url: "/admin/resource/add",
                data: data,
                processData: false,
                contentType: false,
                success: function (data){
                    console.log(data);
                    if(data.success){
                       return window.location.reload();
                    }
                },
                error: function (msg){
                }
            });

        });

    });
    

});