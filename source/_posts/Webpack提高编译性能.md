---
title: Webpack提高编译性能
date: 2019-12-02 22:31:56
tags:
- JS
categories:
- 前端
---

### webpack提高编译性能

<!-- more -->

#### webpack热更新

#### 检查webpack性能相关的工具
- `webpack-dashboard` 开发过程中，可以及时查看某些模块出现的问题，及时调整
![webpack-dashboard](/uploads/20191129/1.png)
```js
  // webpack.config.js
  module.exports = {
    plugins: [
      // ...,
      new DashboardPlugin({})
    ]
  }
```
- `webpack-bundle-analyzer` 可以查看一下是哪些包的体积较大，然后进行优化
```js
  // webpack.prod.js
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  module.exports = {
    plugins: [
      // ...,
      new BundleAnalyzerPlugin(),
    ]
  }
```
- `speed-measure-webpack-plugin` 分析出`Webpack`打包过程中`Loader`和`Plugin`的耗时，有助于找到构建过程中的性能瓶颈
```js
  // webpack.prod.js
  module.exports = {
    // ...,
  };
  // webpack.speed.js
  const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
  const smp = new SpeedMeasurePlugin();
  const config = require('./webpack.prod.js')
  module.exports = smp.wrap(config)
```

#### `cache-loader`
在一些性能开销较大的`loader`之前添加`cache-loader`，将结果缓存中磁盘中。默认保存在`node_modueles/.cache/cache-loader`目录下
配合`speed-measure-webpack-plugin`,我们可以看到那些耗时比较长的`loader`,通过`cache-loader`的配合，可以有效的提高非首次编译速度
```js
  // webpakc.prod.js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.vue$/,
          exclude: /node_modules/,
          use: ['cache-loader', 'vue-loader']
        },
        {
          test: /\.js?$/,
          exclude: [/node_modules/],
          use: [ 'cache-loader', 'babel-loader' ]
        },
      ]
    }
  }
```
当然，如果仅仅针对`babel-loader`需要配置`cache`,我们也可以不使用`cache-loader`，给`babel-loader`增加选项`cacheDirectory`。
```js
  // webpakc.prod.js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true; // 开启cache
              }
            }
          ]
        },
      ]
    }
  }
```

#### 多进程/多实例构建
`webpack4` 有`thread-loader`,来实现多进程编译，和`cache-loader`一样的使用方式，
把`thread-loader`放置在其它`loader`之前，那么放置在这个`loader`之后的`loader`就会在一个单独的`worker`池中运行。
在`worker`池(worker pool)中运行的`loader`是受到限制的。例如：
- 这些`loader`不能产生新的文件。
- 这些`loader`不能使用定制的`loader API`（也就是说，通过插件）。
- 这些`loader`无法获取`webpack`的选项设置。

还有`HappyPack`**(不维护了)**

#### 缩小打包的作用域

- `exclude/include`(确定`loader`规则范围)
- `resolve.modules` 指明第三方模块的绝对路径 (减少不必要的查找)
- `resolve.mainFields` 只采用`main`字段作为入口文件描述字段 (减少搜索步骤，需要考虑到所有运行时依赖的第三方模块的入口文件描述字段)
- `resolve.extensions` 尽可能减少后缀尝试的可能性
- `noParse` 对完全不需要解析的库进行忽略 (不去解析但仍会打包到`bundle`中，注意被忽略掉的文件里不应该包含 `import、require、define` 等模块化语句)
- `IgnorePlugin`(完全排除模块)
- 合理使用`alias`


#### webpack自身的优化

1. `tree-shaking` 如果使用ES6的`import`语法，那么在生产环境下，会自动移除没有使用到的代码
2. `scope hosting` 作用域提升,变量提升，可以减少一些变量声明。在生产环境下，默认开启。 另外，大家测试的时候注意一下，`speed-measure-webpack-plugin`和`HotModuleReplacementPlugin`不能同时使用，否则会报错