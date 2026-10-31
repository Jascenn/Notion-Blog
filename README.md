# Simple Blog

一个基于 Next.js 和 Notion 的极简博客系统，支持从 Notion 数据库实时同步内容。

## ✨ 特性

- 🚀 **Next.js 15** - 使用最新的 App Router
- 📝 **Notion CMS** - 使用 Notion 作为内容管理系统
- 🎨 **极简设计** - 参考 tw93.fun 的简洁风格
- 🌙 **深色模式** - 完整的深色/浅色主题切换
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🔍 **全文搜索** - 支持文章标题、内容、标签搜索
- 📌 **文章置顶** - 支持重要文章置顶显示
- 📢 **公告系统** - 支持网站公告发布
- 🏷️ **标签系统** - 支持多标签分类和筛选
- 🌐 **中英双语** - 全站中英文切换，文章可直接切换到对应英文版本
- 📡 **RSS 订阅** - 全站 `/rss.xml` Feed，全站页面支持自动发现，订阅引导页一键复制
- ✉️ **邮件订阅** - 双重确认 + 欢迎邮件，每周一 08:00（北京时间）发送本周更新汇总，邮件支持一键退订并实时同步回 Notion
- ⚡ **性能优化** - 支持错误处理和超时重试
- 🎯 **SEO 友好** - 完整的元数据和 OpenGraph 支持

## 🛠️ 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS
- **字体**: LXGW WenKai (霞鹜文楷)
- **内容**: Notion API
- **Markdown**: react-markdown + rehype + remark
- **部署**: Vercel

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆仓库
git clone <your-repo-url>
cd simple-blog

# 安装依赖
npm install
```

### 2. Notion 设置

#### 创建 Notion Integration
1. 访问 [Notion Developers](https://www.notion.so/my-integrations)
2. 点击 "Create new integration"
3. 填写集成名称，选择工作区
4. 复制生成的 Internal Integration Token

#### 创建 Notion 数据库
创建一个新的数据库，包含以下字段：

| 字段名 | 类型 | 说明 | 必需 |
|--------|------|------|------|
| **Title** | Title | 文章标题 | ✅ |
| **Content** | Text | 文章内容(Markdown) | ✅ |
| **Slug** | Text | URL路径 | ✅ |
| **Tags** | Multi-select | 标签 | ✅ |
| **Published** | Checkbox | 是否发布 | ✅ |
| **Excerpt** | Text | 摘要 | ✅ |
| **PublishedAt** | Date | 发布日期 | ✅ |
| **Type** | Select | 内容类型 | ✅ |
| **Pinned** | Checkbox | 是否置顶 | ✅ |
| **Cover** | Files & media | 封面图片 | ❌ |

**Type 字段选项**:
- `post` - 普通博客文章
- `page` - 静态页面(如关于页面)
- `announcement` - 公告信息

#### 连接数据库
1. 在数据库页面点击右上角的 "..." 菜单
2. 选择 "Add connections" → 选择你创建的集成
3. 复制数据库URL中的数据库ID

### 3. 环境配置

创建 `.env.local` 文件：

```env
# Notion 配置
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_database_id

# 网站配置 (生产环境使用 https://lingyi.me)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 邮件订阅名单（可选）
# 方式一：显式指定「订阅名单」库 ID（推荐）
NOTION_SUBSCRIBERS_DATABASE_ID=your_subscribers_database_id
# 方式二：指定父页面 ID，首次订阅时自动创建「订阅名单」库
# NOTION_SUBSCRIBERS_PARENT_PAGE_ID=your_parent_page_id

# Resend 邮件发送
RESEND_API_KEY=re_xxxxxxxx
# Resend webhook 签名密钥（退订/退信同步到 Notion 时必需，在 Resend 后台创建 Webhook 获得）
# RESEND_WEBHOOK_SECRET=whsec_xxxxxxxx
# 可选：订阅确认链接签名密钥，留空回退到 CRON_SECRET
# NEWSLETTER_TOKEN_SECRET=xxxxxxxx
# 可选：周刊聚合窗口天数，默认 7
# NEWSLETTER_DIGEST_DAYS=7
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 📝 内容管理

### 写文章

在 Notion 数据库中添加新行：

```
Title: 我的第一篇文章
Content: # 标题

这里是文章内容，支持 Markdown 语法...

Slug: my-first-post
Tags: 技术, 博客
Published: ✅
Excerpt: 文章摘要...
PublishedAt: 2025-01-15
Type: post
Pinned: ❌
```

### 发布公告

```
Title: 重要公告
Content: 网站更新通知...
Slug: announcement-2025-01
Tags: 公告
Published: ✅
Excerpt: 重要更新通知
PublishedAt: 2025-01-15
Type: announcement
Pinned: ❌
```

