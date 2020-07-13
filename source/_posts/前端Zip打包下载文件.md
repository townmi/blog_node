---
title: 前端Zip打包下载文件
date: 2020-07-12 19:37:38
tags:
- JS
categories:
- 前端
---

### 前端Zip打包下载文件

最近在开发一个系统的时候，需要批量生成二维码，并打包下载，在这个机会下，有幸了解了下前端打zip包下载

<!-- more -->

### 如何实现ZIP打包下载

使用jszip这个项目实现的：[https://github.com/Stuk/jszip](https://github.com/Stuk/jszip)
使用也非常简单：
```js
  // 初始化一个zip打包对象
  var zip = new JSZip();
  // 创建一个被用来打包的名为Hello.txt的文件
  zip.file("Hello.txt", "Hello World\n");
  // 创建一个名为images的新的文件目录
  var img = zip.folder("images");
  // 这个images文件目录中创建一个base64数据为imgData的图像，图像名是smile.gif
  img.file("smile.gif", imgData, {base64: true});
  // 把打包内容异步转成blob二进制格式
  zip.generateAsync({type:"blob"}).then(function(content) {
    // content就是blob数据，这里以example.zip名称下载    
    // 使用了FileSaver.js  
    saveAs(content, "example.zip");
  });

  /*
  最终下载的zip文件包含内容如下：
  Hello.txt
  images/
    smile.gif
```

使用非常简单，官方示意也通俗易懂，我直接照着改改效果就出来了。
其中，提到了一个`FileSaver.js`，这也是非常有名的项目，可以介绍一下。

### 纯前端下载FileSaver.js

FileSaver.js项目地址是：[https://github.com/eligrey/FileSaver.js/](https://github.com/eligrey/FileSaver.js/)
使用示意：
```js
  <script src="./FileSaver.min.js"></script>
  <script>
  var canvas = document.getElementById("zxx-canvas");
  canvas.toBlob(function(blob) {
    saveAs(blob, "example.png");
  });
  </script>
```
`FileSaver.js`非常强，不仅兼容到IE10+，而且还支持大文件下载，Chrome浏览器下甚至可以下载2GB大小的文件。
`FileSaver.js`搭配`js-xlsx`还可以纯前端下载`Excel`文件。如果是生成`DOC`文件，试试这个项目。
由于非本文重点，不展开。

[这应该是你见过的最全前端下载总结](https://juejin.im/post/5c3c4b3551882524a5420119)