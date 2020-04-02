---
title: ES6新特性三
date: 2019-02-19 22:31:56
tags:
- JS
categories:
- 前端
---

### ES6对象相关新特性

#### Object.is()
Object.is() 是判断两个值是否严格相等，ES5有`==`和`===`，但是它们都是有缺陷的，`==`会把两边的值先做类型转换，`===` 在比价`NAN`的时候竟然是false
```js
  NAN === NAN // false
  +0 === -0 // true

  Object.is({}, {}) // false
  Object.is(NAN, NAN) // true
  Object.is(+0, -0) // false
```
<!-- more -->
#### Object.assign()
Object.assign()方法用于对象的合并，将原对象的所有可枚举属性复制到目标对象。
1. 基本用法，
```js
  const a = {a: 1};
  const b = {b: 1};
  Object.assign(a, b); // {a:1, b:1} b就是原对象， a就是目标对象
  // 如果原对象，有和目标对象重复的属性，那原对象的属性对应的值会覆盖目标的
  Object.assign({a:1}, {a: 3, b: 1}) // {a: 3, b: 1}
```
2. 若参数不是对象，则先转成对象后返回, 由于undefined或NaN无法转成对象，所以做为参数会报错。
```js
  Object.assign(2) // Number(2)
```
3. Object.assign()只是浅拷贝，愿对象的属性的
```js
  const a = {a: 1};
  const b = {b: 1};
  Object.assign(a, b);
  b.b = 4
  // b => { b: 4} 
  // 但是a 还是 {a: 1, b: 1}
  const a1 = {a: 1}
  const b1 = {b: {a: 1}}
  Object.assign(a1, b1);
  b1.b.a = 4
  // 这下a => {a: 1, b: {a: 4}}
```

4. 数组的特殊性
```js
  Object.assign([4,5,6], [9,1]) // [9,1,6]
  // 先把数组当对象，下标是键、下标对应的值为键值, 
```

### Set和Map

#### Set
Set 和数组很像，但是所有成员的值唯一。所以一般会使用Set来去重.
1. 一般数组的长度都是使用length,Set是size
2. Set的构造函数接受一个参数，参数必须是符合Iterator的数据
3. Set的方法
  ```js
    const s = new Set([1,2,3])
    s.add(4)
    s.delete(4)
    s.has(4)
    s.clear()
  ```
4. 注意Set不比较值的类型，所以
  ```js
    s.add(5)
    s.add('5') // '5'会被添加
  ```
5. Set 是没有 键名的，只有键值， 所以 keys() 和 values() 结果一致
  ```js
    const s = new Set([1, 2, 3])
    s.entries() // SetIterator {1 => 1, 2 => 2, 3 => 3}
    s.keys() // SetIterator {1, 2, 3}
    s.values() // SetIterator {1, 2, 3}
    s.forEach((k,v,s) => console.log(k,v,s)) // k === v, s 是原set
  ```

#### Map
因为js对象的键名只能使用字串，所以ES6添加可以使用任何类型的值作为键名的Map
1. Map 基本使用
```js
  const m = new Map();
  m.set('xx', {})
  const b = {a: 1};
  m.set(b, 4);
  m.size;
  m.get(b);
  m.has(b);
  m.delete('xx');
  m.clear();
```
2. Map的Iterator
  - keys()：返回键名的遍历器。
  - values()：返回键值的遍历器。
  - entries()：返回所有成员的遍历器。
  - forEach()：遍历 Map 的所有成员。
```js
  // 传入数组作为参数，指定键值对的数组。
  const a = new Map([
    ['name','leo'],
    ['age',18]
  ]);

  for (let i of a.keys()){...};
  for (let i of a.values()){...};
  for (let i of a.entries()){...};
  a.forEach((v,k,m)=>{
    console.log(`key:${k},value:${v},map:${m}`)
  })
```