### 置顶文章

将 `Pinned` 字段勾选，文章会显示在列表顶部并带有置顶标识。

### 关于页面

创建 Type 为 `page` 的内容，系统会自动在关于页面显示。

## 🎨 自定义

### 修改样式
编辑 `src/app/globals.css` 自定义全局样式。

### 修改配置
- 导航栏：`src/components/Navigation.tsx`
- 页脚：`src/components/Footer.tsx`
- 博客卡片：`src/components/BlogCard.tsx`

### 字体设置
项目使用 LXGW WenKai (霞鹜文楷) 字体，通过 jsDelivr CDN 加载，国内访问稳定可靠。

配置文件：
- `src/app/layout.tsx` - 字体 CDN 链接
- `src/app/globals.css` - 字体变量和样式定义

## 🚀 部署到 Vercel

### 1. 推送到 GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. 部署到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置环境变量：
   - `NOTION_TOKEN`
   - `NOTION_DATABASE_ID`
   - `NEXT_PUBLIC_SITE_URL=https://lingyi.me`
   - `NOTION_SUBSCRIBERS_DATABASE_ID`（邮件订阅名单库，见上文环境配置）
   - `RESEND_API_KEY`、`RESEND_WEBHOOK_SECRET`（邮件订阅，见上文环境配置）
   - `CRON_SECRET`（Vercel Cron 认证）
5. 点击 "Deploy"

### 3. 域名配置

生产域名: **lingyi.me**（旧域名 lingyi.bio 与 www.lingyi.me 做 308 跳转到主域）

在 Vercel 项目设置 → Domains 中添加域名 `lingyi.me`；`lingyi.bio` 与 `www.lingyi.me` 通过项目路由规则 308 跳转到主域。

## 📁 项目结构

```
simple-blog/
├── src/
│   ├── app/                 # App Router 页面
│   │   ├── [slug]/         # 动态文章页面
│   │   ├── about/          # 关于页面
│   │   ├── api/subscribe/  # 邮件订阅接口
│   │   ├── en/             # 英文版页面
│   │   ├── rss/            # 订阅引导页
│   │   ├── rss.xml/        # RSS Feed 输出
│   │   ├── search/         # 搜索页面
│   │   └── globals.css     # 全局样式
│   ├── components/         # React 组件
│   │   ├── BlogCard.tsx    # 文章卡片
│   │   ├── Navigation.tsx  # 导航栏
│   │   ├── Footer.tsx      # 页脚
│   │   └── ...
│   ├── lib/               # 工具函数
│   │   └── notion.ts      # Notion API 集成
│   └── fonts/            # 字体文件
├── public/               # 静态资源
├── .env.local           # 环境变量 (需要创建)
└── README.md           # 项目文档
```

## 📚 完整文档

### 📖 项目文档
- [📅 更新日志](./CHANGELOG.md) - 版本历史和改进记录
- [⚙️ Notion 配置](./NOTION_SETUP.md) - API 密钥和数据库设置
- [🔒 安全清单](./SECURITY_CHECKLIST.md) - 上线前安全检查
- [📊 数据分析](./docs/ANALYTICS.md) - 访问统计与导出
- [💡 技术解决方案](./docs/TROUBLESHOOTING_SOLUTIONS.md) - 常见问题详细解决方案
- [🗂️ 方案沉淀](./docs/solutions/) - 具体问题的处理记录

## 🔧 API 参考

### Notion 数据库字段

| 字段 | 类型 | 描述 |
|------|------|------|
| `Title` | string | 文章标题 |
| `Content` | string | Markdown 内容 |
| `Slug` | string | URL 路径 |
| `Tags` | string[] | 标签数组 |
| `Published` | boolean | 是否发布 |
| `Excerpt` | string | 文章摘要 |
| `PublishedAt` | string | 发布时间 |
| `Type` | 'post' \| 'page' \| 'announcement' | 内容类型 |
| `Pinned` | boolean | 是否置顶 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

提交约定见 [CONTRIBUTING.md](CONTRIBUTING.md)；安全问题按
[SECURITY.md](SECURITY.md) 私下报告。

## 📄 许可证

本项目采用 [PolyForm Noncommercial License 1.0.0](LICENSE)，允许个人学习、研究、实验和非商业项目使用；未经授权不得用于商业目的。

这不是 OSI 认可的开源许可证。商业授权请联系仓库维护者。

## 🙏 致谢

- 设计灵感来自 [tw93.fun](https://tw93.fun)
- 字体：[LXGW WenKai](https://github.com/lxgw/LxgwWenKai)
- 框架：[Next.js](https://nextjs.org)
- CMS：[Notion](https://notion.so)

---

**Made with ❤️ by LingYi**

> 最后更新：2026-10-31
