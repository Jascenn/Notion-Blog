# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
