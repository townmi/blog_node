---
title: ES6新数据类型Symbol
date: 2019-02-24 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6新数据类型Symbol

#### Symbol简单介绍
Symbol作为一种新的原始数据类型，表示独一无二的值，主要是为了防止属性名冲突。
- Symbol 是不可以使用`new`的, 因为Symbol不是对象，是一个原始类型
- Symbol 都是不想等的，即使参数一致
```js
  // 没有参数
  Symbol() === Symbol(); // false 

  // 有参数
  Symbol('abc') === Symbol('abc');// false 
```
<!-- more --->
- Symbol 不是字符串，它不能和其他类型的值计算
```js
  const s = Symbol('hello');
  `${s} world!`;// 报错
  // 但是可以显示转换为string
  String(s); // "Symbol(hello)"
  s.toString(); // "Symbol(hello)"
```
- Symbol 可以转字符串、布尔值，但是不能转数字
```js
  const a = Symbol();
  Boolean(a); // true
  !a;        // false

  Number(a); // TypeError
  a + 1 ;    // TypeError
```

#### Symbol的应用

1. Symbol 作为属性名称，防止同名属性，还有防止键被改写或覆盖。
```js
  const o = {}
  const a1 = Symbol("a");
  o[a1] = 1;
  const a2 = Symbol("a");
  o[a2] = 2;
  console.log(o) // {Symbol(a): 1, Symbol(a): 2}
  // 需要注意的是，Symbol作为属性名，不能使用点操作属性，需要使用方括号[]
```
2. Symbol 可以用来定义常量, 消除魔术字符串
```js
  const j = {
    isHarry: Symbol('Harry'),
    isLie: Symbol('Harry'),
  }
  const s = (s) => {
    if (s === j.isHarry) {
      //...
    }
  }
  s(j.isHarry);
```
3. Symbol作为属性名，不出现在for...in、for...of循环，也不被Object.keys()、Object.getOwnPropertyNames()、JSON.stringify()返回。
```js
  const a = Symbol('aa'), b= Symbol('bb');
  const obj = {
    [a]: '11',
    [b]: '22'
  }
  for (const k of Object.values(obj)){console.log(k)}
```
4. Object.getOwnPropertySymbols方法返回一个数组，包含当前对象所有用做属性名的Symbol值。
```js
 Object.getOwnPropertySymbols(obj);
 // [Symbol(aa), Symbol(bb)]
```
5. Reflect.ownKeys方法可以返回所有类型的键名，包括常规键名和 Symbol 键名。
```js
  const obj2 = {
    [a]: '11',
    [b]: '22',
    c: '333'
  };
  Reflect.ownKeys(obj2); // ["c", Symbol(aa), Symbol(bb)]
```

#### Symbol的特殊方法
1. `Symbol.for`,接受一个字符串作为参数,
```js
  Symbol.for('aaa') === Symbol.for('aaa') // true
  // 和Symbol()的区别很明显吧
```
2. `Symbol.keyFor()` 返回一个Symbol类型的key
```js
  Symbol.keyFor(Symbol()) // undefined
  Symbol.keyFor(Symbol.for()) // "undefined", 注意是字符串undefied,
  Symbol.keyFor(Symbol.for('aaa')) // "aaa"
```

