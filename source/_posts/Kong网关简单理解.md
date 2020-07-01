---
title: Kong网关简单理解
date: 2020-06-21 22:31:56
tags:
- Nginx
categories:
- 工具
---

### Kong网关简单理解

上篇文章我们介绍了如何部署`Kong`和`Konga`管理微服务。下面我们将来介绍下如何理解`Kong`，并提供一个通过网关访问API以及使用身份验证插件和访问控制列表来保护其资源的基本示例

<!-- more -->

#### `Service`服务
顾名思义，服务实体是每个上游服务的抽象。服务的示例是数据转换微服务，计费API等。
服务的主要属性是它的URL（其中，Kong应该代理流量），其可以被设置为单个串或通过指定其protocol， host，port和path。
服务与路由相关联（服务可以有许多与之关联的路由）。路由是Kong的入口点，并定义匹配客户端请求的规则。一旦匹配路由，Kong就会将请求代理到其关联的服务。

#### `Route`路由
路由实体定义规则以匹配客户端的请求。每个Route与一个Service相关联，一个服务可能有多个与之关联的路由。与给定路由匹配的每个请求都将代理到其关联的Service上。
可以配置的字段有
- hosts
- paths
- methods
Service 和 Route 的组合（以及它们之间的关注点分离）提供了一种强大的路由机制，通过它可以在Kong中定义细粒度的入口点，从而使基础架构路由到不同上游服务。

#### `Upstream` 
Upstream 对象表示虚拟主机名，可用于通过多个服务（目标）对传入请求进行负载均衡。例如：service.v1.xyz 为Service对象命名的上游host是service.v1.xyz对此服务的请求将代理到上游定义的目标。

#### `Target`
目标IP地址/主机名，其端口表示后端服务的实例。每个上游都可以有多个target,并且可以动态添加Target。
由于上游维护Target的更改历史记录，因此无法删除或者修改Target。要禁用目标，请发布一个新的Targer weight=0,或者使用DELETE来完成相同的操作。

#### 关系
`Upstream` : `target` -> 1:n
`Service` : `Upstream` -> 1:1 or 1:0 (Service 可以直接指向具体的Target，相当于不做负载均衡)
`Service` : `Route` -> 1:n
Client请求的流量通过Route指向与之相关的Service，如果配置插件的话就会作用插件，Service接到流量后给相应的Upstream的服务上面

![Client请求流程](/uploads/20200621/2.png)

### 案例

#### 创建一个服务
```bash
  curl -i -X POST \
    --url http://localhost:8001/services/ \
    --data 'name=example-service' \
    --data 'url=http://172.26.165.118:3001/'
```

#### 给服务添加路由
```bash
  curl -i -X POST \
    --url http://localhost:8001/services/example-service/routes \
    --data 'name=example-service-route' \
    --data 'methods[]=GET' \
```

#### 测试
```bash
  curl -i http://localhost:8000/
  # Vary: Origin
  # Access-Control-Allow-Credentials: true
  # Set-Cookie: test=99999; Max-Age=900; Domain=127.0.0.1; Path=/; Expires=Mon, 22 Jun 2020 09:53:34 GMT; HttpOnly; SameSite=None
  # Date: Mon, 22 Jun 2020 09:38:34 GMT
  # X-Kong-Upstream-Latency: 2
  # X-Kong-Proxy-Latency: 0
  # Via: kong/2.0.4

  # 123
```

#### 给服务添加Oauth2.0插件
```bash
  curl -i -X POST \
  --url http://localhost:8001/services/example-service/plugins/ \
  --data 'name=oauth2' \
  --data 'config.scopes=email' \
  --data 'config.mandatory_scope=true' \
  --data 'config.enable_authorization_code=true' \
  --data 'config.enable_password_grant=true' \

  # "provision_key":"u4y55MdpkkltfnVBqE02Gi4vt8idTZJK",
```

#### 测试oauth
```bash
  curl -i http://localhost:8000/
  # HTTP/1.1 401 Unauthorized
  # Date: Mon, 22 Jun 2020 10:35:17 GMT
  # Content-Type: application/json; charset=utf-8
  # Connection: keep-alive
  # WWW-Authenticate: Bearer realm="service"
  # Content-Length: 77
  # X-Kong-Response-Latency: 6
  # Server: kong/2.0.4

  # {"error_description":"The access token is missing","error":"invalid_request"}
```
这下我们的`oauth2`插件已经生效了

