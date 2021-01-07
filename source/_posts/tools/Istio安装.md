---
title: Istio安装
date: 2020-12-14 11:10:19
tags:
- go
- ServiceMesher
- GateWay
- k8s
categories:
- 工具
---

### Istio安装

今天来分享下最新`Istio`版本的安装。基于`k8s`

<!-- more -->

### 前期准备

首先你得有套`k8s`环境,可以看之前我们的`k8s`部署教程。
在安装之前，你得先去除污点
```bash
  kubectl taint nodes --all node-role.kubernetes.io/master-
  # 如果不设置的化，pod有这样的错:0/1 nodes are available: 1 node(s) had taint {node-role.kubernetes.io/master: }, that the pod didn't tolerate.
  # 看到这样的错，可以去除污点， 再安装
```

### 安装`Istio`
