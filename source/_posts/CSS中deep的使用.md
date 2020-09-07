---
title: CSS中/deep/的使用
date: 2020-09-01 22:31:56
tags:
- CSS
categories:
- 前端
---

### CSS中/deep/的使用

偶然的机会接触到使用`/deep/`来处理`Less`、`Sass`中 `scoped`样式对第三方组件失效的问题

<!-- more -->

### 首先了解问题

`vue`组件编译后，会将`template`中的每个元素加入`[data-v-xxxx]`属性来确保`style scoped`仅本组件的元素而不会污染全局，但如果你引用了第三方组件：
```html
  <div class="xxx">
    <component :data="data">
    </component>
  </div>
```
默认只会对组件的最外层（div）加入这个 [data-v-xxxx] 属性，但第二层开始就没有效果了。如图所示：第一层还有`data-v-17bb9a05`, 但第二层的`.art`就没有了
```html
  <div data-v-17bb8a05 class="xxx">
    <p class="art"></p>
  </div>
```
所以，下面的`style scoped`样式代码对`.art`没有效果
```html
  <style lang="less" scoped>
    .xxx {
      .art {
        backgroud: red;
      }
    }
  </style>
```
应为上面的`scoped`的`Less`代码编译出来的结果如下
```css
  .xxx[data-v-17bb9a05] .art[data-v-17bb9a05] {
    background: red;
  }
```

### 解决方案一
把样式代码从`scoped`中剥离除出来
```html
  <style lang="less">
    .xxx {
      .art {
        backgroud: red;
      }
    }
  </style>
```
但是剥离出来的css，会有可能污染全局样式,我们一般都需要特别主要给`class`命名，防止污染

### 解决方案二
下面就是我们今天要将的`deep`深度选择器,首先，`deep`只是在`Sass`、`Less`这些预编译器中使用的深度选择器,在`css`中使用的是`>>>`.
如果要解决上面的问题，我们的代码如下:
```html
  <style lang="less" scoped>
    .xxx {
      /deep/ .art {
        backgroud: red;
      }
    }
  </style>
```
或者
```html
  <style scoped>
    .xxx >>> .art {
      backgroud: red;
    }
  </style>
```

那为什么不再`Sass`、`Less`中使用`>>>`?,因为它们无法正确解析`>>>`
