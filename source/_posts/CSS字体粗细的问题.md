---
title: CSS字体粗细的问题
date: 2018-12-29 22:31:56
tags:
- CSS
categories:
- 前端
---

### CSS字体粗细的问题

最近设计师在对比网页和设计稿的时候，提出字体粗细的问题，我们来看看，这里面的文章

<!-- more -->

#### 设计师用的字体

首先设计稿里面的字体,下面的样式是我复制的sketch里面的`Copy CSS Attrbutes`
```css
  h2 {
    font-family: PingFangSC-Semibold;
    font-size: 30px;
    color: rgba(0,0,0,0.80);
    letter-spacing: -0.72px;
    text-align: center;
    line-height: 30px;
  }
```
一般我们会在`body`设置根的`font-family`;这个时候我们会直接把`body`的`font-family`设成上面的`font-family: PingFangSC-Semibold;`看起来没什么问题
但是我们发现设计师某些文本字体复制出来又不一样了
```css
  p {
    font-family: PingFangSC-Regular;
    font-size: 15px;
    color: #939397;
    letter-spacing: -0.36px;
    text-align: center;
    line-height: 20px;
  }
```
总不能再改吧，怎么办呢

#### 发现问题

前面复制的两个样式，我们发现，它们都没有带`font-weight`这个属性，不对啊，字体粗细，明明是`font-weight`
但是仔细看看，我们会发现问题`font-family: PingFangSC-Regular;`,这个字体，我翻了苹果的字体册，没看到啊！但是怎么会有效呢。
*我们来看下，苹果的字体册*
![苹果的字体册](/uploads/20190129/1.png)
原来啊，字体是`PingFang SC`, **注意中间的空格不能少**， 但是为什么sketch复制出来的是`PingFangSC-Regular`,后来联系了设计师，说TA们的粗细就是`Light、Regular、Semibold、Medium`这些
这下我惊呆了，CSS里面`font-weight`也没有这些值啊。

#### CSS font-weight
赶紧去查下[CSS手册](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight)
CSS`font-weight`常见粗细值名称和数值对应，`100`到`900`之间的数值大致对应如下的常见粗细值名称：

| Value | Common weight name |
| ---  | --- |
| 100	| Thin (Hairline) |
| 200	| Extra Light (Ultra Light) |
| 300	| Light |
| 400	| Normal (Regular) |
| 500	| Medium |
| 600	| Semi Bold (Demi Bold) |
| 700	| Bold |
| 800	| Extra Bold (Ultra Bold) |
| 900	| Black (Heavy) |
| 950	| Extra Black (Ultra Black) |

原来如此啊，`Light`就是`font-weight: 300`, `Semibold`就是`font-weight: 600`;

#### 最终解决方案
```css
  :root {
    --anyway-font-light: 300;
    --anyway-font-regular: 400;
    --anyway-font-medium: 500;
    --anyway-font-semi-bold: 600;
  }
  body {
    font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  }
  h2 {
    font-weight: var(--anyway-font-semi-bold);
  }
  p {
    font-weight: var(--anyway-font-regular);
  }
```