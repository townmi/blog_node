---
title: Servlet,Tomcat,Jetty,Netty,Mina
date: 2021-03-05 19:37:38
tags:
- Java
categories:
- Java
---

### Servlet,Tomcat,Jetty,Netty,Mina之间的对比

先说结论吧: 
> `Servlet`是一种`Java EE`规范，`Tomcat` & `Jetty`是`Servlet`容器，`Tomcat`包含了`Servlet`。`Servlet`本身并不能处理外部请求，需要`Servlet`容器的配合，`Netty`和`MINA`是网络框架，我们可以使用`Netty`造出自己类似`Tomcat`的web服务器。简单的关系的话 `Tomcat` = `Jetty` > `Netty` & `MINA` > `Servlet`。

<!-- more -->

### 先了解每个技术的定义

#### Servlet

wiki上的定义
> `Servlet`是用`Java`编写的服务器端程序。其主要功能在于交互式地浏览和修改数据，生成动态Web内容。狭义的`Servlet`是指`Java`语言实现的一个接口，广义的`Servlet`是指任何实现了这个`Servlet`接口的类，一般情况下，人们将`Servlet`理解为后者。

#### Tomcat

wiki上的定义

> `Tomcat`是由`Apache`软件基金会下属的`Jakarta`项目开发的一个`Servlet`容器，按照`Sun Microsystems`提供的技术规范，实现了对`Servlet`和`JavaServer Page（JSP）`的支持，并提供了作为Web服务器的一些特有功能，如`Tomcat`管理和控制平台、安全域管理和`Tomcat`阀等。由于`Tomcat`本身也内含了一个`HTTP`服务器，它也可以被视作一个单独的Web服务器。但是，不能将`Tomcat`和`Apache HTTP`服务器混淆，`Apache HTTP`服务器是一个用C语言实现的HTTPWeb服务器；这两个`HTTP web server`不是捆绑在一起的。`Apache Tomcat`包含了一个配置管理工具，也可以通过编辑XML格式的配置文件来进行配置。

默认使用`BIO`。支持（`BIO`, `NIO`, `APR`(Apache Portable Runtime/Apache可移植运行库)）`apr`其实也是`nio`，是操作系统级别的支持.

**http协议**

#### Jetty

wiki上的定义

> `Jetty`是一个纯粹的基于`Java`的网页服务器和`Java Servlet`容器。尽管网页服务器通常用来为人们呈现文档，但是`Jetty`通常在较大的软件框架中用于计算机与计算机之间的通信。`Jetty`作为`Eclipse`基金会的一部分，是一个自由和开源项目。该网页服务器被用在Apache ActiveMQ[2]、Alfresco[3]、Apache Geronimo[4]、Apache Maven、Apache Spark、Google App Engine[5]、Eclipse[6]、FUSE[7]、Twitter’s Streaming API[8]、Zimbra[9]等产品上。`Jetty`也是`Lift`、`Eucalyptus`、`Red5`、`Hadoop`、`I2P`等开源项目的服务器。[10] `Jetty`支持最新的`Java Servlet API`（带JSP的支持），支持`SPDY`和`WebSocket`协议。

`Jetty`是一个Web服务器（HTTP），类似于`Tomcat`等，但比大多数servlet容器都要轻。这更接近传统的Java服务器应用程序（`servlet`，WAR文件）的方式。与`Netty`一样，它足够轻巧，可以嵌入到Java应用程序中。

默认使用`NIO`。支持（`BIO`, `NIO`, `AIO`（jetty9））

**http协议**

#### Netty

wiki上的定义

> `Netty`是一个基于`NIO`客户端-服务端框架，提供给诸如协议服务端与客户端的`Java`网络应用。异步事件驱动网络应用框架和工具用来简化`TCP`和`UDP`网络编程。`Netty`包括了一种响应式编程的实现。

**tcp/udp协议**

#### Mina

wiki上的定义

> `Apache MINA` 是一个开源`Java`网络应用框架。`MINA`可以创建表现良好的网络应用。`MINA`为各中通讯机制比如`TCP`,`UDP`提供统一的API。并且也可以很方便的实现一个自定义通讯方案。`MINA`提供高层和底层的API。

**tcp/udp协议**

### 关系

#### `Servlet`一种规范

`Servlet`是并不是对网络服务器的封装，而是`JEE`规范当中的一个。所以它可以支持多层用户协议。

#### `Tomcat`&`Jetty` 轻量级服务器

它们俩是同一级别的，都是`Servlet`容器。对于`Servlet`容器的工作机制可以参考[Servlet 工作原理解析](https://developer.ibm.com/zh/articles/j-lo-servlet/)

#### `Netty`&`MINA`网络编程框架

`Netty`是基于`NIO`的，`Netty`也像wiki介绍中说的`Netty`在很多大型项目中使用，比如像`ElasticSearch transport`也使用了`Netty`。`MINA`也是`NIO`框架，和`Netty`处于同一级别。下面是它们的区别：

- `mina`比`netty`出现的早，都是[Trustin Lee](https://t.motd.kr/about/)的作品；
- `mina`将内核和一些特性的联系过于紧密，使得用户在不需要这些特性3的时候无法脱离，相比下性能会有所下降；`netty`解决了这个设计问题；
- `netty`的文档更清晰，很多`mina`的特性在`netty`里都有；
- `netty`更新周期更短，新版本的发布比较快；
- 它们的架构差别不大，`mina`靠`apache`生存，而`netty`靠`jboss`，和`jboss`的结合度非常高，`netty`有对`google protocal buf`的支持，有更完整的`ioc`容器支持(`spring`,`guice`,`jbossmc`和`osgi`)；
- `netty`比`mina`使用起来更简单，`netty`里你可以自定义的处理`upstream events` 或/和 `downstream events`，可以使用`decoder`和`encoder`来解码和编码发送内容；
- `netty`和`mina`在处理`UDP`时有一些不同，`netty`将`UDP`无连接的特性暴露出来；而`mina`对`UDP`进行了高级层次的抽象，可以把`UDP`当成”面向连接”的协议，而要`netty`做到这一点比较困难。`mina`把`TCP`和`UDP`一样当”有连接”的处理，一个`UDP`请求会按照address产生一个新的`IoSession`，过期时间是1分钟，这样做的好处是显然的，但是对于有性能要求的项目就不好了，对一个无连接的东西cache 1分钟，大多数时候可能是白cache了，做无用功。 `Mina`这样做可能还有个初衷是连续解码用的，比如一个包太大了，分了两次传输；但是这样的设计应该是`udp`大忌了。