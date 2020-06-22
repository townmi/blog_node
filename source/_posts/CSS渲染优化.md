---
title: 优化关键渲染路径
date: 2020-03-30 03:53:02
tags:
- CSS
categories:
- 前端
---

### 优化关键渲染路径

上篇文章，我们讲了[浏览器的渲染](/2020/03/28/浏览器渲染/), 我们本次继续对浏览器的渲染，进一步深入的理解。
首先我们来看下**关键渲染路径**

<!-- more -->

#### 关键渲染路径

先来看下浏览器的渲染流程图
![渲染进程(浏览器内核)的工作流程](/uploads/20200330/3.png)
上篇文章里面，我们有介绍浏览器的渲染流程，我们在介绍渲染流程的时候并没有提到`javascript`，那么我们现在就要看看`javascript`会对我们的渲染流程有什么影响
我们都知道`JavaScript`的加载、解析与执行会阻塞`DOM`的构建，也就是说，在构建`DOM`时，`HTML`解析器若遇到了`JavaScript`，那么它会暂停构建`DOM`，将控制权移交给`JavaScript`引擎，等`JavaScript`引擎运行完毕，浏览器再从中断的地方恢复`DOM`构建.
至于为什么这么设计，实很好理解的，如果同时构建`DOM`、解析`JavaScript`，万一两者遇到同一个元素，就会出现不一致性的问题。

`JavaScript`对关键渲染路径的影响不只是阻塞`DOM`的构建，**它会导致`CSSOM`也阻塞`DOM`的构建**。
我们看上面的浏览器的渲染流程图发现原本`CSSOM`构建并不会阻塞`DOM`的构建，本身就是井水不犯河水,怎么引入`JavaScript`会导致`CSSOM`也开始阻塞`DOM`的构建，只有`CSSOM`构建完毕后，`DOM`再恢复`DOM`构建。
我们来细看，`JavaScript`不只是可以改`DOM`，它还可以更改样式，也就是它可以更改`CSSOM`。前面我们介绍，不完整的`CSSOM`是无法使用的，但`JavaScript`中想访问`CSSOM`并更改它，那么在执行`JavaScript`时，必须要能拿到完整的`CSSOM`。所以就导致了一个现象，如果浏览器尚未完成`CSSOM`的下载和构建，而我们却想在此时运行脚本，那么浏览器将延迟脚本执行和`DOM`构建，直至其完成`CSSOM`的下载和构建。
也就是说，在这种情况下，浏览器会先下载和构建`CSSOM`，然后再执行`JavaScript`，最后在继续构建`DOM`。
这会导致严重的性能问题，我们假设构建`DOM`需要一秒，构建`CSSOM`需要一秒，那么正常情况下只需要一秒钟`DOM`和`CSSOM`就会同时构建完毕然后进入到下一个阶段。但是如果引入了`JavaScript`，那么`JavaScript`会阻塞`DOM`的构建并等待`CSSOM`的下载和构建，一秒钟之后，假设执行`JavaScript`需要`0.00000001`秒，那么从中断的地方恢复`DOM`的构建后，还需要一秒钟的时间才能完成`DOM`的构建，总共花费了`2`秒钟才进入到下一个阶段。如图6-1所示。
![js对cssom和dom构建的影响](/uploads/20200330/4.png)

举个例子
```html
  <!doctype html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Test</title>
    <link rel="stylesheet" href="https://static.xx.fbcdn.net/rsrc.php/v3/y6/l/1,cross/9Ia-Y9BtgQu.css">
  </head>
  <body>
    aa
    <!-- 没有下面的script ,DOMContentLoaded 116ms触发 -->
    <script>
      console.log(1)
    </script>
    <!-- 有了上面的script ,DOMContentLoaded 1.21s触发 -->
    <!-- 应为CSSOM 构建 阻塞了 DOM 构建, 井水犯了合水 -->
  </body>
  </html>
```

总结：
1. 关键渲染路径（Critical Rendering Path）是指浏览器将`HTML`，`CSS`，`JavaScript`转换为屏幕上所呈现的实际像素这期间所经历的一系列步骤。
2. 关键渲染路径共分五个步骤。构建`DOM` -> 构建`CSSOM` -> 构建渲染树 -> 布局 -> 绘制。
3. `CSSOM`会阻塞渲染，只有当`CSSOM`构建完毕后才会进入下一个阶段构建渲染树。
4. 通常情况下`DOM`和`CSSOM`是并行构建的，但是当浏览器遇到一个`script`标签时，`DOM`构建将暂停，直至脚本完成执行。但由于`JavaScript`可以修改`CSSOM`，所以需要等`CSSOM`构建完毕后再执行`JS`。

