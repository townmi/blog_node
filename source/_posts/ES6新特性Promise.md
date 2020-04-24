---
title: ES6新特性Promise
date: 2019-03-09 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6新特性Promise
主要用途：解决异步编程带来的回调地狱问题。
`Promise`对象2特点:
1. 对象的状态不受外界影响。`Promise`对象代表一个异步操作，有三种状态：pending（进行中）、fulfilled（已成功）和rejected（已失败）。
2. 一旦状态改变，就不会再变，任何时候都可以得到这个结果
`Promise`缺点:
1. 无法取消Promise，一旦新建它就会立即执行，无法中途取消。
2. 如果不设置回调函数，Promise内部抛出的错误，不会反应到外部
3. 当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）

<!-- more -->
#### 基本使用
`Promise`为一个构造函数，需要用new来实例化。
```js
  let p = new Promise(function (resolve, reject){
    if(/*异步操作成功*/){
      resolve(value); // 成功
    } else {
      reject(error); // 失败
    }
  });
})
```
`Promise`接收一个函数作为参数，该函数两个参数resolve和reject，有JS引擎提供。
1. resolve作用是将Promise的状态从pending变成resolved，在异步操作成功时调用，返回异步操作的结果，作为参数传递出去。
2. reject作用是将Promise的状态从pending变成rejected，在异步操作失败时报错，作为参数传递出去。

Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数。
```js
  p.then(function (){
    // 成功
  }, function (){
    // 失败
  })
```

#### 实例方法then

作用是为`Promise`添加状态改变时的回调函数，`then`方法的第一个参数是`resolved`状态的回调函数，第二个参数（可选）是`rejected`状态的回调函数。
`then`方法返回一个新`Promise`实例，与原来`Promise`实例不同，因此可以使用链式写法，上一个`then`的结果作为下一个`then`的参数。

```js
  getJSON("/posts.json").then(function(json) {
    // success
    return json.post;
  }, function () {
    // error
  }).then(function(post) {
    // ...
  });
```
#### 实例方法catch
`Promise.prototype.catch`方法是`.then(null, rejection)`的别名，用于指定发生错误时的回调函数。
```js
  getJSON('/posts.json').then(function(posts) {
    // ...
  }).catch(function(error) {
    // 处理 getJSON 和 前一个回调函数运行时发生的错误
    console.log('发生错误！', error);
  });
```
当promise抛出一个错误，就被catch方法指定的回调函数捕获，下面三种写法相同。
```js
  // 写法一
  const p = new Promise(function(resolve, reject) {
    throw new Error('test');
  });
  p.catch(function(error) {
    console.log(error);
  });
  // Error: test

  // 写法二
  const p = new Promise(function(resolve, reject) {
    try {
      throw new Error('test');
    } catch(e) {
      reject(e);
    }
  });
  p.catch(function(error) {
    console.log(error);
  });

  // 写法三
  const p = new Promise(function(resolve, reject) {
    reject(new Error('test'));
  });
  p.catch(function(error) {
    console.log(error);
  });
```

一般来说，不要在`then`方法里面定义Reject状态的回调函数（即then的第二个参数），总是使用`catch`方法。

#### 构造函数的方法Promise.all
用于将多个`Promise`实例，包装成一个新的`Promise`实例，参数可以不是数组，但必须是Iterator接口，且返回的每个成员都是`Promise`实例。
```js
  const p = Promise.all([p1, p2, p3]);
```
`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况。
1. 只有p1、p2、p3的状态都变成fulfilled，p的状态才会变成fulfilled，此时p1、p2、p3的返回值组成一个数组，传递给p的回调函数。
2. 只要p1、p2、p3之中有一个被rejected，p的状态就变成rejected，此时第一个被reject的实例的返回值，会传递给p的回调函数。

注意：如果`Promise`的参数中定义了`catch`方法，则`rejected`后不会触发`Promise.all()`的`catch`方法，因为参数中的`catch`方法执行完后也会变成`resolved`，当`Promise.all()`方法参数的实例都是`resolved`时就会调用`Promise.all()`的`then`方法。
```js
  const p1 = new Promise((resolve, reject) => {
    resolve('hello');
  })
  .then(result => result)
  .catch(e => e);

  const p2 = new Promise((resolve, reject) => {
    throw new Error('报错了');
  })
  .then(result => result)
  .catch(e => e);

  Promise.all([p1, p2])
  .then(result => console.log(result))
  .catch(e => console.log(e));
  // ["hello", Error: 报错了]
```
如果参数里面都没有`catch`方法，就会调用`Promise.all()`的`catch`方法。
```js
  const p1 = new Promise((resolve, reject) => {
    resolve('hello');
  })
  .then(result => result);

  const p2 = new Promise((resolve, reject) => {
    throw new Error('报错了');
  })
  .then(result => result);

  Promise.all([p1, p2])
  .then(result => console.log(result))
  .catch(e => console.log(e));
  // Error: 报错了
```
#### 构造函数的方法Promise.race
与`Promise.all`方法类似，也是将多个`Promise`实例包装成一个新的`Promise`实例。
```js
  const p = Promise.race([p1, p2, p3]);
```
与`Promise.all`方法区别在于，`Promise.race`方法是p1, p2, p3中只要一个参数先改变状态，就会把这个参数的返回值传给p的回调函数。

#### 构造函数的方法Promise.resolve
将现有对象转换成`Promise`对象。
```js
  const p = Promise.resolve($.ajax('/whatever.json'));
  p.then(...)
```
