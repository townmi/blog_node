---
title: Javascript 事件循环(浏览器)
date: 2019-02-11 11:35:36
tags:
- JS
categories:
- 前端
---

### 事件循环(Event Loop)
#### Javascript 单线程
我们知道Javascript最大的特点就是单线程模式，Javascript这门语言历史悠久，起初是作为浏览器的脚本语言，在浏览器里负责DOM操作等等。
后来随着计算机的发展，HTML5新增了Web Worker 但是Web Worker里面限制比较多, 不可以操作DOM，子线程还是被主线程操控，没能改变JS单线程的命运。

<!-- more -->

#### 任务队列
写web的同学都知道事件和callback，这两个概念，我们经常会给元素添加事件，ajax添加回调。为什么这门写，就是应为上面的单线程特性。
正是应为单线程，不可能把所以任务都放到主线程里面跑，特别是像Ajax这种网络请求。所以许多任务需要以队列的方式去完成。
所以简单来讲，Javascript单线程模型可以理解为*主线程+任务队列*的模式， 主线程里面执行栈空了，就从任务队列里面取任务放到主线程执行，不停的循环。这就有了我们的*事件循环*

#### 事件循环的简单概念
上面我们简单总结了*主线程+任务队列*的模式，如何来理解呢，可以用一个流程图来简单描述下
```
主线程执行栈                  任务队列                                      浏览器底层
for(...)...
btn.onclick=...                                  往任务队列添加成功的回调任务
ajax()                   ajaxSuccess任务 <--------------------------  ajax请求成功返回
for(...)...                           
a()...                                           往任务队列添加定时的回调任务
setTimeOut()              TimeOut任务     <--------------------------  定时器到了时间
for(...)...                           
...                                               往任务队列添加btn点击的回调任务
            Event Loop ---> btnClick任务   <--------------------------  btn被点击了
                   |
                   |
                   |
事件循环会在主线程执行栈为空的时候，从任务队列以先进先出的方式取一个任务到执行栈执行，不停的循环
```


### 任务的理解
#### 同步于异步
前面我们简单理解了事件循环，也知道任务队列的概念，可以简单的总结 主线程执行栈里面都是同步执行的，任务队列是怎么来的呢？
我们在主线程里面经常会发送一个ajax请求、setTimeout等等，我们大都理解为异步的，为什么这么理解呢？就拿ajax来讲，一般都是像下面这样写:
```javascript
var xmlhttp = new XMLHttpRequest(); // line1
xmlhttp.onreadystatechange = function() {   // line2
  if (this.readyState == 4 && this.status == 200) {
    myFunction(this);
  }
};
xmlhttp.open("GET", "cd_catalog.xml", true); // line3
xmlhttp.send();  // line4
```
如果我讲line2的代码放到line4下面，我们发现ajax依旧成功执行回调，甚至我使用`setTimeout(function(){//line2}, 3)`也是可以执行回调的,这个时候你会发现ajax发送不依赖`onreadystatechange`回调事件，你仅需要将参数设置完，就可以发送请求，请求有了返回，浏览器底层会查找你的这个`xmlhttp`有没有`onreadystatechange`方法，有就往任务队列推入`onreadystatechange`任务。
当然，我们知道`xmlhttp.open()` 第三个参数如果是`false`，那么ajax就是同步模式，这种情况下 line2 必须在line4 之前，我们来看下这两种情况区别的关键。
关键就是`xmlhttp.send();` 如果是异步模式，line4 执行完，`send`函数发送请求就会立马返回(return)，直接执行下面的line5，如果是同步模式，`send`函数发送请求后并不会立马return，需要等待网络请求返回结果，有了结果就看有没有`onreadystatechange`，有的话就立马执行，没有就return。

所以简单的理解就是同步是发送I/O、NetWork必须等事件都有了结果，在return；异步就是发送I/O、NetWork不等事件的结果，立马return。


#### 异步任务详解


#### macrotasks 与 microtasks



### 完整事件循环模型
1. 选择最先进入 事件循环任务队列的一个任务， 如果队列中没有任务，则直接跳到第6步的 Microtask
2. 设置 事件循环的当前运行任务为上一步所选择的任务
3. Run: 运行所选任务
4. 设置 事件循环的当前运行任务为 null
5. 将刚刚第3步运行的任务从它的任务队列中删除
6. Microtasks: perform a microtask checkpoint   
    1. 设置 performing a microtask checkpoint 的标记为 true
    2. Microtask queue handling: 如果事件循环的 microtask queue 是空，跳到第8步 Done
    3. 选取最先进入 microtask queue 的 microtask
    4. 设置 事件循环的当前运行任务 为上一步所选择的任务
    5. Run: 执行所选取的任务
    6. 设置 事件循环的当前运行任务 为 null
    7. 将刚刚第5步运行的 microtask 从它的 microtask queue 中删除
    8. Done: For each environment settings object whose responsible event loop is this event loop, notify about rejected promises on that environment settings object （此处建议查看原网页）
    9. 清理 Index Database 的事务
    10. 使 performing a microtask checkpoint 的标记为 false
7. 更新并渲染界面
8. 返回第1步