### 如何优化关键渲染路径

关键还是看到底那些因素会影响渲染路径，总结下来有下面3种:
- 关键资源的数量
- 关键路径的长度
- 关键字节的数量
> 切记，非常重要，所有优化关键渲染路径的方法，都是在优化以上三种因素。因为只有这三种因素可以影响关键渲染路径。

1. 关键资源指的是那些可以阻塞页面首次渲染的资源。例如`JavaScript`、`CSS`都是可以阻塞关键渲染路径的资源，这些资源就属于“关键资源”。关键资源的数量越少，浏览器处理渲染的工作量就越少，同时CPU及其他资源的占用也越少。
2. 关键路径的长度指的是浏览器和资源服务器之间的往返次数`Round-Trip Time`，通常被称作RTT。
3. 关键字节的数量指的是关键资源的字节大小，浏览器要下载的资源字节越小，则下载速度与处理资源的速度都会更快。通常很多优化方法都是针对关键字节的数量进行优化。例如：压缩（GZIP）
> 关键路径中的每一步耗时越长，由于阻塞会导致渲染路径的整体耗时变长。

#### 优化 DOM
在关键渲染路径中，构建渲染树（Render Tree）的第一步是构建`DOM`，所以我们先讨论如何让构建`DOM`的速度变得更快。
**HTML文件的尺寸应该尽可能的小**，目的是为了让客户端尽可能早的接收到完整的`HTML`。通常`HTML`中有很多冗余的字符，例如：JS注释、CSS注释、HTML注释、空格、换行。更糟糕的情况是我见过很多生产环境中的HTML里面包含了很多废弃代码，这可能是因为随着时间的推移，项目越来越大，由于种种原因从历史遗留下来的问题，不过不管怎么说，这都是很糟糕的。对于生产环境的HTML来说，应该删除一切无用的代码，尽可能保证HTML文件精简。
总结起来有三种方式可以优化HTML：
- 缩小文件的尺寸（Minify）
- 使用gzip压缩（Compress）
- 使用缓存（HTTP Cache）。
> 缩小文件的尺寸（Minify）会删除注释、空格与换行等无用的文本。

**本质上，优化DOM其实是在尽可能的减小关键路径的长度与关键字节的数量**。

