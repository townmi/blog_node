---
title: Webpack基础
date: 2019-11-09 22:31:56
tags:
- JS
categories:
- 前端
---

### Webpack基础

`Webpack`的运行流程是一个串行的过程，从启动到结束大概就是下面3个步骤
- 初始化：启动构建，读取与合并配置参数，加载`Plugin`，实例化`Compiler`
- 编译：从`Entry`出发，针对每个`Module`串行调用对应的`Loader`去翻译文件的内容，再找到该`Module`依赖的`Module`，递归地进行编译处理
- 输出：将编译后的`Module`组合成`Chunk`，将`Chunk`转换成文件，输出到文件系统中

<!-- more -->

#### Webpack构建具体的流程

具体的流程可以分下面几个步骤
1. **初始化参数** 从配置文件和`Shell`语句中读取与合并参数，得出最终的参数
2. **开始编译** 用上一步得到的参数初始化`Compiler`对象，加载所有配置的插件，执行对象的`run`方法开始执行编译
3. **确定入口** 根据配置中的`entry`找出所有的入口文件
4. **编译模块** 从入口文件出发，调用所有配置的`Loader`对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
5. **完成模块编译** 在经过第4步使用`Loader`翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系
6. **输出资源** 根据入口和模块之间的依赖关系，组装成一个个包含多个模块的`Chunk`，再把每个`Chunk`转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会
7. **输出完成** 在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统
在以上过程中，`Webpack`会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用`Webpack`提供的`API`改变`Webpack`的运行结果。

#### Webpack基本参数设置

```js
  // webpack.config.js
  const path = require('path');
  module.exports = {
    entry: "./app/entry", // string | object | array
    mode: "production", // "production" | "development" | "none"
    output: {
      // webpack 如何输出结果的相关选项
      path: path.resolve(__dirname, "dist"), // string
      // 所有输出文件的目标路径
      // 必须是绝对路径（使用 Node.js 的 path 模块）

      filename: "bundle.js", // string
      // "[name].js", // 用于多个入口点(entry point)（出口点？）
      // "[chunkhash].js", // 用于长效缓存,「入口分块(entry chunk)」的文件名模板（出口分块？）

      publicPath: "/assets/", // string 
      // publicPath: "https://cdn.example.com/"
      // 输出解析文件的目录，url 相对于 HTML 页面

      libraryTarget: "umd", // 通用模块定义
      // 导出库(exported library)的类型
      // libraryTarget: "umd2", // 通用模块定义
      // libraryTarget: "commonjs2", // exported with module.exports
      // libraryTarget: "commonjs-module", // 使用 module.exports 导出
      // libraryTarget: "commonjs", // 作为 exports 的属性导出
      // libraryTarget: "amd", // 使用 AMD 定义方法来定义
      // libraryTarget: "this", // 在 this 上设置属性
      // libraryTarget: "var", // 变量定义于根作用域下
      // libraryTarget: "assign", // 盲分配(blind assignment)
      // libraryTarget: "window", // 在 window 对象上设置属性
      // libraryTarget: "global", // property set to global object
      // libraryTarget: "jsonp", // jsonp wrapper

      chunkFilename: "[id].js",
      // chunkFilename: "[chunkhash].js", // 长效缓存(/guides/caching)
      // 「附加分块(additional chunk)」的文件名模板
    },
    module: {
      // 关于模块配置
      rules: []
    },
    resolve: {
      // 解析模块请求的选项
      // （不适用于对 loader 解析）
      extensions: [".js", ".json", ".jsx", ".css"],
      alias: {
        "module": "new-module",
        // 起别名："module" -> "new-module" 和 "module/path/file" -> "new-module/path/file"
        "only-module$": "new-module",
        // 起别名 "only-module" -> "new-module"，
        // 但不匹配 "only-module/path/file" -> "new-module/path/file"
        "module": path.resolve(__dirname, "app/third/module.js"),
        // 起别名 "module" -> "./app/third/module.js" 和 "module/file" 会导致错误
        // 模块别名相对于当前上下文导入
      }
    },
    externals: ["react", /^@angular\//],
    // externals: "react", // string（精确匹配）
    // externals: /^[a-z\-]+($|\/)/, // 正则
    // externals: { // 对象
    //   angular: "this angular", // this["angular"]
    //   react: { // UMD
    //     commonjs: "react",
    //     commonjs2: "react",
    //     amd: "react",
    //     root: "React"
    //   }
    // },
    // externals: (request) => { /* ... */ return "commonjs " + request }
    // 不要遵循/打包这些模块，而是在运行时从环境中请求他们
    plugins: [],
    performance: {

    }
  }
```

