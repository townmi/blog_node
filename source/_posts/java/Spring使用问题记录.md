---
title: Spring使用问题记录
date: 2020-09-15 19:37:38
tags:
- Java
categories:
- Java
---

### Spring使用问题记录
本文章用来记录使用`Spring`过程中遇到的一些问题，包括解决方案

<!-- more -->

#### AOP 类型转换的问题

在使用`aop`进行事物声明式 切面的时候，遇到下面的报错:
```bash
  java.lang.ClassCastException: com.sun.proxy.$Proxy13 cannot be cast to org.example.spring.dao.AssetCategoryDaoImpl
```
事例代码:
```xml
  <!--  结合AOP实现事务的织入-->
  <aop:config>
    <!--    配置事务切入点-->
    <aop:pointcut id="txPointCut" expression="execution(* org.example.spring.dao.AssetCategoryDaoImpl.select())"/>
    <aop:advisor advice-ref="txAdvice" pointcut-ref="txPointCut"/>
  </aop:config>
```
```java
  @org.junit.Testpublic
  public void test2() {
    ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
    AssetCategoryDaoImpl bean = (AssetCategoryDaoImpl) context.getBean("assetCategoryDao"); // 这里报错
    List<AssetCategory> ls = bean.select();
    for (AssetCategory l : ls) { 
      System.out.println(l.toString());
    }
  }
```

报错代码:
```java
  AssetCategoryDaoImpl bean = (AssetCategoryDaoImpl) context.getBean("assetCategoryDao");
  // 报错的根源: 不能用接口的实现类（AssetCategoryDaoImpl）来转换Proxy的实现类，它们是同级，应该用共同的接口来转换
```
所以解决方案如下:
```java
  @org.junit.Testpublic
  public void test2() {
    ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
    // AssetCategoryMapper Dao 层面的接口
    AssetCategoryMapper bean = (AssetCategoryMapper) context.getBean("assetCategoryDao");
    List<AssetCategory> ls = bean.select();
    for (AssetCategory l : ls) { 
      System.out.println(l.toString());
    }
  }
```