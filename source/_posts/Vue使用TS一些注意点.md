---
title: Vue使用TypeScript一些注意点
date: 2020-05-15 22:31:56
tags:
- JS
categories:
- 前端
---

### Vue使用TypeScript一些注意点

目前`Vue`3.0还没有推出，但是希望在自己的项目中使用`TypeScript`，相信大家都遇到许多问题, 下面带大家来踩踩坑

<!-- more -->

#### vue文件中this类型问题
![this类型问题](/uploads/20200409/1.png)
为什么我们的`this`的type是`CombinedVueInstance<Vue, unknown, unknown, unknown, Readonly<Record<never, any>>>`
问题就在`computed`、`methods`里面，我们需要对`computed`、`methods`里面的属性和方法声明反回类型
```js
  export default Vue.extend({
    data() {
      return {
        name: '';
      }
    },
    computed: {
      cname(): string {
        const { name } = this;
        return `c${name}`;
      }
    },
    methods: {
      getName(): string {
        const { name } = this;
        return `get: ${name}`;
      }
    }
  })
```

#### Vue.prototype.method问题
在使用`Vue`开发的时候，我们喜欢给`Vue`的原型绑定全局方法, 这样，每个`Vue`组件都可以用这个方法，或者对象
```js
  // app.js
  Vue.prototype.$bus = new Vue();
  Vue.prototype.$axios = new Axios();
  //...
  // a.vue
  export default Vue.extend({
    methods: {
      sendEvent(): void {
        const { name } = this;
        this.$bus.$emit('name', name);
      }
    }
  });
  // 这个时候就会出现
  // Property '$bus' does not exist on type 'CombinedVueInstance<Vue, .....
```
确实如此啊，因为根本不知道`$bus`，从哪里来的，所以实例根本早不到这个方法，这种情况下，我们需要在`TypeScript`添加`types`
```js
  // vue.d.ts
  import Vue from 'vue';
  import { AxiosInstance } from 'axios';

  declare module 'vue/types/vue' {
    interface Vue {
      $bus: Vue;
    }
  }
```
`vue.d.ts`这个文件就是用来补充`Vue`里面确实的一些类型, 保证`TypeScript`能正确推断
一般在使用`TypeScript`开发项目的时候，我们需要`types`这个文件夹，来存放我们需要扩展或者指定的的类型文件

#### Vue props的问题
最近升级`TypeScript`到`3.9.2`，出现了下面的问题，问题是关于`Vue`里面`props`类型的问题
```js
  // Type of property 'some' circularly references itself in mapped type 'RecordPropsDefinition<{ some: any; }>'
```
查了下，好像是[TypeScript自己的BUG](!https://github.com/microsoft/TypeScript/issues/37649),但是开发的时候，还是会有`TS2615`报错,很烦人。
我们只能从代码层面解决这个问题了，目前还没有其他好的方法
```js
// 原来的写法
export default Vue.extend({
  props: {
    some: {
      type: Array,
      default: () => [],
    },
  },
});
// 新的写法
export default Vue.extend({
  props: {
    some: {
      type: Array,
      default() => {
        return [];
      },
    },
  },
});

```