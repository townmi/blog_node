---
title: Vue组件化通信
date: 2019-04-24 19:37:38
tags:
- JS
categories:
- 前端
---

### Vue组件化通信
如果Vue组件多了，他们之间如何通信，下面我们来演示一下Vue组件之间常用的通信方法

<!-- more -->

#### 父子组件
父子组件 我们常用的方法就是`props`、`$emit`，来处理通信问题

```html
  <!-- parent -->
  <template>
    <div id="parent">
      <child :msg="msg" @getChildMsg="getChildMsg"></child>
    </div>
  </template>
  <script>
    import Child from '@/components/Child'
    export default {
      name: "parent",
      data(){
        return {
          msg: '111'
        }
      },
      components: {
        Child
      },
      methods: {
        getmsg(msg) {
          this.msg = msg
        }
      },
    }
  </script>

  <!-- child -->
  <template>
    <div id="child">
      <p>{{ msg }}</p>
      <button @click="sendParentMsg">传递数据到父级</button>
    </div>
  </template>
  <script>
    export default {
      name: "child",
      props: ['msg'],
      methods: {
        sendParentMsg(msg) {
          this.$emit('getChildMsg','new msg')
        }
      },
    }
  </script>
```

#### 祖父孙组件通信
祖父孙组件通信依然可以使用上面的`props`、`$emit`来处理,下面，我么来试试`$attrs`、`$listeners`这两个api。

```html
  <!-- 祖 -->
  <template>
    <div>
      <child :msg="msg" @change="change"></child>
    </div>
  </template>
  <script>
    import Child from '@/components/Child'
    export default {
      data(){
        return {
          msg: '111'
        }
      },
      components: {
        Child
      },
      methods: {
        change(msg) {
          this.msg = msg
        }
      },
    }
  </script>

  <!-- 父 -->
  <template>
    <div>
      <children v-on="$listeners" v-bind="$attrs"></children>
    </div>
  </template>
  <script>
    import Children from '@/components/Children'
    export default {
      components: {
        Children
      },
    }
  </script>

  <!-- 孙 -->
  <template>
    <div id="child">
      <p>{{ msg }}</p>
      <button @click="handleClick">传递数据到父级</button>
    </div>
  </template>
  <script>
    export default {
      name: "child",
      props: ['msg'],
      methods: {
        handleClick(msg) {
          this.$emit('change','new msg')
        }
      },
    }
  </script>
```
`$attrs` 包含了父作用域中不作为`prop`被识别 (且获取) 的特性绑定 (`class`和`style`除外)。当一个组件没有声明任何`prop`时，这里会包含所有父作用域的绑定 (`class`和`style`除外)，并且可以通过`v-bind="$attrs"`传入内部组件——在创建高级别的组件时非常有用。

#### 兄弟组件间的通信
如果`Vue`项目里面，组件嵌套层级太深，那么我们还通过`props`、`$emit`，一层层去处理，那就太傻了
`Vue`里面有`provice`、`inject`这两个API可以来处理专门用来跨层级提供数据.
```html
  <!-- parent -->
  <template>
    <div id="parent">
      <child />
    </div>
  </template>
  <script>
    import Child from '@/components/Child'
    export default {
      name: "parent",
      provide: {
        global: '全局数据',
      },
      components: {
        Child
      },
    }
  </script>
  <!-- children -->
  <template>
    <div id="children">
      <p>{{ global }}</p>
    </div>
  </template>
  <script>
    export default {
      name: "children",
      inject: ['global'],
    }
  </script>
```
但是`provice`、`inject`不是响应式的，如果子孙元素想通知祖先，就需要hack一下,`Vue1`中有`dispatch`和`boardcast`两个方法，但是`Vue2`中被干掉了，我们自己可以模拟一下
原理就是可以通过`this.parent`和`this.children`来获取父组件和子组件，我们递归一下就可以了
```html
  <!-- parent -->
  <template>
    <div id="parent">
      <child />
      <button @click="boardcast('boardcast','parent')">传递数据到子孙级</button>
    </div>
  </template>
  <script>
    import Child from '@/components/Child'
    export default {
      name: "parent",
      provide: {
        global: '全局数据',
      },
      components: {
        Child
      },
      methods: {
        boardcast(eventName, data) {
          function boardcast(eventName, data){
            this.$children.forEach(child => {
              // 子元素触发$emit
              child.$emit(eventName, data)
              if (child.$children.length){
                // 递归调用，通过call修改this指向 child
                boardcast.call(child, eventName, data)
              }
            });
          }
          boardcast.call(this, eventName, data);
        }
      },
    }
  </script>
  <!-- children -->
  <template>
    <div id="children">
      <p>{{ global }}</p>
      <button @click="dispatch('dispatch','children')">传递数据到父级</button>
    </div>
  </template>
  <script>
    export default {
      name: "children",
      inject: ['global'],
      methods: {
        dispatch(eventName, data) {
          let parent = this.$parent;
          while (parent) {
            if (parent) {
              parent.$emit(eventName, data)
              parent = parent.$parent;
            } else {
              break;
            }
          }
        }
      },
    }
  </script>
```
如果在组件里面去处理`dispatch`、`boardcast`，还不如把这两个方法抽到`Vue`的原型链上
```js
  Vue.prototype.$dispatch = (eventName, data) => {
    let parent = this.$parent
    // 查找父元素
    while (parent ) {
      if (parent) {
        // 父元素用$emit触发
        parent.$emit(eventName,data)
        // 递归查找父元素
        parent = parent.$parent
      } else {
        break
      }
    }
  }


  function boardcast(eventName, data){
    this.$children.forEach(child => {
      // 子元素触发$emit
      child.$emit(eventName, data)
      if (child.$children.length) {
        // 递归调用，通过call修改this指向 child
        boardcast.call(child, eventName, data)
      }
    });
  }
  Vue.prototype.$boardcast = function(eventName, data){
    boardcast.call(this, eventName, data)
  }
```

#### 没啥关系的组件
如果两个组件本身隔的太远，那可以使用`Event Bus`，来处理它们的通信
```js
  Vue.prototype.$bus = new Vue();
```
```html
  <!-- a -->
  <template>
    <div id="a">
      {{msg}}
    </div>
  </template>
  <script>
    import Child from '@/components/Child'
    export default {
      name: "a",
      components: {
        Child
      },
      data() {
        return {
          msg: 'a';
        }
      }
      mounted() {
        this.$bus.$on('event-bus', (data) => {
          this.msg = data;
        })
      },
    }
  </script>
  <!-- b -->
  <template>
    <div id="b">
      <p>{{ global }}</p>
      <button @click="update">发送数据</button>
    </div>
  </template>
  <script>
    export default {
      name: "b",
      methods: {
        update() {
          this.$bus.$emit('event-bus','b')
        }
      },
    }
  </script>
```

#### Vuex
`Vuex`就不细说了，可以写篇文章了