---
title: 网页DNS提速
date: 2021-03-15 19:37:38
tags:
- Linux
- Nginx
categories:
- 前端
---

### 简介

偶然发现[resource-hints](https://w3c.github.io/resource-hints/),今天有空来简单研究下.

<!-- more -->

### 什么是DNS Prefetching

预先做`DNS`解析（domain name resolution），将`domain`域名，转为`IP`地址。浏览器载入页面和资源时需做`DNS`解析，但若等到浏览该页或要下载资源时才做`DNS`解析就太迟了（使用者需要等待一段时间），因此可预先执行。预先做`DNS`解析的好处是使用者浏览之后的页面时，可减少`DNS Lookup`的时间，感觉速度变快了。

### 如何使用DNS Prefetching

在`HTML`的`<head>`加入`<link rel="dns-prefetch" href="https://my-site.com">`。 加入这个标签后，页面上`<a>`的链接都会启动`DNS Prefetching`。注意`DNS Prefetching`在`https`下是无法使用的。若要在`https`下启用`DNS Prefetching`，必须在`<head>`加上`<meta http-equiv="x-dns-prefetch-control" content="on">`才能启用`DNS Prefetching`。但只能启动连接，而无法启用手动设置资源。
順道一提，`<link rel="dns-prefetch" href="//host_name_to_prefetch.com">` 和`<link rel="dns-prefetch" href="http://host_name_to_prefetch.com">` 含义是相同的。

### 合适使用DNS Prefetching

1. 该页面有许多静态资源但放在各个不同的`domain`底下，例如图片、`CSS`、JS等：例如，在这个页面或这个网站将图片放在`http://a.img.com` 和`http://b.img.com` 这些`domain`底下。我希望浏览该页面时能先对这两个`domain`做`DNS Prefetching`，于是可在`<head>`加上:
  ```html
    <link rel="dns-prefetch" href="http://a.img.com" />
    <link rel="dns-prefetch" href="http://b.img.com" />
  ```
2. 该页会转跳到不同`domain`下的页面，因此可在指令先指定对转跳的`domain`做`DNS Prefetching`

### 哪些网站适合优化

1. 电商网站的商品页大量载入不同`domain`下的商品图，例如：淘宝
2. 手机网页，需要提高页面载入完成的速度

### 启用对比

尚未做`DNS Prefetch`之前

![尚未做 DNS Prefetch 之前](/uploads/20210315/1.png)
做了`DNS Prefetch`之后。
我加了这几条指令到`<head>`里面…
```html
  <link rel="dns-prefetch" href="http://a.rimg.com" />
  <link rel="dns-prefetch" href="http://b.rimg.com" />
  <link rel="dns-prefetch" href="http://c.rimg.com" />
  <link rel="dns-prefetch" href="http://d.rimg.com" />
  <link rel="dns-prefetch" href="http://e.rimg.com" />
```
![DNS Prefetch 之后](/uploads/20210315/2.png)

多7次`DNS Prefetch`，其中不需做`DNS Prefetch`的有7次，完全命中。由于在上一页的时候保留了`DNS Lookup`的纪录，因此省了7次的`DNS Lookup`。

拿淘宝的商品页来看看

尚未做 DNS Prefetch 之前
![尚未做 DNS Prefetch 之前](/uploads/20210315/3.png)

DNS Prefetch 之后
![DNS Prefetch 之后](/uploads/20210315/4.png)

多9次`DNS Prefetch`，其中不需做`DNS Prefetch`的有4次，大約減少了一半

chrome可以使用`chrome://histograms/DNS.PrefetchQueue`来观察`DNS Prefetch`的记录

### 好处

花小量的传输（不到 100 bytes），却平均可节省200ms。有兴趣的话可参考[DNS Prefetching - The Chromium Projects](https://www.chromium.org/developers/design-documents/dns-prefetching)。对`SEO`来说，网站速度也是`Ranking Factor`之一，提高下载速度就可提高排名。

### 如何配置

假设在页面上有许多资源，例如：图片、CSS、JS，这些都放在同一个`domain`底下，这时浏览器针对每个`domain`只会开一个连线。也就是说，假设有10个资源放在同一个`domain`之下，每个档案需要100ms才能下载完，那个预计载完资源需要`10*100=1000ms`。但若我们将这10个档案分别放在2个不同的`domain`下，就可以开两条连线档案同时下载，那么只要花 5*100=500ms即可，减少了一半的时间。但也不是说`domain`越多越好，因为`DNS Lookup`需要时间，因此建议维持2 ~ 4个不同的`domain`即可

### 不同浏览器的对比

#### `chrome`

1. `Chrome`会记住最近使用的10个`domain`，并且在开启浏览器时自动解析，因此在开启这些常用页面的时候，并不会有`DNS Lookup`的延迟状况，大约节省了200ms或更多。打开你的`Chrome`，使用指令`chrome://dns`来看看。
2. 本机系统对`DNS`的快取是有限的，大约只能暂存50~200个`domain`。一旦超过了这个限制，便会移除过去使用过的`domain`来存放新的`domain`。而选取移除的`domain`只靠浏览的时间决定，可能会造成经常使用的`domain`查询结果被移除，被迫常常对这个`domain`进行查询。`Chrome`尝试修正这样的机制，所以会猜测哪些`domain`是使用者近期可能会用到的，然后标记为常用，使其能保存久一点。

而`Chrome`类似其他浏览器的其他设定都已忽略，似乎不希望使用者更改预设值。因此直接清除。
`Chrome`打开：`chrome://net-internals/#dns`
点击按钮「clean host cache」

#### `FF`
1. `network.dns.disablePrefetch`：若设定为`true`，则会关闭浏览器`DNS Prefethcing`的功能。
2. `network.dns.disablePrefetchFromHTTPS`：若设定为`false`，则会开启使用`HTTPs`的网站的`DNS Prefethcing`功能。在`HTTPS`的网站下，`DNS Prefethcing`功能预设是关闭的，必须经此手动开启。
3. `network.dnsCacheExpiration`：预设`DNS`暂存1分钟
4. `network.dnsCacheEntries`：预设`DNS`暂存20个
5. `network.http.keep-alive.timeout`：`TCP/IP`连线`idle`一段时间后才会被释放掉，预设是5分钟。好处是避免重覆`DNS Lookup`太快发生。

#### `IE`
1. `DnsCacheTimeout`：预设`DNS`暂存 30 分钟。
2. `KeepAliveTimeout`：`TCP/IP`连线`idle`一段时间后才会被释放掉，预设是1分钟。好处是避免重覆`DNS Lookup`太快发生。
3. `ServerInfoTimeout`：就算没有`KeepAliveTimeout`，假设我们查到了IP位置，并在使用一段时间内都没有发生错误，那么这段间内都不会对此`domain`做`DNS Lookup`。预设是2分钟。