#### 优化CSSOM
与优化DOM类似，CSS文件也需要让文件尽可能的小，或者说所有文本资源都需要。CSS文件应该删除未使用的样式、缩小文件的尺寸（Minify）、使用gzip压缩（Compress）、使用缓存（HTTP Cache）。
除了上面提到的优化策略，CSS还有一个可以影响性能的因素是：**CSS会阻塞关键渲染路径**。
CSS是关键资源，它会阻塞关键渲染路径也并不奇怪，但通常并不是所有的CSS资源都那么的『关键』。
举个例子：一些响应式CSS只在屏幕宽度符合条件时才会生效，还有一些CSS只在打印页面时才生效。这些CSS在不符合条件时，是不会生效的，所以我们为什么要让浏览器等待我们并不需要的CSS资源呢？
针对这种情况，我们应该让这些非关键的CSS资源不阻塞渲染。
实现这一目的非常简单，我们只需要将不阻塞渲染的CSS移动到单独的文件里。例如我们将打印相关的CSS移动到print.css，然后我们在HTML中引入CSS时，添加媒体查询属性print，代码如下：
```html
  <link href="print.css" rel="stylesheet" media="print">
```
上面代码添加了`media="print"`属性，所以上面CSS资源仅用于打印。添加了媒体查询属性后，浏览器依然会下载该资源，但如果条件不符合，那么它就不再阻塞渲染，也就是变成了非阻塞的CSS, 同时CSS资源变成了Lowest，表示低优先级。
上面提供的方法是针对那些不需要生效的CSS资源，**如果CSS资源需要在当前页面生效，只是不需要在首屏渲染时生效，那么为了更快的首屏渲染速度，我们可以将这些CSS也设置成非关键资源**。只是我们需要一些比较hack的方式来实现这个需求：
```html
  <link href="style.css" rel="stylesheet" media="print" onload="this.media='all'">
```
上面代码先把媒体查询属性设置成print，将这个资源设置成非阻塞的资源。然后等这个资源加载完毕后再将媒体查询属性设置成all让它立即对当前页面生效。
通过这样的方式，我们既可以让这个资源不阻塞关键渲染路径，还可以让它加载完毕后对当前页面生效。
类似的方案有很多，代码如下：
```html
  <link rel="preload" href="style.css" as="style" onload="this.rel='stylesheet'">
  <link rel="alternate stylesheet" href="style.css" onload="this.rel='stylesheet'">
```
上面两种方式都能实现同样的效果。
关于CSS的加载有这么多门道，到底怎样才是最佳实践？答案是：[Critical CSS](https://github.com/addyosmani/critical)。
**Critical CSS的意思是：把首屏渲染需要使用的CSS通过style标签内嵌到head标签中，其余CSS资源使用异步的方式非阻塞加载。**
CSS资源在构建渲染树时，会阻塞JavaScript，所以我们应该保证所有与首屏渲染无关的CSS资源都应该被标记为非关键资源。
所以Critical CSS从两个方面解决了性能问题：
- 减少关键资源的数量（将所有与首屏渲染无关的CSS使用异步非阻塞加载）
- 减少关键路径的长度（将首屏渲染需要的CSS直接内嵌到head标签中，移除了网络请求的时间）。

#### 避免使用@import
大家应该都知道要避免使用`@import`加载CSS，实际工作中我们也不会这样去加载CSS，但这到底是为什么呢？
这是因为使用`@import`加载CSS会增加额外的关键路径长度
```html
  <!doctype html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Demos</title>
    <link rel="stylesheet" href="http://127.0.0.1:8887/style.css">
    <link rel="stylesheet" href="https://lib.baomitu.com/CSS-Mint/2.0.6/css-mint.min.css">
  </head>
  <body>
    <div class="cm-alert">Default alert</div>
  </body>
  </html>
  <!-- 我们会发现两个样式是并行下载的 -->
  <!-- 如果改下下面的 方式 -->
  <!doctype html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Demos</title>
      <link rel="stylesheet" href="http://127.0.0.1:8887/style.css">
  </head>
  <body>
      <div class="cm-alert">Default alert</div>
  </body>
  </html>
```
```css
/* style.css */
@import url('https://lib.baomitu.com/CSS-Mint/2.0.6/css-mint.min.css');
body{background:red;}
/* 我们发现，浏览器是先下载style.css 再下载css-mint.min.css 就是串行加载， 时间变长了 */
/* 前一个CSS加载完后再去下载使用@import导入的CSS资源。这无疑会导致加载资源的总时间变长。 */
```
**所以避免使用`@import`是为了降低关键路径的长度**

#### 异步JavaScript
所有文本资源都应该让文件尽可能的小，JavaScript也不例外，它也需要删除未使用的代码、缩小文件的尺寸（Minify）、使用gzip压缩（Compress）、使用缓存（HTTP Cache）。
与CSS资源相似，JavaScript资源也是关键资源，JavaScript资源会阻塞DOM的构建。并且JavaScript会被CSS文件所阻塞。**为了避免阻塞，可以为script标签添加`async`属性**。
举个例子:
```html
  <!doctype html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Demos</title>
    <link rel="stylesheet" href="https://static.xx.fbcdn.net/rsrc.php/v3/y6/l/1,cross/9Ia-Y9BtgQu.css">
  </head>
  <body>
    <p class='_159h'>aa</p>
    <script src="http://qiniu.bkt.demos.so/static/js/app.53df42d5b7a0dbf52386.js"></script>
  </body>
  </html>
  <!-- 这个例子中，首先是先并行下载9Ia-Y9BtgQu.css，app.53df42d5b7a0dbf52386.js -->
  <!-- 下完了，执行CSSOM 然后才是 JS 执行，最后是 DOM 构建，DOM 构建结束了 触发 domcontentloaded -->
```
如果将`script`标签添加`async`属性：
```html
  <!doctype html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Demos</title>
    <link rel="stylesheet" href="https://static.xx.fbcdn.net/rsrc.php/v3/y6/l/1,cross/9Ia-Y9BtgQu.css">
  </head>
  <body>
    <p class='_159h'>aa</p>
    <script async src="http://qiniu.bkt.demos.so/static/js/app.53df42d5b7a0dbf52386.js"></script>
  </body>
  </html>
  <!-- 先执行DOM构建 构建结束了 触发 domcontentloaded  -->
  <!-- DOM构建的同时下载9Ia-Y9BtgQu.css，app.53df42d5b7a0dbf52386.js -->
  <!-- JS加载完后不再需要等待CSS资源，并且也不再阻塞DOM的构建 -->
```
可以看到，在关键渲染路径中优化JavaScript，**目的是为了减少关键资源的数量**

### 总结
关键渲染路径是浏览器将HTML，CSS，JavaScript转换为屏幕上所呈现的实际像素的具体步骤。而优化关键渲染路径可以提高网页的呈现速度，也就是首屏渲染优化。
你会发现，我们介绍的内容都是如何优化DOM，CSSOM以及JavaScript，因为通常在关键渲染路径中，这些步骤的性能最差。这些步骤是导致首屏渲染速度慢的主要原因。