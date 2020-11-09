---
title: SimpleDateFormat时区的问题
date: 2020-12-02 19:37:38
tags:
- Java
categories:
- Java
---

### SimpleDateFormat时区的问题
今天发送通知的时候，遇到数据库的unix时间戳在java转时间格式化的时候出现问题，少了8小时，我们来看看什么问题

<!-- more -->

#### 为什么少了8小时

首先试试下面的代码
```java
  TimeZone aDefault = TimeZone.getDefault();
  System.out.println(aDefault);
```
在自己的电脑上出现输出如下
```js
  // sun.util.calendar.ZoneInfo[id="Asia/Shanghai",offset=28800000,dstSavings=0,useDaylight=false,transitions=31,lastRule=null]
```
但是在容器中，我们发现结果如下:
```js
  // sun.util.calendar.ZoneInfo[id="Etc/UTC",offset=0,dstSavings=0,useDaylight=false,transitions=0,lastRule=null]
```
若果我们的java程序是通过容器来部署的，大概率会遇到时间格式化时区的问题，当然如果你自己手动处理容器时区，估计可以避免
下面我们来看看如何解决这个时区的问题

#### 通过`setTimeZone`

`SimpleDateFormat`对象是支持`setTimeZone`，来手动切换时区,下面就是通过设置上海时区，来格式化uninx时间戳对应的时分
```java
  SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
  timeFormat.setTimeZone(TimeZone.getTimeZone("Asia/Shanghai"));
  String orderStartTime = timeFormat.format(1606899600l * 1000);
  System.out.println(orderStartTime);
```

#### `setDefault`

除了上面的手动设置，我们也可以通过`TimeZone.setDefault`来设置全局的默认时区。

```java
  TimeZone.setDefault(TimeZone.getTimeZone("GMT+8:00"));

  SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
  String orderStartTime = timeFormat.format(1606899600l * 1000);
  System.out.println(orderStartTime);
```

#### 时区说明

1. `"GMT+8:00"`、`"Asia/Shanghai"`: 中国时区

2. 时区大全
  ``` js
    {"ACT", "Australia/Darwin"},
    {"AET", "Australia/Sydney"},
    {"AGT", "America/Argentina/Buenos_Aires"},
    {"ART", "Africa/Cairo"},
    {"AST", "America/Anchorage"},
    {"BET", "America/Sao_Paulo"},
    {"BST", "Asia/Dhaka"},
    {"CAT", "Africa/Harare"},
    {"CNT", "America/St_Johns"},
    {"CST", "America/Chicago"},
    {"CTT", "Asia/Shanghai"},
    {"EAT", "Africa/Addis_Ababa"},
    {"ECT", "Europe/Paris"},
    {"EST", "America/New_York"},
    {"HST", "Pacific/Honolulu"},
    {"IET", "America/Indianapolis"},
    {"IST", "Asia/Calcutta"},
    {"JST", "Asia/Tokyo"},
    {"MIT", "Pacific/Apia"},
    {"MST", "America/Denver"},
    {"NET", "Asia/Yerevan"},
    {"NST", "Pacific/Auckland"},
    {"PLT", "Asia/Karachi"},
    {"PNT", "America/Phoenix"},
    {"PRT", "America/Puerto_Rico"},
    {"PST", "America/Los_Angeles"},
    {"SST", "Pacific/Guadalcanal"},
    {"VST", "Asia/Saigon"}
  ```

建议使用标准的`"GMT+8:00"`来处理中国时区的问题。