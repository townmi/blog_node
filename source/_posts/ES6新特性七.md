---
title: ES6新特性七
date: 2019-04-29 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6新特性Proxy
`proxy` 用于修改某些操作的默认行为，可以理解为一种拦截外界对目标对象访问的一种机制，从而对外界的访问进行过滤和修改，即代理某些操作，也称“代理器”。

<!-- more -->

#### Proxy 的简单使用
```js
  let a = new Proxy({ c: 12 }, {
    get: function (target, handler, receiver) {
      console.log(target, handler, receiver);
        return 'leo';
    }
  })

  a.c; // leo
  a.a; // leo
```

#### Proxy 13种拦截

1. `get(target, propKey, receiver)` 拦截对象属性的读取，比如`proxy.foo`和`proxy['foo']`
2. `set(target, propKey, value, receiver)` 拦截对象属性的设置，比如`proxy.foo = v`或`proxy['foo'] = v`，返回一个布尔值.
3. `has(target, propKey)` 拦截`propKey in proxy`的操作，返回一个布尔值.
4. `apply(target, object, args)` 拦截`Proxy`实例作为函数调用的操作，比如`proxy(...args)`、`proxy.call(object, ...args)`、`proxy.apply(...)`。
5. `construct(target, args)` 拦截`Proxy`实例作为构造函数调用的操作，比如`new proxy(...args)`。
6. `ownKeys(target)` 拦截`Object.getOwnPropertyNames(proxy)`、`Object.getOwnPropertySymbols(proxy)`、`Object.keys(proxy)`、`for...in`循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而`Object.keys()`的返回结果仅包括目标对象自身的可遍历属性。
7. `deleteProperty(target, propKey)` 拦截`delete proxy[propKey]`的操作，返回一个布尔值.
8. `defineProperty(target, propKey, propDesc)` 拦截`Object.defineProperty(proxy, propKey, propDesc）`、`Object.defineProperties(proxy, propDescs)`，返回一个布尔值。
9. `getOwnPropertyDescriptor(target, propKey)` 拦截`Object.getOwnPropertyDescriptor(proxy, propKey)`，返回属性的描述对象.
10. `preventExtensions(target)` 拦截`Object.preventExtensions(proxy)`，返回一个布尔值
11. `getPrototypeOf(target)` 拦截`Object.getPrototypeOf(proxy)`，返回一个对象。
12. `isExtensible(target)` 拦截`Object.isExtensible(proxy)`，返回一个布尔值。
13. `setPrototypeOf(target, proto)` 拦截`Object.setPrototypeOf(proxy, proto)`，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。

#### Proxy.revocable()方法
`Proxy.revocable`方法返回一个可取消的`Proxy`实例
```js
  let target = {};
  let handler = {};

  let {proxy, revoke} = Proxy.revocable(target, handler);

  proxy.foo = 123;
  proxy.foo // 123

  revoke();
  proxy.foo // TypeError: Revoked
```
`Proxy.revocable`的一个使用场景是，目标对象不允许直接访问，必须通过代理访问，一旦访问结束，就收回代理权，不允许再次访问。

#### this的问题
虽然`Proxy`可以代理针对目标对象的访问，但它不是目标对象的透明代理，即不做任何拦截的情况下，也无法保证与目标对象的行为一致。主要原因就是在`Proxy`代理的情况下，目标对象内部的`this`关键字会指向`Proxy`代理
```js
  const target = {
    m: function () {
      console.log(this === proxy);
    }
  };
  const handler = {};

  const proxy = new Proxy(target, handler);

  target.m() // false
  proxy.m()  // true
```
下面是一个例子，由于`this`指向的变化，导致`Proxy`无法代理目标对象
```js
  const _name = new WeakMap();
  class Person {
    constructor(name) {
      _name.set(this, name);
    }
    get name() {
      return _name.get(this);
    }
  }
  const jane = new Person('Jane');
  jane.name // 'Jane'
  const proxy = new Proxy(jane, {});
  proxy.name // undefined
```
此外，有些原生对象的内部属性，只有通过正确的`this`才能拿到，所以`Proxy`也无法代理这些原生对象的属性
```js
  const target = new Date();
  const handler = {};
  const proxy = new Proxy(target, handler);

  proxy.getDate();
  // TypeError: this is not a Date object.
```
上面代码中，`getDate`方法只能在`Date`对象实例上面拿到，如果`this`不是`Date`对象实例就会报错。这时，`this`绑定原始对象，就可以解决这个问题
```js
  const target = new Date('2015-01-01');
  const handler = {
    get(target, prop) {
      if (prop === 'getDate') {
        return target.getDate.bind(target);
      }
      return Reflect.get(target, prop);
    }
  };
  const proxy = new Proxy(target, handler);

  proxy.getDate() // 1
```

