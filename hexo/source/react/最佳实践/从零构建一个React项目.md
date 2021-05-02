# 从零构建一个React项目

## Start

新建文件夹，执行

```shell
yarn init
```



## 安装基础包

```shell
yarn add react react-dom
yarn add webpack webpack-cli
```

## 简单编写代码

1. 添加 src 文件夹

2. 在 src 添加 index.js 文件

3. index.js 文件内容：

   ```typescript
   import ReactDom from 'react-dom';
   
   ReactDom.render('xxx',document.getElementById('root'));
   ```

4. 添加 webpack.config.js 配置简单配置webpack

   ```typescript
   module.exports={
       entry:'./src/index.js',
       output:{
           filename:'./index.js'
       }
   }
   ```

5. 编辑 package.json 文件，添加编译命令

   ```typescript
     "scripts": {
       "build": "webpack "
     },
   ```

6. 命令行执行编译命令

   ```shell
   yarn run build
   ```

完成最简版本前端项目，编译出 index.js 手动创建 index.html 添加对该 js 的引用

**index.html**

```html
<html><body><div id="root"></div><script src="./index.js"></script></body></html>
```

## 使用第一个插件

简单版需要手动创建 html 和手动引用资源文件，显然我们并不想这么干，在 css ，图片，等资源丰富之后，一个个手动新增并不现实，于是我们需要一个插件帮助在 build 阶段实现自动输出 index.html。

### 使用 HtmlWebpackPlugin 插件	

1. 安装

   ```shell
   yarn add --dev html-webpack-plugin
   ```

2. 在 src 下创建 index.html 模板文件，内容如下

   ```html
   <html>
       <body>
           <div id='root'>
   
           </div>
       </body>
   </html>
   ```

3. 配置使用

   ```typescript
   const HtmlWebpackPlugin=require('html-webpack-plugin');
   module.exports={
       entry:'./src/index.js',
       output:{
           filename:'./index.js'
       },
       plugins:[
           new HtmlWebpackPlugin({
               template:'./src/index.html'
           })
       ]
   }
   ```

4. 再次 build 在 dist 文件夹可以看到 index.js 和 index.html 文件，使用浏览器打开 index.html 出现如我们所期望的内容。



## 更近一步

简单项目我们使用了 ReactDom 挂载简单的内容到指定 Dom 容器中，显然我们实际工作中并不会如此简单，更近一步的，我们需要做到

- 使用 TypeScript 
- 使用 JSX
- 使用 webpack dev server
- 引用 CSS 文件
- 引用静态图片文件

### 使用JSX

1. 创建`src/app`文件夹，新建`index.js`文件，内容如下：

   ```typescript
   import { Component } from 'react'
   class Index extends Component {
       render() {
           return 'xxxx';
       }
   }
   export default Index;
   ```

2. 在 `src/index.js` 中使用 `jsx`

   ```typescript
   import ReactDom from 'react-dom';
   import App from './app/index';
   
   ReactDom.render(<App />,document.getElementById('root'));
   ```

3. 执行 `yarn run build ` 这时会报错，因为 `jsx` 作为 js 的语法扩展，并不被原生 js 支持，我们需要配置webpack，使用`babel-loader`

4. 安装 `yarn add --dev babel-loader @babel/preset-react`

5. 配置 webpack.config.js

   ```typescript
    module: {
           rules: [
               {
                   test: /\.(ts|js|tsx)?$/,
                   use: [
                       {
                           loader: 'babel-loader',
                           options: {
                               presets: ['@babel/preset-react']
                           }
                       }
                   ],
                   exclude: /node_modules/,
               },
           ],
       },
   ```

6. 执行 `yarn run build` 可以看到成功编译

7. 打开 index.html 文件，页面空白，控制台报错 `react is not defined` 发现编译后没有React库

8. 修改 `src/index.js`，添加对 React 的引用

   ```typescript
   import ReactDom from 'react-dom';
   import React from 'react';
   import App from './app/index';
   
   ReactDom.render(<App />,document.getElementById('root'));
   ```

   

9. 修改 `src/app/index.js` ，添加对 React 的引用

   ```typescript
   import React, { Component } from 'react'
   
   class Index extends Component {
   
       render() {
           return (
               <div>
                   xxxxxxxxxxx
               </div>
           );
       }
   }
   
   export default Index;
   ```

10. 再次编译后，提示成功，打开 html 页面，显示正常。



### 使用 TypeScript

1. 修改 `src/app/index.js` 文件名后缀为 `index.tsx`

2. 修改 `src/app/index.tsx` 内容为

   ```typescript
   import React, { Component } from 'react'
   
   interface IndexProps {
       name: string;
       age: number;
   }
   
   class Index extends Component<IndexProps> {
   
       render() {
           return (
               <div>
                   xxxxxxxxxxx
               </div>
           );
       }
   }
   
   export default Index;
   ```

