---
title: sniproxy代理的安装于使用
date: 2021-01-28 11:10:19
tags:
- Linux
categories:
- 工具
---

### sniproxy代理的安装于使用

如何实现无证书任意网站反代。
[`sniproxy`](https://github.com/dlundquist/sniproxy)是个不错的选择

<!-- more -->

### 安装

先拉取源代码`git clone https://github.com/dlundquist/sniproxy`.

#### 安装依赖包

```bash
  sudo apt-get install autotools-dev cdbs debhelper dh-autoreconf dpkg-dev gettext libev-dev libpcre3-dev libudns-dev pkg-config fakeroot devscripts
```

#### 编译安装

```bash
  ./autogen.sh && ./configure && make check && sudo make install
```

#### sniproxy 命令

```bash
Usage: sniproxy [-c <config>] [-f] [-n <max file descriptor limit>] [-V]
    -c  configuration file, defaults to /etc/sniproxy.conf
    -f  run in foreground, do not drop privileges
    -n  specify file descriptor limit
    -V  print the version of SNIProxy and exit
```

### 启动

#### 配置文件

```apacheconf
  user daemon

  pidfile /tmp/sniproxy.pid

  error_log {
    syslog daemon
    priority notice
  }

  access_log {
    # Same options as error_log
    filename /home/harry/logs/sniproxy/https_access.log
  }

  listen 443 {
    # This listener will only accept IPv4 connections since it is bound to the
    # IPv4 any address.
    proto tls
    table https_hosts
  }
  
  table https_hosts {
    .* *:443
  }
```

#### 启动

```bash
  # 启动
  sniproxy -c custom.conf
  # 查看进程
  harry@harry:/etc$ ps -aux | grep sniproxy
  daemon   25201  0.0  0.0  25624  2528 ?        Ss   08:18   0:00 sniproxy -c custom.conf
  root     25202  0.0  0.0  17168   136 ?        S    08:18   0:00 sniproxy -c custom.conf
  harry    25263  0.0  0.0  14864  1072 pts/0    S+   08:18   0:00 grep --color=auto sniproxy
  # 查看端口占用情况
  harry@harry:/etc$ sudo netstat -nap | grep sniproxy
  tcp6       0      0 :::443                  :::*                    LISTEN      25201/sniproxy      
  unix  3      [ ]         STREAM     CONNECTED     7803440  25201/sniproxy       
  unix  3      [ ]         STREAM     CONNECTED     7803441  25202/sniproxy  
```

#### 使用sniproxy
sniproxy 搭建成功，但是它是不能被直接访问的，你需要将域名解析过去。在需要代理的机器上面修改`dns`映射, 比如:`host`文件
```bash
  # 安装并开启sniproxy的机器ip
  188.88.88.88 www.google.com
```