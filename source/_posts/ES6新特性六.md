---
title: ES6新特性六
date: 2019-03-29 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6新特性Generator函数

`Generator`函数是一种异步编程解决方案。其原理：
执行`Genenrator`函数会返回一个遍历器对象，依次遍历`Generator`函数内部的每一个状态。
`Generator`函数是一个普通函数，有以下两个特征：
1. `function`关键字与函数名之间有个星号；
2. 函数体内使用`yield`表达式，定义不同状态；
3. 通过调用`next`方法，将指针移向下一个状态，直到遇到下一个`yield`表达式（或`return`语句）为止。简单理解，`Generator`函数分段执行，`yield`表达式是暂停执行的标记，而`next`恢复执行。
<!-- more -->
```js
  function * f (){
    yield 'hi';
    yield 'leo';
    return 'ending';
  }
  let a = f();
  a.next();  // {value: 'hi', done : false}
  a.next();  // {value: 'leo', done : false}
  a.next();  // {value: 'ending', done : true}
  a.next();  // {value: undefined, done : false}
```

#### yield表达式

`yield`表达式是暂停标志，遍历器对象的`next`方法的运行逻辑如下：

1. 遇到`yield`就暂停执行，将这个`yield`后的表达式的值，作为返回对象的`value`属性值。
2. 下次调用`next`往下执行，直到遇到下一个`yield`。
3. 直到函数结束或者`return`为止，并返回`return`语句后面表达式的值，作为返回对象的`value`属性值。
4. 如果该函数没有`return`语句，则返回对象的`value`为`undefined`。
注意： 
1. `yield`只能用在`Generator`函数里使用，其他地方使用会报错。
2. `yield`表达式如果用于另一个表达式之中，必须放在圆括号内。
```js
  function * a (){
    console.log('a' + yield);     //  SyntaxErro
    console.log('a' + yield 123); //  SyntaxErro
    console.log('a' + (yield));     //  ok
    console.log('a' + (yield 123)); //  ok
  }
```
3. `yield`表达式用做函数参数或放在表达式右边，可以不加括号。
```js
  function * a (){
    f(yield 'a', yield 'b');    //  ok
    lei i = yield;              //  ok
  }
```

#### next方法
`yield`本身没有返回值，或者是总返回`undefined`，`next`方法可带一个参数，作为**上一个`yield`表达式**的返回值。
```js
  function * f(x){
    let y = 2 * (yield (x+1));
    let z = yield (y/3);
    return (x + y + z);
  }
  let a = f(5);
  a.next();   // {value : 6 ,done : false}
  a.next();   // {value : NaN ,done : false}  
  a.next();   // {value : NaN ,done : true}
  // NaN因为yeild返回的是对象 和数字计算会NaN

  let b = f(5);
  b.next();     // {value : 6 ,done : false}
  b.next(12);   // {value : 8 ,done : false}
  b.next(13);   // {value : 42 ,done : false}
  // x 5 y 24 z 13
```
这一特点，可以让`Generator`函数开始执行之后，可以从外部向内部注入不同值，从而调整函数行为。
```js
  function * f(x){
    let y = 2 * (yield (x+1));
    let z = 0;
    if (y === 24) {
      z = yield (y/3);
    } else {
      z = yield (y/2);
    }
    return (x + y + z);
  }
  let b = f(5);
  b.next();     // {value : 6 ,done : false}
  b.next(12);   // {value : 8 ,done : false}
  b.next(13);   // {value : 42 ,done : false}

  let b = f(5);
  b.next();     // {value : 6 ,done : false}
  b.next(11);   // {value : 11 ,done : false} // 这里传入不同的参数，走了不同的逻辑
  b.next(15);   // {value : 42 ,done : false}

```