3. 修改 `src/index.js` 文件名后缀为 `index.tsx`

4. 添加插件 `yarn add --dev typescript awesome-typescript-loader source-map-loader`

5. 修改webpack配置，添加 Loader

   ```typescript
   { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
     
     
   ```

   添加 resolve 配置，实现 webpack 对 `tsx` 后缀文件的识别

   ```typescript
   resolve: {
       extensions: ['.tsx', '.ts', '.js'],
   }
   ```

6. 添加 `tsconfig.json` 配置 typescript 编译器选项

   ```typescript
   {
       "compilerOptions": {
           "outDir": "./dist/",
           "sourceMap": true,
           "noImplicitAny": true,
           "module": "commonjs",
           "target": "es5",
           "esModuleInterop": true,
           "jsx": "react"
       },
       "include": [
           "src"
       ],
   }
   ```

   注意，不添加 esModuleInterop 会导致一些没有默认导出的外部模块报错

7. 执行编译，如期报错，因为我们在使用组件时没有给组件添加属性。

8. 修改 `src/index.tsx` 文件内容如下

   ```typescript
   import ReactDOM from 'react-dom';
   import React from 'react';
   import App from './app/index';
   
   ReactDOM.render(<App age={1} name="xxx" />,document.getElementById('root'));
   ```

9. 再次执行 `yarn run build`，编译成功，打开 index.html 显示正常。

10. 对于引入 css 可能会出现报错，因为没有导出，可以添加`global.d.ts` 文件，内容如下

    ```typescript
    declare module '*.css';
    declare module '*.scss';
    declare module '*.png';
    ```

11. 修改`tsconfig.json` 的配置

    ```typescript
    {
        "compilerOptions": {
            "outDir": "./dist/",
            "sourceMap": true,
            "noImplicitAny": true,
            "module": "commonjs",
            "target": "es5",
            "esModuleInterop": true,
            "jsx": "react"
        },
        "include": [
            "src",
            "global.d.ts"
        ],
    }
    ```

    

### 使用 webpack dev server

我们使用开发服务器代替打开html文件的方式

1. 添加包 `yarn add --dev webpack-dev-server`

2. 在 `package.json` 添加执行脚本

   ```typescript
   "start": "webpack-dev-server"
   ```

3. 配置 `webpack.config.js` 文件新增 `devServer` 节点

   ```typescript
       devServer: {
           contentBase: path.join(__dirname, 'dist'),
           compress: true,
           port: 9000
       }
   ```

4. 使用命令 `yarn start` 启动开发环境。访问 `http://localhost:9000` 看到页面正常显示，修改文件，自动编译和刷新

5. 这时默认只有localhost的可以访问，如果是在远程机开发，需要如下修改，然后才能使用远程机ip加端口访问

   ```typescript
       devServer: {
           host:'0.0.0.0',
           contentBase: path.join(__dirname, 'dist'),
           compress: true,
           port: 9000
       }
   ```

   

这个配置几乎没有遇到坑点。

### 引入样式

我们需要事项以下目的：

1. 在组件中使用 `import { myclassname } from '../index.scss' ` 导入和使用样式。
2. 编译后，生成单独的样式文件

步骤：

1. 新增 `src/style.scss` 样式文件，并编写样式内容如下

   ```typescript
   .test{
       text-align: center;
       width: 100%;
   }
   ```

2. 修改 `src/app/index.tsx` 文件，添加引入和使用样式的代码

   ```typescript
   import React, { Component } from 'react'
   import Styles from '../style.scss';
   
   interface IndexProps {
       name: string;
       age: number;
   }
   
   class Index extends Component<IndexProps> {
   
       render() {
   
           return (
               <div className={Styles.test} >
                   xxxxxxxxxxx
               </div>
           );
       }
   }
   
   export default Index;
   ```

3. 执行 `yarn start` 报错，提示没有处理改类型文件的 Loader。

4. 安装 Loader `yarn add --dev css-loader sass-loader style-loader`

5. 修改 webpack配置文件，添加 Loader

   ```typescript
               {
                   test: /\.css|scss$/,
                   use: [
                       "style-loader",
                       {
                           loader: require.resolve('css-loader'),
                           options: {
                               modules: true,
                           }
                       },
                       "sass-loader" // 将 Sass 编译成 CSS，默认使用 Node Sass
                   ]
               }
   ```

6. 执行 `yarn start` 提示成功，打开浏览器可以看到文字已居中，但是我们会发现，并没有使用单独的 css 文件，而是通过 js 创建的css，这不利于生产上，用户对资源的缓存，比如我们修改的 js ，但是没有修改样式，最终编译出来的 js 有变化，客户端会重新加载而不使用缓存，所以我们需要分离 js 和 css 。