#### 开发模式需要注意的参数
配合`webpack-dev-server`,可以实现本地开发，以及`api`的代理等等.
```js
  // webpack.config.js
  module.exports = {
    devServer: {
      hot: true,
      open: true,
      compress: true,
      contentBase: '/dist/',
      disableHostCheck: true,
      historyApiFallback: true,
      watchOptions: {
        poll: 1000,
      },
      proxy: {
        '/api': {
          target: `http://8.8.8.8.:8888`,
          pathRewrite: { '^/api': '' }
        }
      }
    },
  }
```

### loaders
`loader`本质就是一个函数，在该函数中对接收到的内容进行转换，返回转换后的结果。 因为`Webpack`只认识`JavaScript`，所以`Loader`就成了翻译官，对其他类型的资源进行转译的预处理工作
`loader`在`module.rules`中配置，作为模块的解析规则，类型为数组。每一项都是一个`Object`，内部包含了`test`(类型文件)、`loader`、`options` (参数)等属性
```js
  // webpack.config.js
  module.exports = {
    module: {
      rules: [
        {
          test: /***/, // test：需要匹配的模块后缀名；
          use: [] //  use：对应处理的 loader 插件名称（处理顺序是从右往左）
        }
      ]
    }
  }
```

#### 样式相关
1. `css-loader` 加载`CSS`，支持模块化、压缩、文件导入等特性
2. `style-loader` 把`CSS`代码注入到`JavaScript`中，通过`DOM`操作去加载`CSS`
3. `postcss-loader` 扩展`CSS`语法，使用下一代`CSS`，可以配合`autoprefixer`插件自动补齐`CSS3`前缀
4. `sass-loader` 处理`sass`文件
5. `less-loader` 处理`less`文件

```js
  // webpack.config.js
  module.export = {
    module: {
      rules: [
        {
          test: /\.(sc|c|sa)ss$/,
          use: [
            "style-loader", 
            {
              loader:"css-loader",
              options:{ sourceMap: true } // sourceMap 可以再devtools查看源代码
            },
            {
              loader:"postcss-loader",
              options: {
                ident: "postcss",
                sourceMap: true,
                plugins: loader => [
                  require('autoprefixer')(),
                  // 这里可以使用更多配置，如上面提到的 postcss-cssnext 等
                  // require('postcss-cssnext')()
                ]
              }
            },
            {
              loader:"sass-loader",
              options:{ sourceMap: true } // sourceMap 可以再devtools查看源代码
            },
            // {
            //   loader: "less-loader",
            //   options: {
            //     lessOptions: {
            //       javascriptEnabled: true
            //     }
            //   }
            // }
          ]
        }
      ]
    }
  }
  // 上面的loader 是先sass处理，完了用postcss-loader处理sass的结果，
  // 再交给css-loader处理，最终给到style-loader处理输出到dom里面
```

#### 脚本相关
1. `babel-loader` 把`ES6`转换成`ES5`
2. `ts-loader` 将`TypeScript`转换成`JavaScript`
3. `vue-loader` 加载`Vue.js`单文件组件
```js
  const rules = [
    {
      test: /\.vue$/,
      exclude: /node_modules/,
      loader: 'vue-loader',
    },
    {
      test: /\.ts$/,
      exclude: [/(\.d\.ts)/],
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/],
      }
    },
    {
      test: /\.js?$/,
      exclude: [/node_modules/],
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    },
  ]
```

#### 图片资源类
1. `file-loader` 把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件 (处理图片和字体)
```js
  const rules = [
    {
      test: /\.(woff(2)?|eot|ttf|otf|)$/,
      loader: 'file-loader',
      options: {
        name: '[path][name].[hash:6].[ext]',
        context: path.resolve(__dirname, '../src'),
      }
    },
    {
      test: /\.(png|jpe?g|gif|svg)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[path][name].[hash:6].[ext]',
            context: path.resolve(__dirname, '../src'),
          }
        }
      ]
    }
  ]
