---
title: NPM私有依赖包
date: 2020-07-16 19:37:38
tags:
- JS
categories:
- 前端
---

### NPM私有依赖包

最近在使用`npm`私有化部署遇到，公网包和私有包如何在`package.json`中管理的问题

<!-- more -->

### 问题描述

首先，我们都知道官方的包管理地址是`https://registry.npmjs.org/`, 许多团队都会有自己的私有`npm`包管理地址，比如`https://registry.npm.taobao.org`, 我们都知道淘宝`npm`镜像会不停的同步官方的包
但是大多数团队的私有`npm`并不会去同步官方的包，这个时候如果我们在项目里面不仅用到官方的包还用到自己私有的包，那么我们的`packages.json`里面的`dependencies`该如何配置呢?

### dependencies

首先`dependencies`到底可以怎么写？
- `version` 精确匹配版本
- `>version` 必须大于某个版本
- `>=version` 大于等于
- `<version` 小于
- `<=version` version 小于
- `~version` "约等于"，具体规则详见semver文档
- `^version` "兼容版本"具体规则详见semver文档
- `1.2.x` 仅一点二点几的版本
- `http://...` 见下面url作为denpendencies的说明
- `*` 任何版本
- `""` 空字符，和*相同
- `version1 - version2` 相当于 >=version1 <=version2.
- `range1 || range2` 范围1和范围2满足任意一个都行
- `git...` 见下面git url作为denpendencies的说明
- `repo See` 见下面GitHub仓库的说明
- `tag发布的一个特殊的标签`，见npm-tag的文档 https://docs.npmjs.com/getting-started/using-tags
- `path/path/path` 见下面本地模块的说明
```json
  {
    "dependencies" : {
      "foo" : "1.0.0 - 2.9999.9999",
      "bar" : ">=1.0.2 <2.1.2",
      "baz" : ">1.0.2 <=2.3.4",
      "boo" : "2.0.1",
      "qux" : "<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0",
      "asd" : "http://asdf.com/asdf.tar.gz",
      "til" : "~1.2",
      "elf" : "~1.2.3",
      "two" : "2.x",
      "thr" : "3.3.x",
      "lat" : "latest",
      "dyl" : "file:../dyl",
    }
  }
```
```json
  {
    "dependencies" : {
      "git1" : "git://github.com/user/project.git#commit-ish",
      "git2" : "git+ssh://user@hostname:project.git#commit-ish",
      "git3" : "git+https://user@hostname/project/blah.git#commit-ish",
    }
  }
```
支持github的`username/modulename`的写法，#后边可以加后缀写明分支`hash`或标签
```json
  {
    "dependencies" : {
      "express": "visionmedia/express",
      "mocha": "visionmedia/mocha#4727d357ea",
    }
  }
```

### 私有化和公网的如何共存

上面`dependencies`写法，我们都看了，npm包仅支持版本号处理，那么私有化的包该怎么处理呢？
这个时候还是需要去设置下`.npmrc` 配置文件,[官方说明](https://docs.npmjs.com/configuring-npm/npmrc.html)
```js
  @myscope:registry=https://mycustomregistry.example.org
  // @myscope 开头的包都冲私有包镜像下载，
```
```bash
  npm install -S @myscope/yy
  # 比如上面我们添加了@myscope/yy这个包，那么这个包就会https://mycustomregistry.example.org下载
  npm install -S vue
  # 这个时候vue这个包就会从官方镜像下载，或者你设置的镜像下载
```