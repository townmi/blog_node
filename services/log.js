var log4js = require("log4js");

log4js.configure({
    appenders: [
        { type: 'console' },
        { 
        	"type": "dateFile", 
        	"filename": "logs/log.log",
        	"pattern": "-yyyy-MM-dd",
        	"alwaysIncludePattern": false,
        	"category": "log"
        }
    ]
});

var log = log4js.getLogger('log');


module.exports = log;