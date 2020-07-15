---
title: ShadowDOM
date: 2020-07-07 19:37:38
tags:
- JS
categories:
- 前端
---

### ShadowDOM

在chrome dev tools 中打开 `Settings -> Preferences -> Elements`中把`Show user agent shadow DOM`打上勾。然后，打开一个支持 HTML5 播放的视频网站。比如 Youtube：

<!-- more -->

![ShadowDOM](/uploads/20200707/1.png)

我们可以看到`video`内部有一个`#shadow-root`，在这个标签下还可以看到许多元素，我们知道`video`会有许多播放控件，其实这些控件就是由`#shadow-root`下面的元素构成的，像`input`其实也有附加的ShadowDom，在给`input`元素添加`placeholder`后，我们通过chrome dev tools 可以发现这个`placeholder`其实是由`#shadow-root`中的`div`构成的

Shadow Dom 允许在`Document`渲染时插入一个*子DOM树*，并且这个子树不再主DOM树中，同时为子树中的元素和css提供了封装的能力，Shadow Dom使得子树中的DOM和主文档的DOM保持分离,子树中的CSS不会影响到主DOM树的元素样式,如下图：
![ShadowDOM](/uploads/20200707/2.png)

这里需要列出Shadow DOM几个概念
1. `shadow host`: 一个常规的DOM节点，Shadow DOM会被附加到这个节点上
2. `shadow tree`: Shadow DOM 内部的DOM树
3. `shadow boundary`: Shadow DOM结束的地方，也是常规DOM开始的地方
4. `shadow root`: Shadow Tree的根节点

### Shadow DOM的作用

#### 浏览器自带的原始组件

Shadow DOM 最大的作用就是隔离外部环境来分装组件，所以上面提到的`video`、`input`，还有`audio`、`select` 也都是由基本的元素构成的

#### Web Components

当我们在开发通用组件的时候，可以不必担心样式和DOM的冲突问题，需要下面3项条件
1. 自定义元素: 一组`javasciprt`API，可以自定义元素已经元素的行为
2. HTML模版: `template`和`slot`元素可以呈现不同的ui
3. Shadow DOM: 可以和主文档隔离，并且能控制其关联的功能，可以保持元素的私有化.

#### 微前端

微前端作为一种*架构风格*，其中可由多个*可独立交付的前端子应用*组合成一个大的整体。那么在*微前端架构*下，每一个独立的子应用间及子应用间的如何保证不会冲突？样式不会相互覆盖？那么，是否可以将每个*子应用*通过 Shadow DOM 进行隔离？答案是肯定的.
其他，在需要进行 DOM/CSS 隔离的场景，都有可能是 Shadow DOM 的用武之地。 避免和宿主页面的样式冲突，即不影响宿主页面，也不要受宿主页面的影响

### 如何创建Shadow DOM

Shadow DOM 必须附加在一个元素上，可以是通过 HTML 声明的一个元素，也可以是通过脚本动态创建的元素。可以是原生的元素，如 `div`、`p` ，也可以是*自定义元素*如 `my-element` ，语法如下：
```js
  const shadowroot = element.attachShadow(shadowRootInit); 
```
参考下面的例子:
```html
  <html>
    <head>
      <title>Shadow Demo</title>
    </head>
    <body>
      <h1>Shadow Demo</h1>
      <div id="host"></div>
      <script>
        const host = document.querySelector('#host');
        // 通过 attachShadow 向元素附加 Shadow DOM
        const shodowRoot = host.attachShadow({ mode: 'open' });
        // 向 shodowRoot 中添加一些内容
        shodowRoot.innerHTML = `<style>*{color:red;}</style><h2>haha!</h2>`;
      </script>
    </body>
  </html>
```
`attachShadow`的参数的`mode`选项用于设定*封装模式*,有两个值可选:
1. `'open'`: 可以通过host元素的`host.shadowRoot`获取到`shadowRoot`引用, 这样任何代码都可以通过`shadowRoot`来访问子DOM
2. `'closed'`: 这种模式下host元素的`host.shadowRoot`是`null`, 我们只能通过`element.attachShadow`的返回值拿到`shadowRoot`的引用(通常可能隐藏在类中)，像浏览器内部的`video`、`input`等等就是关闭的，我们没有办法访问到。

