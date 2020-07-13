---
title: vue一些小技巧
date: 2020-07-02 19:37:38
tags:
- JS
categories:
- 前端
---

### vue一些小技巧

在vue的使用过程中会遇到各种场景，当普通使用时觉得没什么，但是或许优化一下可以更高效更优美的进行开发。下面有一些我在日常开发的时候用到的小技巧，在下将不定期更新~

<!-- more -->

#### vue-loader
`vue-loader` 是处理.vue文件的webpack loader.下面来介绍下不怎么常用的两个小技巧
- `preserveWhitespace` 删除template中元素之间的空格
  ```html
    <div>
      <p></p>
    </div>
    <!-- 使用 preserveWhitespace build 之后效果如下代码-->
    <div><p></p></div>
    <!-- 这样有效降低打包后的文件的大小 -->
  ```

- `transformToRequire` 可以处理`require`资源
```html
<template>
  <img :src="src">
</template>
<script>
  export default {
    data() {
      return {
        src: require('./1.png').default
      }
    }
  }
</script>
```
可以通过配置`transformToRequire`来处理
```html
<template>
  <img src="./1.png">
</template>
```
```js
// webpack.js
{
  transformToRequire: {
    video: ['src'],
    img: 'src'
  }
}
```

#### watch
相信大家都会经常使用到watcher,
```html
  <script>
    export default {
      watch: {
        txt(newVal, oldVal) {
          // todos
        }
      }
    }
  </script>
```
上面是watch基本用法，下面是不怎么常用的，但是比较有用的
```html
  <script>
    export default {
      watch: {
        txt: {
          handler: (newVal, oldVal) {
            // todo
          },
          immediate: true, // 代表在wacth里声明了txt属性后立即先去执行handler方法 
          deep: true // 表是否深度监听，监听器会一层层的往下遍历，给对象的所有属性都加上这个监听器，但是这样性能开销就会非常大了
        }
      }
    }
  </script>
```

#### $attrs 和 $listeners
往往我们写组件的时候，都需定义好`props`，如果我们想偷懒，不去定义`props`，但是又想用父级组件传来的属性或者事件呢？
```html
  <!-- 父组件 -->
  <child a1="a1" a2="a2" a3="a3" a4="a4" />
  <!-- 子组件 -->
  <script>
    export default {
      mounted() {
        console.log(this.$attrs, $listeners) // 父组件传来的属性和事件
      }
    }
  </script>
```

#### Vue.set()
当你的数据是个以多叉树的情况下，而且这个数据还会动态添加子节点数据，你为了获取数据双向绑定的效果，你可能比较需要`Vue.set`这个方法
```html
  <script>
    export default {
      data() {
        return tree {
          children:[
            {
              children: []
            }
          ]
        }
      },
      methods: {
        get() {
          // 这里可能获取了子节点数据，需要往tree 上面添加
          this.tree = newTree; // 这样写的话，添加的数据，不会又双向绑定的效果
          // 这里需要
          this.tree.children((e, i) => {
            this.$set(tree, i, e);
          })
        }
      }
    }
  </script>
```

#### 动态组件
许多情况，我们需要根据不同条件，加载不同的组件，这个时候我们会使用`v-if`，其实还可以使用`:is`
```html
  <template>
    <transition> <!-- 可以添加切换动画 -->
      <keep-alive> <!-- 可以缓存组件，这样不会导致组件重新加载 -->
        <component :is="currentComponent"> <!-- currentComponent 加载对应的组件-->
      </keep-alive>
    </transition>
  </template>
```