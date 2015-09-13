seajs.config({

    // 配置基础路径，内部模块的依赖，不再需要全局去配置路径
    base: "http://127.0.0.1:3000/js/",

    // 系统公用模块，直接依赖
    alias: {
        "jquery"            : "src/jquery.min.js",
        "bootstrap"         : "src/bootstrap.min.js",
        "dateTimePicker"    : "src/datetimepicker.min.js",
        "datatables"        : "src/dataTables.js",
        "editor"            : "src/summernote.js",
        "cookie"            : "src/cookie.js",
        "xss"               : "src/xss.js",

        "datatables_ext"    : "libs/dataTables.bootstrap.js",
        "dataGrid"          : "libs/dataGrid.js",
        "tools"             : "libs/tools.js",
        "validator"         : "libs/validator.js",
        "chartsConfig"      : "libs/chartsConfig.js",
        "metisMenu"         : "libs/metisMenu.js",
        "multiSelect"       : "libs/multiSelect.js"
    },

    // 全站变量
    vars: {
        
    },

    // 文本模式
    charset: 'utf-8'

});
