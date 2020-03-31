---
title: CSS unicode-range 字体属性
date: 2020-03-15 22:31:56
tags:
- CSS
categories:
- 前端
---

### CSS unicode-range 字体属性

#### 关于CSS 字体

前端使用字体，其实大部分人不是很讲究, 包括我自己，最新发现同样的段落，但是在不同的机器上，行数不一致，别说，一般人觉得没啥，这很正常，但是这个问题已经遇到好几年了，今天就来看看。
首先我们知道不同的系统都有不一样的字体，一般常用的微软雅黑，苹果电脑上是没有的。所以大家一般回想下面这样去处理网页的字体
```css
  body {
    font-family: 'Microsoft Yahei', Arial, sans-serif;
  }
```
<!-- more -->

#### @font-face的使用

但是很多时候，设计师总是喜欢玩点小个性，希望标题是一个字体，正文又是其他的字体，这时候，我们前端同学就不得祭出大招`@font-face`
```css
  @font-face {
    font-family: T;
    src: local('SimSun');
  }
  @font-face {
    font-family: P;
    src: local('PingFang SC'), local("Microsoft Yahei");
  }
  .h1 {
    font-family: T; // 标题 宋体
  }
  .p {
    font-family: P; // 正文 平方或者微软雅黑
  }
```

#### unicode-range的使用

这个时候，眼尖的设计师又来逼逼了，你这个引号，怎么和我的设计稿不一样啊，这个时候真的是十万个啥啥，是时候祭出我们的大刀了`unicode-range`
```css
  @font-face {
    font-family: YinHao;
    src: local('SimSun');
    unicode-range: U+201c, U+201d;
  }
  .p {
    font-family: YinHao, P; // 这下正文的引号都是统一的宋体引号
  }

```
上面我定义了一个`YinHao`的font-family，这个font-family仅包含两个引号，所以引号相关的字体，都会使用`YinHao`, 具体*unicode-range*的使用方法可以参考
```css
  /* 支持的值 */
  unicode-range: U+26;               /* 单个字符编码 */
  unicode-range: U+0-7F;
  unicode-range: U+0025-00FF;        /* 字符编码区间 */
  unicode-range: U+4??;              /* 通配符区间 */
  unicode-range: U+0025-00FF, U+4??; /* 多个值 */
```

#### 回到开始的问题

同一段文本， 在不同的机器上，行数不一致，这种情况，我们就可以把那些影响的字符集, 先生成对应的字体, 然后用`unicode-range`处理成新的font-family，确保不同机器都是统一的字体。
```css
  @font-face {
    font-family: SPEC;
    src: url('Only-Spec');
    unicode-range: **; // 对应的字符编码
  }

```