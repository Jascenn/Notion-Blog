# 文档导航

欢迎来到 Simple Blog 项目文档中心。

## 📖 项目概述

这是一个基于 Next.js 15 和 Notion API 的现代化博客系统，支持完整的 Notion 块格式渲染，具备深色模式、响应式设计和多种内容格式支持。

### ✨ 核心特性
- **Notion CMS**: 使用 Notion 作为内容管理系统
- **完整格式支持**: 支持多种 Notion 块类型渲染
- **深色模式**: 完整的浅色/深色主题切换
- **响应式设计**: 完美适配移动端和桌面端
- **全文搜索**: 支持文章标题、内容、标签搜索
- **性能优化**: 懒加载、缓存、错误处理

## 🚀 快速开始

### 用户指南
- **[开发指南](./guides/DEVELOPMENT.md)** - 环境搭建、本地开发、项目架构
- **[部署指南](./guides/DEPLOYMENT.md)** - 生产环境部署、域名配置
- **[Notion 配置](./guides/NOTION_SETUP.md)** - Notion 集成设置、数据库配置

## 📚 文档索引

### 快速访问
- **[完整文档索引](./INDEX.md)** - 所有文档的详细目录和导航
- **[变更日志](./CHANGELOG.md)** - 版本历史和功能更新
- **[项目结构](./PROJECT_STRUCTURE_OPTIMIZED.md)** - 详细的项目结构说明

### 技术文档
- **[格式支持](./technical/FORMATS.md)** - Notion 块类型支持详解
- **[故障排查](./technical/TROUBLESHOOTING.md)** - 常见问题和解决方案
- **[Callout 优化](./technical/callout-optimization-2025-11-05.md)** - Callout 块渲染优化
- **[项目清理](./technical/PROJECT_CLEANUP_2025-11-05.md)** - 项目维护和清理记录
- **[项目对比](./technical/PROJECT_COMPARISON_2025-11-05.md)** - 版本对比分析

### 历史归档
- **[归档文档](./archive/)** - 历史版本文档和报告

## 🏗️ 项目架构

```
simple-blog/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── [slug]/         # 动态文章页面
│   │   ├── about/          # 关于页面
│   │   ├── search/         # 搜索页面
│   │   └── page.tsx        # 首页
│   ├── components/          # React 组件
│   │   ├── MarkdownContent.tsx  # Markdown 渲染组件
│   │   ├── BlogCard.tsx         # 文章卡片
│   │   ├── ThemeToggle.tsx      # 主题切换
│   │   └── ...
│   └── lib/                # 工具库
│       ├── notion.ts       # Notion API 集成
│       └── logger.ts       # 日志工具
├── docs/                   # 📚 项目文档
│   ├── guides/            # 用户指南
│   ├── technical/         # 技术文档
│   └── archive/           # 历史归档
└── public/                # 静态资源
```

## 🛠️ 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS
- **字体**: LXGW WenKai (霞鹜文楷)
- **CMS**: Notion API
- **Markdown**: react-markdown + rehype + remark
- **部署**: Vercel (lingyi.bio)

## 📊 功能清单

### 内容管理
- ✅ Notion 数据库集成
- ✅ 实时内容同步
- ✅ Markdown 渲染
- ✅ 代码高亮
- ✅ 数学公式支持

### 用户体验
- ✅ 深色/浅色模式
- ✅ 响应式设计
- ✅ 全文搜索
- ✅ 文章置顶
- ✅ 标签筛选
- ✅ RSS 订阅

### 性能优化
- ✅ 图片懒加载
- ✅ 内容缓存
- ✅ 错误处理
- ✅ 超时重试

## 🌐 生产环境

- **域名**: lingyi.bio
- **部署平台**: Vercel
- **环境变量**:
  - `NOTION_SECRET` - Notion Integration Token
  - `NOTION_DATABASE_ID` - Notion 数据库 ID
  - `NEXT_PUBLIC_SITE_URL` - 网站 URL (https://lingyi.bio)

## 📞 获取帮助

### 开发问题
1. 查看 [开发指南](./guides/DEVELOPMENT.md)
2. 查看 [故障排查](./technical/TROUBLESHOOTING.md)
3. 检查 [完整文档索引](./INDEX.md)

### 部署问题
1. 查看 [部署指南](./guides/DEPLOYMENT.md)
2. 检查环境变量配置
3. 查看 Vercel 部署日志

### Notion 集成问题
1. 查看 [Notion 配置指南](./guides/NOTION_SETUP.md)
2. 确认 Integration 权限
3. 验证数据库 ID

---

**提示**: 建议从 [完整文档索引](./INDEX.md) 开始浏览,它提供了所有文档的详细分类和导航。

**最后更新**: 2025-11-05
**当前版本**: v1.2.0
**维护状态**: 🟢 积极维护
