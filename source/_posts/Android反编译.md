---
title: Android反编译
date: 2019-01-09 17:31:56
tags:
- Java
categories:
- 安卓
---

### 需要准备的工具
* [JDK](https://www.oracle.com/technetwork/cn/java/javase/downloads/jdk8-downloads-2133151-zhs.html)
* [apktool](https://ibotpeaches.github.io/Apktool/install/)
* [dex2jar](https://github.com/pxb1988/dex2jar)
* [jd-gui](http://jd.benow.ca/)

### 环境配置
#### 安装`java`环境
 正确安装好java环境后，可以使用`java -version` 查看环境配置是否正常

![java -version](/uploads/20190109/1.png)

<!-- more -->

#### 设置`apktool`脚本
 [参考](https://ibotpeaches.github.io/Apktool/install/) 下面是mac os 配置的案例
* 下载[脚本](https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/osx/apktool) (另存为apktool)
* 下载 [apktool-2](https://bitbucket.org/iBotPeaches/apktool/downloads/) 将下载的jar包重命名为`apktool.jar`
* 将解压后的文件`apktool.jar & apktool`复制到/usr/local/bin目录下 (需要root权限)
* 解决权限问题`chmod 777 apktool apktool.jar`

#### 设置`dex2jar.sh`脚本
* 将下载好的dex2jar压缩包解压，将`d2j-dex2jar.sh`重命名为`dex2jar.sh`
* 将解压后的文件夹`dex2jar/`复制到/usr/local/bin目录下 (需要root权限)
* 解决权限问题`chmod -R 777 dex2jar/`
* 设置环境变量
    ```
    # 1. 打开.bash_profile文件，并添加如下配置：
    export PATH=$PATH:/usr/local/bin/dex2jar
    # 2. 执行命令：source ~/.bash_profile，让配置立即生效
    ```

### Android逆向流程

#### 使用`apktool`反编译apk安装包
* `apktool d xxx.apk` 反编译`xxx.apk`获得`xxx`目录如下
    ```
    .
    ├── AndroidManifest.xml   
    ├── apktool.yml
    ├── assets
    ├── lib
    ├── original
    ├── res
    ├── smali
    ├── smali_classes2
    └── unknown
    ```
* `apktool b xxx` 重新打包`xxx`
    ```
    .
    ├── AndroidManifest.xml
    ├── apktool.yml
    ├── assets
    ├── build   // 重新编译资源和源代码
    ├── dist    // 重新编译后的apk文件
    ├── lib
    ├── original
    ├── res
    ├── smali
    ├── smali_classes2
    └── unknown
    ```

#### 使用`dex2jar.sh`将dex反编译成jar
apktool重新编译我们获得`build` 目录
```
.
└── apk
    ├── AndroidManifest.xml
    ├── classes.dex
    ├── classes2.dex
    ├── lib
    ├── res
    └── resources.arsc
```
两个dex文件是源代码的核心文件, 我们使用`dex2jar.sh classes.dex`可以获得`classes-dex2jar.jar`文件(打包在jar包里)

#### 使用`JD-GUI`软件查看jar包内容
使用`jd-gui`这个软件来查看`classes-dex2jar.jar`
![classes-dex2jar.jar](/uploads/20190109/2.png)