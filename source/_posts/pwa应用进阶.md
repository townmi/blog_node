---
title: PWA应用 进阶一
date: 2018-03-19 17:00:59
tags:
- JS
categories:
- 前端
---


### 什么是PWA应用？

PWA 的全拼是 Progressive Web Apps, 意思就是渐进式的网页应用。现在的许多网页应用相比Native APP 都有以下许多缺点:

1. 断网下基本无法使用
2. 需要输入网址才能访问
3. 无法获取推送消息

当然Native APP 相比普通网页也有许多缺点:

1. 开发成本远高于普通网页
2. 需要安装软件
3. 80%的Native APP 无人问津

在这样的情况下 W3C和Google开始推出**PWA**技术, PWA应用就是为了提升Web APP 的用户体验，结合 Web APP 和 Native APP 的优点. 

<!--more-->

总的来说PWA App 有以下特点:

1. 安全的(基于HTTPS)
2. 自适应的(必须响应式)
3. SEO优化的()
4. 可持续的(在网络通畅的情况下，同步最新状态)
5. 可安装的
6. 极速体验的


### Web App 如何升级 PWA APP

那么如何从普通的网页升级到PWA 应用呢？需要如下几个必要的条件:

1. 第一网站必须使用https
2. 所有页面都必须适配pad 和 mobile
3. 必须添加 Manifest 包含 PWA APP 的应用信息, 以及必要的资源
4. 支持**Service Worker** (important).


### Manifest 详解

Manifest 是一个JSON文件, 配置了 PWA APP 应用的名称、启动图片、启动路径和主题颜色等, 具体如下:

```json
{
  "short_name": "H.T App",
  "name": "Blog of Harry.Tang",
  "icons": [
    {
      "src": "launcher-icon-1x.png",
      "type": "image/png",
      "sizes": "48x48"
    },
    {
      "src": "launcher-icon-2x.png",
      "type": "image/png",
      "sizes": "96x96"
    },
    {
      "src": "launcher-icon-4x.png",
      "type": "image/png",
      "sizes": "192x192"
    }
  ],
  "start_url": "index.html?utm_source=homescreen",
  "background_color": "#2196F3  // 指定背景颜色。 Chrome 在网页启动后会立即使用此颜色",
  "display": "standalone // 隐藏浏览器的 UI",
  "orientation": "landscape // 强制一个特定方向",
  "theme_color": "#2196F3 // 指定主题颜色。该属性设置工具栏的颜色"
}
```

Manifest 的引用

```html
<link rel="manifest" href="/manifest.json">
```



### Service Worker

#### Service Worker