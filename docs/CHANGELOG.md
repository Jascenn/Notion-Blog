# 更新日志

所有重要的项目变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.2.0] - 2025-09-28

### 🎉 新增
- **优化的音频播放器**: 精美卡片设计，支持文件信息展示
- **优化的视频播放器**: 与音频播放器一致的设计风格
- **增强的文件类型识别**: 改进文件扩展名提取逻辑
- **平台特定书签样式**: Spotify、YouTube、GitHub、Twitter 专属图标

### 🔧 修复
- **图片显示问题**: 修复图片组件渲染逻辑，统一使用 Markdown 语法
- **音频格式支持**: 添加缺失的音频处理逻辑到 NotionEmbed 组件
- **文件类型识别错误**: 修复从 URL 和文件名中提取扩展名的问题
- **ReactMarkdown 属性映射**: 修复 kebab-case 到 camelCase 的属性转换问题

### ✨ 改进
- **多列布局间距优化**: 根据用户反馈减少列内元素间距至 0.25rem
- **媒体播放器样式**: 统一的渐变背景和卡片设计
- **深色模式适配**: 完善所有新组件的深色主题支持
- **测试页面内容**: 使用真实可访问的媒体文件 URL

### 📚 文档
- **开发指南**: 完整的项目架构和开发工作流文档
- **格式支持文档**: 21种 Notion 块类型的详细说明
- **故障排除指南**: 常见问题和解决方案
- **更新日志**: 版本历史和变更记录

## [1.1.0] - 2025-09-27

### 🎉 新增
- **完整的 Notion 格式支持**: 实现 21种块类型渲染
- **媒体播放功能**: 音频、视频播放器
- **图片优化**: 点击放大、懒加载、错误处理
- **文件下载**: 智能文件类型识别和下载
- **嵌入支持**: 书签链接、通用嵌入

### 🎨 设计
- **深色模式**: 完整的深色主题支持
- **响应式设计**: Mobile-first 设计理念
- **颜色系统**: Notion 原生颜色支持
- **动画效果**: 平滑过渡和交互反馈

### 🏗️ 架构
- **组件化**: 模块化的组件设计
- **类型安全**: 完整的 TypeScript 支持
- **性能优化**: 代码分割和懒加载
- **错误处理**: 优雅的错误边界和回退

## [1.0.0] - 2025-09-25

### 🎉 新增
- **基础博客功能**: 文章列表、详情页面、搜索功能
- **Notion API 集成**: 从 Notion 数据库获取文章内容
- **Markdown 渲染**: 基础的 Markdown 内容显示
- **路由系统**: Next.js App Router 实现

### 🎨 设计
- **现代化界面**: 简洁的卡片式设计
- **Tailwind CSS**: 实用优先的样式框架
- **字体优化**: 中英文字体搭配

### 🚀 性能
- **服务端渲染**: Next.js SSR/SSG 优化
- **图片优化**: Next.js Image 组件
- **SEO 优化**: 基础的元数据配置

## 重大修复历史

### HTML 标签不匹配问题
**问题**: ReactMarkdown 生成的 HTML 可能存在标签不匹配
```typescript
// 修复前：页面布局可能错乱
// 修复后：添加标签清理机制
const cleanedContent = content.replace(/^\s*<\/div>\s*$/gm, '');
```

### ReactMarkdown 属性映射问题
**问题**: kebab-case 属性转换为 camelCase 导致读取失败
```typescript
// 修复前
type={properties['data-embed-type']}

// 修复后：添加回退机制
type={properties['data-embed-type'] || properties.dataEmbedType}
```

### 音频格式支持缺失
**问题**: NotionEmbed 组件缺少音频处理逻辑
```typescript
// 修复：添加 renderAudio 函数和 switch case
case 'audio':
  preview = renderAudio();
  break;
```

### 文件类型识别问题
**问题**: 无法正确从文件名和 URL 中提取扩展名
```typescript
// 修复前：单一来源
const extension = getFileExtension(name || url);

// 修复后：优先级处理
const nameExtension = getFileExtension(fileName);
const urlExtension = getFileExtension(url);
const extension = nameExtension || urlExtension;
```

### 图片显示兼容性
**修复历程**:
1. **v1.1.0**: 使用 Notion embed 格式
2. **v1.1.1**: 添加图片处理到 NotionEmbed
3. **v1.2.0**: 统一使用 Markdown 语法保持一致性

## 性能改进历史

### 图片懒加载 (v1.0.0)
```typescript
<Image
  src={src}
  alt={alt}
  loading="lazy"
  placeholder="blur"
/>
```

### 代码分割 (v1.1.0)
```typescript
const MathComponent = dynamic(() => import('./MathComponent'), {
  ssr: false
});
```

### 媒体预加载优化 (v1.2.0)
```typescript
<audio controls preload="metadata">
<video controls preload="metadata">
```

## 设计演进

### 播放器设计
- **v1.1.0**: 基础 HTML5 控件
- **v1.2.0**: 精美卡片设计 + 文件信息展示

### 间距优化
- **初始**: `gap: 2rem` (过大)
- **v1.2.0**: `gap: 0.25rem` (极简设计)

### 深色模式
- **v1.1.0**: 基础深色主题
- **v1.2.0**: 完整的深色模式适配

## 技术栈演进

### 框架升级
- **v1.0.0**: Next.js 14 + React 18
- **v1.2.0**: Next.js 15 + React 19 + Turbopack

### 依赖更新
- **ReactMarkdown**: 8.0.7 (稳定版本)
- **remark-gfm**: 3.0.1 (GitHub 风格)
- **rehype-highlight**: 6.0.0 (语法高亮)

## 未来规划

### v1.3.0 (计划中)
- **数学公式**: 重新评估数学公式渲染
- **评论系统**: 集成评论功能
- **分享功能**: 社交媒体分享
- **搜索优化**: 全文搜索改进

### v1.4.0 (规划中)
- **实时同步**: Notion webhook 集成
- **缓存优化**: 智能缓存策略
- **多语言**: i18n 国际化支持
- **管理后台**: 内容管理界面

### v2.0.0 (长期目标)
- **微服务架构**: API 服务分离
- **CDN 集成**: 全球内容分发
- **协作功能**: 多用户支持
- **插件系统**: 扩展机制

## 贡献者

### 核心开发
- **主要开发者**: Claude (AI Assistant)
- **项目维护**: 开发团队

### 特别感谢
- Notion 团队 - 优秀的 API 设计
- Next.js 团队 - 强大的 React 框架
- 开源社区 - 各种依赖库支持

## 版本说明

### 版本号规则
- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

### 发布周期
- **主版本**: 每 6-12 个月
- **次版本**: 每 1-2 个月
- **修订版**: 按需发布

### 支持政策
- **最新版本**: 积极维护和支持
- **前一版本**: 安全修复和关键 bug 修复
- **更早版本**: 不再维护

---

**最后更新**: 2025-09-28
**当前版本**: v1.2.0
**下一版本**: v1.3.0 (开发中)