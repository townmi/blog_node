---
title: vue单页面权限
date: 2020-07-01 19:37:38
tags:
- JS
categories:
- 前端
---

### vue单页面权限

在开发企业应用时，权限问题是一直伴随着我们开发人员的问题，服务器有着各种权限系统的设计，那么对于前后端分离的项目来说，我们前端该怎么处理权限问题呢?

<!-- more -->

### 权限问题
首先我们来看看会出现哪些权限问题
1. 应用的权限问题，说白了就是有没有权限使用这个网站
2. 页面的权限问题，说白了，在这个网站里面的页面是不是每个能使用
3. 组件的权限，说白了，我有没有权限使用所有的业务组件
4. 接口的权限，这个很简单就是服务能不能正常使用

我们可以将前端遇到的权限问题，大体分成上面的四大类,下面我们就上面的四大类的权限问题，一一找出相对应的解决方案

#### 应用的权限问题

前后端分离之前，那么保存用户的登录信息一般都是通过`session+cookie/token`管理，前后端分离后，我们都需要前端调用服务看看用户是不是登录状态。
大体做法可以如下几个步骤
1. 用户打开前端页面
2. 检查本地`cookie/localstorage`是否有`token`
3. 如果没有`token`就跳转到`login`页面
4. 如果有`token`，就请求登录服务，看看token有没有失效,失效了返回第3个步骤
5. 如果登录`token`没有失效，就正常访问网站

下面是参考代码
```js
  const routes = [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard
        }, {
          path: 'page1',
          name: 'Page1',
          component: Page1
        }, {
          path: 'page2',
          name: 'Page2',
          component: Page2
        }
      ]
    }, {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]

  const router = new Router({
    routes,
    mode: 'history'
    // 其他配置
  })

  router.beforeEach((to, from, next) => {
    if (to.name === 'Login') {
      // 当进入路由为login时,判断是否已经登录
      if (store.getters.user.isLogin) {
        // 如果已经登录,则进入功能页面
        return next('/')
      } else {
        return next()
      }
    } else {
      if (store.getters.user.isLogin) {
        return next()
      } else {
        // 如果没有登录,则进入login路由
        return next('/login')
      }
    }
  });

  Vue.extend({
    // Login.vue
    async mounted () {
      var token = Cookie.get('vue-login-token')
      if (token) {
        var { data } = await axios.post('/api/loginByToken', {
          token: token
        })
        if (data.ok) {
          this[LOGIN]()
          Cookie.set('vue-login-token', data.token)
          this.$router.push('/')
        } else {
          // 登录失败逻辑
        }
      }
    },
    methods: {
      ...mapMutations([
        LOGIN
      ]),
      async login () {
        var { data } = await axios.post('/api/login', {
          username: this.username,
          password: this.password
        })
        if (data.ok) {
          this[LOGIN]()
          Cookie.set('vue-login-token', data.token)
          this.$router.push('/')
        } else {
          // 登录错误逻辑
        }
      }
    }
  });
```
如果登出的话，直接清除`cookie`就好了

#### 页面级别的权限

如果我们登录了网站，但是有些页面不希望用户访问到，怎么办？
第一种办法就是可以借助[`vue-router`/路由独享的守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#路由独享的守卫)来进行处理
```js
  const routes = [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard
        }, {
          path: 'page1',
          name: 'Page1',
          component: Page1,
          beforeEnter: (to, from, next) => {
            // 这里检查权限并进行跳转
            next()
          }
        }, {
          path: 'page2',
          name: 'Page2',
          component: Page2,
          beforeEnter: (to, from, next) => {
            // 这里检查权限并进行跳转
            next()
          }
        }
      ]
    }, {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]
```
虽然上面的方案可以配合[`vue-router`/路由懒加载](https://router.vuejs.org/zh/guide/advanced/lazy-loading.html)实现没有权限的页面不加载，但是很明显上面的方案有些问题:
1. 当页面权限足够细致时,router的配置将会变得更加庞大难以维护(可以借助`beforeEach`构子函数简化)
2. 每当后台更新页面权限规则时,前端的判断逻辑也要跟着改变,这就相当于前后端需要共同维护一套页面级别权限.

为了解决上后台和前端权限一致，我们可以通过`Vue`动态加载`router`来实现
```js
  Vue.extend({
    // Login.vue
    async mounted () {
      var token = Cookie.get('vue-login-token')
      if (token) {
        var { data } = await axios.post('/api/loginByToken', {
          token: token
        })
        if (data.ok) {
          this[LOGIN]()
          Cookie.set('vue-login-token', data.token)
          // 这里调用更新router的方法
          this.updateRouter(data.routes)
        }
      }
    },
    // ...
    methods: {
      async updateRouter (routes) {
        // routes是后台返回来的路由信息
        const routers = [
          {
            path: '/',
            component: Layout,
            children: [
              {
                path: '',
                name: 'Dashboard',
                component: Dashboard
              }
            ]
          }
        ]
        routes.forEach(r => {
          routers[0].children.push({
            name: r.name,
            path: r.path,
            component: () => routesMap[r.component]
          })
        })
        this.$router.addRoutes(routers)
        this.$router.push('/') // 这里可以在动态根据location.pathname 来刷页面
      }
    }
  });
```

#### 组件权限
组件的使用权限这个就很简单了，像`React`，我们就可以使用高阶组件处理下
```js
  const withAuth = (Comp, auth) => {
  return class AuthComponent extends Component {
    constructor(props) {
      super(props);
      this.checkAuth = this.checkAuth.bind(this)
    }

    checkAuth () {
      const auths = this.props;
      return auths.indexOf(auth) !== -1;
    }

    render () {
      if (this.checkAuth()) {
        <Comp { ...this.props }/>
      } else {
        return null
      }
    }
  }
}
```
如果是`Vue`，可以通过`render`来简单处理
```js
  // Auth.vue
  import { mapGetters } from 'vuex'

  export default {
    name: 'Auth-Comp',
    render (h) {
      if (this.auths.indexOf(this.auth) !== -1) {
        return this.$slots.default
      } else {
        return null
      }
    },
    props: {
      auth: String
    },
    computed: {
      ...mapGetters(['auths'])
    }
  }
  // 使用
  <Auth auth="canShowHello">
    <Hello></Hello>
  </Auth>
```

#### 接口的权限
这个就更简单了，这个其实和页面、UI关系就不是很大了
都是在网络请求层添加拦截器处理下,大体就是下面的步骤
1. 首先从后端获取允许当前用户访问的Api接口的权限
2. 根据返回来的结果配置前端的ajax请求库(如`axios`)的拦截器
3. 在拦截器中判断权限,根据需求提示用户即可
```js
  axios.interceptors.request.use((config) => {
    // 这里进行权限判断
    if (/* 没有权限 */) {
      return Promise.reject('no auth')
    } else {
      return config
    }
  }, err => {
    return Promise.reject(err)
  })
```