### Proxy 13种拦截详解

#### get
`get`方法用于拦截某个属性的读取操作，可以接受三个参数，依次为目标对象、属性名和`proxy`实例本身（严格地说，是操作行为所针对的对象），其中最后一个参数可选
```js
  var person = {
    name: "张三"
  };

  var proxy = new Proxy(person, {
    get: function(target, propKey) {
      if (propKey in target) {
        return target[propKey];
      } else {
        throw new ReferenceError("Prop name \"" + propKey + "\" does not exist.");
      }
    }
  });

  proxy.name // "张三"
  proxy.age // 抛出一个错误
```
`get`方法可以继承
```js
  let proto = new Proxy({}, {
    get(target, propertyKey, receiver) {
      console.log('GET ' + propertyKey);
      return target[propertyKey];
    }
  });

  let obj = Object.create(proto);
  obj.foo // "GET foo"
```
上面代码中，拦截操作定义在`Prototype`对象上面，所以如果读取`obj`对象继承的属性时，拦截会生效。
```js
  // 利用 Proxy，可以将读取属性的操作（get），转变为执行某个函数，从而实现属性的链式操作
  var pipe = function (value) {
    var funcStack = [];
    var oproxy = new Proxy({} , {
      get : function (pipeObject, fnName) {
        if (fnName === 'get') {
          return funcStack.reduce(function (val, fn) {
            return fn(val);
          },value);
        }
        funcStack.push(window[fnName]);
        return oproxy;
      }
    });

    return oproxy;
  }

  var double = n => n * 2;
  var pow    = n => n * n;
  var reverseInt = n => n.toString().split("").reverse().join("") | 0;

  pipe(3).double.pow.reverseInt.get; // 63
```
下面是一个`get`方法的第三个参数的例子，它总是指向原始的读操作所在的那个对象，一般情况下就是`Proxy`实例
```js
  const proxy = new Proxy({}, {
    get: function(target, key, receiver) {
      return receiver;
    }
  });

  const d = Object.create(proxy);
  d.a === d // true
```
上面代码中，`d`对象本身没有`a`属性，所以读取`d.a`的时候，会去`d`的原型`proxy`对象找。这时，`receiver`就指向`d`，代表原始的读操作所在的那个对象
```js
  // 如果一个属性不可配置（configurable）且不可写（writable），则 Proxy 不能修改该属性，否则通过 Proxy 对象访问该属性会报错。
  const target = Object.defineProperties({}, {
    foo: {
      value: 123,
      writable: false,
      configurable: false
    },
  });

  const handler = {
    get(target, propKey) {
      return 'abc';
    }
  };

  const proxy = new Proxy(target, handler);

  proxy.foo
  // TypeError: Invariant check failed
```

#### set
`set`方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和`Proxy`实例本身，其中最后一个参数可选
```js
  // 假定Person对象有一个age属性，该属性应该是一个不大于 200 的整数，那么可以使用Proxy保证age的属性值符合要求
  let validator = {
    set: function(obj, prop, value) {
      if (prop === 'age') {
        if (!Number.isInteger(value)) {
          throw new TypeError('The age is not an integer');
        }
        if (value > 200) {
          throw new RangeError('The age seems invalid');
        }
      }

      // 对于满足条件的 age 属性以及其他属性，直接保存
      obj[prop] = value;
    }
  };

  let person = new Proxy({}, validator);

  person.age = 100;

  person.age // 100
  person.age = 'young' // 报错
  person.age = 300 // 报错
```
```js
  // 有时，我们会在对象上面设置内部属性，属性名的第一个字符使用下划线开头，表示这些属性不应该被外部使用。结合get和set方法，就可以做到防止这些内部属性被外部读写。
  const handler = {
    get (target, key) {
      invariant(key, 'get');
      return target[key];
    },
    set (target, key, value) {
      invariant(key, 'set');
      target[key] = value;
      return true;
    }
  };
  function invariant (key, action) {
    if (key[0] === '_') {
      throw new Error(`Invalid attempt to ${action} private "${key}" property`);
    }
  }
  const target = {};
  const proxy = new Proxy(target, handler);
  proxy._prop
  // Error: Invalid attempt to get private "_prop" property
  proxy._prop = 'c'
  // Error: Invalid attempt to set private "_prop" property
```
`set`方法的第四个参数`receiver`，指的是原始的操作行为所在的那个对象，一般情况下是`proxy`实例本身，请看下面的例子
```js
  const handler = {
    set: function(obj, prop, value, receiver) {
      obj[prop] = receiver;
    }
  };
  const proxy = new Proxy({}, handler);
  const myObj = {};
  Object.setPrototypeOf(myObj, proxy);

  myObj.foo = 'bar';
  myObj.foo === myObj // true
```
注意，如果目标对象自身的某个属性，不可写且不可配置，那么`set`方法将不起作用
```js
  const obj = {};
  Object.defineProperty(obj, 'foo', {
    value: 'bar',
    writable: false,
  });

  const handler = {
    set: function(obj, prop, value, receiver) {
      obj[prop] = 'baz';
    }
  };

  const proxy = new Proxy(obj, handler);
  proxy.foo = 'baz';
  proxy.foo // "bar"
```
注意，严格模式下，`set`代理如果没有返回`true`，就会报错
```js
  'use strict';
  const handler = {
    set: function(obj, prop, value, receiver) {
      obj[prop] = receiver;
      // 无论有没有下面这一行，都会报错
      return false;
    }
  };
  const proxy = new Proxy({}, handler);
  proxy.foo = 'bar';
  // TypeError: 'set' on proxy: trap returned falsish for property 'foo'
```

