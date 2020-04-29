---
title: ES7&ES8以及ES9的新特性
date: 2019-09-09 22:31:56
tags:
- JS
categories:
- 前端
---

### ES7的新特性

#### 数组 includes() 
`includes()`用于查找一个值是否在数组中，如果在返回`true`，否则返回`false`,与字符串的`includes`方法类似,
`includes()`方法接收两个参数，搜索的内容和开始搜索的索引，默认值为`0`，若搜索值在数组中则返回`true`否则返回`false`。
```js
  ['a', 'b', 'c', 'd'].includes('b');      // true
  ['a', 'b', 'c', 'd'].includes('b', 1);   // true
  ['a', 'b', 'c', 'd'].includes('b', 2);   // false
```

<!-- more -->

#### 指数操作符(**)
基本用法
```js
  let a = 3 ** 2 ; // 9
  // 等效于
  Math.pow(3, 2);  // 9
  let b = 3;
  b **= 2; // 9
```

### ES8的新特性

#### async异步函数
下面是最简单`async`异步函数的案例, `await`只能用在 `async`函数里面，不然报错
```js
  async function fetchJson(url) {
    try {
        let request = await fetch(url);
        let text = await request.text();
        return JSON.parse(text);
    }
    catch (error) {
        console.log(`ERROR: ${error.stack}`);
    }
  }
```
其实它就是`Generator`函数的语法糖,我们可以对比下`Generator`函数
```js
  // Generator写法
  const fs = require('fs');
  const readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
      fs.readFile(fileName, function(error, data) {
        if (error) return reject(error);
        resolve(data);
      });
    });
  };
  const gen = function* () {
    const f1 = yield readFile('/etc/fstab');
    const f2 = yield readFile('/etc/shells');
    console.log(f1.toString());
    console.log(f2.toString());
  };

  // async await写法
  const asyncReadFile = async function () {
    const f1 = await readFile('/etc/fstab');
    const f2 = await readFile('/etc/shells');
    console.log(f1.toString());
    console.log(f2.toString());
  };
```
那么对比`Genenrator`有四个优点
1. 内置执行器`Generator`函数执行需要有执行器，而`async`函数自带执行器，即`async`函数与普通函数一模一样 `async f();`
2. 更好的语义`async`和`await`，比起星号`*`和`yield`，语义更清楚了。`async`表示函数里有异步操作，`await`表示紧跟在后面的表达式需要等待结果
3. 更广的适用性`yield`命令后面只能是`Thunk`函数或`Promise`对象，而`async`函数的`await`命令后面，可以是`Promise`对象和原始类型的值（数值、字符串和布尔值，但这时等同于同步操作）
4. 返回值是`Promise` `async`函数的返回值是`Promise`对象，这比`Generator`函数的返回值是`Iterator `对象方便多了。你可以用`then`方法指定下一步的操作

**`async`使用注意**
1. `await`命令放在`try...catch`代码块中，防止`Promise`返回`rejected`
2. 若多个`await`后面的异步操作不存在继发关系，最好让他们同时执行
  ```js
    // 效率低
    let a = await f();
    let b = await g();

    // 效率高
    let [a, b] = await Promise.all([f(), g()]);
  ```

`async`函数还有很多使用形式：
```js
  // 函数声明式
  async function foo() {}
  // 函数表达式
  const foo = async function () {};
  // 对象的方法
  let a = {
    async f(){...}
  }
  // 箭头函数
  const foo = async () => {};
```

#### `Object`新增方法

1. `Object.values` 返回一个数组，成员是参数对象自身的（不含继承的）所有**可遍历属性**的键值
  ```js
    let a = { f1: 'hi', f2: 'leo'};
    Object.values(a); // ['hi', 'leo']
    // 如果参数不是对象，则返回空数组：
    Object.values(10);   // []
    Object.values(true); // []
  ```
2. `Object.entries` 返回一个数组，成员是参数对象自身的（不含继承的）所有**可遍历属性**的键值对数组
  ```js
    let a = { f1: 'hi', f2: 'leo'};
    Object.entries(a); // [['f1','hi'], ['f2', 'leo']]
    // 将对象转为真正的Map结构
    let a = { f1: 'hi', f2: 'leo'};
    let map = new Map(Object.entries(a));
  ```
3. `Object.getOwnPropertyDescriptors()` 之前有`Object.getOwnPropertyDescriptor`方法会返回某个对象属性的描述对象，新增的`Object.getOwnPropertyDescriptors()`方法，返回指定对象所有自身属性（非继承属性）的描述对象
  ```js
    let a = {
      a1:1,
      get f1(){ return 100}
    }
    Object.getOwnPropertyDescriptors(a)
    // a1: {value: 1, writable: true, enumerable: true, configurable: true}
    // f1: {set: undefined, enumerable: true, configurable: true, get: ƒ}
  ```
  引入这个方法，主要是为了解决`Object.assign()`无法正确拷贝`get`属性和`set`属性的问题
  ```js
    let a = {
      set f(v){
        console.log(v)
      }
    }
    let b = {};
    Object.assign(b, a);
    Object.getOwnPropertyDescriptor(b, 'f')
    // {value: undefined, writable: true, enumerable: true, configurable: true}
  ```
  `value`为`undefined`是因为`Object.assign`方法不会拷贝其中的`get`和`set`方法，使用`getOwnPropertyDescriptors`配合`Object.defineProperties`方法来实现正确的拷贝
  ```js
    let a = {
      set f(v){
        console.log(v)
      }
    }
    let b = {};
    Object.defineProperties(b, Object.getOwnPropertyDescriptors(a));
    Object.getOwnPropertyDescriptor(b, 'f')
  ```
  `Object.getOwnPropertyDescriptors`方法的配合`Object.create`方法，将对象属性克隆到一个新对象，实现浅拷贝
  ```js
    const shallowClone = (obj) => Object.create(
      Object.getPrototypeOf(obj),
      Object.getOwnPropertyDescriptors(obj)
    );
  ```

#### `String`新增方法
`padStart`、`padEnd`用来为字符串填充特定字符串，并且都有两个参数：字符串目标长度和填充字段，第二个参数可选，默认空格
```js
  'es8'.padStart(2);          // 'es8'
  'es8'.padStart(5);          // '  es8'
  'es8'.padStart(6, 'woof');  // 'wooes8'
  'es8'.padStart(14, 'wow');  // 'wowwowwowwoes8'
  'es8'.padStart(7, '0');     // '0000es8'

  'es8'.padEnd(2);            // 'es8'
  'es8'.padEnd(5);            // 'es8  '
  'es8'.padEnd(6, 'woof');    // 'es8woo'
  'es8'.padEnd(14, 'wow');    // 'es8wowwowwowwo'
  'es8'.padEnd(7, '6');       // 'es86666'
```

#### `Function`新的特性
函数参数列表与调用中的尾部逗号， 我们在定义或者调用函数时添加尾部逗号而不报错。
```js
  function es8(var1, var2, var3,) {
    // ...
  }
  es8(10, 20, 30,);
```


### ES9的新特性

#### `Promise.prototype.finally` 方法
`finally()`是`ES9`中`Promise`添加的一个新标准，用于指定不管`Promise`对象最后状态（是`fulfilled`还是`rejected`）如何，都会执行此操作，并且`finally`方法必须写在最后面，即在`then`和`catch`方法后面。
```js
  // 写法如下
  promise
    .then(res => {...})
    .catch(err => {...})
    .finally(() => {...})
```

#### 未完待续