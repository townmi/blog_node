---
title: Webpack一些坑
date: 2020-03-03 22:31:56
tags:
- JS
categories:
- 前端
---

### Webpack一些坑

前端在使用webpack 构建项目的时候，总会遇到一些意外，下面是我汇总的意外事件

<!-- more -->

#### mini-css-extract-plugin的小问题
最近升级`mini-css-extract-plugin` 发现多了许多`warning`,看着心烦
```js
  // WARNING in chunk 1 [mini-css-extract-plugin]
  // Conflicting order. Following module has been added:
  // * css ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??ref--6-2!./node_modules/sass-loader/dist/cjs.js!./node_modules/sass-resources-loader/lib/loader.js??ref--6-4!./src/components/Input/style.scss
  // despite it was not able to fulfill desired ordering with these modules:
  // * css ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??ref--6-2!./node_modules/sass-loader/dist/cjs.js!./node_modules/sass-resources-loader/lib/loader.js??ref--6-4!./src/components/Dropdown/style.scss
  //   - couldn't fulfill desired order of chunk group(s) , , 
  // * css ./node_modules/css-loader/dist/cjs.js!./node_modules/postcss-loader/src??ref--6-2!./node_modules/sass-loader/dist/cjs.js!./node_modules/sass-resources-loader/lib/loader.js??ref--6-4!./src/components/Select/style.scss
  //   - couldn't fulfill desired order of chunk group(s) , 
  //   - while fulfilling desired order of chunk group(s) , 
```
`Conflicting order`,[排序的问题](!https://github.com/webpack-contrib/mini-css-extract-plugin/issues/250)。好坑爹啊，作者竟然让我们降低版本。
好在新版本支持下面的配置。可以不会出现上面的`warning`
```js
  new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
    chunkFilename: '[name].[contenthash].css',
    ignoreOrder: true, // 这个参数设置true就可以了
  }),
```