#### has
`has`方法用来拦截`HasProperty`操作，即判断对象是否具有某个属性时，这个方法会生效。典型的操作就是`in`运算符。
`has`方法可以接受两个参数，分别是目标对象、需查询的属性名。
```js
  // 下面的例子使用has方法隐藏某些属性，不被in运算符发现
  var handler = {
    has (target, key) {
      if (key[0] === '_') {
        return false;
      }
      return key in target;
    }
  };
  var target = { _prop: 'foo', prop: 'foo' };
  var proxy = new Proxy(target, handler);
  '_prop' in proxy // false
```
如果原对象不可配置或者禁止扩展，这时has拦截会报错, 如果某个属性不可配置（或者目标对象不可扩展），则has方法就不得“隐藏”**（即返回`false`）**目标对象的该属性
```js
  var obj = { a: 10 };
  Object.preventExtensions(obj);

  var p = new Proxy(obj, {
    has: function(target, prop) {
      return false;
    }
  });

  'a' in p // TypeError is thrown
```
值得注意的是，**`has`方法拦截的是`HasProperty`操作，而不是`HasOwnProperty`操作**，即`has`方法不判断一个属性是对象自身的属性，还是继承的属性。
另外，虽然`for...in`循环也用到了`in`运算符，但是`has`拦截对`for...in`循环不生效
```js
  let stu1 = {name: '张三', score: 59};
  let stu2 = {name: '李四', score: 99};

  let handler = {
    has(target, prop) {
      if (prop === 'score' && target[prop] < 60) {
        console.log(`${target.name} 不及格`);
        return false;
      }
      return prop in target;
    }
  }

  let oproxy1 = new Proxy(stu1, handler);
  let oproxy2 = new Proxy(stu2, handler);

  'score' in oproxy1
  // 张三 不及格
  // false

  'score' in oproxy2
  // true

  for (let a in oproxy1) {
    console.log(oproxy1[a]);
  }
  // 张三
  // 59

  for (let b in oproxy2) {
    console.log(oproxy2[b]);
  }
  // 李四
  // 99
```

#### apply
`apply方法拦截函数的调用、`call`和`apply`操作。
`apply`方法可以接受三个参数，分别是目标对象、目标对象的上下文对象（this）和目标对象的参数数组
```js
  var target = function () { return 'I am the target'; };
  var handler = {
    apply: function () {
      return 'I am the proxy';
    }
  };

  var p = new Proxy(target, handler);

  p()
  // "I am the proxy"
```
```js
  var twice = {
    apply (target, ctx, args) {
      return Reflect.apply(...arguments) * 2;
    }
  };
  function sum (left, right) {
    return left + right;
  };
  var proxy = new Proxy(sum, twice);
  proxy(1, 2) // 6
  proxy.call(null, 5, 6) // 22
  proxy.apply(null, [7, 8]) // 30
```
上面代码中，每当执行proxy函数（直接调用或call和apply调用），就会被apply方法拦截。
```js
  // 另外，直接调用Reflect.apply方法，也会被拦截
  Reflect.apply(proxy, null, [9, 10]) // 38 
```

#### construct
`construct`方法用于拦截`new`命令，下面是拦截对象的写法。
`construct`方法可以接受三个参数,分别是目标对象、构造函数的参数对象 和 造实例对象时，new命令作用的构造函数
```js
  var p = new Proxy(function () {}, {
    construct: function(target, args, newTarget) {
      console.log('called: ' + args.join(', '));
      return { value: args[0] * 10 };
    }
  });

  (new p(1)).value
  // "called: 1"
  // 10
