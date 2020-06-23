---
title: 初识Kong网关
date: 2020-06-18 22:31:56
tags:
- Nginx
categories:
- 工具
---

### 初识Kong网关

本文将重点介绍如何使用`Kong`和Konga管理微服务。我们将介绍两个应用程序的部署过程。

<!-- more -->

#### `Kong` 是啥
![Kong概念](/uploads/20200621/1.png)

`Kong`是使用`Lua`编写的，被广泛采用的开源API网关。它利用`OpenResty`框架在`Nginx`之上运行，并提供了一个简单的`RESTful API`，可用于以动态方式配置您的基础架构

#### `Konga` 是啥
`Konga`是功能齐全的开源多用户GUI，使管理多个`Kong`安装的艰巨任务变得轻而易举。
它可以与一些最受欢迎的数据库集成在一起，并提供可视化工具，以更好地理解和维护您的体系结构

### 安装

#### 安装 `Kong`

在本教程中，我们将使用`Docker`容器。其他安装`Kong`的方法可以在这里找到：[https://konghq.com/install](https://konghq.com/install)

1. 首先，您将需要创建一个自定义网络，以使容器能够发现彼此并进行通信。在此示例中`kong-net`为网络名称，您可以使用任何名称
  ```bash
    docker network create kong-net
  ```
2. 启动你的数据库
  ```bash
    # 如果您想使用Cassandra容器
    docker run -d --name kong-database --network=kong-net -p 9042:9042 cassandra:3
    # 如果您想使用PostgreSQL容器
    docker run -d --name kong-database \
      --network=kong-net \
      -p 5432:5432 \
      -e "POSTGRES_USER=kong" \
      -e "POSTGRES_DB=kong" \
      -e "POSTGRES_PASSWORD=kong" \
      postgres:9.6
  ```
3. 使用临时Kong容器运行迁移
  ```bash
    docker run --rm \
      --network=kong-net \
      -e "KONG_DATABASE=postgres" \
      -e "KONG_PG_HOST=kong-database" \
      -e "KONG_PG_USER=kong" \
      -e "KONG_PG_PASSWORD=kong" \
      -e "KONG_CASSANDRA_CONTACT_POINTS=kong-database" \
      kong:latest kong migrations bootstrap
  ```
4. 运行迁移并准备好数据库后，请启动一个Kong容器，该容器将连接到数据库容器，就像临时迁移容器一样
  ```bash
    docker run -d --name kong \
      --network=kong-net \
      -e "KONG_DATABASE=postgres" \
      -e "KONG_PG_HOST=kong-database" \
      -e "KONG_PG_USER=kong" \
      -e "KONG_PG_PASSWORD=kong" \
      -e "KONG_CASSANDRA_CONTACT_POINTS=kong-database" \
      -e "KONG_PROXY_ACCESS_LOG=/dev/stdout" \
      -e "KONG_ADMIN_ACCESS_LOG=/dev/stdout" \
      -e "KONG_PROXY_ERROR_LOG=/dev/stderr" \
      -e "KONG_ADMIN_ERROR_LOG=/dev/stderr" \
      -e "KONG_ADMIN_LISTEN=0.0.0.0:8001, 0.0.0.0:8444 ssl" \
 le      -p 8000:8000 \
      -p 8443:8443 \
      -p 127.0.0.1:8001:8001 \
      -p 127.0.0.1:8444:8444 \
      kong:latest
  ```
5. 测试一下
  ```bash
    curl -i http://本地主机:8001/
    curl -i http://本地主机:8000/
  ```

#### 安装 `Konga`

`Konga`拥有自己的文件系统存储，尽管不建议在生产环境中使用它，但只要`kongadata`文件夹存在于某个卷中，它就可以安全使用, 具体如何使用`Konga`，可以看 [https://github.com/pantsel/konga](https://github.com/pantsel/konga)

下面就是使用docker安装`Konga`
```bash
  docker run -p 1337:1337 \
    --network {{kong-network}} \ // optional
    --name konga \
    -e "NODE_ENV=production" \ // or "development" | defaults to 'development'
    -e "TOKEN_SECRET={{somerandomstring}}" \
    pantsel/konga
```
然后打开`http://本地主机:1337`, 先注册管理员账户，然后就可以使用`Konga`来管理`Kong Admin API`了

#### compose启动`Kong`和`Konga`

配置如下:
```yaml
  version: '3.7'

  volumes:
    kong_data: {}

  networks:
    kong-net:
      name: kong-net
      external: false

  services:
    konga:
      image: pantsel/konga
      secrets:
      - kong_postgres_password
      environment:
        KONGA_SEED_USER_DATA_SOURCE_FILE: /run/secrets/konga_node_seed
      deploy:
        restart_policy:
          condition: on-failure
      ports:
      - 1337:1337

    kong-migrations:
      image: "${KONG_DOCKER_TAG:-kong:latest}"
      command: kong migrations bootstrap
      depends_on:
        - db
      environment:
        KONG_DATABASE: postgres
        KONG_PG_DATABASE: ${KONG_PG_DATABASE:-kong}
        KONG_PG_HOST: db
        KONG_PG_USER: ${KONG_PG_USER:-kong}
        KONGA_SEED_KONG_NODE_DATA_SOURCE_FILE: /run/kong_seed_node_data.json
      volumes:
        - ./kong_seed_node_data.json:/run/kong_seed_node_data.json
      secrets:
        - kong_postgres_password
      networks:
        - kong-net
      restart: on-failure
      deploy:
        restart_policy:
          condition: on-failure

    kong-migrations-up:
      image: "${KONG_DOCKER_TAG:-kong:latest}"
      command: kong migrations up && kong migrations finish
      depends_on:
        - db
      environment:
        KONG_DATABASE: postgres
        KONG_PG_DATABASE: ${KONG_PG_DATABASE:-kong}
        KONG_PG_HOST: db
        KONG_PG_USER: ${KONG_PG_USER:-kong}
        KONG_PG_PASSWORD_FILE: /run/secrets/kong_postgres_password
      secrets:
        - kong_postgres_password
      networks:
        - kong-net
      restart: on-failure
      deploy:
        restart_policy:
          condition: on-failure

    kong:
      image: "${KONG_DOCKER_TAG:-kong:latest}"
      user: "${KONG_USER:-kong}"
      depends_on:
        - db
      environment:
        KONG_ADMIN_ACCESS_LOG: /dev/stdout
        KONG_ADMIN_ERROR_LOG: /dev/stderr
        KONG_ADMIN_LISTEN: '0.0.0.0:8001'
        KONG_CASSANDRA_CONTACT_POINTS: db
        KONG_DATABASE: postgres
        KONG_PG_DATABASE: ${KONG_PG_DATABASE:-kong}
        KONG_PG_HOST: db
        KONG_PG_USER: ${KONG_PG_USER:-kong}
        KONG_PROXY_ACCESS_LOG: /dev/stdout
        KONG_PROXY_ERROR_LOG: /dev/stderr
        KONG_PG_PASSWORD_FILE: /run/secrets/kong_postgres_password
      secrets:
        - kong_postgres_password
      networks:
        - kong-net
      ports:
        - "8000:8000/tcp"
        - "127.0.0.1:8001:8001/tcp"
        - "8443:8443/tcp"
        - "127.0.0.1:8444:8444/tcp"
      healthcheck:
        test: ["CMD", "kong", "health"]
        interval: 10s
        timeout: 10s
        retries: 10
      restart: on-failure
      deploy:
        restart_policy:
          condition: on-failure
      
    db:
      image: postgres:9.5
      environment:
        POSTGRES_DB: ${KONG_PG_DATABASE:-kong}
        POSTGRES_USER: ${KONG_PG_USER:-kong}
        POSTGRES_PASSWORD_FILE: /run/secrets/kong_postgres_password
      secrets:
        - kong_postgres_password
      healthcheck:
        test: ["CMD", "pg_isready", "-U", "${KONG_PG_USER:-kong}"]
        interval: 30s
        timeout: 30s
        retries: 3
      restart: on-failure
      deploy:
        restart_policy:
          condition: on-failure
      stdin_open: true
      tty: true
      networks:
        - kong-net
      volumes:
        - kong_data:/var/lib/postgresql/data

  secrets:
    kong_postgres_password:
      file: ./POSTGRES_PASSWORD
```
```bash
 # POSTGRES_PASSWORD 
 # kong

 # kong_seed_node_data.json
  # module.exports = [
  #   {
  #     "id": "abcd1234test",
  #       "name": "Kong Test Seed",
  #       "type": "key_auth",
  #       "kong_admin_url": "http://kong:8001",
  #       "kong_api_key": "DonKeyKong",
  #       "health_checks": false,
  #   }
  # ]
```