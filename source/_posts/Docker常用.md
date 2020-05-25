---
title: Docker常用
date: 2020-01-29 22:31:56
tags:
- Docker
categories:
- Linux
---

### Docker常用
`docker` 常用总结

<!-- more -->

#### 基本用法

1. `docker pull xxx` 拉取镜像

  ```bash
    docker pull nginx
    # 拉取 nginx 镜像
  ```

2. `docker images` 查看镜像
  ```bash
    docker images
    # 查看本地的镜像
  ```

3. `docker run` 启动容器
  ```bash
    docker --debug run -p 80:80 --name www -d nginx
    # --debug 查看启动日志的
    # -p 端口映射
    # --name 容器名称
    # -d 用哪个镜像
  ```

4. `docker ps` 查看容器状态
  ```bash
    docker ps
    # 查看正常允许的容器
  ```

5. `docker exec` 进入容器
  ```bash
    docker exec -it www bash
    # 进入容器，
  ```

6. `docker logs` 查看容器日志
  ```bash
    docker logs www
    # 查看容器的日志
  ```

7. `docker stop`
  ```bash
    docker stop www
    # 停掉www 这个启动的容器
    docker stop 1231241
    docker stop $(docker ps -q -f name=www)
    # 停掉 name是www的容器
  ```

8. `docker rm` 删除容器
  ```bash
    docker rm www
    # 删除www容器
    docker rm $(docker ps -a -q -f name=www)
    # 删除名字是www的容器
  ```

9. `docker rmi` 删除镜像
  ```bash
    docker rmi nginx
    # 删除nginx镜像
    docker rmi $(docker images xxxx -q)
    # 删除 镜像名字包含xxxx的镜像
  ```

#### build镜像
1. Dockerfile
  ```dockerfile
    FROM nginx
    RUN mkdir -p /usr/share/nginx/html
    ADD . /usr/share/nginx/html
    COPY ./nginx.conf /etc/nginx/nginx.conf
    CMD nginx -g 'daemon off;'
  ```
  上面就是一个最简单的`Dockerfile`，把当前目录通过`nginx`可以访问

2. build
```bash
  docker build -t xxx:1.0.0 .
  # 打包一个镜像，名字xxx, tag是1.0.0 使用当前路径下的Dockerfile
  docker build -t xxx2 - < tttt
  # 打包一个镜像，名字xxx2, tag是latest 使用ttt为Dockerfile
```

#### Dockerfile一些指令

1. `FROM` 
2. `COPY`
3. `ADD`
4. `RUN`
5. `EXPOSE`
6. `ENV`
7. `CMD`

#### docker-compose

```yml
  version: '3'
  services:
    nodejs:
      build:
        context: .
        dockerfile: Dockerfile
      image: nodejs
      container_name: nodejs
      restart: unless-stopped
      networks:
        - app-network

    webserver:
      image: nginx
      container_name: webserver
      restart: unless-stopped
      ports:
        - "80:80"
      volumes:
        - web-root:/var/www/html
        - ./nginx-conf:/etc/nginx/conf.d
        - certbot-etc:/etc/letsencrypt
        - certbot-var:/var/lib/letsencrypt
      depends_on:
        - nodejs
      networks:
        - app-network

    certbot:
      image: certbot/certbot
      container_name: certbot
      volumes:
        - certbot-etc:/etc/letsencrypt
        - certbot-var:/var/lib/letsencrypt
        - web-root:/var/www/html
      depends_on:
        - webserver
      command: certonly --webroot --webroot-path=/var/www/html --email sammy@example.com --agree-tos --no-eff-email --staging -d example.com  -d www.example.com 

  volumes:
    certbot-etc:
    certbot-var:
    web-root:
      driver: local
      driver_opts:
        type: none
        device: /home/sammy/node_project/views/
        o: bind

  networks:
    app-network:
      driver: bridge  
```