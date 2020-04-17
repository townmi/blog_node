---
title: ES6迭代器Iterator
date: 2020-03-30 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6迭代器Iterator

#### Iterator迭代器概念

Iterator是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要实现了*Iterator*接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。
Iterator三个作用：
- 为各种数据结构，提供一个统一的、简便的访问接口；
- 使得数据结构的成员能够按某种次序排列；
- Iterator 接口主要供ES6新增的for...of消费；

<!-- more -->
#### Iterator迭代器如何实现的

1. 创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
2. 第一次调用指针对象的`next`方法，可以将指针指向数据结构的第一个成员。
3. 第二次调用指针对象的`next`方法，指针就指向数据结构的第二个成员。
4. 不断调用指针对象的`next`方法，直到它指向数据结构的结束位置。

每一次调用`next`方法，都会返回数据结构的当前成员的信息。具体来说，就是返回一个包含`value`和`done`两个属性的对象。
- `value`属性是当前成员的值;
- `done`属性是一个布尔值，表示遍历是否结束;

下面我们来模拟下过程
```js
  const fun = (arr) => {
    let nextIndex = 0;
    return {
      next: () => {
        return nextIndex < arr.length ? {
          value: arr[nextIndex++],
          done: false,
        } : {
          value: undefined,
          done: true
        }
      }
    }
  }
  const a = fun(['a', 'b']);
  a.next(); // { value: "a", done: false }
  a.next(); // { value: "b", done: false }
  a.next(); // { value: undefined, done: true }
```

#### 默认实现了Iterator迭代器接口的数据结构

若数据可遍历，即一种数据部署了Iterator接口。
ES6中默认的Iterator接口部署在数据结构的`Symbol.iterator`属性，即如果一个数据结构具有`Symbol.iterator`属性，就可以认为是可遍历。
原生具有Iterator接口的数据结构有：
- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象

#### Iterator迭代器的使用场景

1. 解构赋值 对数组和 Set 结构进行解构赋值时，会默认调用Symbol.iterator方法
```js
  let a = new Set().add('a').add('b').add('c');
  let [x, y] = a;       // x = 'a'  y = 'b'
  let [a1, ...a2] = a;  // a1 = 'a' a2 = ['b','c']
```
2. 扩展运算符 扩展运算符（...）也会调用默认的 Iterator 接口
```js
  let a = 'abcd';
  const [...b] = a; // ['a', 'b', 'c', 'd']
  a = ['a','b','c'];
  [...a, 'd']; // ['a', 'b', 'c', 'd']
```
3. `yield*`后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口
```js
  let a = function* () {
    yield 1;
    yield* [2,3,4];
    yield 5;
  }
  let b = a();
  b.next(); // { value: 1, done: false }
  b.next(); // { value: 2, done: false }
  b.next(); // { value: 3, done: false }
  b.next(); // { value: 4, done: false }
  b.next(); // { value: 5, done: false }
  b.next(); // { value: undefined, done: true }
```
4. 其他场合,由于数组的遍历会调用遍历器接口，所以任何接受数组作为参数的场合，其实都调用了遍历器接口。下面是一些例子。
  - for...of
  - Array.from()
  - Map(), Set(), WeakMap(), WeakSet()（比如new Map([['a',1],['b',2]])）
  - Promise.all()
  - Promise.race()

#### for...of循环

只要数据结构部署了`Symbol.iterator`属性，即具有 iterator 接口，可以用`for...of`循环遍历它的成员。也就是说，`for...of`循环内部调用的是数据结构的`Symbol.iterator`方法。
使用场景：`for...of`可以使用在数组，Set和Map结构，类数组对象，Genetator对象和字符串。
1. 数组 `for...of`循环可以代替数组实例的`forEach`方法
```js
  et a = ['a', 'b', 'c'];
  for (let k of a){console.log(k)}; // a b c

  a.forEach((ele, index)=>{
    console.log(ele);    // a b c
    console.log(index);  // 0 1 2 
  })
```
  与`for...in`对比，`for...in`只能获取对象键名，不能直接获取键值，而`for...of`允许直接获取键值。
2. Set和Map 可以使用数组作为变量，如`for (let [k,v] of b){...}`
```js
  let a = new Set(['a', 'b', 'c']);
  for (let k of a){console.log(k)}; // a b c

  let b = new Map();
  b.set('name','leo');
  b.set('age', 18);
  b.set('aaa','bbb');
  for (let [k,v] of b){console.log(k + ":" + v)};
```
3. 类数组对象
```js
  // 字符串
  let a = 'hello';
  for (let k of a ){console.log(k)}; // h e l l o

  // DOM NodeList对象
  let b = document.querySelectorAll('p');
  for (let k of b ){
    k.classList.add('test');
  }

  // arguments对象
  function f(){
    for (let k of arguments){
      console.log(k);
    }
  }
  f('a','b'); // a b
```

#### 跳出for...of
```js
  for (let k of a){
    if (k>100)
      break;
    console.log(k);
  }
```