---
title: k8s简单上手使用
date: 2020-12-11 11:10:19
tags:
- docker
- k8s
categories:
- 工具
---

### k8s简单上手使用

今天就来简单使用下`k8s`，主要就是使用`kubectl`工具

<!-- more -->

### 查询相关

#### 查询节点状态

```bash
  harry@harry:~$ kubectl get nodes
  NAME    STATUS   ROLES                  AGE   VERSION
  harry   Ready    control-plane,master   52m   v1.20.0

  harry@harry:~$ kubectl cluster-info
  Kubernetes control plane is running at https://ip:6443
  KubeDNS is running at https://ip:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

  To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

#### 查询pods相关

```bash
  harry@harry:~$ kubectl get pods --all-namespaces
  NAMESPACE              NAME                                         READY   STATUS    RESTARTS   AGE
  istio-system           istio-egressgateway-799df76979-6jxgw         1/1     Running   0          44m
  istio-system           istio-ingressgateway-5cfc5bff6d-7z5ll        1/1     Running   0          44m
  istio-system           istiod-5c6d68885d-ktxm4                      1/1     Running   0          49m
  kube-system            coredns-74ff55c5b-bwdwg                      1/1     Running   0          53m
  kube-system            coredns-74ff55c5b-sqvpf                      1/1     Running   0          53m
  kube-system            etcd-harry                                   1/1     Running   0          53m
  kube-system            kube-apiserver-harry                         1/1     Running   0          53m
  kube-system            kube-controller-manager-harry                1/1     Running   0          53m
  kube-system            kube-proxy-sxmsf                             1/1     Running   0          53m
  kube-system            kube-scheduler-harry                         1/1     Running   0          53m
  kubernetes-dashboard   dashboard-metrics-scraper-79c5968bdc-crnrl   1/1     Running   0          52m
  kubernetes-dashboard   kubernetes-dashboard-f9b57fd4c-6qffr         1/1     Running   0          52m
```
> `--all-namespaces` 查询所有

也可指定`namespaces`

```bash
  harry@harry:~$ kubectl get pods -n kubernetes-dashboard
  NAME                                         READY   STATUS    RESTARTS   AGE
  dashboard-metrics-scraper-79c5968bdc-crnrl   1/1     Running   0          53m
  kubernetes-dashboard-f9b57fd4c-6qffr         1/1     Running   0          53m
```

#### 查询服务

```bash
  harry@harry:~$ kubectl get service kubernetes-dashboard -n kubernetes-dashboard
  NAME                   TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)         AGE
  kubernetes-dashboard   NodePort   10.108.33.245   <none>        443:31118/TCP   6m46s
