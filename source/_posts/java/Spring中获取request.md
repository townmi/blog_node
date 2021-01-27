---
title: Spring中获取request
date: 2021-01-13 19:37:38
tags:
- Java
categories:
- Java
---

### Spring中获取request
本文将介绍在`Spring MVC`开发的web系统中，获取`request`对象的几种方法，并讨论其线程安全性

<!-- more -->

#### 手动调用

```java
  @Controller
  public class TestController {
    @RequestMapping("/test")
    public void test() throws InterruptedException {
      HttpServletRequest request = ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();
      // 模拟程序执行了一段时间
      Thread.sleep(1000);
    }
  }
```

手动调用是线程安全的，优点: 可以在非Bean中直接获取。缺点: 如果使用的地方较多，代码非常繁琐；因此可以与其他方法配合使用

#### Controller中加参数

```java
  @Controller
  public class TestController {
    @RequestMapping("/test")
    public void test(HttpServletRequest request) throws InterruptedException {
      // 模拟程序执行了一段时间
      Thread.sleep(1000);
    }
  }
```

该方法实现的原理是，在`Controller`方法开始处理请求时，`Spring`会将`request`对象赋值到方法参数中。除了`request`对象，可以通过这种方法获取的参数还有很多，具体可以参见：https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-ann-methods
`Controller`中获取`request`对象后，如果要在其他方法中（如`service`方法、工具类方法等）使用`request`对象，需要在调用这些方法时将`request`对象作为参数传入。

通过添加参数也是线程安全的。
这种方法的主要缺点是`request`对象写起来冗余太多，主要体现在两点：
- 如果多个`controller`方法中都需要`request`对象，那么在每个方法中都需要添加一遍`request`参数
- request对象的获取只能从`controller`开始，如果使用`request`对象的地方在函数调用层级比较深的地方，那么整个调用链上的所有方法都需要添加`request`参数

实际上，在整个请求处理的过程中，request对象是贯穿始终的；也就是说，除了定时器等特殊情况，`request`对象相当于线程内部的一个全局变量。而该方法，相当于将这个全局变量，传来传去。

#### 自动注入

```java
  @Controller
  public class TestController{
    // Autowired 有可能在IDEA中报了红线警告 Could not autowire. No beans of ‘xxxx’ type found, Intellij IDEA 本身工具的问题
    @Resource
    private HttpServletRequest request; //自动注入request
    
    @RequestMapping("/test")
    public void test() throws InterruptedException{
      //模拟程序执行了一段时间
      Thread.sleep(1000);
    }
  }
```

自动注入也是线程安全的。

在`Spring`中，`Controller`的`scope`是`singleton`(单例)，也就是说在整个web系统中，只有一个`TestController`；但是其中注入的`request`却是线程安全的，原因在于：
使用这种方式，当Bean（本例的TestController）初始化时，Spring并没有注入一个request对象，而是注入了一个代理（proxy）；当Bean中需要使用request对象时，通过该代理获取request对象。
在上述代码中加入断点，查看request对象的属性，如下图所示：
![request对象其实是一个代理（proxy）](/uploads/20210114/1.png)

`request`实际上是一个代理：代理的实现参见`AutowireUtils`的内部类`ObjectFactoryDelegatingInvocationHandler`:
```java
  /**
    * Reflective InvocationHandler for lazy access to the current target object.
    */
  @SuppressWarnings("serial")
  private static class ObjectFactoryDelegatingInvocationHandler implements InvocationHandler, Serializable {
    private final ObjectFactory<?> objectFactory;
    public ObjectFactoryDelegatingInvocationHandler(ObjectFactory<?> objectFactory) {
      this.objectFactory = objectFactory;
    }
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
      // ……省略无关代码
      try {
          return method.invoke(this.objectFactory.getObject(), args); // 代理实现核心代码
      }
      catch (InvocationTargetException ex) {
          throw ex.getTargetException();
      }
    }
  }
```

也就是说，当我们调用`request`的方法`method`时，实际上是调用了由`objectFactory.getObject()`生成的对象的method方法；`objectFactory.getObject()`生成的对象才是真正的request对象。
继续观察，发现`objectFactory`的类型为`WebApplicationContextUtils`的内部类`RequestObjectFactory`；而`RequestObjectFactory`代码如下：
```java
  /**
    * Factory that exposes the current request object on demand.
    */
  @SuppressWarnings("serial")
  private static class RequestObjectFactory implements ObjectFactory<ServletRequest>, Serializable {
    @Override
    public ServletRequest getObject() {
      return currentRequestAttributes().getRequest();
    }
    @Override
    public String toString() {
      return "Current HttpServletRequest";
    }
  }
```
其中，要获得`request`对象需要先调用`currentRequestAttributes()`方法获得`RequestAttributes`对象，该方法的实现如下:
```java
  /**
    * Return the current RequestAttributes instance as ServletRequestAttributes.
    */
  private static ServletRequestAttributes currentRequestAttributes() {
    RequestAttributes requestAttr = RequestContextHolder.currentRequestAttributes();
    if (!(requestAttr instanceof ServletRequestAttributes)) {
      throw new IllegalStateException("Current request is not a servlet request");
    }
    return (ServletRequestAttributes) requestAttr;
  }
```

生成`RequestAttributes`对象的核心代码在类`RequestContextHolder`中，其中相关代码如下（省略了该类中的无关代码）:
```java
  public abstract class RequestContextHolder {
    public static RequestAttributes currentRequestAttributes() throws IllegalStateException {
      RequestAttributes attributes = getRequestAttributes();
      // 此处省略不相关逻辑…………
      return attributes;
    }
    public static RequestAttributes getRequestAttributes() {
      RequestAttributes attributes = requestAttributesHolder.get();
      if (attributes == null) {
        attributes = inheritableRequestAttributesHolder.get();
      }
      return attributes;
    }
    private static final ThreadLocal<RequestAttributes> requestAttributesHolder = new NamedThreadLocal<RequestAttributes>("Request attributes");
    private static final ThreadLocal<RequestAttributes> inheritableRequestAttributesHolder = new NamedInheritableThreadLocal<RequestAttributes>("Request context");
  }
```
通过这段代码可以看出，生成的`RequestAttributes`对象是线程局部变量（`ThreadLocal`），因此`request`对象也是线程局部变量；这就保证了`request`对象的线程安全性。

通过自动注入，带来的好处就是：
- 注入不局限于`Controller`中, 还可以在任何`Bean`中注入，包括`Service`、`Repository`及普通的`Bean`。
- 注入的对象不限于`request`：除了注入`request`对象，该方法还可以注入其他`scope`为`request`或`session`的对象，如`response`对象、`session`对象等；并保证线程安全。
- 减少代码冗余：只需要在需要`request`对象的`Bean`中注入`request`对象，便可以在该`Bean`的各个方法中使用.

#### @ModelAttribute方法

```java
  @Controller
  public class TestController {
    private HttpServletRequest request;

    @ModelAttribute
    public void bindRequest(HttpServletRequest request) {
      this.request = request;
    }
    @RequestMapping("/test")
    public void test() throws InterruptedException {
      // 模拟程序执行了一段时间
      Thread.sleep(1000);
    }
  }
```

`@ModelAttribute`注解用在`Controller`中修饰方法时，其作用是`Controller`中的每个`@RequestMapping`方法执行前，该方法都会执行。
因此在本例中，`bindRequest()`的作用是在`test()`执行前为`request`对象赋值。虽然`bindRequest()`中的参数`request`本身是线程安全的，但由于`TestController`是单例的，`request`作为`TestController`的一个域，无法保证线程安全。