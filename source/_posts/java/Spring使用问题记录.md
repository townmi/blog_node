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

#### `AOP`类型转换的问题

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

#### `GET`请求数组参数的问题

在使用`GET`请求的情况下，如果参数有数组的情况会报错.
```java
  @RequestParam(value = "arrays[]", defaultValue = "") int[] arrays
  // the valid characters are defined in rfc 7230 and rfc 3986 spring boot
```
原因是：**我们在前后台交互的时候往往使用json格式的字段串参数，其中含有“{}”“[]”这些特舒符号，在高版本的tomcat中含有这些字符的请求会被拦截**

解决方法一：降低tomcat版本（不推荐），将tomcat版本改到`tomcat8.5`以下，但是我并不推荐这种办法，因为你以后的开发迟早要使用更新的版本，所以怎么修改tomcat版本我就不介绍了

方法二：在`springboot`工程中增加一个`tomcat`配置，或者将`webServerFactory`方法加入到`springboot`启动类中，配置文件代码如下

```java
  @Configuration
  public class TomcatConfig {

    @Bean
    public TomcatServletWebServerFactory webServerFactory() {
      TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
      factory.addConnectorCustomizers((Connector connector) -> {
        connector.setProperty("relaxedPathChars", "\"<>[\\]^`{|}");
        connector.setProperty("relaxedQueryChars", "\"<>[\\]^`{|}");
      });
      return factory;
    }
  }
```