### 哪些元素可以附加Shadow DOM

并非所有 HTML 元素都可以开启 Shadow DOM 的，只有一组有限的元素可以附加 Shadow DOM。有时尝试将 Shadow DOM 树附加到某些元素将会导致 DOMException 错误，例如：
```js
  document.createElement('img').attachShadow({mode: 'open'});    
  // => DOMException
```
下面是可以支持附加Shadow DOM的元素：
```js
  // article  aside blockquote
  // body div fotter
  // h1 ~ h6
  // header main nav
  // p section span
```

### React中如何应用Shadow DOM

在基于 React 的项目中应该如何使用 Shadow DOM 呢？比如你正在基于 React 编写一个面向不同产品或业务，可嵌入集成使用的公共组件，比如你正在基于 React 做一个「微前端架构」应用的设计或开发

#### 尝试

```js
  import * as React from 'react';

  const ShadowView: React.FC<Record<string, any>> = (props: any) => {
    const attachShadow = (host: HTMLDivElement) => {
      host.attachShadow({ mode: 'open' });
    }

    return (
      <div ref={attachShadow}>
        {props.children}
      </div>
    )
  };

  const Music: React.FC<Record<string, unknown>> = () => {
    return (
      <>
        <ShadowView>
          <span>隔离</span>
        </ShadowView>
      </>
    )
  };

  export default Music;
```
上面的例子跑起来发现页面是空的，


在这里需要稍注意一下，在一个元素上附加了Shadow DOM后，元素原本的*子元素*将不会再显示，并且这些子元素也不在Shadow DOM中，只有`host.shadowRoot`的子元素才是*子DOM树*中一部分。也就是说这个*子DOM树*的*根节点*是`host.shadowRoot`而非`host`。`host.shadowRoot`是`ShadowRoot`的实例，而`ShadowRoot`则继承于 DocumentFragment，可通过原生 DOM API 操作其子元素。
我们需通过`Element.attachShadow`附加到元素，然后就能拿到附加后的`ShadowRoot`实例。 针对`ShadowRoot`这样一个原生`DOM Node`的的引用，除了利用`ReactDOM.render`或`ReactDOM.createPortal`，我们并不能轻易的将`React.Element`渲染到其中，除非直接接操作`DOM`。
```js
  const ShadowView: React.FC<Record<string, any>> = (props: any) => {
    const attachShadow = (host: HTMLDivElement) => {
      const shadowRoot = host.attachShadow({ mode: 'open' });
      [].slice.call(host.children).forEach((element: Element) => {
        shadowRoot.appendChild(element);
      });
    }

    return (
      <div ref={attachShadow}>
        {props.children}
      </div>
    )
  };


  const Music: React.FC<Record<string, unknown>> = () => {
    const inClick = () => {
      alert('in');
    };
    const outClick = () => {
      alert('out')
    }
    return (
      <>
        <span onClick={outClick}>外部</span>
        <ShadowView>
          <span onClick={inClick}>内部</span>
        </ShadowView>
      </>
    )
  };

  export default Music;
```
在浏览器中看看效果，可以看到是可以正常显示的。但与此同时会发现一个问题「隔离在`ShadowRoot`中的元素上的事件无法被触发了」，这是什么原因呢？
是由于`React`的**合成事件机制**的导致的，我们知道在`React`中*事件*并不会直接绑定到具体的DOM元素上，而是通过在`document`上绑定的`ReactEventListener`来管理， 当时元素被单击或触发其他事件时，事件被`dispatch`到`document`时将由`React`进行处理并触发相应合成事件的执行。
那为什么合成事件在Shadow DOM中不能被正常触发？是因为当在Shadow DOM外部捕获时浏览器会对事件进行「重定向」，也就是说在Shadow DOM中发生的事件在外部捕获时将会使用host元素作为事件源。这将让`React`在处理合成事件时，不认为Shadow DOM中元素基于`JSX`语法绑定的事件被触发了。

