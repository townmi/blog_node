---
title: Vue组件双向数据绑定
date: 2019-05-13 19:37:38
tags:
- JS
categories:
- 前端
---

### Vue组件双向数据绑定
父子组件之间的双向绑定非常简单，但是很多人因为是从`Vue` 2+开始使用的，可能不知道如何双向绑定，当然最简单的双向绑定（单文件中）就是表单元素的`v-model`了

<!-- more -->

#### 父子组件的自定义双向v-model
```html
  <!-- parent -->
  <template>
    <child v-model="msg"></child>
  </template>
  <script>
  import Child from '@/components/Child'
  export default {
    components: {
      Child
    },
    data() {
      return {
        msg:' parent'
      }
    },
    watch: {
      msg(newV, oldV) {
        console.log(newV, oldV);
      }
    }
  }
  </script>
  <!-- child -->
  <template>
    <div>
      <span>{{ msg }}</span>
      <button @click="update"></button>
    </div>
  </template>
  <script>
  export default {
    model:{
      prop: 'msg',//这个字段，是指父组件设置 v-model 时，将变量值传给子组件的 msg
      event: 'custom-event'//这个字段，是指父组件监听 custom-event 事件
    },
    props:{
      msg: String //此处必须定义和model的prop相同的props，因为v-model会传值给子组件
    },
    methods: {
      update() {
        this.$emit('custom-event', 'child');
      }
    }
  }
  </script>
```
> 你学会组件的自定义`v-model`了吗 ？ 如果是普通的表单元素，同理，监听表单的`input`或者`change`事件，实时将`value`或者`checked`通过`$emit`传递就可以了

#### 父子组件的自定义多个双向值
上述例子，是实现单个`prop`值的双向绑定，当组件的需求需要复杂的操作，需要多个双向值，是如何实现的呢。这里需要用到以前被vue抛弃，后来又回归的`.sync`修饰符
```html
  <!-- parent -->
  <template>
    <child :p1.sync="p1" :p2.sync="p2"></child>
  </template>
  <script>
  import Child from '@/components/Child'
  export default {
    components: {
      Child
    },
    data() {
      return {
        p1:' parent'
        p2:' parent'
      }
    },
    watch: {
      p1(newV, oldV) {
        console.log(newV, oldV);
      },
      p2(newV, oldV) {
        console.log(newV, oldV);
      }
    }
  }
  </script>
  <!-- child -->
  <template>
    <div>
      <span>{{ p1 }}</span>
      <span>{{ p2 }}</span>
      <button @click="update1"></button>
      <button @click="update2"></button>
    </div>
  </template>
  <script>
  export default {
    props: ['p1', 'p2'],
    methods: {
      update1() {
        this.$emit('update:p1', 'child');
      }
      update2() {
        this.$emit('update:p2', 'child');
      }
    }
  }
  </script>
```
此处需要注意，虽然加上`.sync`即可双向绑定，但是还是要依靠子组件`$emit`去触发`update:prop`名实现修改父组件的变量值实现双向数据流，如果直接对`prop`的属性直接赋值，依然会出现报错。
**事实上，`.sync`修饰符是一个简写，它做了一件事情**
```html
  <template>
    <child :p1.sync="p1"></child>
    <!-- 等价于 -->
    <child :p1="p1" @update:msg="p1 = $event"></child>
    <!-- 这里的$event就是子组件$emit传递的参数 -->
  </template>
```
**当需要把一个对象中的属性全部通过`.sync`传入双向数据流时，可以再简便一下写法**
```html
  <template>
    <child :.sync="obj"></child>
  </template>
  <script>
    export default {
      components:{
        child
      },
      data() {
        return {
          obj: {
            p1: 'test'
            p2: 'test'
            p3: 'test'
            p4: 'test'
          }
        }
      }
    }
  </script>
```