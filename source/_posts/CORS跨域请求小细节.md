---
title: CORS跨域时，为何会出现一次动作，两次请求
date: 2019-07-24 19:37:38
tags:
- JS
categories:
- 前端
---

### CORS跨域时，为何会出现一次动作，两次请求？
在开发前后端分离项目时候，我们总会面临一个跨域问题。
众所周知，在以前，跨域可以采用代理、JSONP等方式，而在现代浏览器面前，我们有了更好的选择，`CORS`。
我们可以通过服务器端设置`Access-Control-Allow-Origin`响应头，即可使指定来源像访问同源接口一样访问跨域接口。

<!-- more -->

在使用`CORS`的时候，后台采用`token`检验机制，前台发送请求必须将`token`放到`Request Header`中,那么就需要传输自定义`Header`信息，这时候细心的你一定会发现一个问题，在前端`ajax`请求数据的时候，有时候会向后台一次性发送两次请求，这两次请求第一次无返回数据，第二次才会返回正确数据。莫名多出了一个`OPTIONS`的请求
```js
  // Request URL: http://127.0.0.1:3000/
  // Request Method: OPTIONS
  // Status Code: 204 No Content
  // Remote Address: 127.0.0.1:3000
  // Referrer Policy: strict-origin-when-cross-origin

  // HTTP/1.1 204 No Content
  // X-Powered-By: Express
  // Access-Control-Allow-Origin: *
  // Access-Control-Allow-Credentials: true
  // Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
  // Vary: Access-Control-Request-Headers
  // Access-Control-Allow-Headers: authorization
  // Content-Length: 0
  // Date: Wed, 27 May 2020 03:30:26 GMT
  // Connection: keep-alive

  // OPTIONS / HTTP/1.1
  // Host: 127.0.0.1:3000
  // Connection: keep-alive
  // Pragma: no-cache
  // Cache-Control: no-cache
  // Accept: */*
  // Access-Control-Request-Method: POST
  // Access-Control-Request-Headers: authorization
  // Origin: http://localhost:8080
  // Sec-Fetch-Mode: cors
  // Sec-Fetch-Site: cross-site
  // Sec-Fetch-Dest: empty
  // Referer: http://localhost:8080/
  // User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/82.0.4083.0 Safari/537.36
  // Accept-Encoding: gzip, deflate, br
  // Accept-Language: en-US,en;q=0.9
```

不用怀疑，这不是你的代码有`bug`,也不是在请求函数中重复调用了请求，因为很明显，两次的`Request Method`是不一样的。
如果你也曾因这个问题，困惑过，迷茫过，不知所因。那么关于这个问题，我将为你给出答案！
对于`CORS`跨域，有两种不同的请求类型。[MDN HTTP访问控制（CORS）介绍](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
1. 简单跨域请求
2. 复杂跨域请求(带预检的跨域请求)。

#### 简单跨域请求

简单跨域请求是指满足以下两个条件的请求。
1. `HTTP`方法是以下三种方法之一：
    - `HEAD`
    - `GET`
    - `POST`

2. `HTTP`的头信息不超出以下几种字段：
    - Accept
    - Accept-Language
    - Content-Language
    - Last-Event-ID
    - Content-Type：只限于三个值，application/x-www-form-urlencoded、multipart/form-data、text/plain

简单跨域请求的部分响应头如下：
  - Access-Control-Allow-Origin（必含）- 不可省略，否则请求按失败处理。该项控制数据的可见范围，如果希望数据对任何人都可见，可以填写"*"。
  - Access-Control-Allow-Credentials（可选） – 该项标志着请求当中是否包含cookies信息，只有一个可选值：true（必为小写）。如果不包含cookies，请略去该项，而不是填写false。这一项与XmlHttpRequest2对象当中的withCredentials属性应保持一致，即withCredentials为true时该项也为true；withCredentials为false时，省略该项不写。反之则导致请求失败。
  - Access-Control-Expose-Headers（可选） – 该项确定XmlHttpRequest2对象当中getResponseHeader()方法所能获得的额外信息。通常情况下，getResponseHeader()方法只能获得如下的信息：
  - Cache-Control
  - Content-Language
  - Content-Type
  - Expires
  - Last-Modified
  - Pragma

当你需要访问额外的信息时，就需要在这一项当中填写并以逗号进行分隔。

#### 复杂跨域请求
任何一个不满足简单跨域请求要求的请求，即被认为是复杂请求，也称作带预检的跨域请求。
一个复杂请求不止发送一个包含通信内容的请求，其中最先发送的是一种**"预检"请求**，此时作为服务端，也需要返回**"预回应"**作为响应。"预检"请求实际上是对服务端的一种权限请求，只有当"预检"请求成功返回，实际请求才开始执行。
预请求以`OPTIONS`形式发送，当中同样包含域，并且还包含了两项CORS特有的内容：

`Access-Control-Request-Method` – 该项内容是实际请求的种类，可以是`GET`、`POST`之类的简单请求，也可以是`PUT`、`DELETE`等等。
`Access-Control-Request-Headers` – 该项是一个以逗号分隔的列表，当中是复杂请求所使用的头部。

显而易见，这个"预检"请求实际上就是在为之后的实际请求发送一个权限请求，在预回应返回的内容当中，服务端应当对这两项进行回复，以让浏览器确定请求是否能够成功完成。一旦预回应如期而至，所请求的权限也都已满足，才会发出真实请求，携带真实数据

#### 解决方法
现在问题所在已经很明显了，那么面对这种跨域预检机制造成的多次请求问题，我们可以在后台设置`Access-Control-Max-Age`来控制浏览器在多长时间内（单位s）无需在请求时发送预检请求，从而减少不必要的预检请求。

**有时候你打开`chrome dev tools`去试的时候，发现`Access-Control-Max-Age`设置了，但是还是会有两次请求，这个时候你需要看下`Disable cache`是不是被勾上了**