####  for...of循环
`for...of`循环会自动遍历，不用调用`next`方法，需要注意的是，`for...of`遇到`next`返回值的`done`属性为`true`就会终止，`return`返回的不包括在`for...of`循环中。
```js
  function * f(){
    yield 1;
    yield 2;
    yield 3;
    yield 4;
    return 5;
  }
  for (let k of f()){
    console.log(k);
  }
  // 1 2 3 4  没有 5 
```

#### Generator.prototype.throw()
`throw`方法用来向函数外抛出错误，并且在`Generator`函数体内捕获。
```js
  let f = function * (){
    try { yield }
    catch (e) { console.log('内部捕获', e) }
  }

  let a = f();
  a.next();

  try{
    a.throw('a');
    a.throw('b');
  }catch(e){
    console.log('外部捕获',e);
  }
  // 内部捕获 a
  // 外部捕获 b
```

####  Generator.prototype.return()
`return`方法用来返回给定的值，并结束遍历`Generator`函数，如果`return`方法没有参数，则返回值的`value`属性为`undefined`。
```js
  function * f(){
    yield 1;
    yield 2;
    yield 3;
  }
  let g = f();
  g.next();          // {value : 1, done : false}
  g.return('leo');   // {value : 'leo', done " true}
  g.next();          // {value : undefined, done : true}
```

#### next()/throw()/return()共同点
相同点就是都是用来恢复`Generator`函数的执行，并且使用不同语句替换`yield`表达式。
1. `next()`将`yield`表达式替换成一个值。
```js
  let f = function * (x,y){
    let r = yield x + y;
    return r;
  }
  let g = f(1, 2); 
  g.next();   // {value : 3, done : false}
  g.next(1);  // {value : 1, done : true}
  // 相当于把 let r = yield x + y;
  // 替换成 let r = 1;
```
2. `throw()`将`yield`表达式替换成一个throw语句。
```js
  g.throw(new Error('报错'));  // Uncaught Error:报错
  // 相当于将 let r = yield x + y
  // 替换成 let r = throw(new Error('报错'));
```
3. `next()`将`yield`表达式替换成一个return语句。
```js
  g.return(2); // {value: 2, done: true}
  // 相当于将 let r = yield x + y
  // 替换成 let r = return 2;
```

####  yield* 表达式
用于在一个`Generator`中执行另一个`Generator`函数，如果没有使用`yield*`会没有效果。
```js
  function * a(){
    yield 1;
    yield 2;
  }
  function * b(){
    yield 3;
    yield * a();
    yield 4;
  }
  // 等同于
  function * b(){
    yield 3;
    yield 1;
    yield 2;
    yield 4;
  }
  for(let k of b()){console.log(k)}
  // 3
  // 1
  // 2
  // 4
```

#### 回调，Promise、Generator函数对比
```js
  // 回调
  f1(function(v1){
    f2(function(v2){
      f3(function(v3){
          // ... more and more
      })
    })
  })

  // 使用Promise 
  Promise.resolve(f1)
    .then(f2)
    .then(f3)
    .then(function(v4){
      // ...
    },function (err){
      // ...
    }).done();

  // 使用Generator
  function * f (v1){
    try{
      let v2 = yield f1(v1);
      let v3 = yield f1(v2);
      let v4 = yield f1(v3);
      // ...
    } catch(err){
      // console.log(err)
    }
  }
  function g (task){
    let obj = task.next(task.value);
    // 如果Generator函数未结束，就继续调用
    if(!obj.done){
      task.value = obj.value;
      g(task);
    }
  }
  g( f(initValue) );
```

#### 异步编程的使用
```js
  // fetch
  let fetch = require('node-fetch');
  function * f(){
    let url = 'http://www.baidu.com';
    let res = yield fetch(url);
    console.log(res.bio);
  }
  // 执行该函数
  let g = f();
  let result = g.next();
  // 由于fetch返回的是Promise对象，所以用then
  result.value.then(function(data){
    return data.json();
  }).then(function(data){
    g.next(data);
  });
```