---
title: Framework7小细节
date: 2020-04-16 22:31:56
tags:
- JS
categories:
- 前端
---

### Vue+Framework7小细节

#### 路由器相关(View 设置)
1. 页面切换动画,需要设置`animate`，注意 `animate` 这个属性需要在view这个配置里面添加，才能有效
2. 页面切换需要地址栏的地址也一起变动, 需要设置`pushState`， 注意 `pushState`也需要在view这个配置里面添加，才能有效
3. 默认的路由分割符号是`#!`,我们可以通过`pushStateSeparator`，来修改, 可以指定`''`, 这个参数也是必须在`view` 里面设置才有效.
4. 当然设置`pushStateSeparator`为`''`的情况下，需要指定`pushStateRoot`,这个参数也是必须在`view` 里面设置才有效.

<!-- more -->
参考下面的配置:
```js
  const f7params = {
    routes: routes, // 路由
    view: {
      pushState: true,
      animate: false,
      pushStateRoot: `${window.location.origin}/test`,
      pushStateSeparator: '',
    },
  };
```

#### 路由(Routes 设置)
1. `Routes` 可以使用`asyncComponent` 来懒加载
2. `Routes` 有对应的勾子函数 `beforeEnter`, `beforeLeave`
3. `async`, 前面可以使用`asyncComponent`，来懒加载组件，`async`，不仅仅可以懒加载组件，可以异步获取数据并且，把数据绑定到对应的组件
4. `Routes` 事件，`on`, 可以监听`pageBeforeIn`、`pageAfterIn`、`pageInit`、`pageBeforeRemove`这些事件
```js
  const do = (to, from, resolve, reject) => {
    // todo
    resolve();
  };
  const routes = [
    {
      path: '/demo',
      component: DemoPage,
      name: 'demo',
      beforeEnter: do,
      on: {
        pageBeforeIn: function (event, page) {
          // do something before page gets into the view
        },
        pageAfterIn: function (event, page) {
          // do something after page gets into the view
        },
        pageInit: function (event, page) {
          // do something when page initialized
        },
        pageBeforeRemove: function (event, page) {
          // do something before page gets removed from DOM
        },
      }
    },
    {
      path: '/test',
      name: 'test',
      asyncComponent: () => import('../pages/test.vue'),
      beforeEnter: do,
    },
    {
      path: '/async',
      name: 'async',
      async: (routeTo, routeFrom, resolve, reject) => {
        this.app.request.json('http://some-endpoint/', function (data) {
          resolve(
            {
              component: RequestAndLoad,
            },
            {
              context: {
                user: data,
              }
            }
          );
        });
      },
      beforeEnter: do,
    },
    // ...
  ]
```