---
title: 通过Docker安装ELK
date: 2020-10-13 11:10:19
tags:
- Java
categories:
- 工具
---

### 什么是ELK
- E: `ElasticSearch`全文搜索引擎, 它可以快速地储存、搜索和分析海量数据。维基百科、Stack Overflow、Github 都采用它
- L: `Logstash` 是 `Elasticsearch` 的最佳数据管道, `Logstash` 是插件式管理模式，在输入、过滤、输出以及编码过程中都可以使用插件进行定制。
- K: `Kibana` 是为 `Elasticsearch`设计的开源分析和可视化平台。你可以使用`Kibana`来搜索，查看存储在`Elasticsearch`索引中的数据并与之交互。

<!-- more -->

### 通过docker安装ELK

#### 新增docker net
新增`ElasticSearch`相关容器联网的网络
```bash
  docker network create es
```

#### 安装`ElasticSearch`

先查询一下`ElasticSearch`的镜像
```bash
  docker search elasticsearch
```

拉取最新的镜像
```bash
  docker pull elasticsearch:7.9.2
```
查看本地的镜像
```bash
  docker images
  ##
  REPOSITORY                 TAG                 IMAGE ID            CREATED             SIZE
  elasticsearch              7.9.2               caa7a21ca06e        2 weeks ago         763MB
```
启动
```bash
  docker run -d --name es --net es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.9.2
  ##
  docker ps
  CONTAINER ID        IMAGE                 COMMAND                  CREATED             STATUS              PORTS                                            NAMES
  f8422697c89f        elasticsearch:7.9.2   "/tini -- /usr/local…"   5 minutes ago       Up 11 seconds       0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   es
```
修改容器中`ElasticSearch`的配置
```bash
  # 进入容器
  docker exec -it es bash
  # 修改配置文件
  vi /config/elasticsearch.yml
  # 添加配置
  http.host: 0.0.0.0
  http.cors.enabled: true
  http.cors.allow-origin: "*"
  # wq! 保存
  # exit 退出容器
  # 重启容器
  docker restart es
```
可以在浏览器打开`http://127.0.0.1:9200`，看到`elasticsearch`正常工作了
```json
  {
    "name" : "f8422697c89f",
    "cluster_name" : "docker-cluster",
    "cluster_uuid" : "D1COa2UgT3et7vs8MsPizg",
    "version" : {
      "number" : "7.9.2",
      "build_flavor" : "default",
      "build_type" : "docker",
      "build_hash" : "d34da0ea4a966c4e49417f2da2f244e3e97b4e6e",
      "build_date" : "2020-09-23T00:45:33.626720Z",
      "build_snapshot" : false,
      "lucene_version" : "8.6.2",
      "minimum_wire_compatibility_version" : "6.8.0",
      "minimum_index_compatibility_version" : "6.0.0-beta1"
    },
    "tagline" : "You Know, for Search"
  }
```

#### 安装`ElasticSearch-Head`

[`ElasticSearch-Head`](https://github.com/mobz/elasticsearch-head#running-with-built-in-server)是一个前端软件，用来查看`elasticsearch`信息的，就像大多数数据库管理软件链接数据库。
注意，我们这里的`elasticsearch`版本是7.9.2，所以目前不能使用docker去部署`ElasticSearch-Head`,必须把github上的源码，拉下来自己部署:
1. `git clone git://github.com/mobz/elasticsearch-head.git`
2. `cd elasticsearch-head`
3. `npm install`
4. `npm run start`
5. `open http://localhost:9100/`

#### 安装`Logstash`

首先去docker查一下镜像资源
```bash
  docker search logstash
  #
  NAME                                   DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
  logstash                               Logstash is a tool for managing events and l…   1728                [OK]        
```
拉取并启动`Logstash`
```bash
  # 拉取最新镜像
  docker pull logstash:7.9.2
  # 启动容器
  docker run --name es_logstash  --net es logstash:7.9.2
```
修改部分配置
```bash
  # 进入容器
  docker exec -it es_logstash bash
  # 修改配置
  xpack.monitoring.elasticsearch.hosts: [ "http://es:9200" ]
```

#### 安装`Kibana`
首先去docker查一下镜像资源
```bash
  docker search kibana
  #
  NAME                                 DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
  kibana                               Kibana gives shape to any kind of data — str…   1961                [OK]        
```
拉取并启动`Logstash`
```bash
  # 拉取最新镜像
  docker pull kibana:7.9.2
  # 启动容器
  docker run --name es_kibana --net es -p 5601:5601 -d  kibana:7.9.2
```
修改配置
```bash
  # 进入容器
  docker exec -it es_kibana bash
  # 修改配置
  elasticsearch.hosts: [ "http://es:9200" ]
```
打开浏览器 `http://127.0.0.1:5601/app/home`

### 通过docker-compose 来安装

参考[Elastic Stack on Docker](https://github.com/xeraa/elastic-docker/tree/master/full_stack)