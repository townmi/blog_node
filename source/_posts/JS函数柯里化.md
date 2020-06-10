---
title: JS函数柯里化
date: 2019-08-19 19:37:38
tags:
- JS
categories:
- 前端
---

### JS函数柯里化

面试的时候，我们经常遇到这样的题目
> 请写一个方法，实现下面的功能`sum(1)(2)(3) === 6;`
首先来分析下这道题，实现一个`sum`函数并依次传入参数执行，得到最终的结果。通过题目很容易得到的结论是，把传入的参数相乘就能够得到需要的结果，也就是 1+2+3 = 6。

<!-- more -->

#### 简单的实现
通过嵌套返回函数
```js
  const sum = (a) => {
    return (b) => {
      return (c) => {
        return a+b+c;
      }
    }
  }
```
上面的实现方案存在的缺陷：
1. 代码不够优雅，实现步骤需要一层一层的嵌套函数。
2. 可扩展性差，假如是要实现`sum(1)(2)(3)...(n)`这样的功能，那就得嵌套`n`层函数。

那么有没有更好的解决方案，答案是，使用函数式编程中的函数柯里化实现

### 函数柯里化
函数柯里化指的是将能够接收多个参数的函数转化为接收单一参数的函数，并且返回接收余下参数且返回结果的新函数的技术。
函数柯里化的主要作用和特点就是参数复用、提前返回和延迟执行

#### 举个例子
封装兼容现代浏览器和`IE`浏览器的事件监听的方法，正常情况下封装是这样的
```js
  var addEvent = function(el, type, fn, capture) {
    if (window.addEventListener) {
      el.addEventListener(type, function(e) {
        fn.call(el, e);
      }, capture);
    } else {
      el.attachEvent('on' + type, function(e) {
        fn.call(el, e);
      })
    }
  }
```
该封装的方法存在的不足是，每次写监听事件的时候调用`addEvent`函数，都会进行`if else`的兼容性判断。事实上在代码中只需要执行一次兼容性判断就可以了，后续的事件监听就不需要再去判断兼容性了。那么怎么用函数柯里化优化这个封装函数
```js
  var addEvent = (function() {
    if (window.addEventListener) {
      return  function(el, type, fn, capture) {
        el.addEventListener(type, function(e) {
          fn.call(el, e);
        }, capture);
      }
    } else {
      return  function(el, type, fn) {
        el.attachEvent('on' + type, function(e) {
          fn.call(el, e);
        })
      }
    }
  })();
```
`js`引擎在执行该段代码的时候就会进行兼容性判断，并且返回需要使用的事件监听封装函数。这里使用了函数柯里化的两个特点：提前返回和延迟执行

柯里化另一个典型的应用场景就是`bind`函数的实现。使用了函数柯里化的两个特点：参数复用和提前返回。
```js
  Function.prototype.bind = function() {
    var fn = this;
    var args = Array.prototye.slice.call(arguments);
    var context = args.shift();
    return function(){
      return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));
    };
  };
```

#### 柯里化如何实现`sum`

```js
  function curry(fn, args) {
    var length = fn.length;
    var args = args || [];
    return function(){
      newArgs = args.concat(Array.prototype.slice.call(arguments));
      if (newArgs.length < length){
        return curry.call(this, fn, newArgs);
      } else {
        return fn.apply(this, newArgs);
      }
    }
  }
  function sumFn(a, b, c) {
    return a + b + c;
  }

  sum = curry(sumFn);
  sum(1)(2)(3); // 6

  // curry 没有其他因素可以简单写成
  function curry (func) {
    return function () {
      return arguments.length === func.length ? func(...arguments) : curry(func).bind(null, ...arguments)
    }
  }
  // 没有其他因素也可以简单写成
  var curry = fn => judge = (...args) => args.length === fn.length ? fn(...args) : (arg) => judge(...args, arg)
```
这里根据函数`fn`的参数数量进行判断，直到传入的数量等于`fn`函数需要的参数数量才会返回`fn`函数的最终运行结果，但是这种方式都太依赖参数数量了.
如果我们希望参数不是固定的那该如何处理呢？
这里主要有一个知识点，那就是函数的隐式转换，涉及到`toString`和`valueOf`两个方法，如果直接对函数进行计算，那么会先把函数转换为字符串，之后再参与到计算中，利用这两个方法我们可以对函数进行修改
```js
  var curry = function(fn) {
    var func = function() {
      var _args = [].slice.call(arguments, 0);
      var func1 = function() {
        [].push.apply(_args, arguments)
        return func1;
      }
      func1.toString = func1.valueOf = function() {
        return fn.apply(fn, _args);
      }
      return func1;
    }
    return func;
  }
  var sumFn = function() {
    return [].reduce.call(arguments, function(a, b) {
      return a + b;
    })
  }
  sum = curry(sumFn);
  sum(1)(2)(3)(4)(8); // f 18
  sum(1)(2)(3)(4)(8).toString(); // 18

  // 第二种
  const add = sum => {
    const fn = n => add(n + sum);
    fn.valueOf = () => sum;
    return fn;
  }
  add(1).valueOf(); // 1;
  add(1)(2).valueOf(); // 3;
  add(1)(2)(3).valueOf(); // 6;
```

#### 总结
1. 参数复用, `curry`是可以传参数的，这些参数就可以重复利用了
2. 提前返回, `addEvent`就是很好的例子, 初始`addEvent`的执行其实值实现了部分的应用（只有一次的`if...else if...`判定），而剩余的参数应用都是其返回函数实现的，典型的柯里化
3. 延迟执行,其实和函数的`bind`操作符差不多


#### 一道小题目
```js
  // 验证 输出全部都是 [1, 2, 3, 4, 5]
  fn(1, 2, 3, 4, 5);
  fn(_, 2, 3, 4, 5)(1);
  fn(1, _, 3, 4, 5)(2);
  fn(1, _, 3)(_, 4)(2)(5);
  fn(1, _, _, 4)(_, 3)(2)(5);
  fn(_, 2)(_, _, 4)(1)(3)(5)

  // 方案
  function curry(fn, args, holes) {
    length = fn.length;

    args = args || [];

    holes = holes || [];

    return function() {

        var _args = args.slice(0),
          _holes = holes.slice(0),
          argsLen = args.length,
          holesLen = holes.length,
          arg, i, index = 0;

        for (i = 0; i < arguments.length; i++) {
          arg = arguments[i];
          // 处理类似 fn(1, _, _, 4)(_, 3) 这种情况，index 需要指向 holes 正确的下标
          if (arg === _ && holesLen) {
              index++
              if (index > holesLen) {
                _args.push(arg);
                _holes.push(argsLen - 1 + index - holesLen)
              }
          }
          // 处理类似 fn(1)(_) 这种情况
          else if (arg === _) {
            _args.push(arg);
            _holes.push(argsLen + i);
          }
          // 处理类似 fn(_, 2)(1) 这种情况
          else if (holesLen) {
            // fn(_, 2)(_, 3)
            if (index >= holesLen) {
              _args.push(arg);
            }
            // fn(_, 2)(1) 用参数 1 替换占位符
            else {
              _args.splice(_holes[index], 1, arg);
              _holes.splice(index, 1)
            }
          }
          else {
            _args.push(arg);
          }

        }
        if (_holes.length || _args.length < length) {
          return curry.call(this, fn, _args, _holes);
        } else {
          return fn.apply(this, _args);
        }
    }
  }
  var _ = {};
  var fn = curry(function(a, b, c, d, e) {
    console.log([a, b, c, d, e]);
  });
```