```

#### 查询pod运行详情

```bash
  harry@harry:~$ kubectl describe pods kubernetes-dashboard-f9b57fd4c-m727d -n kubernetes-dashboard
  Name:         kubernetes-dashboard-f9b57fd4c-m727d
  Namespace:    kubernetes-dashboard
  Priority:     0
  Node:         harry/172.26.62.84
  Start Time:   Tue, 15 Dec 2020 06:38:04 +0000
  Labels:       k8s-app=kubernetes-dashboard
                pod-template-hash=f9b57fd4c
  Annotations:  <none>
  Status:       Running
  IP:           10.244.0.9
  IPs:
    IP:           10.244.0.9
  Controlled By:  ReplicaSet/kubernetes-dashboard-f9b57fd4c
  Containers:
    kubernetes-dashboard:
      Container ID:  docker://7b697a156a351e804611989024d2401a8b52c912b3727b9cc3daba6c580fb9de
      Image:         kubernetesui/dashboard:v2.0.5
      Image ID:      docker-pullable://kubernetesui/dashboard@sha256:5e23ccf274c48147af8b6fb7269c50129687be3db9d351630ca9a7eb8ab0aed7
      Port:          8443/TCP
      Host Port:     0/TCP
      Args:
        --tls-cert-file=/home/harry/certs/dashboard.crt
        --tls-key-file=/home/harry/certs/dashboard.key
        --auto-generate-certificates
        --namespace=kubernetes-dashboard
      State:          Running
        Started:      Tue, 15 Dec 2020 06:38:20 +0000
      Ready:          True
      Restart Count:  0
      Liveness:       http-get https://:8443/ delay=30s timeout=30s period=10s #success=1 #failure=3
      Environment:    <none>
      Mounts:
        /certs from kubernetes-dashboard-certs (rw)
        /tmp from tmp-volume (rw)
        /var/run/secrets/kubernetes.io/serviceaccount from kubernetes-dashboard-token-srdnd (ro)
  Conditions:
    Type              Status
    Initialized       True 
    Ready             True 
    ContainersReady   True 
    PodScheduled      True 
  Volumes:
    kubernetes-dashboard-certs:
      Type:        Secret (a volume populated by a Secret)
      SecretName:  kubernetes-dashboard-certs
      Optional:    false
    tmp-volume:
      Type:       EmptyDir (a temporary directory that shares a pod's lifetime)
      Medium:     
      SizeLimit:  <unset>
    kubernetes-dashboard-token-srdnd:
      Type:        Secret (a volume populated by a Secret)
      SecretName:  kubernetes-dashboard-token-srdnd
      Optional:    false
  QoS Class:       BestEffort
  Node-Selectors:  kubernetes.io/os=linux
  Tolerations:     node-role.kubernetes.io/master:NoSchedule
                  node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                  node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
  Events:
    Type    Reason     Age    From               Message
    ----    ------     ----   ----               -------
    Normal  Scheduled  9m     default-scheduler  Successfully assigned kubernetes-dashboard/kubernetes-dashboard-f9b57fd4c-m727d to harry
    Normal  Pulling    8m58s  kubelet            Pulling image "kubernetesui/dashboard:v2.0.5"
    Normal  Pulled     8m45s  kubelet            Successfully pulled image "kubernetesui/dashboard:v2.0.5" in 13.361447584s
    Normal  Created    8m45s  kubelet            Created container kubernetes-dashboard
    Normal  Started    8m44s  kubelet            Started container kubernetes-dashboard

```

#### 查看`pod`日志

```bash
  harry@harry:~$ kubectl logs -f kubernetes-dashboard-f9b57fd4c-m727d -n kubernetes-dashboard
  2020/12/15 06:38:20 Starting overwatch
  2020/12/15 06:38:20 Using namespace: kubernetes-dashboard
  2020/12/15 06:38:20 Using in-cluster config to connect to apiserver
  2020/12/15 06:38:20 Using secret token for csrf signing
  2020/12/15 06:38:20 Initializing csrf token from kubernetes-dashboard-csrf secret
  2020/12/15 06:38:20 Empty token. Generating and storing in a secret kubernetes-dashboard-csrf
  2020/12/15 06:38:20 Successful initial request to the apiserver, version: v1.20.0
  2020/12/15 06:38:20 Generating JWE encryption key
  2020/12/15 06:38:20 New synchronizer has been registered: kubernetes-dashboard-key-holder-kubernetes-dashboard. Starting
  2020/12/15 06:38:20 Starting secret synchronizer for kubernetes-dashboard-key-holder in namespace kubernetes-dashboard
  2020/12/15 06:38:21 Initializing JWE encryption key from synchronized object
  2020/12/15 06:38:21 Creating in-cluster Sidecar client
  2020/12/15 06:38:21 Successful request to sidecar
  2020/12/15 06:38:21 Auto-generating certificates
  2020/12/15 06:38:21 Successfully created certificates
  2020/12/15 06:38:21 Serving securely on HTTPS port: 8443
```

#### 查看所有事件

```bash
  harry@harry:~$ kubectl get events --all-namespaces
  # 也可以指定namespces
  harry@harry:~$ kubectl get events -n kubernetes-dashboard
  LAST SEEN   TYPE      REASON              OBJECT                                            MESSAGE
  12m         Normal    Scheduled           pod/dashboard-metrics-scraper-79c5968bdc-4rdkz    Successfully assigned kubernetes-dashboard/dashboard-metrics-scraper-79c5968bdc-4rdkz to harry
  12m         Normal    Pulled              pod/dashboard-metrics-scraper-79c5968bdc-4rdkz    Container image "kubernetesui/metrics-scraper:v1.0.6" already present on machine
  12m         Normal    Created             pod/dashboard-metrics-scraper-79c5968bdc-4rdkz    Created container dashboard-metrics-scraper
  12m         Normal    Started             pod/dashboard-metrics-scraper-79c5968bdc-4rdkz    Started container dashboard-metrics-scraper
  12m         Normal    SuccessfulCreate    replicaset/dashboard-metrics-scraper-79c5968bdc   Created pod: dashboard-metrics-scraper-79c5968bdc-4rdkz
  12m         Normal    ScalingReplicaSet   deployment/dashboard-metrics-scraper              Scaled up replica set dashboard-metrics-scraper-79c5968bdc to 1
  12m         Warning   Unhealthy           pod/kubernetes-dashboard-f9b57fd4c-6qffr          Liveness probe failed: Get "https://10.244.0.4:8443/": net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers)
  12m         Normal    Scheduled           pod/kubernetes-dashboard-f9b57fd4c-m727d          Successfully assigned kubernetes-dashboard/kubernetes-dashboard-f9b57fd4c-m727d to harry
  12m         Normal    Pulling             pod/kubernetes-dashboard-f9b57fd4c-m727d          Pulling image "kubernetesui/dashboard:v2.0.5"
  12m         Normal    Pulled              pod/kubernetes-dashboard-f9b57fd4c-m727d          Successfully pulled image "kubernetesui/dashboard:v2.0.5" in 13.361447584s
  12m         Normal    Created             pod/kubernetes-dashboard-f9b57fd4c-m727d          Created container kubernetes-dashboard
  12m         Normal    Started             pod/kubernetes-dashboard-f9b57fd4c-m727d          Started container kubernetes-dashboard
  12m         Normal    SuccessfulCreate    replicaset/kubernetes-dashboard-f9b57fd4c         Created pod: kubernetes-dashboard-f9b57fd4c-m727d
  12m         Normal    ScalingReplicaSet   deployment/kubernetes-dashboard                   Scaled up replica set kubernetes-dashboard-f9b57fd4c to 1
