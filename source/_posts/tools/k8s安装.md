---
title: k8s安装
date: 2020-12-11 11:10:19
tags:
- docker
- k8s
categories:
- 工具
---

### k8s安装
今天来安装一下`k8s`,来详细了解如何使用`k8s`

<!-- more -->

### 前期准备

mac 上 virtualbox 已经非常好用了，而且免费，推荐使用. 装上 mac 之后，安装一个 ubuntu server 的镜像，系统配置要求最低 2GB，2CPU. 配置网卡 1 为桥接网卡为了和主机通信，网卡 2 为 网络地址转换为了和外网通信。


### 安装`Docker`

具体步骤请参考[Ubuntu安装`Docker`](https://yeasy.gitbook.io/docker_practice/install/ubuntu)
我们这边直接先使用脚本自动安装
```bash
  curl -fsSL get.docker.com -o get-docker.sh
  # --mirror 选项使用国内源进行安装
  sudo sh get-docker.sh --mirror Aliyun
```

docker 安装好之后配置成国内的 docker 源，`sudo vi /etc/docker/daemon.json` 输入以下内容

```json
  {
    "registry-mirrors": [
      "https://dockerhub.azk8s.cn",
      "https://reg-mirror.qiniu.com"
    ]
  }
```

然后重启 docker:

```bash
  sudo systemctl daemon-reload
  sudo systemctl restart docker
```
关闭`swap`
```bash
  sudo swapoff -a
  #如何确认swap已经关闭
  free -m
  # swap都是0,就说明已经关闭
```

### 安装`K8s`基础组件

首先来安装`kubelet kubeadm kubectl` 三大组件：
- `kubelet`
- `kubeadm`
- `kubectl`

```bash
  # 安装系统工具
  apt-get update && apt-get install -y apt-transport-https
  # 安装 GPG 证书
  curl https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | apt-key add - 
  # 写入软件源；注意：我们用系统代号为 bionic，但目前阿里云不支持，所以沿用 16.04 的 xenial
  cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
  > deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
  > EOF

  # 安装组件
  apt-get update
  apt-get install -y kubelet kubeadm kubectl
  ///.....///
  Preparing to unpack .../6-kubeadm_1.20.0-00_amd64.deb ...
  Unpacking kubeadm (1.20.0-00) ...
  Setting up conntrack (1:1.4.4+snapshot20161117-6ubuntu2) ...
  Setting up kubernetes-cni (0.8.7-00) ...
  Setting up cri-tools (1.13.0-01) ...
  Setting up socat (1.7.3.2-2ubuntu2) ...
  Setting up kubelet (1.20.0-00) ...
  Created symlink /etc/systemd/system/multi-user.target.wants/kubelet.service → /lib/systemd/system/kubelet.service.
  Setting up kubectl (1.20.0-00) ...
  Setting up kubeadm (1.20.0-00) ...
  Processing triggers for man-db (2.8.3-2ubuntu0.1) ...
  ///..///

  # 注意我们这里安装的是1.20.0-00版本

  # 设置 kubelet 自启动，并启动 kubelet
  systemctl enable kubelet && systemctl start kubelet
```

### 初始化`k8s`

先初始化
```bash
  sudo kubeadm init --v=5
```

**注意点，这步比较重要**
上面的步骤是已经安装完`kubelet`，但是我们的节点还是没有成功启动
```bash
  root@xxx:~# kubectl get nodes
  NAME    STATUS     ROLES                  AGE   VERSION
  xxx     NotReady   control-plane,master   29s   v1.20.0
```
通过检查节点我们发现，是网络问题
```bash
  kubectl describe node xxx
  # runtime network not ready: NetworkReady=false reason:NetworkPluginNotReady message:docker: network plugin is not ready: cni config uninitialized
```
所有下面我们来安装`flannel`网络解析插件，并重启`kubelet`
```bash
  kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
  # 安装成功后重启
  systemctl daemon-reload
  systemctl restart kubelet
```

然后配置集群信息
```bash
  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

最终可以部署pod
```bash
  # Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at: 
  # https://kubernetes.io/docs/concepts/cluster-administration/addons/
  kubectl apply -f [podnetwork].yaml
```

还有加入集群的信息
```bash
  # You can now join any number of machines by running the following on each node as root:
  kubeadm join <control-plane-host>:<control-plane-port> --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

### 安装`k8s`DashBoard

默认情况下不会部署 Dashboard。可以通过以下命令部署
```bash
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0/aio/deploy/recommended.yaml
```
也可以参考我的[配置](https://gist.github.com/townmi/dd719b285e72e14e51bd395a1ea80943)
文件中的sct、key文件的生成可以参考[Certificate management](https://github.com/kubernetes/dashboard/blob/master/docs/user/certificate-management.md)
```bash
  kubectl apply -f file.yaml
```
检查pods是否成功运行
```bash 
  kubectl get pods -n kubernetes-dashboard
  # 成功后执行
  kubectl -n kubernetes-dashboard get service kubernetes-dashboard
  NAME                   TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)         AGE
  kubernetes-dashboard   NodePort   10.100.17.171   <none>        443:31308/TCP   24m
```
`pods`成功运行后，可以用浏览器打开`https://masterip:31308/`，可以打开ui面板了,注意应为tls证书是我们自己签发的，有的浏览器不能访问, 可以找一个老版的浏览器试试，或者通过命令启动浏览器(可以关闭tls验证)。

最后，你成功打开这个`DashBoard`,发现需要`token`，可以通过如下命令生成
```bash
  kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep eks-admin | awk '{print $1}')
```

