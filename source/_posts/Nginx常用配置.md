---
title: Nginx常用配置
date: 2020-04-12 22:31:56
tags:
- Nginx
categories:
- 工具
---

### Nginx常用配置

#### 配置文件夹网页访问

```apacheconf
  server {
    listen       8080;
    server_name  localhost;
    location / {
      root ~/www/;
    }
  }
```

<!-- more -->
#### 配置反向代理

```apacheconf
  server {
    listen       8080;
    server_name  localhost;
    location / {
      proxy_pass http://localhost:8081;
    }
  }
```

#### gzip配置

```apacheconf
  server {
    listen       8080;

    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types application/javascript application/rss+xml application/vnd.ms-fontobject application/x-font application/x-font-opentype application/x-font-otf application/x-font-truetype application/x-font-ttf application/x-javascript application/xhtml+xml application/xml font/opentype font/otf font/ttf image/svg+xml image/x-icon text/css text/javascript text/plain text/xml;

    location / {
      proxy_pass                 http://localhost:8081;
      proxy_set_header Host      $host:$server_port;
      proxy_set_header           X-Real-IP          $remote_addr;
    }
  }
```

#### CORS跨域设置

```apacheconf
  http {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Headers X-Requested-With;
    add_header Access-Control-Allow-Methods GET,POST,OPTIONS;
  }
```
```apacheconf
  server {
    listen       80;
    server_name  localhost;
    location / {
      if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        #
        # Custom headers and headers various browsers *should* be OK with but aren't
        #
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        #
        # Tell client that this pre-flight info is valid for 20 days
        #
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
      }
      if ($request_method = 'POST') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
      }
      if ($request_method = 'GET') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range';
      }
    }
  }
```

#### 打开目录浏览功能

```apacheconf
  server {
    listen       8080;
    server_name  localhost;
    location / {
      root ~/www/;
      autoindex on;
      autoindex_exact_size on;
      autoindex_localtime on;
    }
  }
```

#### 针对SPA应用的设置

前端单页面应用，会出现不使用`hash history`模式的情况,这个情况下，我们会出现除了`root`路由可以打开，其他路由刷新就会404的情况，我们如果是使用nginx来发布的前端网站的话，可以使用下面的配置来解决这类问题
```apacheconf
  server {
    listen       8080;
    server_name  localhost;
    location / {
      root ~/www/;
      try_files $uri /index.html;
    }
  }
```
如果`www`目录下面不仅仅只有`index.html`这一个入口
``` bash
  .
├── assets
├── css
├── demo.html
├── fonts
├── index.html
├── js
```
这下，两个入口怎么办？
```apacheconf
  server {
    listen       8080;
    server_name  localhost;
    location / {
      root ~/www/;
      try_files $uri /index.html;
    }

    location /demo {
      root ~/www/;
      try_files $uri /demo.html;
    }
  }
```

#### location指令详解
通过指定模式来与客户端请求的URI相匹配，基本语法如下：location [=|~|~*|^~|@] pattern{……}
1. 没有修饰符 表示：必须以指定模式开始
2. = 表示：必须与指定的模式精确匹配
3. ~ 表示：指定的正则表达式要区分大小写
4. ~* 表示：指定的正则表达式不区分大小写
5. ^~ 类似于无修饰符的行为，也是以指定模式开始，不同的是，如果模式匹配，那么就停止搜索其他模式了
6. @ ：定义命名location区段，这些区段客户段不能访问，只可以由内部产生的请求来访问，如try_files或error_page等

#### root和alias的区别
```apacheconf
  location /img/ {
    alias /var/www/image/;
  }
```
若按照上述配置的话，则访问/img/目录里面的文件时，ningx会自动去/var/www/image/目录找文件
```apacheconf
  location /img/ {
    root /var/www/image;
  }
```
若按照这种配置的话，则访问/img/目录下的文件时，nginx会去/var/www/image/img/目录下找文件。
alias是一个目录别名的定义，root则是最上层目录的定义。
还有一个重要的区别是alias后面必须要用“/”结束，否则会找不到文件的。。。而root则可有可无~~