```

#### 其他常用
1. `eslint-loader` 通过`ESLint`检查`JavaScript`代码
2. `url-loader` 与`file-loader`类似，区别是用户可以设置一个阈值，大于阈值会交给`file-loader`处理，小于阈值时返回文件`base64`形式编码 (处理图片和字体)
3. `source-map-loader` 加载额外的`Source Map`文件，以方便断点调试
4. `cache-loader` 可以在一些性能开销较大的`Loader`之前添加，目的是将结果缓存到磁盘里

### plugins
`plugins`就是插件，基于事件流框架`Tapable`，插件可以扩展`Webpack`的功能，在`Webpack`运行的生命周期中会广播出许多事件，`plugins`可以监听这些事件，在合适的时机通过`Webpack`提供的`API`改变输出结果
在`plugins`中单独配置，类型为数组，每一项是一个`plugin`的实例，参数都通过构造函数传入

#### 样式
1. `mini-css-extract-plugin` 前面的`style-loader`是将样式代码都写到`head`的`style`里面去了，`mini-css-extract-plugin`可以样这些样式打包成单独的`CSS`文件,使用`mini-css-extract-plugin`就不能用`style-loader`
  ```js
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    const use = [
      MiniCssExtractPlugin.loader,  // 替换之前的 style-loader
      {
        loader:"css-loader",
        options:{ sourceMap: true }
      },
      {
        loader:"postcss-loader",
        options: {
          ident: "postcss",
          sourceMap: true,
          plugins: loader => [require('autoprefixer')()]
        }
      },
      {
        loader:"sass-loader",
        options:{ sourceMap: true }
      },
    ]
    // mini-css-extract-plugin 使用
    const plugins =  [
      new MiniCssExtractPlugin({
        filename: '[name].css', // 最终输出的文件名
        chunkFilename: '[id].css'
      }),
      // new MiniCssExtractPlugin({
      //   filename: '[name].[contenthash].css',
      //   chunkFilename: '[name].[contenthash].css',
      // })
    ]
  ```
2. `optimize-css-assets-webpack-plugin`, css代码虽然打包成单独文件，但是我们还需要压缩css代码，`optimize-css-assets-webpack-plugin`可以实现
  ```js
    const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
    const plugins =  [
      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: {
          safe: true,
          map: { inline: false },
        },
      }),
      // new OptimizeCssAssetsPlugin({ })
    ]
  ```

#### 脚本
1. `terser-webpack-plugin` 支持压缩 ES6 (Webpack4) 
2. `uglifyjs-webpack-plugin` 不支持 ES6 压缩 (Webpack4 以前)
3. `vue-loader/lib/plugin` 这个插件是针对`vue`的，官方解释*这个插件是必须的！它的职责是将你定义过的其它规则复制并应用到`.vue`文件里相应语言的块。例如，如果你有一条匹配`/\.js$/`的规则，那么它会应用到`.vue`文件里的 `<script>`块*
```js
  const TerserPlugin = require('terser-webpack-plugin');
  const plugins = [
    new TerserPlugin()
  ]
```

#### 其他常用
1. `webpack.DefinePlugin` 设置环境变量
2. `webpack.HotModuleReplacementPlugin` 模块热更新，它允许在运行时更新所有类型的模块，而无需完全刷新
3. `webpack.NamedModulesPlugin` 启用H模块热更新后，此插件将导致显示模块的相对路径。配合`webpack.HotModuleReplacementPlugin`,建议用于开发中
4. `webpack.optimize.ModuleConcatenationPlugin` 作用域提升(scope hoisting)
5. `html-webpack-plugin`  创建一个`html`文件，并把`webpack`打包后的静态文件根据设定自动插入到这个`html`文件当中
6. `webpack-cdn-plugin` 配合`html-webpack-plugin`,将`externals`的第三方包通过CDN加载
7. `serviceworker-webpack-plugin` 为网页应用增加离线缓存功能
8. `clean-webpack-plugin` 目录清理
9. `webpackbar` 显示编译进度条
10. `webpack-bundle-analyzer` 可视化`Webpack`输出文件的体积 (业务组件、依赖第三方模块)
11. `speed-measure-webpack-plugin` 可以看到每个`Loader`和`Plugin`执行耗时 (整个打包耗时、每个`Plugin`和`Loader`耗时)