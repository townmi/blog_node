---
title: Netty入门使用
date: 2021-03-02 19:37:38
tags:
- Java
categories:
- Java
---

### Netty入门使用
Netty是一款基于NIO（Nonblocking I/O，非阻塞IO）开发的网络通信框架，它具有一下三个有点:
* 并发高
* 传输快
* 封装好

<!-- more -->

### Netty初级使用
下面是通过Netty开发一个简单的客户端/服务端应用

#### 添加依赖库

```groovy
  // https://mvnrepository.com/artifact/io.netty/netty-all
  implementation group: 'io.netty', name: 'netty-all', version: '4.1.59.Final'
```

#### Netty服务端
通过`Netty`启动服务
```java
  package com.example;

  import io.netty.bootstrap.ServerBootstrap;
  import io.netty.channel.ChannelFuture;
  import io.netty.channel.ChannelInitializer;;
  import io.netty.channel.ChannelOption;
  import io.netty.channel.nio.NioEventLoopGroup;
  import io.netty.channel.socket.SocketChannel;
  import io.netty.channel.socket.nio.NioServerSocketChannel;
  import io.netty.handler.codec.http.HttpObjectAggregator;
  import io.netty.handler.codec.http.HttpServerCodec;


  public class NettyServer {
    public static void main(String[] args) {
      new NettyServer().start();
    }

    public void start() {
      //
      ServerBootstrap bootstrap = new ServerBootstrap();
      NioEventLoopGroup boss = new NioEventLoopGroup(1);
      NioEventLoopGroup child = new NioEventLoopGroup();

      bootstrap
        .group(boss, child)
        .channel(NioServerSocketChannel.class)
        .childHandler(new ChannelInitializer<SocketChannel>() {
          @Override
          protected void initChannel(SocketChannel ch) throws Exception {
            System.out.println("init channel" + ch);
            ch
              .pipeline()
              .addLast("handler", new AppLogicAdapter());
              // 业务处理
          }
        }).option(ChannelOption.SO_BACKLOG, 128)
        .childOption(ChannelOption.SO_KEEPALIVE, true);
      System.out.println("服务端开启");
      try {
        ChannelFuture sync = bootstrap.bind(10011).sync();
        sync.channel().closeFuture().syncUninterruptibly();
      } catch (InterruptedException e) {
        e.printStackTrace();
        boss.shutdownGracefully();
        child.shutdownGracefully();
      }
    }
  }

```
服务器处理响应逻辑。
```java
  package com.example;

  import io.netty.buffer.ByteBuf;
  import io.netty.buffer.Unpooled;
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.ChannelInboundHandlerAdapter;
  import io.netty.util.CharsetUtil;

  public class AppLogicAdapter extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
      //获取客户端发送过来的消息
      ByteBuf byteBuf = (ByteBuf) msg;
      System.out.println("收到客户端" + ctx.channel().remoteAddress() + "发送的消息：" + byteBuf.toString(CharsetUtil.UTF_8));
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
      //发送消息给客户端
      ctx.writeAndFlush(Unpooled.copiedBuffer("服务端已收到消息，并给你发送一个问号?", CharsetUtil.UTF_8));
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
      //发生异常，关闭通道
      ctx.close();
    }
  }

```

#### Netty客户端
通过`Netty`启动客户端调用

```java
  package com.example;

  import io.netty.bootstrap.Bootstrap;
  import io.netty.channel.ChannelFuture;
  import io.netty.channel.ChannelInitializer;
  import io.netty.channel.nio.NioEventLoopGroup;
  import io.netty.channel.socket.SocketChannel;
  import io.netty.channel.socket.nio.NioSocketChannel;

  public class NettyClient {

    public static void main(String[] args) {
      new NettyClient().open();
    }

    public void open() {
      NioEventLoopGroup group = new NioEventLoopGroup();
      Bootstrap bootstrap = new Bootstrap();
      bootstrap
        .group(group)
        .channel(NioSocketChannel.class)
        .handler(new ChannelInitializer<SocketChannel>() {
          @Override
          protected void initChannel(SocketChannel ch) throws Exception {
            ch.pipeline().addLast(new ClientLogic());
          }
        });

      System.out.println("客户端开始");
      try {
        ChannelFuture sync = bootstrap.connect("127.0.0.1", 10011).sync();
        sync.channel().closeFuture().sync();
      } catch (InterruptedException e) {
        e.printStackTrace();
      }
    }
  }

```

