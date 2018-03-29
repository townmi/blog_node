---
title: WebPack 构建PWA
date: 2018-03-28 12:37:29
tags:
- JS
- webpack
categories:
- 前端
---

### WebPack 构建PWA

前面我们了解到如何通过 Service Worker 服务缓存资源, 如今WEB前端许多项目都使用了webpack构建工具, 今天我们不来将如何使用webpack, 仅仅简单介绍下 如何通过webpack 来构建一个 PWA 应用。

在原有webpack 环境下，我们需要引入一个扩展包 [serviceworker-webpack-plugin](https://github.com/oliviertassinari/serviceworker-webpack-plugin)
```javascript
npm install -D serviceworker-webpack-plugin
```

<!-- more -->

把扩展包添加到webpack配置文件
```javascript
import ServiceWorkerWebpackPlugin from 'serviceworker-webpack-plugin';

...

  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/sw.js'),
      publicPath: '/xxx/',
      filename: `sw-personal.js` // 在network里面被访问的sw.js
    }),
  ],
```

然后需要在js主线程注册Server Worker
```javascript
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

if ('serviceWorker' in navigator) {
  const registration = runtime.register();
}
```

这样我们的简单PWA应用基本完成，这里被注册到AppCache里面的文件都是通过webpack打包出来的，如果我们需要加入静态的其他资源，我们可以手动添加到`'src/sw.js'`
```javascript
{
  assets: [
    './main.hash.js',
  ],
}
```
