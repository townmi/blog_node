---
title: HTTP缓存
date: 2020-08-10 19:37:38
tags:
- Nginx
categories:
- 工具
---

### HTTP缓存
每当我们发布版本之后万恶的index.html的缓存老是需要手动清除一下，才能加载新的js文件（虽然我们使用了hash后缀打包js文件，但是html文件入口是固定的）。每次客户出现了问题，都只能在群里说下清一下缓存试试呢。

<!-- more -->

### 我们的技术背景
- 使用webpack等打包出一个唯一的入口文件index.html，或者其他方式的入口html文件
- 入口html文件中js已经使用hash后缀方式加载
- 使用nginx做代理

### 先了解问题
首先是第一次打开页面，如图
![第一次打开页面](/uploads/20200812/1.png)
如上图所示，我访问系统入口地址（为什么不是index.html?这是使用了vue-router的history模式，nginx配置返回静态文件index.html），大家看一下它的状态是200，其他css,js文件都是200（http常用状态码后面会补充）。
当我刷新一下浏览器之后，如下：

![刷新后的页面](/uploads/20200812/2.png)
我们会发现入口文件它的状态变成了304,而其他css,js文件是200 memory cache，表示缓存过了。此时如果不强制清除缓存就会出现前面描述的情况一样，即使我下面的css,js文件都有hash后缀但是因为入口文件被缓存了，那么它还是会加载老的js文件，当然如果此css或js文件不存在可能会404错误

我们来对比下这几个状态:

| 状态码 | 说明 |	个人理解 | 备注 |
| --- | --- | --- | --- |
| 200 | OK  |	请求成功 | 正常请求 |
| 304 | Not Modified | 自从上次请求后，请求的网页未修改过。服务器返回此响应时，不会返回网页内容 | 协商缓存| 
| 200 | memory cache | 不请求网络资源，资源在本地内存当中 |  chrome策略，firefox都是304| 


### 解决方案

结合以上表格可以看出，不管是304还是 200  memory cache都会有存在入口文件被缓存的风险。所以修改nginx配置如下：
```apacheconf
  location ~ .*\.(htm|html)?$ {
    #原来这样设置的不管用
    #expires -1;
    #现在改为，增加缓存
    add_header Cache-Control "private, no-store, no-cache, must-revalidate, proxy-revalidate";
    access_log on;
  }
```

更新`nginx`配置后不管刷新多少次，都是200正常状态，没有被缓存，但是检测到css,js文件还是原来的所以也不用担心他们会重新加载一遍

### `try_files`的特殊处理
我们在nginx配置前端页面的时候，都经常使用`try_files`去区分不同入口
```apacheconf
  ## server中已经指定root的path如下
  location ^~ / {
    access_log off;
    expires 30d;
  }

  location ^~ /mobile/ {
    add_header Cache-Control no-cache;
    try_files $uri$args /mobile.html;
  }
```
我们会发现，上面的配置对于`/mobile/`页面的缓存策略有影响，`try_files`匹配后，会直接进入匹配的`location`中的配置，我们在这里配置的`header`都会被丢弃，也就是说我们要把这一段配置到 /mobile.html 中去.
[具体参考nginx文档](http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
我们需要对`try_files`特殊处理下
```apacheconf
  location = /mobile.html {
    add_header Cache-Control no-cache;
  }

  location ^~ /mobile/ {
    try_files $uri$args /mobile.html;
  }
```
比较优雅的写法如下
```apacheconf
  location ^~ /mobile/ {
    try_files $uri @mobile;
  }

  location @mobile {
    add_header Cache-Control "private, no-store, no-cache, must-revalidate, proxy-revalidate";
    expires 0;
    try_files /mobile.html =404;
  }
```

### 影响缓存的一些参数

#### 强制缓存

1. `Expires`: `Expires`是服务端返回的到期时间。如果下一次请求如果小于服务端返回的过期时间，则直接使用缓存数据。`Expires`是HTTP1.0的东西，现在浏览器默认都是使用HTTP1.1。而且由于该值是有服务端生成，而客户端的时间和服务端的时间有可能不一致，导致存在一定误差。所以HTTP1.1使用`Cache-Control`替代
2. `Cache-Control`: 
  - `max-age`：标识资源能够被缓存的最大时间。
  - `public`：表示该响应任何中间人，包括客户端和代理服务器都可以缓存。
  - `private`：表示该响应只能用于浏览器私有缓存中，中间人（代理服务器）不能缓存此响应。
  - `no-cache`：需要使用对比缓存（`Last-Modified/If-Modified-Since`和`Etag/If-None-Match`）来验证缓存数据。
  - `no-store`：所有内容都不会缓存，强制缓存和对比缓存都不会触发

#### 对比缓存

浏览器在第一次请求数据时，服务器会将缓存的标识与数据一起返回给浏览器，浏览器将这两个缓存到本地缓存数据库中。
再次请求数据时，就会在请求`header`中带上缓存的标识发送给服务器，服务器根据缓存标识对比，如果发生变化，则返回`200`状态码，返回完整的响应数据给浏览器，如果未发生更新，则返回`304`状态码告诉浏览器继续使用缓存数据

会造成对比缓存的字段如下：
1. Last-Modified与If-Modified-Since: 
  - Last-Modified: 第一次请求时，服务器会在响应头里设置该参数，告诉浏览器该资源的最后修改时间
  - If-Modified-Since: 再次（注意不是第一次）请求服务器时，客户端浏览器通过此字段通知服务器上次请求时，服务器返回的资源最后修改时间。服务器收到请求后，发现header中有If-Modified-Since字段，则与被请求资源的最后修改时间进行对比。 若资源的最后修改时间大于If-Modified-Since，则说明资源被修改过，则响应返回完整的内容，返回状态码200。 若资源的最后修改时间小于或等于If-Modified-Since，则说明资源未修改，则返回304状态码，告诉浏览器继续使用所保存的缓存数据。
2. Etag与If-None-Match(**优先级高于Last-Modified与If-Modified-Since**): 
  - Etag: 服务器响应请求时，告诉浏览器当前资源在服务器的唯一标识（由服务端生成）
  - If-None-Match: 再次请求服务器时，通过此字段通知服务器客户端缓存的资源的唯一标识。服务器收到请求header周发现有If-None-Match字段，则与被请求资源的唯一标识进行对比。 如果不一样，说明资源被修改过，则返回完整的响应，状态码200。 如果一样，说明资源未被修改过，则返回304状态码，告诉浏览器继续使用缓存的数据