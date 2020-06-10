---
title: Token续命
date: 2020-06-07 03:53:02
tags:
- JS
categories:
- 前端
---

### 刷新Token
最初收到访问令牌时，它可能包含刷新令牌以及到期时间，如以下示例所示:
```json
  {
    "access_token": "AYjcyMzY3ZDhiNmJkNTY",
    "refresh_token": "RjY2NjM5NzA2OWJjuE7c",
    "token_type": "bearer",
    "expires": 3600
  }
```
刷新令牌的存在意味着访问令牌将过期，并且无需用户交互即可获得一个新令牌。

<!-- more -->

#### `token`过期
`expires`值是访问令牌有效的秒数。取决于您使用的服务来决定访问令牌有效的时间，并且可能取决于应用程序或组织自己的策略。您可以使用它来抢先刷新访问令牌，而不用等待令牌过期的请求失败。
如果您提出`API`请求，并且令牌已经过期，您将获得一个响应，表明是这样。您可以检查此特定的错误消息，然后刷新令牌并再次尝试请求。
如果您使用的是基于`JSON`的`API`，则它可能会返回带有`invalid_token`错误的`JSON`错误响应。无论如何，`WWW-Authenticate`标头也将具有`invalid_token`错误。
```json
  // HTTP/1.1 401 Unauthorized
  // WWW-Authenticate: Bearer error="invalid_token"
  // error_description="The access token expired"
  // Content-type: application/json
  {
    "error": "invalid_token",
    "error_description": "The access token expired"
  }
```

#### 刷新`token`
当您的代码识别出此特定错误时，它便可以使用以前收到的刷新令牌向令牌端点发出请求，并取回一个新的访问令牌，以用于重试原始请求。
要使用刷新令牌，请使用向服务的令牌端点发出`POST`请求`grant_type=refresh_token`，并包括刷新令牌和客户端凭据。
```js
  // POST /oauth/token HTTP/1.1
  // Host: authorization-server.com
  
  // grant_type=refresh_token
  // &amp;refresh_token=xxxxxxxxxxx
  // &amp;client_id=xxxxxxxxxx
  // &amp;client_secret=xxxxxxxxxx
```
响应将是一个新的访问令牌，并可能是一个新的刷新令牌，就像您将授权代码交换为访问令牌时收到的一样
```json
  {
    "access_token": "BWjcyMzY3ZDhiNmJkNTY",
    "refresh_token": "Srq2NjM5NzA2OWJjuE7c",
    "token_type": "bearer",
    "expires": 3600
  }
```