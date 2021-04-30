# React

使用 React Hooks 的无状态组件，在每次渲染时，包括组件内的函数，都会保留所有 state ，props 在执行时刻的值，这一点和 class 版本的组件具有很大的差异，class 版本会取到最新值。

```typescript
import React, { Component } from 'react';
class OldApp extends Component {


    constructor(props) {
        super(props);
        this.state = {
            count: 1
        }

    }

    testOnclick = () => {
        setTimeout(() => {
            console.log(this.state.count);
        }, 3000);
    }

    render() {
        return (
            <div>
                <div>
                    oldApp
                </div>
                <div>{this.state.count}</div>
                <button onClick={() => { this.setState({ count: this.state.count+1 }) }} >add</button>
                <button onClick={() => { this.testOnclick(); }} >show</button>
            </div>
        )
    }
}

export default OldApp;

```

多次点击 add ，交错点击 show，console 里输出最新状态的 count n 次。

```typescript
function App() {
  const [count, setCount] = useState({ name: 1 });

  function handleAlertClick() {
    setTimeout(() => {
      alert(count.name);

    }, 3000);
  }

  return (
    <div className="App">
      <OldApp />
      <p>{count.name}</p>
      <button onClick={() => { setCount({ name: count.name + 1 }) }} > add</button>
      <button onClick={() => { handleAlertClick() }} >alert</button>
    </div>
  );
}

export default App;

```

多次点击 add ，交错点击 alert ，console 多次出现被调用当时的值。

class 版本可以使用闭包修复，实际 Hooks 依赖 JavaScript 闭包。如果希望无状态组件获取到最新值，想 class 这样的表现，可以使用`useRef`

```typescript
function App() {
  const [count, setCount] = useState({ num: 1 });
  const lastCount=useRef(count);
  function handleAlertClick() {
    lastCount.current = count;
    setTimeout(() => {
      console.log(lastCount.current.num);
    }, 3000);
  }

  return (
    <div className="App">
      <p>{count.num}</p>
      <button onClick={() => { setCount({ num: count.num + 1 }) }} > add</button>
      <button onClick={() => { handleAlertClick() }} >alert</button>
    </div>
  );
}
```





## React Hooks

- useMemo：只有在某个依赖项改变时才会重新计算

  ```typescript
  const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
  ```

- useCallback：把内联函数以及依赖数组作为参数传入，将返回回调函数的 memoized 版本。

  ```typescript
  const memoizedCallback = useCallback(
    () => {
      doSomething(a, b);
    },
    [a, b],
  );
  ```

  直接定义的函数，在每次渲染时其实都会变化，这样的函数无法作为其他 Hook 的依赖存在，通过 useCallback 定义的函数，可作为其他 hooks 的依赖存在。当有多个 useEffect ，我们希望抽象出 useEffect 相同部分的逻辑，这部分逻辑依赖于 props 或者 state 时，可以考虑使用 useCallback。

- useContext：上下文

  ```typescript
  import React from 'react';
  export default React.createContext(null);
  ```

  ```jsx
  import React, { useEffect, useState, useRef, useReducer, useContext } from 'react';
  import './App.css';
  import Test from './Test';
  import ToDoContext from './ToDoContext';
  
  
  function App() {
    const [count, dispatch] = useReducer(reducer, { num: 1 })
  
    function reducer(state, action) {
      switch (action.type) {
        case 'add':
          return {
            ...state,
            num: state.num + 1
          }
      }
    }
  
    return (
      <ToDoContext.Provider value={{count,dispatch}} >
        <Test></Test>
      </ToDoContext.Provider>
    );
  }
  export default App;
  ```

  ```jsx
  import React, { useContext } from 'react';
  import ToDoContext from './ToDoContext';
  
  function Test() {
      const { count, dispatch } = useContext(ToDoContext);
      return (
          <div>{count.num}</div>
      )
  }
  export default Test;
  ```

  上下文用于解决 React 层层传递数据的问题，被包裹的子组件可以获取到全局数据，通常全局状态树会使用到上下文。

- useEffect：在 render 之后执行的的方法，可以理解为 `componentDidMount` 或者 `componentDidUpdate`生命周期经常完成的操作，但是不一样的是，我们可以通过传递依赖的形式，确保代码仅在依赖变化时执行，这点我们之前使用`shouldComponentUpdate`进行`props`的对比类似。

- useRef：使用 useRef 创建的对象和之间创建的对象的不同之处在于，useRef 返回的对象，在每次使用时会拿到最新值，而不是当次渲染值。

- useReducer：当改变状态的逻辑很复杂时，我们通常使用 useReducer 来实现，而其他地方只需要 dispatch 相应的 type 不需要关心如何改变。同时结合useContext 我们可以做到统一的状态树管理



## useEffect 详解

useEffect 用来处理会有副作用的操作，比如之前我们在生命周期函数中常常使用的获取数据操作。

```typescript
 useEffect(async () => {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=redux',
    );
 
    setData(result.data);
  });
```

但是这样并不理想，因为不经在组件加载时会执行，在组件更新时也会执行，因此，对于只需要在加载阶段执行的操作，我们通常给予一个空依赖。

```typescript
  useEffect(async () => {
    const result = await axios(
      'https://hn.algolia.com/api/v1/search?query=redux',
    );
 
    setData(result.data);
  }, []);
```

如此在第一次执行之后，useEffect 不会再执行，因为依赖未变化（为空）。

但是这样依然不完美，useEffect 并不希望函数有返回，而异步函数实际上会返回一个`AsyncFunction` ，会报警告，因此我们可以这样优化。

```typescript
useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'https://hn.algolia.com/api/v1/search?query=redux',
      );
 
      setData(result.data);
    };
 
    fetchData();
  }, []);
```

以上操作实际使用 effects 模拟了传统的生命周期函数`ComponentDidMount`。而实际上我们应该用不同的眼光来看待`useEffect`。

例如常见的查询获取数据操作

```` typescript
  const [search, setSearch] = useState('redux');
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        `http://hn.algolia.com/api/v1/search?query=${search}`,
      );
 
      setData(result.data);
    };
 
    fetchData();
  }, [search]);
 
````

页面操作改变 search ，依赖于 search 的 effect 重新执行。

当返回一个方法时，会在组件清除阶段执行。useEffect 是可选清除方式，不返回方法，默认不需要清除

```typescript
 useEffect(() => {
    function handleStatusChange(status) {
      setIsOnline(status.isOnline);
    }
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    // Specify how to clean up after this effect:
    return function cleanup() {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
```



### 错误处理

```typescript
 const [isError, setIsError] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
 
      try {
        const result = await axios(url);
 
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
 
      setIsLoading(false);
    };
 
    fetchData();
  }, [url]);
```

使用一个 state 存放错误，并显示在页面

### 自定义 Hook

我们将获取数据，错误判断，加载等从 APP 组件抽离，形成一个自定义的 Hooks。

```typescript
const useHackerNewsApi = () => {
  const [data, setData] = useState({ hits: [] });
  const [url, setUrl] = useState(
    'https://hn.algolia.com/api/v1/search?query=redux',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
 
      try {
        const result = await axios(url);
 
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
 
      setIsLoading(false);
    };
 
    fetchData();
  }, [url]);
 
  return [{ data, isLoading, isError }, setUrl];
}
```

