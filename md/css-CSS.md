title: CSS样式规范一
date: 2014-05-16 11:11:15
tags: css
categories: css
---

## 元素分类(常规) ##
1. 块级元素：(display: block) [div, h1 ~ h6, p, ul, ol, dl, li, dt, dd]
2. 内嵌块元素:(display: inline-block) [img, input]
3. 内嵌元素：(display: inline) [strong, em, a, span]
4. table元素：(display: inline-table)

**css标签元素的分类就好比javascript里面数据类型的分类，如果你拿到一个变量却不知道这个变量的数据类型，你敢用么。可想而知，CSS里面标签元素分类的重要性.**

一.内嵌元素的特性：


1. 行内元素不会应用width属性，其长度是由内容撑开的
2. 行内元素不会应用height属性，其高度也是由内容撑开的，但是高度可以通过line-height调节
3. 行内元素的padding属性只用padding-left和padding-right生效，padding-top和padding-bottom会改变元素范围，但不会对其它元素造成影响
4. 行内元素的margin属性只有margin-left和margin-right有效，margin-top和margin-bottom无效
5. 行内元素的overflow属性无效，这个不用多说了
6. 行内元素的vertical-align属性无效（height属性无效）