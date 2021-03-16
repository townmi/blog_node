---
title: Mybatis+IPage＜POJO＞转IPage＜Vo＞
date: 2021-03-09 19:37:38
tags:
- Java
categories:
- Java
---

### 问题

问题描述：使用`mybatis plus`时 通过crud接口获取`iPage<实体>`但返回需要用`iPage`封装

<!-- more -->

### convert

`mybatis+`的`Ipage`有`conver`方法，用来转实体数据
```java
  private IPage<UnionVO> convert(IPage<Union> iPage) {
    return iPage.convert(pojo -> {
      UnionVO vo = new UnionVO();
      vo.setAppKey(pojo.getAppKey());
      vo.setAppName(pojo.getAppName());
      vo.setUnionId(pojo.getId());
      vo.setUnionName(pojo.getPlatformName());
      vo.setCreateTime(pojo.getCreateTime());
      vo.setUpdateTime(pojo.getUpdateTime());
      return vo;
    });
  }
```