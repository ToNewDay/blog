# Coding代码管理帮助文档

## 安装gitbook

```
$ sudo npm install -g gitbook-cli
```


## 构建和调试

```
$ gitbook install
$ gitbook build
$ gitbook serve
```

然后在 [http://localhost:4000](http://localhost:4000) 可预览。  

### 注：`gitbook install`如果遇到 "cb.apply" 错误的一种解决方式
执行 `gitbook install` 时，可能会遇到如下错误：  
```
$ gitbook install
Installing GitBook 3.2.3
  SOLINK_MODULE(target) Release/.node
  CXX(target) Release/obj.target/fse/fsevents.o
/usr/local/lib/node_modules/gitbook-cli/node_modules/npm/node_modules/graceful-fs/polyfills.js:287
      if (cb) cb.apply(this, arguments)
                 ^

TypeError: cb.apply is not a function
    at /usr/local/lib/node_modules/gitbook-cli/node_modules/npm/node_modules/graceful-fs/polyfills.js:287:18
    at FSReqCallback.oncomplete (fs.js:169:5)
```
一个解决方法是编辑 `/usr/local/lib/node_modules/gitbook-cli/node_modules/npm/node_modules/graceful-fs/polyfills.js`，注释掉以下部分（位于62~64行左右）：
```
fs.stat = statFix(fs.stat)
fs.fstat = statFix(fs.fstat)
fs.lstat = statFix(fs.lstat)
```
即将其改为：
```
// fs.stat = statFix(fs.stat)
// fs.fstat = statFix(fs.fstat)
// fs.lstat = statFix(fs.lstat)
```
