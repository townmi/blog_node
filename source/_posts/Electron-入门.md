---
title: Electron 入门
date: 2019-01-17 15:10:19
tags:
- Electron
- JS
categories:
- 前端
---

### 什么是Electron
[Electron](https://electronjs.org/)是可以使用HTML，CSS和JavaScript来构建跨平台桌面应用程序的一个开源库。 [Electron](https://www.chromium.org/)通过将Chromium和Node.js合并到同一个运行时环境中，并将其打包为Mac，Windows和Linux系统下的应用来实现这一目的。

<!-- more -->

### 第一个Election应用

#### 目录结构
```
.
├── index.html
├── main.js
├── node_modules
├── package.json
└── render.js
```

#### 目录代码说明
* `package.json` 这个就是项目的配置文件。
    ```json
    {
        "name": "electron-downloader",
        "version": "1.0.0",
        "description": "a electron app for download p2p files",
        "main": "main.js",
        "scripts": {
            "start": "electron ."
        },
        "repository": {
            "type": "git",
            "url": "git+https://github.com/townmi/electron-downloader.git"
        },
        "keywords": [
            "p2p",
            "electron"
        ],
        "author": "harry.tang",
        "license": "MIT",
        "bugs": {
            "url": "https://github.com/townmi/electron-downloader/issues"
        },
        "homepage": "https://github.com/townmi/electron-downloader#readme",
        "devDependencies": {
            "electron": "^4.0.1"
        }
    }
    ```
* `main.js` 是定义在`package.json` `main`字段，electron 执行的时候会查找该字段对于的启动文件，如果没有定义，就会查找一级目录下的`index.js`文件。总之，这个文件就是项目的启动文件。
    ```javascript
    const {app, BrowserWindow} = require('electron');

    // 创建全局主窗口变量
    let mainWindow;

    function createWindow() {
        // 创建主窗口
        mainWindow = new BrowserWindow({
            width: 800,
            height: 600
        });
        // 给主窗口加载我们的页面
        mainWindow.loadFile('index.html');

        // 当主窗口被关闭掉，我们需要释放对其的引用
        mainWindow.on('close', () => {
            mainWindow = null;
        });
    }

    // 当electron应用初始化完成，可以创建窗口视区
    app.on('ready', createWindow);
    ```
* `index.html` 在应用里面会开启窗口`win = new BrowserWindow({ width: 800, height: 600 })` 窗口都会加载一个页面，通常情况下加载的就是`index.html`
    ```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Electron Downloader</title>
    </head>
    <body>
        <h1>Electron Downloader Manager</h1>
        <script>
            // 可以引用render.js
            require('./render.js')
        </script>
    </body>
    </html>
    ```
* `render.js` 这个脚本，都一般是窗口页面依赖的脚本
    ```javascript
    // 所有的 Node.js APIs 在这里都可以被调用
    ```
* `npm run start` 启动electron应用，会得到下面的视图
![Electron Downloader](/uploads/20190117/1.png)

### 