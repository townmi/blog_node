---
title: React-Hooks注意点
date: 2020-09-17 15:10:19
tags:
- React
- JS
categories:
- 前端
---

### React-Hooks注意点
我们在使用React Hooks API的时候经常会遇到一些使用不当的情况，下面我们来总结看看.

<!-- more -->

### 滥用`useState`
反应的核心概念之一是处理状态。您可以控制整个数据流和状态渲染。每次再次渲染树时，它很可能与状态变化有关。
使用`useState`钩子，您现在还可以在功能组件中定义状态。这是处理反应状态的一种真正整洁而简便的方法。但是如下面的示例所示，它也可能被滥用。
对于下一个示例，我们需要一些解释，假设我们有两个按钮，一个按钮是计数器，另一个按钮使用当前计数发送请求或触发动作。但是，当前编号永远不会显示在组件内。仅当您单击第二个按钮时才需要该请求
**问题代码**:
```js
  function ClickButton(props) {
    const [count, setCount] = useState(0);

    const onClickCount = () => {
      setCount((c) => c + 1);
    };

    const onClickRequest = () => {
      apiCall(count);
    };

    return (
      <div>
        <button onClick={onClickCount}>Counter</button>
        <button onClick={onClickRequest}>Submit</button>
      </div>
    );
  }
```

> 乍一看，您可能会问这到底是什么问题？这么写不是挺正常的吗？当然，这是可以的，并且可能永远不会有问题。但是，在做出反应时，每个状态的变化都将迫使该组件及其子组件重新呈现。但是在上面的示例中，由于我们从未在渲染部分中使用该状态，因此每次设置计数器时，最终将成为不必要的渲染，这可能会影响性能或产生意外的副作用。

如何解决: 如果要在组件内部使用一个变量，该变量应在渲染之间保持其值，但又不强制重新渲染，则可以使用useRef钩子。它将保留该值，但不强制重新渲染组件
```js
  function ClickButton(props) {
    const count = useRef(0);

    const onClickCount = () => {
      count.current++;
    };

    const onClickRequest = () => {
      apiCall(count.current);
    };

    return (
      <div>
        <button onClick={onClickCount}>Counter</button>
        <button onClick={onClickRequest}>Submit</button>
      </div>
    );
  }
```

### `useEffects`单一责任

还记得我们只有`componentWillReceiveProps` or`componentDidUpdate`方法挂接到`react`组件的渲染过程的时代吗？它带回了黑暗的回忆，也使您意识到使用`useEffect`钩子的美妙之处，尤其是您可以随意使用它们。
但是有时忘记并将`useEffect`用于几件事会带回那些黑暗的回忆。例如，假设您有一个组件以某种方式从后端获取一些数据，并且还根据当前位置显示面包屑。（再次使用`react-router`获取当前位置。）
**问题代码**:
```js
  function Example(props) {
    const location = useLocation();

    const fetchData = () => {
      /*  Calling the api */
    };

    const updateBreadcrumbs = () => {
      /* Updating the breadcrumbs*/
    };

    useEffect(() => {
      fetchData();
      updateBreadcrumbs();
    }, [location.pathname]);

    return (
      <div>
        <BreadCrumbs />
      </div>
    );
  }
```

> 有两个用例，"数据获取"和"显示面包屑"。两者都用`useEffect`钩子更新。`useEffect`当`fetchData`和`updateBreadcrumbs`功能或`location`更改时，此单个挂钩将运行。现在的主要问题是，`fetchData`当位置更改时，我们也会调用该函数。这可能是我们没有想到的副作用。

```js
  function Example(props) {
    const location = useLocation();

    const updateBreadcrumbs = () => {
      /* Updating the breadcrumbs*/
    };

    useEffect(() => {
      updateBreadcrumbs();
    }, [location.pathname]);

    const fetchData = () => {
      /*  Calling the api */
    };

    useEffect(() => {
      fetchData();
    }, []);

    return (
      <div>
        <BreadCrumbs />
      </div>
    );
  }
```

使用`useEffect()`时，有一点需要注意。如果有多个副效应，应该调用多个`useEffect()`，而不应该合并写在一起。