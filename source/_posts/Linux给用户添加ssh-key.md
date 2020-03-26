---
title: Linux 给用户添加ssh key
date: 2020-03-26 12:04:41
tags:
- Linux
categories:
- Linux
---

### Linux 给用户添加ssh key

#### 第一步

第一步，用户生成ssh key, 直接明命令行输入命令ssh-keygen, 一路回车，会在用户路径下的.ssh 文件生成对应的公钥和私钥。

#### 第二步

第二步，将生成的公钥复制到服务器，
```bash
  scp ~.ssh/id_rsa.pub user@10.211.55.4:~.ssh/authorized_keys
  //             生成的私钥 
```
上面是把公钥复制到服务器，并且生成对应的authorized_keys文件,如果服务器有这个文件，可以在服务器的这个文件后面，粘贴你的公钥内容

<!--more-->

### 第三步

最重要的一步 *authorized_keys的权限要是600!!!*， 所以需要在服务器执行下面的命令
```bash 
  chmod 600 ~.ssh/authorized_keys
```

### 第四步

通过ssh key 登录服务器
```bash
  ssh -l user 10.211.55.4
```

### VSCode 支持
可以在客户机的.ssh 路径下的 config文件配置你的服务器登录key，下面的参考
```bash
  # Host 10.211.55.4
  Host 10.211.55.4
  IdentityFile ~/.ssh/你的私钥
  User user
```