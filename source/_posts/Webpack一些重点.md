---
title: Webpack一些重点
date: 2019-11-29 22:31:56
tags:
- JS
categories:
- 前端
---

### Webpack一些重点
- `source map` 打包和源代码相关
- 文件 `hash` 打包后的文件名称
- `webpack`按需加载代码
等等

<!-- more -->

#### source map
`source map`是将编译、打包、压缩后的代码映射回源代码的过程。打包压缩后的代码不具备良好的可读性，想要调试源码就需要`soucre map`
map文件只要不打开开发者工具，浏览器是不会加载的
线上环境一般有三种处理方案
- `hidden-source-map`：借助第三方错误监控平台`Sentry`使用
- `nosources-source-map`：只会显示具体行数以及查看源代码的错误栈。安全性比`sourcemap`高
- `sourcemap`：通过`nginx`设置将`.map`文件只对白名单开放(公司内网)
注意：避免在生产中使用`inline-`和`eval-`，因为它们会增加`bundle`体积大小，并降低整体性能
```js
  // webpack.config.js
  module.export = {
    devtool: 'source-map' // string
  }
```
| devtool | 构建速度 | 重新构建速度 | 生产环境 | 品质(quality) |
| --- | --- | --- | --- | --- |
| none  | +++ | +++ | yes | 打包后的代码  |
| eval  | +++ |+++ |  no |生成后的代码 |
| cheap-eval-source-map | + | ++ |  no |  转换过的代码（仅限行） |
| cheap-module-eval-source-map |  o | ++ |  no |  原始源代码（仅限行） |
| eval-source-map | -- |+ | no | 原始源代码 | 
| cheap-source-map | + | o | yes | 转换过的代码（仅限行） | 
| cheap-module-source-map | o | - | yes | 原始源代码（仅限行） | 
| inline-cheap-source-map | + | o | no | 转换过的代码（仅限行） | 
| inline-cheap-module-source-map | o | - | no | 原始源代码（仅限行） | 
| source-map | -- | -- | yes | 原始源代码 | 
| inline-source-map | -- | -- | no | 原始源代码 | 
| hidden-source-map | -- | -- | yes | 原始源代码 | 
| nosources-source-map | -- | -- | yes | 无源代码内容 | 

`+++` 非常快速, `++` 快速, `+` 比较快, `o` 中等, `-` 比较慢, `--` 慢

#### 打包文件hash

- `hash`：和整个项目的构建相关，只要项目文件有修改，整个项目构建的`hash`值就会更改
- `chunkhash`：和`Webpack`打包的`chunk`有关，不同的`entry`会生出不同的`chunkhash`
- `contenthash`：根据文件内容来定义`hash`，文件内容不变，则`contenthash`不变

1. js文件设置hash, 用`hash`, chunkFilename使用`chunkhash`
```js
  module.export = {
    entry: {
      app: './scr/app.js',
      search: './src/search.js'
    },    
    output: {
      filename: 'js/[name].[hash:12].js',
      chunkFilename: 'js/[name].[chunkhash:12].js',
      path:__dirname + '/dist'
    }
  }
```
2. CSS文件设置hash,用`contenthash`
```js
  const plugins = [
    new MiniCssExtractPlugin({
      filename: `[name][contenthash:8].css`,
      chunkFilename: '[name].[contenthash].css',
    })
  ]
```
3. 图片的文件设置hash, 配合`file-loader`,使用`hash`
```js
  module.export = {
    module: {
      rules:[
        {
          test:/\.(png|svg|jpg|gif)$/,
          use:[
            {
              loader:'file-loader',
              options:{
                name:'img/[name][hash:8].[ext]'
              }
            }
          ]
        }
      ]
    }
  }
```

