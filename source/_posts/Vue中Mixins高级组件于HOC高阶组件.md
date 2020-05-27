---
title: Vue中Mixins高级组件于HOC高阶组件
date: 2019-06-08 19:37:38
tags:
- JS
categories:
- 前端
---

### Vue中Mixins高级组件于HOC高阶组件
如果Vue组件多了，他们之间如何通信，下面我们来演示一下Vue组件之间常用的通信方法

<!-- more -->

#### Mixins高级组件
混入 (`mixin`) 提供了一种非常灵活的方式，来分发`Vue`组件中的可复用功能。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被“混合”进入该组件本身的选项
[Vue官方介绍](https://cn.vuejs.org/v2/guide/mixins.html)。
去个例子，如果我需要记录每次用户点击了按钮组件，我该如何使用`mixin`
```js
  // 定义一个混入对象
  var Button = {
    created: function () {
      this.hello()
    },
    methods: {
      click: function () {
        console.log('self logic')
      }
    }
  }

  // 定义一个使用混入对象的组件
  var NewButton = Vue.extend({
    mixins: [Button]，
     methods: {
      click (event) {
        console.log('记录')
      }
    }
  })

  var button = new NewButton();
  // click => "self logic"
  // click => "记录"
```
仔细看，我们会发现，使用`mixins`会遇到`mixins`同名属性合并、同名钩子函数将合并为一个数组的问题，虽然可以实现功能，但是同时带来一些问题
1. 需要知道Button源码结构
2. 带来了隐式依赖，如果`mixins`嵌套，会很难理解
特别是使用全局混入的时候，要特别小心，基本不推荐使用
```js
  // 为自定义的选项 'myOption' 注入一个处理器。
  Vue.mixin({
    created: function () {
      var myOption = this.$options.myOption
      if (myOption) {
        console.log(myOption)
      }
    }
  })

  new Vue({
    myOption: 'hello!'
  })
  // => "hello!"
```
> 请谨慎使用全局混入，因为它会影响每个单独创建的`Vue`实例 (包括第三方组件)。大多数情况下，只应当应用于自定义选项，就像上面示例一样。推荐将其作为插件发布，以避免重复应用混入。


#### `HOC`高阶组件
所谓高阶组件其实就是高阶函数，`React`和`Vue`都证明了一件事儿：一个函数就是一个组件。所以组件是函数这个命题成立了，那高阶组件很自然的就是高阶函数，即一个返回函数的函数
用一句话来理解，即包裹组件的组件
```js
// 定义一个基础组件
  var Button = {
    created: function () {
      this.hello()
    },
    methods: {
      click: function () {
        console.log('self logic')
      }
    }
  }
  const XDButton = {
    props: Button.props,
    data() {
      return {};
    },
    mounted() {
      // todo
    },
    render(h) {
      const slots = Object.keys(this.$slots)
        .reduce((arr, key) => arr.concat(this.$slots[key]), [])
        .map((vnode) => {
          vnode.context = this._self;
          return vnode;
        });
      return h(Button, {
        on: {
          ...this.$listeners,
          click: () => {
            console.log('记录')
          }
        },
        props: this.$props,
        scopedSlots: this.$scopedSlots,
        attrs: this.$attrs,
      }, slots);
    },
  };
```
虽然`HOC`高阶组件可以实现功能，但是同时带来一些问题
1. 组件之间通信会被拦截，比如子组件访问父组件的方法(`this.$parent.methods`)
2. 特殊情况是需要知道被包裹组件源码结构

#### 两者对比
1. `mixin` 高级组件，虽然官方推荐使用，但也是看使用场景的
2. `HOC` 高阶组件，其实`Vue`官方并没有推荐使用，但是某些场合下还是可以使用的