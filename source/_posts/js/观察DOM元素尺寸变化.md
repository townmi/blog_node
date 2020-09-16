---
title: Resize Observer API
date: 2020-09-14 15:10:19
tags:
- JS
categories:
- 前端
---

### Resize Observer API
Resize Observer API提供了一种高性能的机制，通过该机制，代码可以监视元素的大小更改，并且每次大小更改时都会向观察者传递通知。

<!-- more -->

### 概念和使用

存在大量的响应式设计（以及其他相关）技术，它们可以响应元素大小的变化，但是以前，它们的实现常常很笨拙或者说生硬。

举个例子，当视口更改大小时， 媒介查询/`window.matchMedia`非常适合在特定点更新布局，但是如果要响应于特定元素的大小更改而更改布局，该元素又不是外部容器时，该怎么办？

为此，一种有限的解决方案是监听对适当事件的更改，该事件会提示您对更改大小感兴趣的元素 (例如 `window resize event`)，然后找出该元素之后新的尺寸或其他功能，例如，使用`Element.getBoundingClientRect`或者`Window.getComputedStyle`，来调整大小。

这样的解决方案仅适用于有限的场景，对性能不利（不断调用上述方法会导致性能严重下降），并且在不更改浏览器窗口大小的情况下通常不起作用。

Resize Observer API提供了一种解决此类问题的解决方案，此外，它还使您能够轻松观察和响应元素内容或边框的大小变化，并以高效的方式做出响应。 它为Web平台中经常讨论的缺少`element queries`提供了`JavaScript`解决方案。

用法很简单，并且与其他观察者（例如 `Performance Observer`或者`Intersection Observer`)— 几乎相同，您可以使用`ResizeObserver()`构造函数创建一个新的`ResizeObserver`，然后使用`ResizeObserver.observe()`使其寻找特定元素大小的更改。 每次更改大小时，构造函数中设置的回调函数便会运行，从而提供对新维度的访问权限，并允许您根据需要执行任何操作。

### 接口

- `ResizeObserver`
  提供注册新观察者以及启动和停止观察元素的能力。
- `ResizeObserverEntry`
  描述已调整大小的单个元素，标识该元素及其新大小。


### 例子
您可以在我们的GitHub存储库中找到几个简单的示例：

- [resize-observer-border-radius.html](https://mdn.github.io/dom-examples/resize-observer/resize-observer-border-radius.html) ([源码](https://github.com/mdn/dom-examples/blob/master/resize-observer/resize-observer-border-radius.html)): 一个带有绿色框的简单示例，其大小为视口大小的百分比。更改视口大小时，框的圆角将根据框的大小成比例地变化。 我们可以通过`border-radius`来百分比来实现，但这很快会导致椭圆形的角看起来很丑陋，而上述解决方案为您提供了随盒子大小缩放的漂亮的角形正方形。
- [resize-observer-text.html](https://mdn.github.io/dom-examples/resize-observer/resize-observer-text.html) ([源码](https://github.com/mdn/dom-examples/blob/master/resize-observer/resize-observer-text.html)): 这里我们使用`resize observer`来改变`font-size`，标题和段落的值随着滑块值的改变而改变，导致包含的`<div>`改变宽度。 这表明您可以响应元素大小的更改，即使它们与视口无关。
代码通常将遵循这种模式 (取自`resize-observer-border-radius.html`):
```js
  const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
      if(entry.contentBoxSize) {
        entry.target.style.borderRadius = Math.min(100, (entry.contentBoxSize.inlineSize/10) + (entry.contentBoxSize.blockSize/10)) + 'px';
      } else {
        entry.target.style.borderRadius = Math.min(100, (entry.contentRect.width/10) + (entry.contentRect.height/10)) + 'px';
      }
    }
  });

  resizeObserver.observe(document.querySelector('div'));
```

[转载](https://developer.mozilla.org/zh-CN/docs/Web/API/Resize_Observer_API)