客户端发送请求，并接受返回数据
```java
  package com.example;

  import io.netty.buffer.ByteBuf;
  import io.netty.buffer.Unpooled;
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.ChannelInboundHandlerAdapter;
  import io.netty.util.CharsetUtil;

  public class ClientLogic extends ChannelInboundHandlerAdapter {
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
  //    super.channelActive(ctx);
      ctx.writeAndFlush(Unpooled.copiedBuffer("来自客户端", CharsetUtil.UTF_8));
    }

    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
      ByteBuf byteBuf = (ByteBuf) msg;
      System.out.println("收到消息:" + ctx.channel().remoteAddress() + "的消息:" + byteBuf.toString(CharsetUtil.UTF_8));
    }
  }

```

### 使用Netty部署一个Web服务器

```java
  // ...
  public class NettyServer {
    // ...
    public void start() {
      // ...
      bootstrap
        .group(boss, child)
        .channel(NioServerSocketChannel.class)
        .childHandler(new ChannelInitializer<SocketChannel>() {

          @Override
          protected void initChannel(SocketChannel ch) throws Exception {
            System.out.println("init channel" + ch);
            ch
              .pipeline()
              .addLast(new HttpServerCodec())
              // HttpServerCodec 解码请求编码返回
              .addLast("httpAggregator", new HttpObjectAggregator(512 * 1024))
              // 消息聚合器（重要）。为什么能有FullHttpRequest这个东西，就是因为有他，HttpObjectAggregator
              // 如果没有httpAggregator，就不会有那个消息FullHttpRequest的那段Channel，同样也不会有FullHttpResponse。
              // 如果没有httpAggregator, 那么一个http请求就会通过多个Channel被处理，这对我们的业务开发是不方便的，而aggregator的作用就在于此。
              // HttpObjectAggregator(512 * 1024)的参数含义是消息合并的数据大小，如此代表聚合的消息内容长度不超过512kb。
              .addLast("handler", new AppLogicHandler());
              // 业务逻辑
          }
        }).option(ChannelOption.SO_BACKLOG, 128)
        .childOption(ChannelOption.SO_KEEPALIVE, true);
      // ...
    }
  }

```

处理http请求，并返回
```java
  package com.example;

  import io.netty.buffer.Unpooled;
  import io.netty.channel.ChannelFutureListener;
  import io.netty.channel.ChannelHandlerContext;
  import io.netty.channel.SimpleChannelInboundHandler;
  import io.netty.handler.codec.http.*;

  public class AppLogicHandler extends SimpleChannelInboundHandler<FullHttpRequest> {
    @Override
    protected void channelRead0(ChannelHandlerContext ctx, FullHttpRequest msg) throws Exception {
      System.out.println("class:" + msg.getClass().getName());
      DefaultFullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK, Unpooled.wrappedBuffer("hello, world!".getBytes()));
      // 生成response，这里使用的FullHttpResponse，同FullHttpRequest类似，通过这个我们就不用将response拆分成多个channel返回给请求端了
      HttpHeaders headers = response.headers();
      headers.add(HttpHeaderNames.CONTENT_TYPE, HttpHeaderValues.TEXT_PLAIN + "; charset=UTF-8");
      headers.add(HttpHeaderNames.CONTENT_LENGTH, response.content().readableBytes());
      // 添加header描述length。这一步是很重要的一步，如果没有这一步，你会发现用postman发出请求之后就一直在刷新，因为http请求方不知道返回的数据到底有多长。
      headers.add(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE);
      ctx.writeAndFlush(response).addListener(ChannelFutureListener.CLOSE);
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
      System.out.println("服务端完成");
      super.channelReadComplete(ctx);
      ctx.flush();
      // channel读取完成之后需要输出缓冲流。
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
      super.exceptionCaught(ctx, cause);
      System.out.println("服务端报错");
      if (cause != null) cause.printStackTrace();
      if (ctx != null) ctx.close();
    }
  }

```