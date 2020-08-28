---
title: rsync的用法
date: 2020-08-28 19:37:38
tags:
- Linux
categories:
- 工具
---

### rsync的用法
`rsync`是一个常用的`Linux`应用程序，用于文件同步。
它可以在本地计算机与远程计算机之间，或者两个本地目录之间同步文件（但不支持两台远程计算机之间的同步）。它也可以当作文件复制工具，替代`cp`和`mv`命令。

<!-- more -->
与其他文件传输工具（如 FTP 或 scp）不同，`rsync`的最大特点是会检查发送方和接收方已有的文件，仅传输有变动的部分（默认规则是文件大小或修改时间有变动

### 基本用法

#### -r参数

本机使用`rsync`命令时，可以作为`cp`和`mv`命令的替代方法，将源目录同步到目标目录
```bash
  rsync -r source destination
```
如果有多个目录或者文件需要同步，可以参考如下:
```bash
  rsync -r source1 source2 destination
```
上面的命令里面，`source1`、`source2`都会被同步到`destination`目录中

#### -a参数

`-a`这个参数可以替代`-r`，除了可以递归同步以外，还可以同步元信息(修改的时间、权限等)。因为`rsync`默认使用文件大小和修改的时间来决定文件是否需要更新，所以`-a`比`-r`更有用。
```bash
  rsync source destination
```
上面的命令执行后，如果`destination`目录不存在。`rsync`会自动创建,`source`目录被完整的复制到`destination`目录下面，形成了`destination/source`目录结构。
如果我们只想把`source`目录下的内容同步到`destination`，则需要在源目录后面加上`/`
```bash
  rsync source/ destination
```
上面的命令执行后，只会把`source`目录下的内容同步到`destination`，不会在`destination`下面创建`source`目录

#### --delete参数

默认情况下，`rsync`只确保源目录的所有内容（明确排除的文件除外）都复制到目标目录。它不会使两个目录保持相同，并且不会删除文件。如果要使得目标目录成为源目录的镜像副本，则必须使用`--delete`参数，这将删除只存在于目标目录、不存在于源目录的文件。
```bash
  rsync -av --delete source/ destination
```
上面的命令中, ```--delete```参数会使得`destination`成为`source`的一个镜像

### 排除文件

#### --exclude参数
有时，我们希望同步的时候排除某些目录或者文件，这时就可以使用`--exclude`参数来指定排除模式
```bash
  rsync -av --exclude='*.js' source/ destination
  # 或者
  rsync -av --exclude '*.js' source/ destination
```
`rsync`会同步以"."开头的隐藏文件，如果要排除
```bash
  rsync -av --exclude='.*' source/ destination
```
如果想排除某个目录下的所以文件，但是不希望排除这个目录本身，可以参考下面的命令
```bash
  rsync -av --exclude 'dir/*' source/ destination
```
也可也使用多个排除模式
```bash
  # 多个 --exclude
  rsync -av --exclude 'dir/*' --exclude '*.js' source/ destination
  # bash的{} 扩展功能
  rsync -av --exclude={'dir/*', '*.js'} source/ destination
```
若果你的排除模式有很多，几百种，我们可以把它写到一个文件中，每行一个模式，然后使用`--exclude-from`参数指定这个文件
```bash
  rsync -av --exclude-from="exclude-file.txt" source/ destination
```

#### --include参数

`--include`参数用来指定必须同步的文件模式，往往和`--exclude`结合使用
```bash
  rsync -av --include='*.js' --exclude='*' source/ destination
```
上面的命令指定同步的时候，排除所以文件，但是会同步js文件


### 远程同步

`rsync`除了支持本地两个目录直接的同步，也支持远程同步，同可以将本地内容，同步到远程服务
```bash
  rsync -av source/ user@host:ddestination
```
也可以将远程的内容同步到本地
```bash
  rsync -av user@host:source/ destination
```

#### ssh协议
`rsync`默认使用`ssh`进行远程登录和数据传输
```bash
  rsync -av -e ssh source/ user@host:destination
  # 因为最早rsync 不使用ssh协议，所以需要指定 -e 参数，后来默认ssh 所以 -e ssh 可以省略
```
如果我们的`ssh`命令有附加的参数，则必须使用`-e`参数指定`ssh`的命令参数
```bash
  rsync -av -e 'ssh -p 2222' source/ user@host:destination
  # 指定了ssh的端口2222
```
#### rsync协议
除了使用`SSH`，如果另一台服务器安装并运行了`rsync`守护程序，则也可以用`rsync://`协议（默认端口873）进行传输。具体写法是服务器与目标目录之间使用双冒号分隔`::`
```bash
  rsync -av source/ host::module/destination
```
注意，上面地址中的`module`并不是实际路径名，而是`rsync`守护程序指定的一个资源名，由管理员分配。
如果想知道`rsync`守护程序分配的所有`module`列表，可以执行下面命令
```bash
  rsync rsync://host
```
`rsync`协议除了使用双冒号，也可以直接用`rsync://`协议指定地址
```bash
  rsync -av source/ rsync://host/module/destination
```

### 增量备份

`rsync`的最大特点就是它可以完成增量备份，也就是默认只复制有变动的文件。
除了源目录与目标目录直接比较，`rsync`还支持使用基准目录，即将源目录与基准目录之间变动的部分，同步到目标目录。
具体做法是，第一次同步是全量备份，所有文件在基准目录里面同步一份。以后每一次同步都是增量备份，只同步源目录与基准目录之间有变动的部分，将这部分保存在一个新的目标目录。这个新的目标目录之中，也是包含所有文件，但实际上，只有那些变动过的文件是存在于该目录，其他没有变动的文件都是指向基准目录文件的硬链接
`--link-dest`参数用来指定同步时的基准目录
```bash
  rsync -a --delete --link-dest /compare/path /source/path /target/path
```
上面命令中，`--link-dest`参数指定基准目录`/compare/path`，然后源目录`/source/path`跟基准目录进行比较，找出变动的文件，将它们拷贝到目标目录`/target/path`。那些没变动的文件则会生成硬链接。这个命令的第一次备份时是全量备份，后面就都是增量备份了
下面是一个脚本事例，备份用户的主目录
```bash
  #!/bin/bash
  # A script to perform incremental backups using rsync

  set -o errexit
  set -o nounset
  set -o pipefail

  readonly SOURCE_DIR="${HOME}"
  readonly BACKUP_DIR="/mnt/data/backups"
  readonly DATETIME="$(date '+%Y-%m-%d_%H:%M:%S')"
  readonly BACKUP_PATH="${BACKUP_DIR}/${DATETIME}"
  readonly LATEST_LINK="${BACKUP_DIR}/latest"

  mkdir -p "${BACKUP_DIR}"

  rsync -av --delete \
    "${SOURCE_DIR}/" \
    --link-dest "${LATEST_LINK}" \
    --exclude=".cache" \
    "${BACKUP_PATH}"

  rm -rf "${LATEST_LINK}"
  ln -s "${BACKUP_PATH}" "${LATEST_LINK}"
```
上面脚本中，上一次备份的目录`${BACKUP_DIR}/${DATETIME}`是基准目录，每一次同步都会生成一个新目录，然后将`${BACKUP_DIR}/latest`指向这个新目录，作为下一次的基准目录，再删除上一次的基准目录。由于`--link-dest`对于那些没有变动的文件，生成的是硬链接，而不是软链接，所以即使删除基准目录，那些文件依然可以访问