7. 安装插件 `yarn add --dev mini-css-extract-plugin`  修改 webpack 配置，需要修改 Loader 以及添加插件

   - 替换 style-loader 

     ```typescript
                 {
                     test: /\.css|scss$/,
                     use: [
                         {
                             loader: MiniCssExtractPlugin.loader,
                             options: {
                                 publicPath: '../'
                             }
                         },
                         {
                             loader: require.resolve('css-loader'),
                             options: {
                                 modules: true,
                             }
                         },
                         "sass-loader" // 将 Sass 编译成 CSS，默认使用 Node Sass
                     ]
                 }
     ```

   - 添加 plugins 

     ```typescript
         plugins: [
             new HtmlWebpackPlugin({
                 template: './src/index.html'
             }),
             new MiniCssExtractPlugin({
                 filename: '[name].css',
                 chunkFilename: '[id].css'
             })
         ],
     ```

   - 注意需要在开头引入插件 `const MiniCssExtractPlugin = require('mini-css-extract-plugin');`

8. 再次执行 `yarn start` 页面成功运行，并且在网络请求中可以看到有单独的 css 文件。

坑点：

1. 当前已经不需要使用 `typings-for-css-modules-loader` 来做在 tsx 中应用 css 文件的功能，只需要修改 css-loader 的 options 添加 `modules: true`即可

### 使用静态图片

我们希望实现

1. 图片资源可以在组件中被 import

2. 图片资源可以这样使用 

   ```typescript
   import myimg from '../asset/test.png';
   ....
   <img src={myimg}  />
   ```

步骤：

1. 修改 `src/app/index.tsx` 文件，添加图片引用和使用代码

   ```typescript
   import React, { Component } from 'react'
   import Styles from '../style.scss';
   import baiduImg from '../asset/baidu-logo.png';
   
   interface IndexProps {
       name: string;
       age: number;
   }
   
   class Index extends Component<IndexProps> {
   
       render() {
   
           return (
               <div className={Styles.test} >
                   <img src={baiduImg}  />
                   xxxxxxxxxxx
               </div>
           );
       }
   }
   
   export default Index;
   ```

2. 执行 `yarn start ` 报错，提示无法处理该类型文件。

3. 添加 `file-loader` 

   ```typescript
   yarn add --dev file-loader
   ```

4. 修改 webpack 配置，添加 Loader

   ```typescript
               {
                   loader: require.resolve('file-loader'),
                   // Exclude `js` files to keep "css" loader working as it injects
                   // its runtime that would otherwise be processed through "file" loader.
                   // Also exclude `html` and `json` extensions so they get processed
                   // by webpacks internal loaders.
                   exclude: [/\.(js|mjs|jsx|ts|tsx|css|scss)$/, /\.html$/, /\.json$/],
                   options: {
                       name: `[name].[hash:12].[ext]`,
                   },
               },
   ```

5. 再次执行 `yarn start` 页面正常加载，图片显示。

未发现坑点。

考虑性能问题，小于 8k 的图片我们可能不希望浏览器发起 http 请求去获取，这时我们可以使用`url-loader` 

```typescript
 						{
                test: /\.(gif|png|svg|eot|otf|ttf|woff|woff2)$/,
                use: {
                    loader: "url-loader",
                    options: {
                        limit: 8192,
                    }
                }
            },
```

注意，必须配合`file-loader`使用，虽然不会报错，但是生产的 base64 无法被展示为图片。

```typescript
            {
                loader: require.resolve('file-loader'),
                exclude: [/\.(js|mjs|jsx|ts|tsx|css|scss|svg)$/, /\.html$/, /\.json$/],
                options: {
                    name: `[name].[hash:12].[ext]`,
                },
            },
```



### 其他

1. 开启 `source map` ，在开发阶段方便调试代码。需修改 webpack 配置如下

   ```typescript
   module.exports = {
       entry: './src/index.tsx',
       output: {
           filename: './index.js'
       },
       devtool: "source-map",
     .....
   ```

### 结束

如此我们大致实现了 `create-react-app ` 帮助实现的基本功能，但是我们观察 create 帮助创建的项目，会发现，仍然有很多插件和实现我们没有使用到过，在下面的开发中，我们尝试构建一个完整的复杂前端项目，发现问题的同时，理解 create 中的其他插件和操作。



## 手撸一个业务系统

我们尝试开发一个真实可用的系统，在实践中完善我们的工具链和架构

### 目标产品



## FAQ

1. 当我们通过 NGINX 转发时，一般会设定 base path 用作转发，这时如果是通过 `create-react-app` 创建的 react 应用，可以修改 `package.json` 配置 `homepage` 节点