#### 尝试ReactDOM.render改造下

`ReactDOM.render`的第二个参数，可传入一个DOM元素。那是不是能通过`ReactDOM.render`将`React Eements`渲染到Shodaw DOM中呢？看一下如下尝试
```js
  import * as React from 'react';
  import * as ReactDOM from 'react-dom';

  class ShadowView extends React.Component<any> {
    attachShadow = (host: HTMLDivElement) => {
      const { children } = this.props;
      const shadowRoot = host.attachShadow({ mode: 'open' });
      ReactDOM.render(children, shadowRoot);
    }
    render() {
      return <div ref={this.attachShadow}></div>
    }
  };

  const Music: React.FC<Record<string, unknown>> = () => {
    const [state, setState] = React.useState('loading');

    const click = () => {
      setState('done');
    };

    return (
      <>
        <ShadowView>
          <span>{state}</span>
          <span onClick={click}>内部</span>
        </ShadowView>
      </>
    )
  };

  export default Music;
```
可以看到通过`ReactDOM.render`进行`children`的渲染，是能够正常渲染到`ShadowRoot`中，并且在Shadow DOM中合成事件也是能正常触发执行的。
为什么此时「隔离在 Shadow DOM 中的元素事件」能够被触发了呢？ 因为在`React`在发现渲染的目标在`ShadowRoot`中时，将会将事件绑定在通过`Element.getRootNode()`获取的`DocumentFragment`的`RootNode`上
看似一切顺利，但却会发现父组件的`state`更新时，而`ShadowView`组件并没有更新。如上边的示例，其中的`state`显示的还是旧的，而原因就在我们使用`ReactDOM.render`时，Shadow DOM的元素和父组件不在一个`React`渲染上下文中了

#### 使用ReactDOM.createPortal

我们知道`createPortal`的出现为「弹窗、提示框」等脱离文档流的组件开发提供了便利，替换了之前不稳定的`API unstable_renderSubtreeIntoContainer`。
`ReactDOM.createPortal`有一个特性是「通过`createPortal`渲染的 DOM，事件可以从`Portal`的入口端冒泡上来」，这一特性很关键，没有父子关系的DOM，合成事件能冒泡过来，那通过`createPortal`渲染到Shadow DOM中的元素的事件也能正常触发吧？并且能让所有元素的渲染在一个上下文中。那就基于`createPortal`实现一下
```js
  import * as React from 'react';
  import * as ReactDOM from 'react-dom';

  const ShadowContent = ({ root, children }) => {
    return ReactDOM.createPortal(children, root);
  };

  class ShadowView extends React.Component<any> {
    state = { root: null };
    setRoot = (e: HTMLDivElement) => {
      const root = e.attachShadow({ mode: 'open' });
      this.setState({ root });
    };
    render() {
      const { children } = this.props;
      const { root } = this.state;
      return <div ref={this.setRoot}>
        {root && <ShadowContent root={root} >
          {children}
        </ShadowContent>}
      </div>;
    }
  };

  const Music: React.FC<Record<string, unknown>> = () => {
    const [state, setState] = React.useState('loading');
    const click = () => {
      setState('done');
    };
    return (
      <>
        <ShadowView>
          <span>{state}</span>
          <span onClick={click}>内部</span>
        </ShadowView>
      </>
    )
  };

  export default Music;
```
有一个小问题是`createPortal`不支持`React 16`以下的版本，但大多数情况下这并不是个什么大问题

### React的ShadowView组件

上边提到了几种在`React`中实现Shadwo DOM组件的方法，而`ShadowView`是一个写好的可开箱即用的面向`React`的Shadow DOM容器组件，利用`ShadowView`可以像普通组件一样方便的在`React`应用中创建启用Shadow DOM的容器元素。
`ShadowView`目前完整兼容支持`React 15/16`，组件的「事件处理、组件渲染更新」等行为在两个版中都是一致的, [https://github.com/Houfeng/shadow-view](https://github.com/Houfeng/shadow-view).