#### 通过 OAuth 2.0授权
既然已经添加了`oauth2`，那么我们需要添加OAuth 2.0授权功能，下面的方法是参考的[https://github.com/Kong/kong-oauth2-hello-world](https://github.com/Kong/kong-oauth2-hello-world)

但是有个前提就是我们需要创建`Consumers`，具体如下
```bash
  # 创建 consumer
  curl -X POST \
    --url "http://localhost:8001/consumers/" \
    --data "username=thefosk"
  # 添加OAuth 2.0应用example
  curl -X POST \
    --url "http://localhost:8001/consumers/thefosk/oauth2/" \
    --data "name=example" \
    --data "redirect_uris[]=http://localhost:3000/code/"
  # {
  #   "redirect_uris": ["http:\/\/localhost:3000\/code\/"],
  #   "created_at":1592822582,
  #   "consumer": {"id":"7233ad32-7939-4363-9194-94031132c1be"},
  #   "id":"fcd294d6-14d1-4092-963c-0be50b12556c",
  #   "tags":null,
  #   "name":"example",
  #   "client_secret":"JZ0h6PThRPWEEyv95CwqdCLxZipZjMRn",
  #   "client_id":"nSBCJQf7uiMSjwv4ehHB3VdQaxt0MBXY"
  # }
```
下面就是`app.js` 一些配置参数
```js
  /*
    This is the secret provision key that the plugin has generated
    after being added to the API
  */
  var PROVISION_KEY = "u4y55MdpkkltfnVBqE02Gi4vt8idTZJK"; // PROVISION_KEY

  /*
    This is the host for the service that OAuth2.0 applies to
  */
  var SERVICE_HOST = "172.26.165.118";

  /*
    URLs to Kong
  */
  var KONG_ADMIN = "http://127.0.0.1:8001";
  var KONG_API = "https://127.0.0.1:8443"; // 注意这里的KONG_API 需要指定 8443 ssl 的端口，后面会细说

  /*
    The path to the API, required later when making a request
    to authorize the OAuth 2.0 client application
  */
  var API_PATH = "/";

  // 下面的方法是新增的通过code去取toke
  function token(code, callback) {
    request({
      method: "POST",
      url: KONG_API + API_PATH + "/oauth2/token",
      form: {
        client_id: "nSBCJQf7uiMSjwv4ehHB3VdQaxt0MBXY", // client_id
        client_secret: "JZ0h6PThRPWEEyv95CwqdCLxZipZjMRn", // client_secret
        code,
        grant_type: "authorization_code"
      }
    }, function (error, response, body) {
      callback(body);
    });
  }

  app.get('/code', function (req, res) {
    var querystring = url.parse(req.url, true).query;
    const code = querystring.code;
    token(code, function (body) {
      res.end(body);
    })
  })
```
然后在浏览器打开 
`http://127.0.0.1:3000/authorize?response_type=code&scope=email&client_id=nSBCJQf7uiMSjwv4ehHB3VdQaxt0MBXY`
会有下面的页面
![授权页面](/uploads/20200621/3.png)
点击 Authorize 按钮，就会返回 toke
![toke获取页面](/uploads/20200621/4.png)
```json
  {
    "refresh_token":"2IKEyMYmy9D7dq7t5Rmnt1CJEeGa8HZN",
    "token_type":"bearer",
    "access_token":"BiUIURyhziMwwgokpP855kM1CbrM5OA9",
    "expires_in":7200
  }
```

#### 测试`access_token`
最终我们通过`access_token`, 去请求我们之前的api
```bash
  curl -i http://localhost:8000/  -H "Authorization: Bearer BiUIURyhziMwwgokpP855kM1CbrM5OA9"

  # HTTP/1.1 200 OK
  # Content-Length: 3
  # Connection: keep-alive
  # X-Powered-By: Express
  # Access-Control-Allow-Origin: http://127.0.0.1:8081
  # Vary: Origin
  # Access-Control-Allow-Credentials: true
  # Set-Cookie: test=99999; Max-Age=900; Domain=127.0.0.1; Path=/; Expires=Tue, 23 Jun 2020 02:02:50 GMT; HttpOnly; SameSite=None
  # Date: Tue, 23 Jun 2020 01:47:50 GMT
  # X-Kong-Upstream-Latency: 7
  # X-Kong-Proxy-Latency: 4
  # Via: kong/2.0.4

  # 123
```

#### 注意点
通过 OAuth 2.0授权 我们其中有些关键的注意点,就是[官方说明](https://docs.konghq.com/hub/kong-inc/oauth2/)
> 根据OAuth2规范，此插件要求基础服务通过HTTPS提供。为避免混淆，我们建议您将用于服务基础服务的路由配置为仅接受HTTPS流量（通过其“协议”属性）。

那么我们开发的时候没有https啊，怎么办呢，很简单
1. 在`Konga`里面把对应的`Oauth2`插件的`accept http if already terminated`设置成`true`
2. `var KONG_API = "https://127.0.0.1:8443"; // 注意这里的KONG_API 需要指定 8443 ssl 的端口，后面会细说`
3. 如果遇到授权认证异常需要检查route测试,一般检查下面几个参数`Paths`、`Path handling` 设置成`v1`、`Strip Path`设置成`false`、

[kong_oauth_nodejs.js](https://gist.github.com/townmi/3915b3d6f4cc33b399f0641f90e0e3a8)

总结：
1. 首先创建一个`service`
2. 然后在`service`下面创建`route`, 这个时候就可以通过kong代理自己的微服务了
3. 给`service`添加`oauth2.0`插件，那么通过kong代理的微服务API如如果没有带有有效的`access_token`就会返回401
4. 创建`consumer`并且在这个comsumer下面添加`OAuth 2.0`应用
5. 通过`nodejs`案例程序,来设计授权认证
6. 通过授权得到的`access_token`来正常访问微服务API