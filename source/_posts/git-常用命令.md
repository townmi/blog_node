---
title: git 常用命令
date: 2019-02-01 13:20:32
tags:
- git
categories:
- 工具
---

###  拉取项目

#### git clone
> `git clone args1 args2`

* `args1` 代表项目的地址，可以是https模式: `https://github.com/facebook/react.git` 或者是git模式 `git@github.com:facebook/react.git` 
* `args2` 如果没有这个参数那么拉下来的项目名称就是`args1`参数里的默认名称，上面的案例的就是`react`, 如果有参数, 项目的名称就是`args2`

<!-- more --->
### 更新

#### git fetch
> `git fetch args1`

fetch 命令紧紧把远端项目的最新代码更新到本地，如果没有`args1` 参数默认就是 `origin` 如果有就是`fetch arsg1` 对应的远端最新代码

#### git pull
pull 在 fetch 基础上会把最新拉下来的远端代码merge到本地代码中具体可以看下面的细节
> `git pull --tags args1 args2`

* `args1` 代表远端项目地址 如果没有就是默认的 `origin`
* `args2` 代表需要合并的本地分支
> `git pull` 这是常用的, `args1`和`args2`都是默认的, 如果当前本地分支是`develop`, 执行这个命令后会拉最新`origin`远端代码，再把最新的远端develop分支代码合并到本地的develop分支. 如果有冲突，在控制台会输出具体哪些文件冲突，如果没有冲突就会打印`Already up to date.`

### 查看
#### git remote
> `git remote -v` 查看当前远端仓库列表

```bash
charlnCI        git@github.com:charlnCI/splayerx.git (fetch)
charlnCI        git@github.com:charlnCI/splayerx.git (push)
chiflix git@github.com:chiflix/splayerx.git (fetch)
chiflix git@github.com:chiflix/splayerx.git (push)
origin  git@github.com:townmi/splayerx.git (fetch)
origin  git@github.com:townmi/splayerx.git (push)
```

> `git remote show args1` 查看某个远端仓库的明细，这里就是`args1`对应的远端仓库

```bash
* remote charlnCI
  Fetch URL: git@github.com:charlnCI/splayerx.git
  Push  URL: git@github.com:charlnCI/splayerx.git
  HEAD branch: develop
  Remote branches:
    dai              new (next fetch will store in remotes/charlnCI)
    develop          new (next fetch will store in remotes/charlnCI)
    fast-reading-mkv new (next fetch will store in remotes/charlnCI)
    master           new (next fetch will store in remotes/charlnCI)
    tomasen          new (next fetch will store in remotes/charlnCI)
  Local ref configured for 'git push':
    develop pushes to develop (fast-forwardable)
```
> `git remote rename args1 args2` 将`args1`名称改为`args2`

> `git remote rm args1` 将`args1`远端仓库从git远端源中删除掉

#### git status
> 要查看哪些文件处于什么状态，可以用 `git status` 命令。 如果在克隆仓库后立即使用此命令，会看到类似这样的输出

![git status](/uploads/20190202/2.png)
可以看到当前分支各种状态，版本是否比远端旧，本地是否新增、删除或者修改了某些文件，等等。下面的图可以解释各类文件状态
![status](/uploads/20190202/1.png)

> `git status -s` s 标记，仅现实文件状态简略的信息。

#### git diff
> `git diff`


#### git show
> `git show`


#### git log
> `git log` 查看最新的日志，按`q`推出


### 操作
#### git branch
> `git branch` 查看仓库的分支
> `git branch -D xxx` 删除本地xxx分支

#### git checkout 
> `git checkout -b xx` 以当前分支，创建一个本地分支xx 

#### git add
> `git add`

#### git commit
> `git commit`

#### git reset

#### git merge

#### git rebase


### 更新
#### git push

