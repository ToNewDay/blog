# OA 版帮助文档代码仓库

线上地址：http://help.coding.pages.oa.com/

### 开发

使用 `yarn start` 启动开发环境

注意：谨慎修改和覆盖 `/hexo/source` 位置 md 文档内容，原则上禁止修改，仅支持从外部仓库通过流水线 push 更改。

### 发布位置

串联编译出静态网站文件后，发布到`http://git.code.oa.com/devops-coding/coding-oa-help-generator.git` 仓库的`oa-pages` 分支，触发 `webhooks` 更新位于 oa pages 的帮助网站代码，实现线上的更新。

### 发布方式

发布更新流程由 CI 任务（开发中）触发，无需手动操作。

### 外部仓库文档发布方式

1. 在原外部仓库提交修改。
2. 触发流水线， push 更改到本仓库 `/hexo/source`  相应位置。







