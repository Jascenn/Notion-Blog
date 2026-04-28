# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 🎨 **Notion 标签彩色化**
  - 引入 `NotionTag` 接口（`{name, color}`），保留 Notion 原始 tag 配色
  - `globals.css` 新增 `.notion-tag-*` 样式
- 🔒 **安全加固** (`next.config.ts`)
  - 响应头：HSTS / CSP / X-Frame-Options / X-Content-Type-Options / Referrer-Policy
  - 图片域名白名单：Notion / S3 / Unsplash
- 📦 **依赖**：新增 `remark-breaks`（markdown 软换行支持）
- 📚 **文档**：`NOTION_SETUP.md`、`SECURITY_CHECKLIST.md`、`docs/solutions/`（5 篇方案文档）
- 🛠️ **脚本**：`scripts/setup.mjs`、`scripts/check-config.mjs`（交互式初始化与配置校验）
- 🧩 `NotionImage.tsx` 代理组件（已写未接入）

### Fixed
- 🐛 **Notion 图片加载失败**：移除 notion-to-md 库的 image 自定义 transformer
  - 问题原因：transformer 给图片 URL 注入 `notion_block_id` 参数，破坏了 AWS S3 的签名校验，导致图片被拒绝（403）
- 🐛 **Notion 嵌套段落被误识别为代码块**：notion-to-md 输出 4 空格缩进，被 markdown 解析器当作 indented code block
  - 修复：用不间断空格（U+00A0）替换前导 4 空格，保留视觉缩进同时不触发代码块语法

## [1.3.2] - 2026-04-28

### Removed
- 🗑️ **OpenClaw PPT 演示资源**
  - 删除 `public/openclaw-ppt/` 17 个文件（`index.html` viewer + 16 张 PNG，约 40 MB）
  - PPT viewer 路由实际未完成（线上 404），属冗余资源
  - 通过 revert commit `c89132a` 实现，保留完整 git 历史

## [1.3.1] - 2025-11-22

### Added
- ✨ **RSS 订阅功能完整实现**
  - 新增 `/rss.xml` API 路由生成 RSS Feed
  - RSS 页面动态显示订阅地址（从环境变量读取）
  - 支持 RSS 阅读器订阅博客更新
  - 1小时缓存重新验证策略

- 📦 **新增工具函数**
  - `src/lib/slugifyHeading.ts` - 统一标题转锚点 ID 的处理逻辑
  - 支持中英文混合标题的 URL 友好转换

### Changed
- ⚡ **性能优化**
  - 恢复 Notion API 缓存功能（开发环境 60s，生产环境 5分钟）
  - 优化并发请求数（开发 2个，生产 4个）
  - 优化请求延迟（开发 100ms，生产 50ms）
  - 添加最大嵌套深度限制（防止无限递归）

- 🔧 **代码质量提升**
  - 添加 TypeScript 类型定义（MarkdownNode 接口）
  - 改进 MarkdownContent 组件的类型安全
  - 统一标题锚点生成逻辑（目录和正文保持一致）
  - 优化数学公式处理逻辑
  - 改进列表嵌套处理

- 🎨 **UI/UX 改进**
  - 改进嵌入内容域名显示（移除 www. 前缀）
  - 优化嵌入元信息显示样式
  - RSS 状态文本更新为"订阅已可用"

### Fixed
- 🐛 **错误处理改进**
  - 使用 logger.debug 替代注释处理错误日志
  - 改进嵌入内容解析的错误处理
  - 修复类型转换警告

### Removed
- 🧹 **代码清理**
  - 删除未使用的 import（dynamic, Image）
  - 移除 image-optimizer.ts 中未使用的 width 参数
  - 移除调试代码和注释
  - 清理 ESLint 配置（添加 .local-archive 到忽略列表）

### Developer Experience
- 📝 **开发工具**
  - 新增 `test-font.html` - 字体加载测试页面
  - 改进开发环境配置

---

## [1.3.0] - 2025-11-08

### Added
- 博客基础功能完善
- Notion API 集成
- Markdown 渲染支持

### Changed
- 性能优化
- UI/UX 改进

---

## [0.1.0] - Initial Release

### Added
- 项目初始化
- Next.js 15 + TypeScript 基础架构
- Notion 数据库集成
- 基础博客功能

---

**版本说明**：
- **Major (X.0.0)** - 重大架构变更或破坏性更新
- **Minor (x.X.0)** - 新功能添加，向后兼容
- **Patch (x.x.X)** - Bug 修复和小改进

**维护者**: LingYi (Jascenn)
**最后更新**: 2025-11-22