在 App 中使用

```jsx
function App() {
  const [query, setQuery] = useState('redux');
  const [{ data, isLoading, isError }, doFetch] = useHackerNewsApi();
 
  return (
    <Fragment>
      <form onSubmit={event => {
        doFetch(`http://hn.algolia.com/api/v1/search?query=${query}`);
        event.preventDefault();
      }}>
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
 
      ...
    </Fragment>
  );
}
```

同样可以抽离初始值

```jsx
import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
 
const useDataApi = (initialUrl, initialData) => {
  const [data, setData] = useState(initialData);
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
 
  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
 
      try {
        const result = await axios(url);
 
        setData(result.data);
      } catch (error) {
        setIsError(true);
      }
 
      setIsLoading(false);
    };
 
    fetchData();
  }, [url]);
 
  return [{ data, isLoading, isError }, setUrl];
};
 
function App() {
  const [query, setQuery] = useState('redux');
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    'https://hn.algolia.com/api/v1/search?query=redux',
    { hits: [] },
  );
 
  return (
    <Fragment>
      <form
        onSubmit={event => {
          doFetch(
            `http://hn.algolia.com/api/v1/search?query=${query}`,
          );
 
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
 
      {isError && <div>Something went wrong ...</div>}
 
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {data.hits.map(item => (
            <li key={item.objectID}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
    </Fragment>
  );
}
 
export default App;
```



## 代码分片（code-spliting）

大部分应用会被打包到一个文件中，但是有很多代码不一定是首屏需要用到的。当项目越来越大时，我们可以分开打包，在运行时再加载。Code-Spliting 可以帮助我们实现 lazy-load ，减少在初次加载时下载的代码数量。

### import()

引入 Code-Spliting 的最佳方式在使用 import 的动态引入语法。

之前

```typescript
import { add } from './math';

console.log(add(16, 26));
```

之后

```typescript
import("./math").then(math => {
  console.log(math.add(16, 26));
});
```

如果是使用 create-react-app 创建的react 应用，当 webpack 处理时，会自动开始 Code-Spliting ，如果是自己从头创建的，则需要配置 webpack。

### React.lazy

React.lazy 允许我们渲染一个动态的 import 像一个普通的组件一样。

之前

```typescript
import OtherComponent from './OtherComponent';
```

之后

```typescript
const OtherComponent = React.lazy(()=>import('./OtherComponent'));
```

当 OtherComponet 被渲染时，才会自动加载包含这个组件的编译文件。

React.lazy 必须使用一个调用了 import() 的函数做为参数，返回一个 promise ，promise resolve 时是模块。动态加载模块需要在 `Suspense` 组件内使用。

```typescript
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

Fallback 属性接受一个 react component 当子组件在加载时展示，也可以放多个动态加载组件在内。

```typescript
import React, { Suspense } from 'react';

const OtherComponent = React.lazy(() => import('./OtherComponent'));
const AnotherComponent = React.lazy(() => import('./AnotherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <section>
          <OtherComponent />
          <AnotherComponent />
        </section>
      </Suspense>
    </div>
  );
}
```

### 错误处理

如果其他模块加载失败，例如因为网络原因，会触发一个错误，你可以通过展示一个良好用户体验的页面来处理这种错误既，[Error Boundaries](https://reactjs.org/docs/error-boundaries.html)。一旦创建了Error Boundaries 在任何地方展示，当发生错误时展示一个错误状态。

```typescript
import React, { Suspense } from 'react';
import MyErrorBoundary from './MyErrorBoundary';

const OtherComponent = React.lazy(() => import('./OtherComponent'));
const AnotherComponent = React.lazy(() => import('./AnotherComponent'));

const MyComponent = () => (
  <div>
    <MyErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <section>
          <OtherComponent />
          <AnotherComponent />
        </section>
      </Suspense>
    </MyErrorBoundary>
  </div>
);
```

### 基于路由的 Code-Spliting

如何妥善使用 Code Spliting 但是不影响用户的使用体验，一个合适的实践是基于路由来处理，一下是使用 `React-Router` 组件的示例。

```typescript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
      </Switch>
    </Suspense>
  </Router>
);
```

### 名称导出

当前 React.lazy 仅支持 default export，如果希望使用 name export 可以如下操作

```
// ManyComponents.js
export const MyComponent = /* ... */;
export const MyUnusedComponent = /* ... */;
// MyComponent.js
export { MyComponent as default } from "./ManyComponents.js";
// MyApp.js
import React, { lazy } from 'react';
const MyComponent = lazy(() => import("./MyComponent.js"));
```



## Context

> Context 提供了数据沿组件树一路传递的方法，而不需要手动赋值给 props 一级级传递数据

在典型的 react 应用里，数据通过 props 上下传递，但是对于一些特定的数据，例如全球化参数，主题等，很多组件都需要这些数据，Context 提供了在组件中共享数据的方式，而不是在每一级组件中被显式的赋值。

### 何时使用 Context

Context 被设计为共享那些被考虑为 "global" 的数据，例如主题，当前用户等。

```tsx
// Context lets us pass a value deep into the component tree
// without explicitly threading it through every component.
// Create a context for the current theme (with "light" as the default).
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
    // Use a Provider to pass the current theme to the tree below.
    // Any component can read it, no matter how deep it is.
    // In this example, we're passing "dark" as the current value.
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

// A component in the middle doesn't have to
// pass the theme down explicitly anymore.
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Component {
  // Assign a contextType to read the current theme context.
  // React will find the closest theme Provider above and use its value.
  // In this example, the current theme is "dark".
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```

### 在使用 Context 之前

Context 主要用于在很多不同层级组件共享数据，需要小心使用，因为它使组件重用变的困难。

**如果仅仅是想避免在多级组件中传递数据， component composition 提供了一个更简单的解决方案**

### API

#### React.createContext

```typescript
const MyContext = React.createContext(defaultValue);
```

创建一个 **Context** 对象，当订阅了这个 Context 对象的组件被渲染时，会从组件树中最靠近的 Provider 读到实时的 Context 值。

#### Context.Provider

```typescript
<MyContext.Provider value={/* some value */}>
```

每个 Context 对象需要和 Provider 组件配合使用，帮助子组件订阅 Context 对象的变化。属性 `value` 的值会被所有订阅了这个 context 的子组件使用。一个 Provider 可以被连接到多个子组件。当 Provider 的属性 value 发生变化时，所有被 Provider 包括的消费组件会被重新 render。这种重新 render 不被 `shouldComponentUpdate` 限制。新旧值的变化和 `Object.is` 使用了相同的算法。

#### Class.contextType

```typescript
class MyClass extends React.Component {
  componentDidMount() {
    let value = this.context;
    /* perform a side-effect at mount using the value of MyContext */
  }
  componentDidUpdate() {
    let value = this.context;
    /* ... */
  }
  componentWillUnmount() {
    let value = this.context;
    /* ... */
  }
  render() {
    let value = this.context;
    /* render something based on the value of MyContext */
  }
}
MyClass.contextType = MyContext;
```

contextType 属性可以被使用 Context 对象赋值，你可以使用 this.context 来消费上下文数据，this.context 可以在任意声明周期，甚至是 render 中使用。

> 这个 api 只可以订阅单个 Context 对象，如果需要从多个中获取，参考： [Consuming Multiple Contexts](https://reactjs.org/docs/context.html#consuming-multiple-contexts)

如果你有使用实验中的类属性语句，你可以使用静态类属性来初始化 Context。

```typescript
class MyClass extends React.Component {
  static contextType = MyContext;
  render() {
    let value = this.context;
    /* render something based on the value */
  }
}
```

#### Context.Consumer

```tsx
<MyContext.Consumer>
  {value => /* render something based on the context value */}
</MyContext.Consumer>
```

这是一个订阅 Context 变化的 react 组件，可以帮助我们在函数式组件中使用上下文。子组件必须是一个 function，这个 function 接受一个 Context 的当前值为参数而且返回一个 React 元素，这个值会和组件树中最近的 Provider 值相同。

#### Context.displayName

Context 对象接受一个 `displayName` 字符串属性，React DevTools 使用这个字符串来显示 Context。

例如：

```tsx
const MyContext = React.createContext(/* some value */);
MyContext.displayName = 'MyDisplayName';
<MyContext.Provider> // "MyDisplayName.Provider" in DevTools
<MyContext.Consumer> // "MyDisplayName.Consumer" in DevTools
```

### 示例

#### 动态 Context

一个更复杂的动态 Context 的例子如下，主要思路是将 Provider 的属性 value 放入组件的 state 。

**theme-context.js**

```
export const themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee',
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222',
  },
};

export const ThemeContext = React.createContext(  themes.dark // default value);
```



**themed-button.js**

```
import {ThemeContext} from './theme-context';

class ThemedButton extends React.Component {
  render() {
    let props = this.props;
    let theme = this.context;    
    return (
      <button
        {...props}
        style={{backgroundColor: theme.background}}
      />
    );
  }
}
ThemedButton.contextType = ThemeContext;
export default ThemedButton;
```



**app.js**

```
import {ThemeContext, themes} from './theme-context';
import ThemeTogglerButton from './theme-toggler-button';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.toggleTheme = () => {
      this.setState(state => ({
        theme:
          state.theme === themes.dark
            ? themes.light
            : themes.dark,
      }));
    };

    // State also contains the updater function so it will
    // be passed down into the context provider
    this.state = {
      theme: themes.light,
      toggleTheme: this.toggleTheme,
    };
  }

  render() {
    // The entire state is passed to the provider
    return (
      <ThemeContext.Provider value={this.state}>
        <Content />
      </ThemeContext.Provider>
    );
  }
}

function Content() {
  return (
    <div>
      <ThemeTogglerButton />
    </div>
  );
}

ReactDOM.render(<App />, document.root);
```

#### 订阅多个 Context

为了保持 Context 渲染速度，React 需要保持每个 Context 在树中是分开的节点。

```
// Theme context, default to light theme
const ThemeContext = React.createContext('light');

// Signed-in user context
const UserContext = React.createContext({
  name: 'Guest',
});

class App extends React.Component {
  render() {
    const {signedInUser, theme} = this.props;

    // App component that provides initial context values
    return (
      <ThemeContext.Provider value={theme}>
        <UserContext.Provider value={signedInUser}>
          <Layout />
        </UserContext.Provider>
      </ThemeContext.Provider>
    );
  }
}

function Layout() {
  return (
    <div>
      <Sidebar />
      <Content />
    </div>
  );
}

// A component may consume multiple contexts
function Content() {
  return (
    <ThemeContext.Consumer>
      {theme => (
        <UserContext.Consumer>
          {user => (
            <ProfilePage user={user} theme={theme} />
          )}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```



## Error Boundaries

> 在过去，组件内的 js 错误通常会破坏组件内部的状态，并且在下一次 render 时报错，而且 react 没有提供一种方式从错误中恢复。

### 介绍

部分 UI 代码的错误不应该破坏掉整个 APP 。为了解决这个问题，React 16 引入了一个新的概念 `error boundary` 。

Error Boundaries 是一个 react 组件，用于处理子组件树中所有的 js 错误，记录这些错误，并且显示一个 fallback 页面，而不是让整个组件树崩溃，Error Boundaries 处理所有在 render，Life Cycle，constructors中

注意：

Error Boundaries 无法捕捉这些错误

1. 事件处理。
2. 异步代码。
3. 服务端渲染。
4. Error Boundaries 自身的异常。

当一个类组件，定义了方法 [`static getDerivedStateFromError()`](https://reactjs.org/docs/react-component.html#static-getderivedstatefromerror)  或者 [`componentDidCatch()`](https://reactjs.org/docs/react-component.html#componentdidcatch)时会被认为是一个 Error Boundary 组件。使用 `static getDerivedStateFromError()` 来 render 一个发生异常时的 UI，使用 `componentDidCatch()` 来记录错误信息。

```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}
```

然后你可以在普通组件使用

```tsx
<ErrorBoundary>
  <MyWidget />
</ErrorBoundary>
```

Error Boundaries 和 try catch 相同的工作方式，但是仅类组件可以作为 Error Boundaries 。实践中，大部分情况下，会定义一个 Error Boundaries 然后在整个应用中使用。

### 何处使用

可以在整个应用外层使用，提示 something is error 类似服务端处理的方式。也可以在限定范围使用，防止异常让整个应用崩溃。

### 捕捉错误的新方式

在引入 Error Boundaries 之前，React 团队进行过讨论，因为在某些场景，白屏可能比显示错误的信息更合适，例如支付应用，聊天应用等。因此需要根据不同的场景考虑如何使用。

## Forwarding Refs

> Ref Fowarding 是一个用户把 ref 转发绑定到子元素上的技术手段，对大部分应用组件来说不会用到，但是对于一些类库组件确可能很有用。

### Forwarding refs to DOM components

考虑一个`FancyButton ` 组件，渲染一个元素的 dom 元素如下

```tsx
function FancyButton(props) {
  return (
    <button className="FancyButton">
      {props.children}
    </button>
  );
}
```

React 组件隐藏了自己的实现细节，其他使用 FancyButton 的组件一般不需要内部 button 组件的 ref。这是好的设计，因为能过阻止其他组件过度依赖内部的 DOM 结构。

但是一些应用层级的组件可能倾向于向使用传统的DOM一样使用这些组件，用于管理焦点，选中，动画等。

ref forward 是一个可选的特性，让组件可以获取到自己的 ref 并传递给下级子组件。

例如：

```tsx
const FancyButton = React.forwardRef((props, ref) => (
  <button ref={ref} className="FancyButton">
    {props.children}
  </button>
));

// You can now get a ref directly to the DOM button:
const ref = React.createRef();
<FancyButton ref={ref}>Click me!</FancyButton>;
```

通过这种方式，使用 FancyButton 的组件，可以直接获取到内部 Button 的 ref。

1. 我们使用 React.createRef 创建了一个 React ref ，并将它赋值给 ref 变量。
2. 通过制定 JSX 的属性，我们将 ref 传递给 FancyButton 组件。
3. React 传递 ref 通过调用方法 (props , ref) => ... 。
4. 我们将 ref 下放绑定到 button。
5. 当 ref 被指定后，ref.current 会被指到 button  DOM 节点。

第二个参数 ref 仅在使用 React.forwardRef 中可以使用，普通的函数组件或者类组件无法获取到 ref 参数。

ref forward 不限于原生 DOM 元素，react 元素同样可以。

## Fragments

> React 中可能会遇到一个组件系统返回多个元素的场景，使用 Framents 帮助我们返回多个元素而不需要给 DOM 添加额外的节点。

```tsx
render() {
  return (
    <React.Fragment>
      <ChildA />
      <ChildB />
      <ChildC />
    </React.Fragment>
  );
}
```

### 动机

一个常见的场景是返回多个元素，例如：

```tsx
class Table extends React.Component {
  render() {
    return (
      <table>
        <tr>
          <Columns />
        </tr>
      </table>
    );
  }
}
```

`<Colums>` 需要返回多个 td 来渲染页面，代码可能这样写

```tsx
class Columns extends React.Component {
  render() {
    return (
      <div>
        <td>Hello</td>
        <td>World</td>
      </div>
    );
  }
}
```

但是这会像 DOM 中添加  div 导致失效。

### 用法

```tsx
class Columns extends React.Component {
  render() {
    return (
      <React.Fragment>
        <td>Hello</td>
        <td>World</td>
      </React.Fragment>
    );
  }
}
```

于是我们这样使用。

### 简写

```tsx
class Columns extends React.Component {
  render() {
    return (
      <>
        <td>Hello</td>
        <td>World</td>
      </>
    );
  }
}
```

使用 `<></>` 可以有相同的效果，唯一的区别是不支持 key 属性。

### 带 key 属性的 Framents

key 是 Frament 唯一支持的属性。

## Higher-Order Components

> 高阶组件是复用组件逻辑的推荐技术，HOCs 并不是 React API 的一部分，他是 React 生态中出现的模式。

具体来说，**高阶组件是一个方法，接受一个组件作为参数，返回另外一个组件**。

```tsx
const EnhancedComponent = higherOrderComponent(WrappedComponent);
```

一般组件将 props 转换成 UI，但高阶组件是将一个组件转换成另一个组件。

高阶组件在 React 的第三方库中普遍存在，比如 Redux’s 的 connect 。

### 使用 HOC 解决横切关注点问题

Cross-Cutting Concerns ：横切关注点，部分关注点横切程序中的多个模块，既在多个模块中都有他，他们既被称为横切关注点，一个典型的例子就是日志系统。

我们之前使用 minix 处理这个问题，但是后来意识到带来的问题比解决的问题更多。

在 react 中组件是主要的重用单位，但是你会发现一些奇怪的情况，传统组件无法处理。例如下面的 CommentList 组件，订阅一个外部数据源，然后渲染一个评论列表。

```tsx
class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      // "DataSource" is some global data source
      comments: DataSource.getComments()
    };
  }

  componentDidMount() {
    // Subscribe to changes
    DataSource.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    // Clean up listener
    DataSource.removeChangeListener(this.handleChange);
  }

  handleChange() {
    // Update component state whenever the data source changes
    this.setState({
      comments: DataSource.getComments()
    });
  }

  render() {
    return (
      <div>
        {this.state.comments.map((comment) => (
          <Comment comment={comment} key={comment.id} />
        ))}
      </div>
    );
  }
}
```

## 集成其他库

React 能在任何 web 应用中使用，这个主题集中于 React 和其他类似于 jQuery  的集成，相同的 idea 也可以用于 React 组件和其他已存在代码的集成上。

### 与基于操作 DOM 的其他插件集成

React 对不由 React 创建的 DOM 元素的变化没有察觉，React 的更新依赖于它自身的内部抽象，如果相同的 DOM 被其他的库改变，React 会陷入困惑而且不会恢复。

这不意味着无法或者很难将 React 和以其他方式影响 DOM 的方式相结合，只是你需要留意做的事情。

最简单的避免冲突的方式是在更新状态时阻止 React 组件。你可以渲染一个 React 没有理由去更新的元素，例如空div `<div />`

### 如何解决问题

```jsx
class SomePlugin extends React.Component {
  componentDidMount() {
    this.$el = $(this.el);
    this.$el.somePlugin();
  }

  componentWillUnmount() {
    this.$el.somePlugin('destroy');
  }

  render() {
    return <div ref={el => this.el = el} />;
  }
}
```

和 Backbone 的集成内容跳过。

## 深入了解 JSX

本质上讲， JSX 只是提供了一种语法糖，实际上是 `React.createElement(component, props, ...children)` 方法。

JSX 代码：

```jsx
<MyButton color="blue" shadowSize={2}>
  Click Me
</MyButton>
```

编译成：

```javascript
React.createElement(
  MyButton,
  {color: 'blue', shadowSize: 2},
  'Click Me'
)
```

也可以使用自包含，没有子元素的标签：

```jsx
<div className="sidebar" />
```

编译成：

```javascript
React.createElement(
  'div',
  {className: 'sidebar'}
)
```

### 指定 React Element 类型

JSX 标签首字母大写时，即表示这是一个 React element 类型。

首字母大写类型的 JSX 标签指向一个 React 组件，这些标签会直接编译成名称变量，所以如果你使用 JSX `<Foo />`

表达式，`Foo` 必须在作用域中。

#### React 必须在作用域中

因为 JSX 编译调用 React.createElement， React 库必须在 JSX 代码的作用域中，例如，下面代码中的两个 import 都是有必要的，尽管 React 和 CustomButton 没有在 JavaScript 代码中直接使用到。

```jsx
import React from 'react';
import CustomButton from './CustomButton';

function WarningButton() {
  // return React.createElement(CustomButton, {color: 'red'}, null);
  return <CustomButton color="red" />;
}
```

如果没有使用 JavaScript 编译工具来加载 React ，而是直接使用的 `<script>` 标签，那 React 已经在全局作用域中。

### 使用 . 符号

同样可以使用 dot-notaion 符号来引用 React 组件，这样可以方便与使用单个模块来导出多个 React 组件，例如如果`MyComponents.DatePicker` 是一个组件，你可以在 JSX 中直接这样使用：

```jsx
import React from 'react';

const MyComponents = {
  DatePicker: function DatePicker(props) {
    return <div>Imagine a {props.color} datepicker here.</div>;
  }
}

function BlueDatePicker() {
  return <MyComponents.DatePicker color="blue" />;
}
```

### 用户定义组件必须大写首字母

当一个元素类型使用小写字母开头时，它指向的时内置组件，例如 `<div>` 或者`<span>`  ，内置组件在传递给 createElement 时是字符串的形式，例如'div'或者‘span’，但是首字母大写的组件传递给 createElement 时是React.createElement(Foo) 的形式，所以对应的组件必须要有定义，或者从其他文件中引入。

推荐使用大写开头来命名组件，如果已经有了小写开头的组件，建议赋值给大写开头的变量后再使用。

### 在运行时指定类型

不能使用表达式作为 React 元素的类型，如果你想使用表达式作为元素类型，只需要将表达式的值赋给一个大写字母开头的变量。例如：

```jsx
import React from 'react';
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
    // Wrong! JSX type can't be an expression.  
    return <components[props.storyType] story={props.story} />;
}
```

如下修复

```jsx
import React from 'react';
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  // Correct! JSX type can be a capitalized variable.  
    const SpecificStory = components[props.storyType];  
    return <SpecificStory story={props.story} />;
}
```

### JSX 中的属性

有几个不同的方式在 JSX 中指定属性

#### 使用 JavaScript 表达式作为属性

可以使用 JavaScript 表达式作为属性，使用 `{}` 包围，例如：

```jsx
<MyComponent foo={1 + 2 + 3 + 4} />
```

`if` 语句和 `for` 循环在 JavaScript 中并不是表达式，因此不能再 JSX 中直接使用，取而代之的，你可以这样使用

```jsx
function NumberDescriber(props) {
  let description;
  if (props.number % 2 == 0) {    
      description = <strong>even</strong>;  
  } else {    
      description = <i>odd</i>;  
  }  
  return <div>{props.number} is an {description} number</div>;
}
```

#### 字符串

可以直接在属性中使用字符串，以下两种表达是相同的：

```jsx
<MyComponent message="hello world" />

<MyComponent message={'hello world'} />
```

当直接使用字符串是，他的值是 HTML-unescaped ，下面两种表示相同：

```jsx
<MyComponent message="&lt;3" />

<MyComponent message={'<3'} />
```



#### 属性的默认值是 ”True“

如果你没有给属性赋予任何值，那它的值将会是 `true`，以下两中表达相同

```jsx
<MyTextBox autocomplete />

<MyTextBox autocomplete={true} />
```

#### 扩展属性

如果你已经有了一个属性对象，你想在 JSX 中使用，可以使用 `...` 作为扩展操作来传递整个属性对象，下面两个表达相同

```jsx
function App1() {
  return <Greeting firstName="Ben" lastName="Hector" />;
}

function App2() {
  const props = {firstName: 'Ben', lastName: 'Hector'};
  return <Greeting {...props} />;
}
```

#### JSX 子元素

在 JSX 表达方式中，被标签包围的内容，会被构造成一个特色的属性 `props.children`。有以下几种不同的方式在处理子元素

##### 字符串

可以在标签中放置一个字符串，`props.children` 也会被指定成这个字符串，这在很多内置的 HTML 元素中会用到。

```jsx
<MyComponent>Hello world!</MyComponent>
```

这是一种可用的表达形式，`MyComponent` 组件的 `props.children` 会简单的变成字符串 `Hello world！` 字符串中的换行会被移除。

##### JSX 子元素

你可以提供更多的 JSX 元素作为子组件，在展示一些嵌套时很有用：

```jsx
<MyContainer>
  <MyFirstComponent />
  <MySecondComponent />
</MyContainer>
```

你也能混合几种不同类型的子元素，例如 JSX 元素和字符串元素，他们像 HTML 一样组合在一起。

```JSX
<div>
  Here is a list:
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</div>
```

React 组件也可以返回一个元素数组。

```jsx
render() {
  // No need to wrap list items in an extra element!
  return [
    // Don't forget the keys :)
    <li key="A">First item</li>,
    <li key="B">Second item</li>,
    <li key="C">Third item</li>,
  ];
}
```

##### JavaScript 表达式作为子元素

你可以使用 JavaScript 表达式作为子元素，只需要用 `{}` 来包含，例如以下两种表达相同

```jsx
<MyComponent>foo</MyComponent>

<MyComponent>{'foo'}</MyComponent>
```

在用于渲染未知长度的列表时经常用到。

```jsx
function Item(props) {
  return <li>{props.message}</li>;
}

function TodoList() {
  const todos = ['finish doc', 'submit pr', 'nag dan to review'];
  return (
    <ul>
      {todos.map((message) => <Item key={message} message={message} />)}
    </ul>
  );
}
```

JavaScript 表达式也能和其他类型混合，例如

```jsx
function Hello(props) {
  return <div>Hello {props.addressee}!</div>;
}

```

##### 方法作为子组件

通常来说，JSX 表达式会被计算为字符串，React 元素，一些元素的列表等，但是 `props.children` 和其他属性一样工作，可以被传递任何数据，例如：

```jsx
function Repeat(props) {
  let items = [];
  for (let i = 0; i < props.numTimes; i++) {
    items.push(props.children(i));
  }
  return <div>{items}</div>;
}

function ListOfTenThings() {
  return (
    <Repeat numTimes={10}>
      {(index) => <div key={index}>This is item {index} in the list</div>}
    </Repeat>
  );
}
```

##### Booleans，Null 和 Undefined 会被忽视

`false`，`null`，`undefined` 和`true` 是不可用的子元素，他们不会被渲染，这些 Jsx 表达式会有相同的结果：

```jsx
<div />

<div></div>

<div>{false}</div>

<div>{null}</div>

<div>{undefined}</div>

<div>{true}</div>
```

这在有条件的渲染 React 组件时经常用到，例如下面的 `<Header />` 只有在 `showHeader` 时 `true` 时渲染：

```jsx
<div>
  {showHeader && <Header />}
  <Content />
</div>
```

注意，这对一些可转化成 false 的表达式不适用，例如数字 0。

如果你想渲染这些类型的数据，可以将他们转化成 string，例如

```jsx
<div>
  My JavaScript variable is {String(myVariable)}.
</div>
```

## 性能优化

React 使用了很聪明的技术来优化更新 DOM 的次数，对大部分应用来说，使用 React 不用做任何事情，也能有优秀的性能。尽管如此，哦我们一人有提升 React 应用的方法。

### 使用生产配置来编译

如果你在衡量或者试图优化 React app 的性能，首先要确保你在使用最优的生产编译配置。

在默认设置下，React 包含了很多有用的警告，这些警告在开发中非常有用，但是他们让 React 变大更加庞大和缓慢，所以在部署应用时，一定要确保使用的是生产版本。

如果你不确定编译设定是否争取，你可以通过安装 React 开发工具插件来检查。

### Create React App

如果你的应用是使用 Create React App 脚手架建设的，执行：

```shell
npm run build
```

这会帮你编译应用的生产版本，这是你在发布前唯一需要执行的操作。

### Signle-File Builds

我们提供编译版本的 React 和 React Dom 作为单个文件：

```js
<script src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
```



### webpack

Webpack v4+ 会自动最小化你的代码，当设置成 `production` 模式时。

```js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  optimization: {
    minimizer: [new TerserPlugin({ /* additional options here */ })],
  },
};
```

记住仅在 `production` 编译模式下需要这样设定，在开发环境下请不要使用 `TerserPlugin` ，因为这会隐藏 React 的提醒，而且让编译变得缓慢。

### 使用 Chrome Performace Tab 可视化组件装载过程

在开发模式下，使用 Chrome 的性能工具，可以讲组件如何加载，更新，卸载的过程可视化出来：

![React components in Chrome timeline](https://reactjs.org/static/64d522b74fb585f1abada9801f85fa9d/1ac66/react-perf-chrome-timeline.png)



### 使用 React 开发工具来可视化性能

### 虚拟化长列表

如果你的应用需要渲染一个长列表（几百或上千行），我们建议使用”windowing“的技术，这个技术仅会渲染一小部分子集，这能减少 DOM 节点创建时间。

[react-window](https://react-window.now.sh/#/examples/list/fixed-size) 和 [react-virtualized](https://bvaughn.github.io/react-virtualized/#/components/List) 时两个流行的窗口化库，他们提供了集中重用组件来展示列表等数据，你也可以创建你自己的窗口化组件，例如 [Twitter](https://medium.com/@paularmstrong/twitter-lite-and-high-performance-react-progressive-web-apps-at-scale-d28a00e780a3)  的做法，如果你想给你的组件量身定制的话。

### 避免调和

React 构建和维持了一个针对已渲染 UI 的内部表现，包含了所有你从组件中 return 的元素，这个表现可以让 React 仅在必要时才创建和操作 DOM 元素。

当一个组件的属性或者状态改变时，React 会计算新的 renturn 和之前的镜像比较，当不一样时，React 会更新 Dom。

尽管 React 只更新改变的 DOM 节点，重渲染依然会花费一些时间，在大部分情况下这不会成为一个问题，但是当这种缓慢可以被察觉到时，你可以通过重载生命周期函数 `shouldComponentUpdate` 来是实现速度优化。

在大多数情况下，你可以通过继承 `React.PureComponent` 来替代重写 `shouldComponentUpdate` ，这个继承实际上实现了一个 `shouldComponentUpdate`  方法，这个方法回浅比较当前和上一个状态的 props 和 state。

### ShouldComponentUpdate 的执行过程

![should component update](https://reactjs.org/static/5ee1bdf4779af06072a17b7a0654f6db/cd039/should-component-update.png)

### 其他

当你处理深层嵌套的对象数据时，更新他们可能会事件繁琐的事情，这时可检查  [Immer](https://github.com/mweststrate/immer) 或 [immutability-helper](https://github.com/kolodny/immutability-helper) 库，这可以在不牺牲性能的同时快速更新到对象。



## Portals

提供一种方法讲允许子节点渲染到父组件意外的 DOM 节点。

```jsx
ReactDOM.createPortal(child, container)
```

第一个参数是任意可被渲染你的 React 元素，第二个参数，是一个 DOM 元素

### 用法

一般来讲，当从组件周昂返回一个元素时，它被挂在与 DOM  上作为一个子元素，但是有些时候，讲子元素插入到 DOM 的任意位置也是有用的，一个典型的使用场景便是 `Modal` ，`tooltips` 等。

### 事件冒泡

尽管 Portal 可以在 DOM 树的任意地方，但是它依然和普通的 React child 的行为一致，作为一个 portal ，它仍然在 react tree 的原来位置，而无论 DOM 树是怎样的。

这包括事件冒泡，一个事件从 portal 内部发出，会沿着 react 树向祖先元素传播。



## Profiler API

`Profiler`  可以衡量一个 React 应用的渲染事件，帮助定位应用中的缓慢部分。

注意：Profiling 添加了一些额外的部分，所以它在生产模式编译时会被禁用。对与生产下进行探查的需求，React 提供了一个特殊的探查版用于打开探查功能，[fb.me/react-profiling](https://fb.me/react-profiling)

### 用法

一个 `Profiler` 可以被加在 React 树的任意地方，来很亮这部分树的渲染耗时。他需要两个属性：`id` 和 `onRender` 回调。例如下面探查一个 `Navigation` 组件的方式：

```jsx
render(
  <App>
    <Profiler id="Navigation" onRender={callback}>      <Navigation {...props} />
    </Profiler>
    <Main {...props} />
  </App>
);
```

探查组件可以嵌套或者并排

```jsx
render(
  <App>
    <Profiler id="Navigation" onRender={callback}>      <Navigation {...props} />
    </Profiler>
    <Profiler id="Main" onRender={callback}>      <Main {...props} />
    </Profiler>
  </App>
);
```

```jsx
render(
  <App>
    <Profiler id="Panel" onRender={callback}>      <Panel {...props}>
        <Profiler id="Content" onRender={callback}>          <Content {...props} />
        </Profiler>
        <Profiler id="PreviewPane" onRender={callback}>          <PreviewPane {...props} />
        </Profiler>
      </Panel>
    </Profiler>
  </App>
);
```

注意，`Profiler` 尽管是一个轻量的组件，它仍然应该尽在必要时使用，因为它会添加 CPU 的开销和内存的负担。

### onRender Callback

`Profiler` 需要一个 `onRender` 方法，React 调用这个方法，每当组件出发更新时，他会收到描述渲染时间的参数

```jsx
function onRenderCallback(
  id, // the "id" prop of the Profiler tree that has just committed
  phase, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
  actualDuration, // time spent rendering the committed update
  baseDuration, // estimated time to render the entire subtree without memoization
  startTime, // when React began rendering this update
  commitTime, // when React committed this update
  interactions // the Set of interactions belonging to this update
) {
  // Aggregate or log render timings...
}
```



## React 的调和过程

React 提供了陈述式的 API ，让我们不用担心每次更新实际上的变化，这让我们编写一个应用程序变得更容易，但是 React 如何实现的细节可能不是那么显而易见，这篇文章解释了我们在打造 React diffing 算法中的选择和决定。

### 动机

当你使用 React 时，唯一你需要思考的关注点时 render 方法，在下一个状态或者属性更新时，render 方法会返回一个不同的React 树，于是 React 需要解决，如何比较两个树，来最有效率的更新 UI。

有一些通用的算法来处理将一个树转换成另一个树的问题，但是通常拥有 O(n3)  的复杂度，如果我们使用这个算法，那展示 1000 个元素，将需要对比百万次，代价过于高昂，取而代之的是，React 实现了一个启发式的算法基于以下两个假设：

1. 两个不同类型的元素会产生不同的树。
2. 开发者可以通过 key 属性，表示不同渲染的两个元素是否相同。

在实践中，这两个假设被验证是可行的。

### Diffing 算法

当 diffing 两个树时，React 首先比价两个 root 的元素。

#### 元素类型不相同

无论什么时候，当 root 元素有两个不同的类型时，React 会直接干掉旧的树，而且构建一个新树来代替。当销毁一个旧的树时，组件实例会收到 `componentWillUnmount()` 方法，当构造一个新树时，新的 DOM 节点会被插入到 DOM 中，组件会收到 `componentWillMount()` 然后收到 `componentDidMount()` ，任何和旧树相关的状态会消失掉。

#### DOM 类型而且类型相同

当比较两个 React DOM 元素时，React 会关注两边的属性，保留相同的，而仅更新有变化的。

#### 组件类型而且类型相同

当一个组件更新时，实例依然时同一个，所以状态会在整个渲染过程中保留，React 会更新组件实例的属性，来匹配新的袁术，然后调用实例中的 `componentWillReceiveProps` 方法和 `componentWillUpdate` 方法。

接下来，render 方法会被调用，diff 算法递归向下调用。

#### 子元素列表

默认的，当递归一个 DOM 节点的子元素时，React 简单的列出两边的 list ，然后按顺序比较。

##### Keys

为了解决这个问题，React 支持 key 属性。

### 权衡

## Refs 和 DOM

> Refs 提供了一种访问 DOM 节点或者 React 元素的方式

在典型的 React 数据流中，`props` 是唯一的父组件和子组件沟通的方式。为了改变子元素，你需要使用新的属性重新渲染它。然而，仍然有少数的情况你需要直接修改子元素。

### 何时使用

refs 有以下几个最佳实践

- 管理 focus，文本选择，或者媒体播放
- 触发重要的动画
- 和第三方 DOM 库集成

除非无法实现，否则请尽量避免使用 Ref



### 不要过度使用

你可能会认为 ref 可以做到任何可能的事请，如果你是这样想的，不妨审慎思考一下，是否有其他途径来实现，尤其是组件状态的层级问题是否有正确的设计。

### 创建 Ref

可以使用 `React.createRef()` 来创建 Refs ，通常在构造函数方法内将 React 元素赋值给一个实例的 `ref` 属性。一下是一个实例：

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  render() {
    return <div ref={this.myRef} />;
  }
}
```

### 访问 Refs

当在 `render` 方法中绑定 ref 后，node 就可以通过 ref 的 current 属性来访问到

```jsx
const node=this.myRef.current;
```

ref 的值取决于 node 的类别：

- 但 ref 属性在 html 元素中使用时，在构造函数调用的 `React.createRef()` 会接收到 DOM 元素作为他的 current 属性。
- 但 ref 属性在自定义组件中用到时，ref 对象会接收到一个组件实例作为他的 current 属性
- 你不可以在函数式组件中使用 ref 属性，因为他们不具备一个实例。

以下示例展示了他们的区别

### 给 DOM 元素添加 REF

以下示例使用了 `ref` 来保存一个 DOM 节点的引用：

```jsx
class CustomTextInput extends React.Component{
    constructor(props){
        super(props);
        this.textInput=React.createRef();
        this.focusTextInput=this.focusTextInput.bind(this);
    }
    
    focusTextInput(){
        this.textInput.current.focus();
    }
    
    render(){
        return(
        	<div>
            	<input type='text' ref={this.textInput}  />
                <input 
                    type='button' 
                    value='Focus the text input' 
                    onClick={this.focusTextInput}
                />
            </div>
        )
    }
}
```

React 会在组件加载时将 DOM 元素赋值给 current 属性，而且在卸载时赋予 null 值，ref 的更新发生在 `componentDidMount` 或者 `componentDidUpdate` 生命周期函数之前。

### 给 Class 类型组件添加 ref

如果在 `CustomerTextInput` 上层有类似的逻辑，我们可以使用 ref 来获取到自定义的 input 而且调用它的 `focusTextInput` 方法。

```JSX
class AutoFocusTextInput extends React.Component{
    constructor(props){
        super(props);
        this.textInput=React.createRef();
    }
    
    componentDidMount(){
        this.textInput.current.focusTextInput();
    }
    
    render(){
        return(
        	<CustomerTextInput ref={this.textInput}  />
        )
    }
}
```

注意这仅当 `CustomTextInput` 使用 class 来声明时才有用

### 给函数式组件添加 REF

默认的，我们可能没有办法在一个函数式组件中使用 ref 属性，因为他们并没有一个实例：

```jsx
function MyFunctionComponent(){
    return <input />;
}

class Parent extends React.Component{
    constructor(props){
        super(props);
        this.textInput=React.createRef();
    }
    
    render(){
        //不会正常工作
        return(
        	<MyFunctionComponent ref={this.textInput}  />
        )
        
    }
}
```

如果你想允许人们获取你的函数式组件的 ref，你可能要使用 forwardRef 或者你可以将他转换成一个类声明的组件。

然而，你能在函数式组件的内部使用 ref，无论指向一个 DOM 元素，还是一个类声明的元素。

```jsx
function CustomTextInput(props){
    const textInput=useRef(null);
    
    function handleClick(){
        textInput.current.focus();
    }
    
    return(
    	<div>
        	<input 
            	type='text'
                ref={textInput}
            />
            <input 
            	type='button'
                value='Focus the text input'
                onClick={handleClick}
            />
        </div>
    )
}
```

### 向父组件暴露 DOM Refs

在极其稀有的场景下，你会想要通过父组件访问其子元素的 DOM ，这通常时不推荐的，因为这打破的组件封装，但是这有时会很有用，当需要监控 focus 或者计算子元素的位置和大小时。

你可能会给子组件添加 ref ，但是这不是个好主意，你只能得到一个组件实例，而不是一个 DOM 节点，而且，这在函数式组件中并不可用。

如果你在使用 React 16.3 以上的版本，我们推荐使用 [ref forwarding](https://reactjs.org/docs/forwarding-refs.html) ，Ref forwarding 让组件选项透传出任意子元素的 ref 作为他们自己的 ref，这里是一个实例，[in the ref forwarding documentation](https://reactjs.org/docs/forwarding-refs.html#forwarding-refs-to-dom-components) 

如果你使用的是 React 16.2 或者更低，你需要更复杂的方案来实现，你可以使用

 [this alternative approach](https://gist.github.com/gaearon/1a018a023347fe1c2476073330cc5509) 来使用一个命名的属性显式传递 ref。

在可能的情况下，我们建议不要透传 DOM 节点。

### 回调式 Ref

React 也支持另外一种方式设置 ref 叫做 "callback refs"，这种方式给了我们更细粒度控制 refs 的方法

不同于使用 createRef 创建传递一个 ref 的属性，传递一个方法，这个方法接受一个 dom 节点或者有一个 react 组件实例作为参数，他们可以被保存起来，在任意地方被访问。

下面是使用这种方式的一个实例：

```jsx
class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.textInput = null;
    this.setTextInputRef = element => {      
        this.textInput = element;   
    };
    this.focusTextInput = () => {      
        // Focus the text input using the raw DOM API      
        if (this.textInput) 
            this.textInput.focus();    
    };  
  }

  componentDidMount() {
    // autofocus the input on mount
    this.focusTextInput();  }

  render() {
    // Use the `ref` callback to store a reference to the text input DOM
    // element in an instance field (for example, this.textInput).
    return (
      <div>
        <input
          type="text"
          ref={this.setTextInputRef}        />
        <input
          type="button"
          value="Focus the text input"
          onClick={this.focusTextInput}        />
      </div>
    );
  }
}
```

在上面的例子中，父元素通过传递 `CustomTextInput`  属性获取到子元素 input 的 ref。

### 创建 REF 的注意事项

如果你使用行内函数来定义的 ref 回调，他会在 update 期间更新两次，第一次传递 null 再次才传递 DOM 元素，这是因为每次 render 都会创建一个新的函数实例，react 需要清除旧的 ref 设置一个新的。你可以通过定义 ref 回调在一个类上。



## 渲染属性

> 主题 `render prop`  指的是在 React 组件间共享数据的方法，通过设置方法作为属性的值

拥有 `render` 属性的组件，会使用 `render` 属性的方法代理自身的 render 方法，来进行渲染。

```jsx
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
```

[React Router](https://reacttraining.com/react-router/web/api/Route/render-func), [Downshift](https://github.com/paypal/downshift)  和 [Formik](https://github.com/jaredpalmer/formik) 库都有使用到 render 属性。在本文中，我们将进行讨论，为什么 render 属性是有用的，以及如何编写你自己的。

### 使用 Render 属性处理关注点横切问题

组件在 react 中是主要的代码复用单元，但是如何将一个组件的状态和行为共享给其他组件并不总是清晰明确的。

例如，下面的组件追踪了 web app 的鼠标位置：

```jsx
class MouseTracker extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        <h1>Move the mouse around!</h1>
        <p>The current mouse position is ({this.state.x}, {this.state.y})</p>
      </div>
    );
  }
}
```

随着鼠标在屏幕上的移动，组件显示他的 横纵坐标在 p 元素节点中。

现在问题是，我们如何在其他组件中重用这种行为，换句话说，如果另外的组件需要知道鼠标位置，我们可以封装这种行为，以便我们轻松的在组件中共享和使用吗。

使用 render props 的方案

```jsx
class Cat extends React.Component {
  render() {
    const mouse = this.props.mouse;
    return (
      <img src="/cat.jpg" style={{ position: 'absolute', left: mouse.x, top: mouse.y }} />
    );
  }
}

class Mouse extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.state = { x: 0, y: 0 };
  }

  handleMouseMove(event) {
    this.setState({
      x: event.clientX,
      y: event.clientY
    });
  }

  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>

        {/*
          Instead of providing a static representation of what <Mouse> renders,
          use the `render` prop to dynamically determine what to render.
        */}
        {this.props.render(this.state)}
      </div>
    );
  }
}

class MouseTracker extends React.Component {
  render() {
    return (
      <div>
        <h1>Move the mouse around!</h1>
        <Mouse render={mouse => (
          <Cat mouse={mouse} />
        )}/>
      </div>
    );
  }
}
```

### 使用其他组件和 render 的区别

很重要的一点是，这种模式叫做 "render props" 并不意味着只能用一个命名为 `render` 的属性来实现这种模式，实际上，任意属性都可以实现这种技术。

我们可以轻松的使用 `children` 属性来实现它。

### 注意事项

#### 对于继承 React.PureComponent 的组件谨慎使用

使用 render 属性会抹除使用 React.PureComponent 组件的优势，如果你在 render 属性内创建函数，那每次对 props 的比较都将不相同。



## 静态类型检查

## 严格模式

> 严格模式是高亮潜在问题的一种方式，像 Fragment ，StrictMode 不会渲染任何可见的 UI ，它激活了潜在的检查和警告

严格模式检查仅在开发模式下游泳，他们对生产编译不会有任何影响

你可以在应用的任何部分打开 strict mode 例如：

```tsx
import React from 'react';

function ExampleApplication() {
  return (
    <div>
      <Header />
      <React.StrictMode>
        <div>
          <ComponentOne />
          <ComponentTwo />
        </div>
      </React.StrictMode>
      <Footer />
    </div>
  );
}
```

在上面的例子中，严格模式检查不会在 `Header` 和 `Footer` 组件中生效，只有 `ComponentOne` 和 `ComponentTwo` 以及他们的子元素会应用检查。

严格模式会在一下几点有助于我们：

- 定位使用不安全什么周期函数的组件
- 对遗留 string ref 的使用进行警告
- 警告弃用的 findDOMNode 方法
- 检测意外的副作用
- 探测将被废弃的  context api

### 定位不安全的生命周期

某些生命周期方法在异步 react 应用中可能是不安全的，然而，如果你的应用使用了第三方库，很难确保这些库是否有使用这些到这些生命周期函数，幸运的是，严格模式会帮助到我们。

当严格模式开启时，React 会列出所有使用了不安全生命周期的组件，而且在 console 中打印出来

![image-20201118174745768](C:\Users\p_weifpeng.TENCENT\AppData\Roaming\Typora\typora-user-images\image-20201118174745768.png)

### 对遗留 string ref 的使用进行警告

我们知道，react 提供了两种使用和关联 ref 的方法，legacy string ref api 和 callback api，尽管 string ref 看上去似乎更方便，但是基于  [several downsides](https://github.com/facebook/react/issues/1373) 我们官方推荐使用 callback ref 代替 string ref

React 16.3 添加了第三个选项来使用 string ref 而没有任何缺陷

```jsx
class MyComponent extends React.Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  render() {
    return <input type="text" ref={this.inputRef} />;
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }
}
```

### 警告弃用的 findDOMNode 方法

React 过去支持 findDOMNOde 方法来打破抽象，直接找到 DOM 元素。但是现在有了 ref 所有实际上我们不再需要该方法。

### 检测意外的副作用

概念上讲，React 在完成工作可以分为两个阶段：

- render 阶段：确定需要应用到 DOM 的修改，在这个阶段，React 调用 `render` 然后和上一次的 render 结果进行比较
- commit 阶段：React 应用变更到 DOM，同时也会调用生命周期方法，像 `componentDidMount` 和 `componentDidUpdate` 。

### 探测将被废弃的  context api

## 非受控组件

> 在大多数情况下，我们建议使用受控组件来实现表单，在受控组件中，表单数据被 react 组件处理。另外一个选项是非受控组件，表单数据将由 DOM 自身处理

非受控：

```jsx
class Form extends Component {
  handleSubmitClick = () => {
    const name = this._name.value;
    // do something with `name`
  }

  render() {
    return (
      <div>
        <input type="text" ref={input => this._name = input} />
        <button onClick={this.handleSubmitClick}>Sign up</button>
      </div>
    );
  }
}
```

受控：

```jsx
class Form extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
    };
  }

  handleNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  render() {
    return (
      <div>
        <input
          type="text"
          value={this.state.name}
          onChange={this.handleNameChange}
        />
      </div>
    );
  }
}
```

区别在于是否要将 form 的 value 保存到状态中。

尽管一个非受控组件会保存 DOM 的真实数据，在某些时候，这对于集成 react 和非 react 代码很有用处，而且这种方式看上去代码更少和更高效，但是，我们仍然建议使用受控组件。

### 默认值

在 react 渲染生命周期中，元素的`value` 属性会覆盖 DOM 的 vaule，但使用一个非受控组件时，你通常希望 react 特别指定默认值，但是在后续的更新中离开。为了处理这种案例，你可以通过传递 `defaultValue` 代替传递 `value` 。组件转载后改变 defaultValue 将不会更新 dom 的value。

### 文件类型的 input

在 html 中，`<input type="file">` 让用户可以从他们的设备中选择一个或多个文件。在 React 中，`<input type="file" />` 总是一个非受控组件，因为他的值无法被用户设置，而且不可编程。

你可以使用 FILE API 来和文件交互，下面的例子展示了如果通过创建一个 DOM 节点的 ref 来在提交前访问文件

```jsx
class FileInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }
  handleSubmit(event) {
    event.preventDefault();
    alert(
      `Selected file - ${this.fileInput.current.files[0].name}`
    );
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Upload file:
          <input type="file" ref={this.fileInput} />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    );
  }
}

ReactDOM.render(
  <FileInput />,
  document.getElementById('root')
);
```

## Web Components

> react 和  [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) 为了处理不同的问题而构造，web component 为可复用的组件提供了强封装，但是 react 提供了一个声明式的库来保持 DOM 和数据的同步，这两个目标是互补的，作为一个开发者，你可以在你的 web component 中自由的使用 react，或者在 React 中使用 web component。

大多数使用 react 的用户不会使用到 web component，但是你可能会想使用，尤其是当你使用第三方的由 web component 编写的 UI 组件时。

### 在 react 中使用 web component

```jsx
class HelloMessage extends React.Component {
  render() {
    return <div>Hello <x-search>{this.props.name}</x-search>!</div>;
  }
}
```































​	