#### 其他已经内置的Symbol值
先来理解下什么概念，首先内置的Symbol值, 并不是你对一个对象操作它的Symbol值,而是你在使用某些方法操作这个对象的时候，这个对象的Symbol值,会被触发。下面来看看，具体的这些Symbol值
1. `Symbol.hasInstance`,是一个方法，当一个实例进行 instanceof 一个对象的时候，判断这个实例是不是这个对象的实例时，这个对象的 `Symbol.hasInstance` 就会被触发. 有点绕
```js
  class C {
    [Symbol.hasInstance](a){
      return a instanceof Array;
    }
  }
  [] instanceof new C(); // true
  [] instanceof C; // false
  // 注意是 判断这个实例是不是这个对象的实例
```
2. `Symbol.isConcatSpreadable`, 是一个属性，当数组的`concat`方法操作时，会先判断每个操作对象的[Symbol.isConcatSpreadable]属性，如果时`false`，操作的该对象不可以展开的
```js
  const a = [1], b = [2], c = [3];
  a.concat(b, c) // [1, 2, 3]
  a[Symbol.isConcatSpreadable] = false;
  c[Symbol.isConcatSpreadable] = false;
  // 这个时候a, c 都不可以展开
  a.concat(b, c) // [Array(1), 2, Array(1)]
```
3. `Symbol.species`, 是一个static属性, 默认指向类的构造函数，在创建衍生对象时会使用，使用时需要用get取值器.
```js
  class P extends Array{}
  let a = new P(1,2,3);
  let b = a.map(x => x);

  b instanceof Array; // true
  b instanceof P; // true
  // 其实 b 不是P 的实例啊

  class P extends Array {
    static get [Symbol.species]() {
      return Array;
    }
  }
  a = new P(1,2,3);
  b = a.map(x => x);

  b instanceof Array; // true
  b instanceof P; // false

```
4. `Symbol.match` 、`Symbol.replace`、`Symbol.search`、`Symbol.split`， 都是方法，对象被字符串对应的`match`、`replace`、`search`、`split`调用的时候，这些方法会被触发
```js
  let a = {};
  a[Symbol.replace] = (...s) => {
    console.log(s);
    return 1;
  };

  c = 'h'.replace(a, 'w');// ['h', 'w']
  // c => 1;
  class P {
    constructor(val) {
      this.val = val;
    }
    [Symbol.search](s){
      return s.indexOf(this.val);
    }
  }
  'hileo'.search(new P('leo')); // 2
  // 其他的同理
```
5. `Symbol.iterator`, 是一个方法，这个很重要，后面的迭代器和Generator函数都会涉及，当对象进行for...of循环时，会调用Symbol.iterator方法，返回该对象的默认遍历器。
```js
  class P {
    *[Symbol.iterator]() {
    let i = 0;
      while(this[i] !== undefined ) {
        yield this[i];
        ++i;
      }
    }
  }
  let a = new P();
  
  a[0] = 1;
  a[1] = 2;

  for (const k of a){
    console.log(k);
  }
  // 1 2
```
6. `Symbol.toPrimitive` 一个方法，当对象需要被转换成原始数据的时候，会触发这个对象的`Symbol.toPrimitive`方法
```js
  let obj = {
    [Symbol.toPrimitive](hint) {
      switch (hint) {
        case 'number':
          return 123;
        case 'string':
          return 'str';
        case 'default':
          return 'default';
        default:
          throw new Error();
      }
    }
  };

  2 * obj // 246
  3 + obj // '3default'
  obj == 'default' // true
  String(obj) // 'str'
```
7. `Symbol.toStringTag`, 一个get属性，返回字符串，当这个属性存在的时候，当调用该对象的toString()时，它的返回值会出现在toString方法返回的字符串之中。
```js
  // 例一
  ({[Symbol.toStringTag]: 'Foo'}.toString())
  // "[object Foo]"

  // 例二
  class Collection {
    get [Symbol.toStringTag]() {
      return 'xxx';
    }
  }
  let x = new Collection();
  Object.prototype.toString.call(x) // "[object xxx]"
```
8. `Symbol.unscopables`,是一个get属性,返回对象，对象是 这个类的方法为key，值都是布尔值. 当布尔值是true的情况下，在`with`作用域下，这些方法会被排除.
```js
  class CC {
    foo() { console.log(1); }
    bar() { console.log(2); }
    get [Symbol.unscopables]() {
      return { foo: true, bar: false };
    }
  }
  const foo = function () { console.log(2); };
  const bar = function () { console.log(1); };

  with (CC.prototype) {
    foo(); // 2
    bar(); // 2
  }
```