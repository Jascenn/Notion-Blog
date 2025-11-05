# Changelog

本文档记录了项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added
- 图片标题智能显示策略
  - 自动移除图片标题中的文件扩展名(.png, .jpg, .jpeg 等)
  - 过滤无意义的文件名(image, photo, 图片, 照片等)
  - 支持中英文无意义文件名识别
- 关于页面功能增强
  - 添加个人头像显示
  - 集成可折叠的更新日志组件
- 新增 `ChangelogSection` 组件用于展示项目更新历史

### Changed
- 优化 `MarkdownContent` 组件的图片渲染逻辑
  - 添加 `isMeaninglessFilename()` 函数用于过滤无意义文件名
  - 添加 `removeFileExtension()` 函数用于移除文件扩展名
  - 统一更新 4 处图片 alt 文本显示位置(错误状态、正常显示、悬停提示、缩放弹窗)

### Technical Details
- **两阶段过滤策略**:
  1. 第一阶段:移除文件扩展名(支持常见图片、文档、视频格式)
  2. 第二阶段:判断处理后的文本是否为无意义文件名
- **显示逻辑**:
  - Notion 内没有标记 alt 的图片不显示图片标题
  - Notion 内有标记 alt 的图片清晰地标注名称,但不显示文件后缀
  - 视觉上不干扰阅读体验

### Examples
```
原始文本 → 处理后 → 显示决策
'Jascen_Arc.png' → 'Jascen_Arc' → ✅ 显示
'image.png' → 'image' → ❌ 不显示
'秋天的风景.jpg' → '秋天的风景' → ✅ 显示
'photo' → 'photo' → ❌ 不显示
```

## [0.1.0] - 2025-11-05

### Added
- 初始项目结构搭建
- 基于 Next.js 15.5.4 + Notion API 的博客系统
- Markdown 内容渲染支持
- 响应式设计和暗色模式支持
- 博客文章列表和详情页面
- 搜索和筛选功能
- RSS 订阅支持
- 阅读进度条
- 相关文章推荐
- PDF 导出功能
- 数学公式渲染支持

### Technical Stack
- **框架**: Next.js 15.5.4 (App Router + Turbopack)
- **UI**: React 18 + TypeScript
- **内容管理**: Notion API
- **样式**: Tailwind CSS
- **Markdown**: ReactMarkdown
- **部署**: Vercel

---

## 版本说明

- **Added** - 新增功能
- **Changed** - 功能变更
- **Deprecated** - 即将废弃的功能
- **Removed** - 已移除的功能
- **Fixed** - 问题修复
- **Security** - 安全相关更新

[Unreleased]: https://github.com/Jascenn/Notion-Blog/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Jascenn/Notion-Blog/releases/tag/v0.1.0
