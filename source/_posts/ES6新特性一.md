---
title: ES6新特性一
date: 2019-01-09 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6新特性一

#### let const

le和const不再像var那样有变量提升的情况，相同作用域下不可以重复声明，还有函数的参数不可以再声明

#### 解构赋值

解构 如果不纯在，就是undefined
```javascript
  const [a, b] = [1];
  console.log(b); // undefined
  const {c} = {b: 1}
  console.log(c) // undefined
```
<!-- more -->

如果解构，右边的模式和左边的不同，则会报错
```javascript
  const [a] = 1;
  const [a] = {};
```
解构可以使用默认值
```javscript
  const [a = 1] = [undefined]
  console.log(a) // 1
```

*对象的解构赋值的内部机制*，是先找到同名属性，然后再赋给对应的变量。真正被赋值的是后者，而不是前者。
```javascript
  let {a:b} = {a:1, c:2};
  // 这个时候a是模式，b是变量
  // a is undefined
  // b => 1
```

字符串、数字和布尔值 都可以解构, 除了下面是数组解构其他的都是先转成对应的对象然后按照对象解构
```javascript
 let [a, b ] = "abc";
 // a => "a"
 // b => "a"
```

#### 字符串一些新的API

- includes 同等于 `indexOf() > -1`
- startsWith `'hello leo'.startsWith('eo') // false`
- endsWith  `'hello leo'.endsWidth('eo') // true`
- repeat `'ab'.repeat(3) // 'ababab' `


#### 函数相关的新特性

关于尖头函数
1. 箭头函数内的this总是指向定义时所在的对象，而不是调用时。
2. 箭头函数不能当做构造函数，即不能用new命令，否则报错。
3. 箭头函数不存在arguments对象，即不能使用，可以使用rest参数代替。
4. 箭头函数不能使用yield命令，即不能用作Generator函数。

- 参数可以添加默认值
```javascript
  const fn = (a = 1) => {
    console.log(a);
  }
  
  fn(); // 1
```
- reset 参数
```javascript
  const fn = (a, ...reset) => {
    console.log(reset);
  }
  
  fn(1, 2, 3, 4); // [2, 3, 4]
```
- 双冒号运算符 相当于*bind*, *apply*
```javascript
  const obj = { fn: () => {console.log(this)}}
  obj::fn;
  // == obj.fn.bind(obj)
  obj::fn(123);
  // == obj.fn.apply(obj, 123)
```