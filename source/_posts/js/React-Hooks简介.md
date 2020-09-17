---
title: React-Hooks简介
date: 2020-09-17 11:10:19
tags:
- React
- JS
categories:
- 前端
---

### React-Hooks简介
以前，`React API`只有一套，现在有两套：类（`class`）API 和基于函数的钩子（`hooks`） API。今天简单介绍它的用法。

<!-- more -->

### 什么是函数组件

在`React`16.8之前，我们写一个组件的基本都是采用`class` API来写的:
```js
  import React, { Component } from "react";

  export default class Button extends Component {
    constructor() {
      super();
      this.state = {
        text: "Click"
      };
      this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
      this.setState(() => {
        return {
          text: "clicked!"
        };
      });
    }
    render() {
      const { buttonText } = this.state;
      return <button onClick={this.handleClick}>{text}</button>;
    }
  }
```
当然16.8之前，我们是可以写一些函数组件的:
```js
  export default  (props) => {
    return <h1>Hello, {props.name}</h1>;
  }
```
但是，这种写法有重大限制，必须是纯函数，不能包含状态，也不支持生命周期方法，因此无法取代类。
所以16.8之后函数组件被加强了，可以采用`Hooks` API写出于`class` API一样的全功能组件.

### Hooks(勾子)

首先我们知道，函数组件，其根本就是一个函数，只是函数的返回值是DOM。那么我们就很清楚函数组件中使用`Hooks`API目的就是解决函数组件之前不能处理状态，不支持声明周期的问题
所以`Hooks`就是用来处理函数组件的状态、组件声明周期等等的操作。下面是常用的几个`hooks`:
- `useState()`: 组件状态
- `useContext()`: 共享上下文状态
- `useReducer()`: store、action
- `useEffect()`: 副作用

### `useState()`状态钩子

`useState()`用于为函数组件引入状态（`state`）。纯函数不能有状态，所以把状态放在钩子里面。
上面的那个组件类，用户点击按钮，会导致按钮的文字改变，文字取决于用户是否点击，这就是状态。使用`useState()`重写如下:
```js
  import React, { useState } from 'react';
  export default () => {
    const [txt, setTxt] = useState('click');

    const handleClick = () => {
      return setTxt('clicked');
    }
    return <button  onClick={handleClick}>{txt}</button>;
  }
```
上面的函数组件中，使用了`useState()`来引入组件状态，这个勾子`useState()`接受一个状态的初始值作为参数，返回一个数组，数组的第一个是组件的状态，第二个是一个**函数**，可以用来更新组件的状态。


### `useContext()`共享上下文状态
如果需要在组件之间共享状态，可以使用`useContext()`。
```js
  <div className="App">
    <SideBar/>
    <Content/>
  </div>
```
现在有两个组件`SideBar`和`Content`，我们希望它们之间共享状态:
```js
  // 第一步就是使用 React Context API，在组件外部建立一个 Context。
  const AppContext = React.createContext({});
  <AppContext.Provider value={{
    message: '哈哈'
  }}>
    <div className="App">
      <SideBar/>
      <Content/>
    </div>
  </AppContext.Provider>

  // SideBar
  import React, { useContext } from 'react';
  export default () => {
    const { message } = useContext(AppContext);
    return (
      <div>
        <p>side-bar</p>
        <p>{message}</p>
      </div>
    );
  }
  // Content
  import React, { useContext } from 'react';
  export default () => {
    const { message } = useContext(AppContext);
    return (
      <div>
        <p>content</p>
        <p>{message}</p>
      </div>
    );
  }
```

### `useReducer()`

`useReducer()`其实是`useState()`的替代方案。如果你熟悉`Redux`(`Redux`的核心概念是，组件发出`action`与状态管理器通信。状态管理器收到`action`以后，使用`Reducer`函数算出新的状态。`Reducer`函数的形式是`(state, action) => newState`)就已经知道它如何工作了。
`useReducer()`它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。
在某些场景下`useReducer`会比`useState`更适用，例如`state`逻辑较复杂且包含多个子值，或者下一个`state`依赖于之前的`state`等。并且，使用`useReducer`还能给那些会触发深更新的组件做性能优化，因为你可以向子组件传递`dispatch`而不是回调函数 。
```js
  const initialState = {count: 0};

  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return {count: state.count + 1};
      case 'decrement':
        return {count: state.count - 1};
      default:
        throw new Error();
    }
  }

  function Counter() {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
      <>
        Count: {state.count}
        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        <button onClick={() => dispatch({type: 'increment'})}>+</button>
      </>
    );
  }
```
由于`Hooks`可以提供共享状态和`Reducer`函数，所以它在这些方面可以取代`Redux`。但是，它没法提供中间件（`middleware`）和时间旅行（time travel），如果你需要这两个功能，还是要用`Redux`。

