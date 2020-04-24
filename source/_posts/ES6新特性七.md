---
title: ES6新特性七
date: 2019-03-29 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6新特性Proxy


<!-- more -->

#### Proxy 的简单使用
```js
  let a = new Proxy({ c: 12 }, {
    get: function (target, handler, receiver) {
      console.log(target, handler, receiver);
        return 'leo';
    }
  })

  a.c; // leo
  a.a; // leo
```