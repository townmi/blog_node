---
title: k8s相关问题
date: 2020-12-15 11:10:19
tags:
- k8s
- flannel
categories:
- 工具
---

### k8s中相关问题

经常会碰到`k8s`相关的问题，今天就记录下来.

<!-- more -->

### k8s启动失败的问题

错误提示: `The connection to the server x.x.x.x:6443 was refused - did you specify the right host or port?`

检查节点发现，节点不正常
```bash
  kubectl get nodes
  # NotReady
```

#### 解决方案
这种情况基本是`swap`没关闭

```bash
  sudo -i
  # 关闭swap
  swapoff -a;
  # 查看swap是否关闭
  free -m
  # 若swap那一行输出为0，则说明已经关闭
  # 重启k8s
  systemctl restart kebelet
```

### flannel的问题

错误日志：`/run/flannel/subnet.env: No such file or directory`

#### 解决方案一

可以[参考](https://github.com/kubernetes/kubernetes/issues/70202#issuecomment-481173403)

```js
  FLANNEL_NETWORK=10.244.0.0/16
  FLANNEL_SUBNET=10.244.0.1/24
  FLANNEL_MTU=1450
  FLANNEL_IPMASQ=true
```

#### 解决方案二
部署k8s的时候，添加参数

```bash
  # 首先重置
  sudo kubeadm reset

  # 指定参数 --pod-network-cidr 
  sudo kubeadm init --apiserver-advertise-address masterip --pod-network-cidr 10.10.0.0/16
  # For `flannel` to work correctly, you must pass `--pod-network-cidr=10.244.0.0/16` to `kubeadm init`.
```