```
`construct`方法返回的必须是一个对象，否则会报错
```js
  var p = new Proxy(function() {}, {
    construct: function(target, argumentsList) {
      return 1;
    }
  });

  new p() // 报错
  // Uncaught TypeError: 'construct' on proxy: trap returned non-object ('1')
```

#### ownKeys
`ownKeys`方法返回的数组成员，只能是字符串或`Symbol`值。如果有其他类型的值，或者返回的根本不是数组，就会报错。
```js
  var obj = {};
  var p = new Proxy(obj, {
    ownKeys: function(target) {
      return [123, true, undefined, null, {}, []];
    }
  });
  Object.getOwnPropertyNames(p)
  // Uncaught TypeError: 123 is not a valid property name
```
如果目标对象自身包含不可配置的属性，则该属性必须被`ownKeys`方法返回，否则报错。
```js
  var obj = {};
  Object.defineProperty(obj, 'a', {
    configurable: false,
    enumerable: true,
    value: 10 }
  );
  var p = new Proxy(obj, {
    ownKeys: function(target) {
      return ['b'];
    }
  });
  Object.getOwnPropertyNames(p)
  // Uncaught TypeError: 'ownKeys' on proxy: trap result did not include 'a'
```
另外，如果目标对象是不可扩展的（`non-extensible`），这时`ownKeys`方法返回的数组之中，必须包含原对象的所有属性，且不能包含多余的属性，否则报错。
```js
  var obj = {
    a: 1
  };
  Object.preventExtensions(obj);
  var p = new Proxy(obj, {
    ownKeys: function(target) {
      return ['a', 'b'];
    }
  });
  Object.getOwnPropertyNames(p)
  // Uncaught TypeError: 'ownKeys' on proxy: trap returned extra keys but proxy target is non-extensible
```

`ownKeys`方法用来拦截对象自身属性的读取操作。具体来说，拦截以下操作。
- `Object.getOwnPropertyNames()`
  ```js
    var p = new Proxy({}, {
      ownKeys: function(target) {
        return ['a', 'b', 'c'];
      }
    });
    Object.getOwnPropertyNames(p)
    // [ 'a', 'b', 'c' ]
  ```
- `Object.getOwnPropertySymbols()`
- `Object.keys()`
  ```js
    // Object.keys()
    let target = {
      a: 1,
      b: 2,
      c: 3
    };
    let handler = {
      ownKeys(target) {
        return ['a'];
      }
    };
    let proxy = new Proxy(target, handler);
    Object.keys(proxy)
    // [ 'a' ]
    // 注意，使用Object.keys方法时，有三类属性会被ownKeys方法自动过滤，不会返回。
    // 目标对象上不存在的属性
    // 属性名为 Symbol 值
    // 不可遍历（enumerable）的属性
    let target = {
      a: 1,
      b: 2,
      c: 3,
      [Symbol.for('secret')]: '4',
    };
    Object.defineProperty(target, 'key', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: 'static'
    });
    let handler = {
      ownKeys(target) {
        return ['a', 'd', Symbol.for('secret'), 'key'];
      }
    };
    let proxy = new Proxy(target, handler);
    Object.keys(proxy)
    // ['a']
    // 上面代码中，ownKeys方法之中，显式返回不存在的属性（d）、Symbol 值（Symbol.for('secret')）、不可遍历的属性（key），结果都被自动过滤掉。
  ```
- `for...in`循环
  ```js
    const obj = { hello: 'world' };
    const proxy = new Proxy(obj, {
      ownKeys: function () {
        return ['a', 'b'];
      }
    });

    for (let key in proxy) {
      console.log(key); // 没有任何输出
    }
  ```



#### deleteProperty
`deleteProperty`方法用于拦截`delete`操作，如果这个方法抛出错误或者返回`false`，当前属性就无法被`delete`命令删除
```js
  var handler = {
    deleteProperty (target, key) {
      invariant(key, 'delete');
      delete target[key];
      return true;
    }
  };
  function invariant (key, action) {
    if (key[0] === '_') {
      throw new Error(`Invalid attempt to ${action} private "${key}" property`);
    }
  }

  var target = { _prop: 'foo' };
  var proxy = new Proxy(target, handler);
  delete proxy._prop
  // Error: Invalid attempt to delete private "_prop" property
```
**注意，目标对象自身的不可配置（`configurable`）的属性，不能被`deleteProperty`方法删除，否则报错。**

#### defineProperty
`defineProperty`方法拦截了`Object.defineProperty`操作
```js
  var handler = {
    defineProperty (target, key, descriptor) {
      return false;
    }
  };
  var target = {};
  var proxy = new Proxy(target, handler);
  proxy.foo = 'bar' // 不会生效
