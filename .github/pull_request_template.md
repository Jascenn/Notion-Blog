## 为什么改

<!-- 关联 issue，写清用户问题或维护动机。 -->

Closes #

## 改了什么

-

## 没改什么 / 已知限制

-

## 怎么验证

<!-- 陌生人能照着执行的命令；页面改动附桌面与移动端截图。 -->

- [ ]

## 影响面

- [ ] 无破坏性变更（有则标题加 `!`，footer 写 `BREAKING CHANGE:`）
- [ ] 涉及 Notion 字段 / 环境变量（列出新增项与兼容行为）
- [ ] 涉及对外路由 / API / SEO 元数据
- [ ] 需要同步 README / CHANGELOG

## 提交前

- [ ] commit 标题符合 `type(scope): subject`
- [ ] 本地跑通：`npm ci && npm run lint && npm run test:analytics`
- [ ] 涉及构建产物时额外跑通 `npm run build`
- [ ] CI 绿；无 Notion 凭据时不把构建失败误判为代码失败
