---
title: traceroute网络分析
date: 2018-03-22 15:34:36
tags:
- IP
categories:
- 网络
---

### traceroute网络分析

如今网络如初发达，4G 普及，5G 即将开启，但是我们经常还是会遇到网卡，网络延迟。当然造成网络卡的原因有很多，基本原因还是带宽不够。

当然很多人都会说，我们家可是50MB、100M带宽呢，还是卡啊。这就不得不说我们的网络传输过程了，网络就好比高速公路，高速上各种收费站、枢纽，在网络世界里体现为我们的路由器、交换机等。

当我们在家里访问百度的时候我们打开了 www.baidu.com 页面, 这个简单的动作，在网络的世界里面缺很复杂，看起来我们只是访问了百度的页面，但是，在网络的世界里面，我们可能走了几百公里出去了。下面，我们来一起看下我们到底在网络世界怎么个传输法的。

<!-- more -->

traceroute是一个工具，用来分析 数据从原地址到目标地址整个过程所经过的各种网关。
```bash
traceroute www.baidu.com
```

在 unix 系统的命令里面可以键入上面的命令，下面是 输出结果

![traceroute](/uploads/20180329/1.png)

```mermaid
graph TD
A[你的个人电脑] -->B[公司网关或者学校网关]
B -->C[区或者镇的电信公司的ISP 网络网关]
C -->D[城市电信公司的ISP网络网关]
D -->E[省或者直辖市的电信公司网关]
E -->F[更高级别的电信ISP网络网关]

```
