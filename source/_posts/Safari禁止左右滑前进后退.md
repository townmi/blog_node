---
title: Safari禁止左右滑前进后退
date: 2020-05-08 22:31:56
tags:
- JS
categories:
- 前端
---

### Safari禁止左右滑前进后退

最近产品上线，设计师要求能不能不让我们的页面在企业微信里面左滑退出，相信很多前端开发都有遇到这样的情况，一般我们开发H5页面的时候，在Safari下面都会遇到这样的问题.

<!-- more -->

#### 如何解决上面的问题

首先，设计师提出的问题是在企业微信里面，企业微信的网页，我我估计和safari差不多，那么我们就先按照safari来试试。
查了下资料发现`safari`有这个特性是`ios7`引入的
>The second and probably more problematic gesture is the swipe right and left from the borders; Safari will trigger the back and forward action in the browsing history à la Internet Explorer on Windows 8 mode. This gesture might have some conflicts with your website if you are inviting users to swipe left or right without some nice margins around (but to be honest, you have the same problem right now with Chrome too).

然后查了苹果官网，发现2017年有人问过[How do i disable swipe to go back a page in safari for the iphone.](!https://discussions.apple.com/thread/5738986)
```js
  // Go to Settings
  // Go to General
  // Go to Accessibility
  // Go to Switch Control
  // Go to Recipes
  // Go to "Turn Pages"
  // There will be various "switches" listed there, such as "left to right swipe." Swipe right and delete those.
```

然后我在IOS设置里面试了半天，发现毛用没有,放弃了，毕竟我的系统都是IOS12了
经过许久的思考，发现，既然Safari左右滑动是页面的前进后退，那么我把页面不能前进后退，不久完了么

#### 让页面不能前进后退来解决这个问题

1. 如果页面的导航是`pushState`, 我们可以通过`replaceState`来替换
2. 如果是`location.href`, 也可以通过`location.replace`

这样，页面的导航栈，就永远只有一个地址了，不会出现能前进后退了,那么`safari`左右滑动也不会出现了。ok完事。
给到产品一看，产品直否决!!!

#### 通过阻止touchmove默认行为
第二种方法就是通过阻止`touch`事件的默认行为来阻止左右滑动
```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试禁止左右滑</title>
    <style>
      * { padding: 0; margin: 0; }
      body { height: 100vh; }
      a { display: block; height: 50vh; }
    </style>
  </head>
  <body>
    <div class="w">
      <div id="us"></div>
      <ul class="scroll">
        <li><a href="http://127.0.0.1/test/">123</a></li>
        <li><a href="http://127.0.0.1/test/">123</a></li>
        <li><a href="http://127.0.0.1/test/">123</a></li>
        <li><a href="http://127.0.0.1/test/">123</a></li>
        <li><a href="http://127.0.0.1/test/">123</a></li>
      </ul>
    </div>
  </body>
  </html>
```
```js
  document.body.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, false);
  document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, {
    passive: false
  });
```
但是这样的配置的话，页面的滚动就没法做了，得自己处理了
```js
  function move (e) {
    e.stopPropagation();
    e.preventDefault();
    const lastY = lastYs[this._i] || 0;
    const startY = startYs[this._i] || 0;
    const y = e.touches[0].pageY - startY + lastY;
    disYs[this._i] = y;
    this.style.transform = `translate(0, ${y}px)`;
  }

  function end(e) {
    e.stopPropagation();
    e.preventDefault();
    lastYs[this._i] = disYs[this._i];
  }

  function start(e) {
    e.stopPropagation();
    e.preventDefault();
    startYs[this._i] = e.touches[0].pageY;
  }
  const scrolls = document.getElementsByClassName('scroll');

  const lastYs = [];
  const startYs = [];
  const disYs = [];
  for (let i = 0; i < scrolls.length; i++) {
    scrolls._i = i;
    lastYs[i] = 0;
    scrolls[i].addEventListener('touchstart', start.bind(scrolls[i]), {
      passive: false
    });
    scrolls[i].addEventListener('touchmove', move.bind(scrolls[i]), {
      passive: false
    });
    scrolls[i].addEventListener('touchend', end.bind(scrolls[i]), {
      passive: false
    });
  }
```

#### better-scroll使用
上面的方法好麻烦啊，有没有其他解决方法呢，有的[better-scroll](https://github.com/ustbhuangyi/better-scroll), 这个库可以处理滚动的问题，包括单击等等.
```html
<script src="https://cdn.jsdelivr.net/npm/better-scroll"></script>
```
```js
  let scroll = new BScroll('body', {
    scroll: true,
    click: true,
  });
```

#### 最后的问题

**上面的方法经过不同的手机测试，发现`ios 13.4.1` 是可以禁止的，但是旧的系统(`ios13.3.x`及以下的版本)都不行**