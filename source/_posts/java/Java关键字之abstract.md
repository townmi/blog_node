---
title: Java关键字之abstract
date: 2020-08-24 19:37:38
tags:
- Java
categories:
- 前端
---

### Java关键字之abstract
在面向对象的概念中，所有的对象都是通过类来描绘的，但是反过来，并不是所有的类都是用来描绘对象的，如果一个类中没有包含足够的信息来描绘一个具体的对象，这样的类就是抽象类

<!-- more -->

#### 简单理解抽象类

1. 只给出方法定义而不具体实现的方法被称为抽象方法，抽象方法是没有方法体的，在代码的表达上就是没有`{}`。使用`abstract`修饰符来表示抽象方法和抽象类。
2. `abstract`修饰符表示所修饰的类没有完全实现，还不能实例化。如果在类的方法声明中使用`abstract`修饰符，表明该方法是一个抽象方法，它需要在子类实现。如果一个类包含抽象方法，则这个类也是抽象类，必须使用`abstract`修饰符，并且不能实例化。
3. 注意，抽象类除了包含抽象方法外，还可以包含具体的变量和具体的方法。类即使不包含抽象方法，也可以被声明为抽象类，防止被实例化

#### 抽象类特点

1. 抽象类不能实例化，即不能对其用`new`运算符；
2. 类中如果有一个或多个`abstract`方法，则该类必须声明为`abstract`；
3. 抽象类中的方法不一定都是`abstract`方法，它还可以包含一个或者多个具体的方法；
4. 即使一个类中不含抽象方法，它也可以声明为抽象类；
5. 抽象类中的抽象方法要被使用，必须由子类复写起所有的抽象方法后，建立子类对象调用。
6. 如果子类只覆盖了部分抽象方法，那么该子类还是一个抽象类。

#### 什么情况下，使用抽象类
1. 类中包含一个明确声明的抽象方法;
2. 类的任何一个父类包含一个没有实现的抽象方法;
3. 类的直接父接口声明或者继承了一个抽象方法，并且该类没有声明或者实现该抽象方法

#### 代码展示
抽象类不能被实例化，抽象方法必须在子类中被实现。请看下面的代码:
```java
  import static java.lang.System.*;
  public final class Demo{
    public static void main(String[] args) {
      Teacher t = new Teacher();
      t.setName("小明");
      t.work();

      Driver d = new Driver();
      d.setName("小陈");
      d.work();
    }
  }
  // 定义一个抽象类
  abstract class People{
    private String name;  // 实例变量

    // 共有的 setter 和 getter 方法
    public void setName(String name){
      this.name = name;
    }
    public String getName(){
      return this.name;
    }

    // 抽象方法
    public abstract void work();
  }
  class Teacher extends People{
    // 必须实现该方法
    public void work(){
      out.println("我的名字叫" + this.getName() + "，大家好...");
    }
  }
  class Driver extends People{
    // 必须实现该方法
    public void work(){
      out.println("我的名字叫" + this.getName() + "，大家好...");
    }
  }
  /*
    运行结果：
    我的名字叫小明，大家好...
    我的名字叫小陈，大家好...
  */
```

#### 关于抽象类的几点说明

1. 抽象类不能直接使用，必须用子类去实现抽象类，然后使用其子类的实例。然而可以创建一个变量，其类型是一个抽象类，并让它指向具体子类的一个实例，也就是可以使用抽象类来充当形参，实际实现类作为实参，也就是多态的应用。
2. 构造函数和静态函数以及`final`修饰的函数不能使用`abstract`修饰符。
3. 如果试图创建一个抽象类的实例就会产生编译错误。
4. 如果一个类是非抽象类却包含一个抽象方法，就会产生编译错误。
5. 抽象类中有构造函数。如果抽象类是父类，需要给子类提供实例的初始化

#### abstract 关键字和哪些关键字不能共存

1. `final`：被`final`修饰的类不能有子类。而被`abstract`修饰的类一定是一个父类。
2. `private`: 抽象类中的私有的抽象方法，不被子类所知，就无法被复写。而抽象方法出现的就是需要被复写。
3. `static`：如果`static`可以修饰抽象方法，那么连对象都省了，直接类名调用就可以了。可是抽象方法运行没意义