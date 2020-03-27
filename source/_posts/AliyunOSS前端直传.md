---
title: Aliyun OSS 前端使用签名直传
date: 2020-03-27 03:53:02
tags:
- JS
- aliyun
- oss
categories:
- 前端
---

### Aliyun OSS 前端使用签名直传

#### 使用说明

*本文档使用不基于阿里云OSS SDK*， 为了避免AccessKeyID和AcessKeySecret会暴露在前端页面，注意本方法是，基于自己的服务器下发签名，前端使用签名上传文件到阿里云OSS,
*前端使用签名直传无法实现分片上传与断点续传*，这种方法无法分片。分片需要[查看文档](https://help.aliyun.com/document_detail/31991.html?spm=a2c4g.11186623.6.1623.1d7a6e28Pj3PrA)。

<!-- more -->

#### 第一步

首先需要在阿里云控制台，创建OSS服务，具体的操作可以参考[阿里云创建OSS服务文档](https://help.aliyun.com/document_detail/31885.html?spm=a2c4g.11186623.6.575.564c11a9wbHB4a)

#### 第二步

自己的后端需要使用 阿里云 STS 进行临时授权，具体的步骤可以参考 [授权访问](https://help.aliyun.com/document_detail/32077.html?spm=a2c4g.11186623.6.1310.71546ab3FvDrko),
注意，是*使用 STS 进行临时授权*， 不是下面的 使用签名 URL 进行临时授权。后端提供一个API 给到 前端，可以参考下面的
```javascript
  // get /api/getALiYunSignture
  {
    accessid: "************" 
    callback: "***********" 
    dir: "example/"
    expire: 1585286045
    host: "//test.oss-cn-shanghai.aliyuncs.com"
    policy: "*********"
    signature: "**********"
  }

```

以上字段说明
- *accessid* oss对应的服务id
- *callback* 是用户上传数据后，应用服务器需要知道用户上传了哪些文件以及文件名；如果上传了图片，还需要知道图片的大小等，为此OSS提供了上传回调方案。这个字段，是服务器给到前端，前端给oss，然后oss可以回调后端.
- *dir* 文件上传的根路径
- expire 签名失效时间
- host 前端上传的域名
- policy 为一段经过UTF-8和base64编码的JSON文本，声明了Post请求必须满足的条件. [参考](https://help.aliyun.com/document_detail/31988.html#h2-url-2)
- signature 签名

#### 第三步

下面就是前端使用签名直传重要一步，但是注意前端拿到这个签名的数据，是可以在有效期内一直使用的，不需要每次上传文件前，都请求新的签名数据.
首先本步骤其实就是一次POST提交，可以参考下面的案例
```javscript
  // file
  const { host, policy, signature, dir, accessid, callback } = oss;
  const data = {
    key: `${dir}${file.name}`, // required
    policy, // required
    OSSAccessKeyId: accessid, // required
    success_action_status: 200, // required 200 这样上传成功后的返回状态码就是200
    signature, // required
    callback, // 可以不加
    'x-oss-tag': 'your tag', // 可以不加， 注意上传是可以加标签的，这样你就可以在阿里云oss,好分类了
  };

  const formData = new FormData();
  if (data) {
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
  }
  formData.append(filename, file);

  axios.post(host, formData, { ... }).then(r => console.log).catch(e => console.error)
```

### 最重要的

不要忘了在阿里云控制台添加*跨域请求*的设置 ![跨域请求](/uploads/20200326/1.png)
