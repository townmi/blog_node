'use strict';
/*
 * author : towne
 * version : 0.0.3
 * for : calendar
 * date : 2015.2.6
 *
*/

define(function (require, exports, module){

    var $ = jQuery = require("jquery");

    function Calendar(parent, currDate, beginDate, endDate, disableDate){

        this.box = parent;
        this.currDate = currDate;
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.disableDate = disableDate;

    }

    Calendar.prototype.toDate = function(string, format) {

        if(null == format) format="yyyy-MM-dd";

        var pattern = format.replace("yyyy", "(\\~1{4})").replace("yy", "(\\~1{2})").replace("MM", "(\\~1{2})").replace("M", "(\\~1{1,2})").replace("dd", "(\\~1{2})").replace("d", "(\\~1{1,2})").replace(/~1/g, "d");
        
        var returnDate;

        if (new RegExp(pattern).test(string)) {
            var yPos = format.indexOf("yyyy");
            var mPos = format.indexOf("MM");
            var dPos = format.indexOf("dd");
            if (mPos == -1) mPos = format.indexOf("M");
            if (yPos == -1) yPos = format.indexOf("yy");
            if (dPos == -1) dPos = format.indexOf("d");
            var pos = new Array(yPos + "y", mPos + "m", dPos + "d");
            var data = { y: 0, m: 0, d: 1};
            var m = string.match(pattern);
            for (var i = 1; i < m.length; i++) {
                if (i == 0) return;
                var flag = pos[i - 1].split('')[1];
                data[flag] = m[i];
                //alert(pos[i-1] + ",flag:"+flag + ",i:" + i + "," + data[flag]);
            };
            
            if (data.y.toString().length == 2) {
                data.y = parseInt("20" + data.y);
            }
            data.m = data.m - 1;
            returnDate = new Date(data.y, data.m, data.d);
        }
        if (returnDate == null || isNaN(returnDate)) returnDate = new Date();
       
        return returnDate;
    };

    Calendar.prototype.dateAdd = function(date, interval, number){
        switch (interval) {
          case "y":
            return new Date(date.getFullYear() + number, date.getMonth(), date.getDate());
            break;
          case "m":
            return new Date(date.getFullYear(), date.getMonth() + number, this.checkDate(date.getFullYear(), date.getMonth() + number, date.getDate()));
            break;
          case "d":
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + number);
            break;
          case "w":
            return new Date(date.getFullYear(), date.getMonth(), 7 * number + date.getDate());
            break;
        }
    };
    Calendar.prototype.format = function(date, style){
        var o = {   
            "M+" : date.getMonth() + 1, //month   
            "d+" : date.getDate(),      //day   
            "h+" : date.getHours(),     //hour   
            "m+" : date.getMinutes(),   //minute   
            "s+" : date.getSeconds(),   //second   
            "w+" : "日一二三四五六".charAt(date.getDay()),   //week   
            "q+" : Math.floor((date.getMonth() + 3) / 3),  //quarter   
            "S"  : date.getMilliseconds() //millisecond   
        }   
        if(/(y+)/.test(style)) {   
            style = style.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));   
        }
        for(var k in o){
            if(new RegExp("("+ k +")").test(style)){   
                style = style.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));   
            }
        } 
        return style;
    };

    Calendar.prototype.checkDate = function(year, month, date){

        var enddate = ["31", "28", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31"];

        var returnDate = "";
        if (year % 4 == 0) {
            enddate[1] = "29";
        }
        if (date > enddate[month]) {
            returnDate = enddate[month];
        } else {
            returnDate = date;
        }
        return returnDate;
    };

    Calendar.prototype.init = function(){

        this.date = this.currDate ? this.toDate(this.currDate,null) : new Date();

        this.beginDate = this.beginDate ? this.toDate(this.beginDate,null) : this.toDate("1900-01-01",null);

        this.endDate = this.endDate ? this.toDate(this.endDate,null) : this.toDate("2020-01-01",null);

        this.disableDate = this.disableDate? this.toDate(this.disableDate,null) : this.toDate('2014-06-01',null);

        this.date = this.date < this.beginDate ? this.beginDate : this.date;

        this.date = this.date > this.endDate ? this.endDate : this.date;

    }
    Calendar.prototype.events = function(){

        var _this = this;

        this.box.find('.js_prev_year').on('click', function(){

            _this.date = _this.dateAdd(_this.date, 'y', -1);
            _this.draw(_this.date);
            return false;

        });
        this.box.find('.js_prev_month').on('click', function(){

            _this.date = _this.dateAdd(_this.date, 'm', -1);
            _this.draw(_this.date);
            return false;
        });
        this.box.find('.js_next_month').on('click', function(){

            _this.date = _this.dateAdd(_this.date, 'm', 1);
            _this.draw(_this.date);
            return false;
        });
        this.box.find('.js_next_year').on('click', function(){

            _this.date = _this.dateAdd(_this.date, 'y', 1);
            _this.draw(_this.date);
            return false;
        });
    }
    Calendar.prototype.draw = function( date ){

        var _this = this;

        if(date){

            this.date = date;

        }else{

            this.init();

        }

        this.year = this.date.getFullYear();

        this.month = this.date.getMonth()+1;

        var thisMonthFirstDate = this.dateAdd(this.date, "d", 1-this.date.getDate());

        var lastMonthEndDate = this.dateAdd(thisMonthFirstDate, "d", -1);

        var lastMonthDate =  thisMonthFirstDate.getDay(); // first line ||

        var lastMonthEndDate = lastMonthEndDate.getDate();

        var thisMonthLastDate = this.dateAdd( this.dateAdd(thisMonthFirstDate, "m", 1), "d", -1 );

        var thisMonthEndDate = thisMonthLastDate.getDate();

        var thisMonthEndDay = thisMonthLastDate.getDay();


        this.box.find('.js_calendar_title span').each(function(i){
            i===0 ? $(this).html(_this.year) : $(this).html(_this.month)
        })

        var str = "";

        for(var i=0;i<lastMonthDate;i++){

            str += "<li><a href='javascript:;' class='ui_prev_month_date'>"+(lastMonthEndDate-lastMonthDate+1+i)+"</a></li>"
        }
       
        for(var i=1;i<thisMonthEndDate+1;i++){

            var cD = this.dateAdd(thisMonthFirstDate, "d", (i-1));
            
            if(this.format(cD, "yyyy-MM-dd") === this.format(this.date, "yyyy-MM-dd")){

                str += "<li><a href='javascript:;' class='ui_this_month today' title='"+this.format(cD, "yyyy-MM-dd")+"'>"+i+"</a></li>";

            }else{

                str += "<li><a href='javascript:;' class='ui_this_month' title='"+this.format(cD, "yyyy-MM-dd")+"'>"+i+"</a></li>";

            }
        }

        for(var i=1;i<7-thisMonthEndDay;i++){

            str += "<li><a href='javascript:;' class='ui_next_month_date'>"+i+"</a></li>";

        }
        
        this.box.find('.js_date').html(str);

    }

    module.exports = Calendar;

})