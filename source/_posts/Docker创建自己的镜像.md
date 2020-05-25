---
title: Docker创建自己的镜像
date: 2020-05-21 22:31:56
tags:
- Docker
categories:
- Linux
---

### Docker创建自己的镜像
在使用docker打包的情况下，经常会遇到现有的镜像不能满足自己的需求
这个时候，就需要自己打包一个特殊的镜像，供自己使用

<!-- more -->

#### 基本用法
如果我们现在需要把`nginx`和`nodejs`，打成一个镜像，下面的`Dockerfile`，就可以做到了

```dockerfile
  FROM nginx

  LABEL maintainer="harry.tang@anyway.work"
  LABEL build_date="2020-05-20"

  RUN apt-get update \
    && apt-get install --assume-yes build-essential apt-transport-https net-tools curl \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install --assume-yes nodejs \
    && apt-get clean

```
基本思路就是在一个容器里面，在安装其他环境需要的包，