#### webpack实现按需加载JS
为了优化前端页面的性能，我们往往需要按需加载某些逻辑代码
这个时候webpack可以配合`babel-loader`来实现
```js
  // webpack.config.js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.js?$/,
          exclude: [/node_modules/],
          loader: 'babel-loader',
          options: {                                                                                                                                                                                                              
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-syntax-dynamic-import',
              // 按需加载 import('./handle').then(fn => fn.default());
            ]
          }
        }
      ]
    }
  }

  // 逻辑代码
  $('btn').on('click', () => {
    import('./logic').then(fn => fn.default());
  });
  // logic代码会被 打包成新chunk
```

#### 多页面打包
`webpack`支持多页面打包，我们需要设置entry多个入口、再配合`html-webpack-plugin`打包多个页面就好了
```js
  // webpack.prod.js
  module.exports = {
    entry: [
      index: './src/index.js'
      login: './src/login.js'
    ],
    plugins:[
      new HtmlWebpackPlugin({
        filename: './index.html',
        chunks: ['index'],
        template: './src/index.html',
        inject: true,
      }),
      new HtmlWebpackPlugin({
        filename: './login.html',
        chunks: ['login'],
        template: './src/login.html',
        inject: true,
      }),
    ]
  }
```

#### resolve配置
`resolve`用于帮助找到模块的绝对路径。 一个模块可以作为另一个模块的依赖模块，然后被后者引用
```js
  // webpack.prod.js
  module.exports = {
    // ...
    resolve: {
      extensions: ['.ts', '.js', '.css', '.scss', 'less', '.json'],
      alias: {
        // ...paths,
        'vue$': 'vue/dist/vue.runtime.esm.js',
        '@': resolvePath('src'),
      },
      plugins: [],
      // modules: ['node_modules'] 告诉 webpack 解析模块时应该搜索的目录
      // modules: [path.resolve(__dirname, 'src'), 'node_modules'] 搜索src优先于node_modules
    },
  }
```

#### externals
当我们通过CDN引用了某些第三方包的情况下，我们需要仍然可以通过`import`引用这些第三方包，但是webpack打包的时候，不会将这些包打进来
```js
  // webpack.prod.js
  module.exports = {
    // ...
    externals: {
      jquery: 'jQuery',
      axios: 'axios',
    }
  }
  // index.html
  <body>
    <div id="root">root</div>
    <script src="http://libs.xxx.com/jquery/2.0.0/jquery.min.js"></script>
    <script src="http://libs.xxx.com/axios/2.0.0/axios.min.js"></script>
  </body>
```

#### 抽离项目的公共代码
抽离公共代码是对于多页应用来说的，如果多个页面引入了一些公共模块，那么可以把这些公共的模块抽离出来，单独打包。公共代码只需要下载一次就缓存起来了，避免了重复下载。
抽离公共代码对于单页应用和多页应该在配置上没有什么区别，都是配置在`optimization.splitChunks`中

```js
  // webpack.prod.kjs
  module.exports = {
    entry:[
      vendor: ['react-dom' , 'react', './libs/utils.js'],
      styles: './src/assets/css/custom.less'
    ]
    optimization: {
      splitChunks: {
        cacheGroups: {
          css: { // entry 定义的styles 会打包到一起
            chunks: 'initial',
            name: 'vendor.styles',
            test: 'styles',
            enforce: true
          },
          vendor: {// entry 定义的vendor 会打包到一起
            chunks: 'initial',
            name: 'vendor.js',
            test: 'vendor',
            enforce: true
          },
          // common: { 也可以按模块被引入次数，把对应的模块打到同一个包中
          //   //公共模块
          //   chunks: 'initial',
          //   name: 'common.js',
          //   minSize: 1024 * 1024, //大小超过100个字节
          //   minChunks: 3 //最少引入了3次
          // }
        }
      },
    }
  }
```

#### mock数据
`webpack-dev-server` 不仅可以反向代理跨域的api，也可mock数据，供前端临时使用
需要配合`mocker-api`这个库去使用
```js
  // mock.data.js
  module.exports = {
    'GET /user': { username: 'test', id: 1 }
  }
  // webpack.dev.js
  const moker = require('mocker-api');
  module.exports = {
    devServer: {
      before(app){
        moker(app, path.resolve('./mock.data.js'))
      }
    }
  }
```