#### 惰性初始化

你可以选择惰性地创建初始`state`。为此，需要将`init `函数作为`useReducer`的第三个参数传入，这样初始`state`将被设置为`init(initialArg)`。
这么做可以将用于计算`state`的逻辑提取到`reducer`外部，这也为将来对重置`state`的`action`做处理提供了便利
```js
  function init(initialCount) {
    return {count: initialCount};
  }

  function reducer(state, action) {
    switch (action.type) {
      case 'increment':
        return {count: state.count + 1};
      case 'decrement':
        return {count: state.count - 1};
      case 'reset':
        return init(action.payload);
      default:
        throw new Error();
    }
  }

  function Counter({initialCount}) {
    const [state, dispatch] = useReducer(reducer, initialCount, init);
    return (
      <>
        Count: {state.count}
        <button
          onClick={() => dispatch({type: 'reset', payload: initialCount})}>
          Reset
        </button>
        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        <button onClick={() => dispatch({type: 'increment'})}>+</button>
      </>
    );
  }

```

#### 跳过 dispatch

如果`Reducer Hook`的返回值与当前`state`相同，`React`将跳过子组件的渲染及副作用的执行。（React 使用`Object.is`比较算法 来比较`state`。）
需要注意的是，`React`可能仍需要在跳过渲染前再次渲染该组件。不过由于`React`不会对组件树的“深层”节点进行不必要的渲染，所以大可不必担心。如果你在渲染期间执行了高开销的计算，则可以使用`useMemo`来进行优化。

### `useEffect()`

`useEffect()`用来引入具有副作用的操作，最常见的就是向服务器请求数据。以前，放在`componentDidMount`里面的代码，现在可以放在`useEffect()`。
`useEffect()`的用法如下：
```js
  useEffect(()  =>  {
    // Async Action
  }, [dependencies])
```
上面用法中，`useEffect()`接受两个参数。第一个参数是一个函数，异步操作的代码放在里面。第二个参数是一个数组，用于给出`Effect`的依赖项，只要这个数组发生变化，`useEffect()`就会执行。**第二个参数可以省略，这时每次组件渲染时，就会执行`useEffect()`**。

```js
  export default ({ personId }) => {
    const [loading, setLoading] = useState(true);
    const [person, setPerson] = useState({});

    useEffect(() => {
      setLoading(true); 
      fetch(`https://swapi.co/api/people/${personId}/`)
        .then(response => response.json())
        .then(data => {
          setPerson(data);
          setLoading(false);
        });
    }, [personId])

    if (loading === true) {
      return <p>Loading ...</p>
    }

    return <div>
      <p>name: {person.name}</p>
      <p>height: {person.height}</p>
      <p>mass: {person.mass}</p>
    </div>
  }
```
上面代码中，每当组件参数`personId`发生变化，`useEffect()`就会执行。组件第一次渲染时，`useEffect()`也会执行

#### `useEffect`用途
- 获取数据（data fetching）
- 事件监听或订阅（setting up a subscription）
- 改变 DOM（changing the DOM）
- 输出日志（logging）

#### `useEffect`的返回值

副效应是随着组件加载而发生的，那么组件卸载时，可能需要清理这些副效应。
`useEffect()`允许返回一个函数，在组件卸载时，执行该函数，清理副效应。如果不需要清理副效应，`useEffect()`就不用返回任何值

```js
  useEffect(() => {
    const subscription = props.source.subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [props.source]);
```

上面例子中，`useEffect()`在组件加载时订阅了一个事件，并且返回一个清理函数，在组件卸载时取消订阅。
实际使用中，由于副效应函数默认是每次渲染都会执行，所以清理函数不仅会在组件卸载时执行一次，每次副效应函数重新执行之前，也会执行一次，用来清理上一次渲染的副效应。

### 自定义`Hooks`

我们可以自定义一些`Hooks`，来抽象使用，比如上面的获取用户的信息
```js
  const usePerson = (personId) => {
    const [loading, setLoading] = useState(true);
    const [person, setPerson] = useState({});
    useEffect(() => {
      setLoading(true);
      fetch(`https://swapi.co/api/people/${personId}/`)
        .then(response => response.json())
        .then(data => {
          setPerson(data);
          setLoading(false);
        });
    }, [personId]);  
    return [loading, person];
  };
```
`usePerson`就是我们自定义的一个`Hooks`，用来获取用户信息，函数组件就可以直接使用这个`usePerson`:
```js
  export default ({ personId }) => {
    const [loading, person] = usePerson(personId);

    if (loading === true) {
      return <p>Loading ...</p>;
    }

    return (
      <div>
        <p>You're viewing: {person.name}</p>
        <p>Height: {person.height}</p>
        <p>Mass: {person.mass}</p>
      </div>
    );
  };
```