```
注意，如果目标对象不可扩展（`non-extensible`），则`defineProperty`不能增加目标对象上不存在的属性，否则会报错。另外，如果目标对象的某个属性不可写（`writable`）或不可配置（`configurable`），则`defineProperty`方法不得改变这两个设置。


#### getOwnPropertyDescriptor
`getOwnPropertyDescriptor`方法拦截`Object.getOwnPropertyDescriptor()`，返回一个属性描述对象或者`undefined`
```js
  // handler.getOwnPropertyDescriptor方法对于第一个字符为下划线的属性名会返回undefined
  var handler = {
    getOwnPropertyDescriptor (target, key) {
      if (key[0] === '_') {
        return;
      }
      return Object.getOwnPropertyDescriptor(target, key);
    }
  };
  var target = { _foo: 'bar', baz: 'tar' };
  var proxy = new Proxy(target, handler);
  Object.getOwnPropertyDescriptor(proxy, 'wat')
  // undefined
  Object.getOwnPropertyDescriptor(proxy, '_foo')
  // undefined
  Object.getOwnPropertyDescriptor(proxy, 'baz')
  // { value: 'tar', writable: true, enumerable: true, configurable: true }
```

#### preventExtensions
`preventExtensions`方法拦截`Object.preventExtensions()`。该方法必须返回一个布尔值，否则会被自动转为布尔值。
这个方法有一个限制，只有目标对象不可扩展时（即`Object.isExtensible(proxy)`为`false`），`proxy.preventExtensions`才能返回true，否则会报错
```js
  var proxy = new Proxy({}, {
    preventExtensions: function(target) {
      return true;
    }
  });

  Object.preventExtensions(proxy)
  // Uncaught TypeError: 'preventExtensions' on proxy: trap returned truish but the proxy target is extensible
  // 上面代码中，proxy.preventExtensions方法返回true，但这时Object.isExtensible(proxy)会返回true，因此报错。
  // 为了防止出现这个问题，通常要在proxy.preventExtensions方法里面，调用一次Object.preventExtensions。
  var proxy = new Proxy({}, {
    preventExtensions: function(target) {
      console.log('called');
      Object.preventExtensions(target);
      return true;
    }
  });

  Object.preventExtensions(proxy)
  // "called"
  // Proxy {}
```

#### getPrototypeOf
`getPrototypeOf`方法主要用来拦截获取对象原型。具体来说，拦截下面这些操作。
- `Object.prototype.__proto__`
- `Object.prototype.isPrototypeOf()`
- `Object.getPrototypeOf()`
- `Reflect.getPrototypeOf()`
- `instanceof`
```js
  var proto = {};
  var p = new Proxy({}, {
    getPrototypeOf(target) {
      return proto;
    }
  });
  Object.getPrototypeOf(p) === proto // true
```
**注意，`getPrototypeOf`方法的返回值必须是对象或者`null`，否则报错。另外，如果目标对象不可扩展（`non-extensible`）， getPrototypeOf方法必须返回目标对象的原型对象**

#### isExtensible
`isExtensible`方法拦截`Object.isExtensible`操作。
```js
  var p = new Proxy({}, {
    isExtensible: function(target) {
      console.log("called");
      return true;
    }
  });

  Object.isExtensible(p)
  // "called"
  // true
  // 注意，该方法只能返回布尔值，否则返回值会被自动转为布尔值
  // 这个方法有一个强限制，它的返回值必须与目标对象的isExtensible属性保持一致，否则就会抛出错误
  Object.isExtensible(proxy) === Object.isExtensible(target)
  
  var p = new Proxy({}, {
    isExtensible: function(target) {
      return false;
    }
  });

  Object.isExtensible(p)
  // Uncaught TypeError: 'isExtensible' on proxy: trap result does not reflect extensibility of proxy target (which is 'true')
```

#### setPrototypeOf
`setPrototypeOf`方法主要用来拦截`Object.setPrototypeOf`方法
```js
  var handler = {
    setPrototypeOf (target, proto) {
      throw new Error('Changing the prototype is forbidden');
    }
  };
  var proto = {};
  var target = function () {};
  var proxy = new Proxy(target, handler);
  Object.setPrototypeOf(proxy, proto);
  // Error: Changing the prototype is forbidden
```
**注意，该方法只能返回布尔值，否则会被自动转为布尔值。另外，如果目标对象不可扩展（`non-extensible`），`setPrototypeOf`方法不得改变目标对象的原型**