```

### 部署相关

#### 普通部署

通过`yaml`配置文件来部署
```bash
  kubectl create -f xxx.yaml
  # 或者
  kubectl apply -f xxx.yaml
```
#### 使用`replace`命令替换部署

```bash
  harry@harry:~$ kubectl replace --force -f recommended.yaml 
  namespace "kubernetes-dashboard" deleted
  serviceaccount "kubernetes-dashboard" deleted
  service "kubernetes-dashboard" deleted
  secret "kubernetes-dashboard-certs" deleted
  secret "kubernetes-dashboard-csrf" deleted
  secret "kubernetes-dashboard-key-holder" deleted
  configmap "kubernetes-dashboard-settings" deleted
  role.rbac.authorization.k8s.io "kubernetes-dashboard" deleted
  clusterrole.rbac.authorization.k8s.io "kubernetes-dashboard" deleted
  rolebinding.rbac.authorization.k8s.io "kubernetes-dashboard" deleted
  clusterrolebinding.rbac.authorization.k8s.io "kubernetes-dashboard" deleted
  deployment.apps "kubernetes-dashboard" deleted
  service "dashboard-metrics-scraper" deleted
  deployment.apps "dashboard-metrics-scraper" deleted
  namespace/kubernetes-dashboard replaced
  serviceaccount/kubernetes-dashboard replaced
  service/kubernetes-dashboard replaced
  secret/kubernetes-dashboard-certs replaced
  secret/kubernetes-dashboard-csrf replaced
  secret/kubernetes-dashboard-key-holder replaced
  configmap/kubernetes-dashboard-settings replaced
  role.rbac.authorization.k8s.io/kubernetes-dashboard replaced
  clusterrole.rbac.authorization.k8s.io/kubernetes-dashboard replaced
  rolebinding.rbac.authorization.k8s.io/kubernetes-dashboard replaced
  clusterrolebinding.rbac.authorization.k8s.io/kubernetes-dashboard replaced
  deployment.apps/kubernetes-dashboard replaced
  service/dashboard-metrics-scraper replaced
  deployment.apps/dashboard-metrics-scraper replaced
```

#### 无yaml文件的`replace`部署

```bash
  kubectl get pod podxxx -n xxx -o yaml | kubectl replace --force -f -
```

#### 重新创建

首先通过`pod`创建`yaml`

```bash
  kubectl get pod podxxx -n xxxxx -o yaml > xxx.yml
```

然后删除`pod`

```bash
  kubectl delete pod podxxx -n xxxxx
```

再通过普通部署`pod`
```bash
  kubectl create -f xxx.yaml
```

### 其他

1. 去除污名
```bash
  kubectl taint nodes --all node-role.kubernetes.io/master-
```

