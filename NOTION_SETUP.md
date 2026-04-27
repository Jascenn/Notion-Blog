# Notion 数据库模板设置指南

本项目使用 Notion 作为内容管理系统（CMS）。按照以下步骤设置你的 Notion 数据库。

## 步骤 1: 创建 Notion Integration

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "+ New integration"
3. 填写以下信息：
   - Name: 你的博客名称（例如：My Blog）
   - Associated workspace: 选择你的工作区
   - Type: Internal Integration
4. 点击 "Submit" 创建
5. 复制 "Internal Integration Token"（格式：`secret_xxxxx`）
   - 这就是你的 `NOTION_TOKEN`

## 步骤 2: 创建数据库

1. 在 Notion 中创建一个新页面
2. 在页面中添加一个 "Table - Full page" 数据库
3. 设置以下属性（Properties）：

### 必需属性

| 属性名 | 类型 | 说明 |
|--------|------|------|
| Title | Title | 文章标题（自动创建） |
| Slug | Text | URL 路径（例如：hello-world） |
| Summary | Text | 文章摘要/简介 |
| Published Date | Date | 发布日期 |
| Status | Select | 文章状态 |
| Tags | Multi-select | 文章标签 |
| Type | Select | 内容类型 |

### Status 选项

创建以下选项（Options）：

- ✅ Published（文章可见）
- 📝 Draft（草稿，不可见）

### Type 选项

创建以下选项：

- Post（普通文章）
- Page（静态页面，如关于页面）
- Announcement（公告）

### 可选属性

| 属性名 | 类型 | 说明 |
|--------|------|------|
| Published | Checkbox | 是否发布（备用） |
| Pinned | Checkbox | 是否置顶 |
| Cover | Files & media | 封面图片 |

## 步骤 3: 连接 Integration

1. 打开你创建的数据库页面
2. 点击右上角的 "•••" 菜单
3. 选择 "Connections" → "Connect to"
4. 找到并选择你在步骤 1 创建的 Integration
5. 点击 "Confirm"

## 步骤 4: 获取数据库 ID

1. 在浏览器中打开你的数据库页面
2. 查看 URL，格式类似：

   ```
   https://www.notion.so/{workspace}/{database_id}?v={view_id}
   ```

3. 复制 `{database_id}` 部分（32位字符）
   - 这就是你的 `NOTION_DATABASE_ID`

## 步骤 5: 配置环境变量

1. 复制 `.env.example` 为 `.env.local`
2. 填入获取的信息：

```env
# Notion API 配置
NOTION_TOKEN=secret_xxxxx（步骤1获取）
NOTION_DATABASE_ID=xxxxx（步骤4获取）

# 网站配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Your Blog Name
NEXT_PUBLIC_AUTHOR_NAME=Your Name
```

## 步骤 6: 创建示例内容

### 创建第一篇文章

在数据库中创建一条新记录：

- **Title**: Hello World
- **Slug**: hello-world
- **Summary**: My first blog post
- **Published Date**: 今天的日期
- **Status**: ✅ Published
- **Tags**: Tutorial
- **Type**: Post

点击打开页面，在页面内容区域添加文章内容（支持所有 Notion 块类型）。

### 创建关于页面（可选）

在数据库中创建一条新记录：

- **Title**: About
- **Slug**: about
- **Summary**: About me and this blog
- **Published Date**: 今天的日期
- **Status**: ✅ Published
- **Type**: Page

在页面内容中添加你的个人介绍。

## 步骤 7: 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 <http://localhost:3000> 查看你的博客！

## 常见问题

### Q: 文章不显示？

A: 检查以下几点：

- Status 是否设置为 "✅ Published"
- Integration 是否已连接到数据库
- NOTION_TOKEN 和 NOTION_DATABASE_ID 是否正确

### Q: 图片不显示？

A: Notion 图片链接有时效性，建议：

- 使用外部图床（如 Cloudinary、Imgur）
- 使用 Notion 的 External URL 功能

### Q: 支持哪些 Notion 块类型？

A: 支持大部分 Notion 块，包括：

- 文本（段落、标题、列表等）
- 代码块
- 引用
- 图片、视频、音频
- Callout
- Toggle
- 表格
- 分栏布局
- 数学公式

## 数据库模板示例

如果你想快速开始，可以复制这个官方推荐模板：

1. 访问 [Notion 博客数据库模板](https://jascen.notion.site/71333db52a09472592523c8c8c92e62e?v=e5827c74a0634196afeea56c2778784d&source=copy_link)
2. 点击页面右上角的 **"Duplicate"**（复制）到你的工作区
3. 按照本文[步骤 3](#步骤-3-连接-integration) 连接你的 API 集成即可。

## 下一步

- 阅读 [README.md](./README.md) 了解更多配置选项
- **重要**：查看 [发布前安全检查清单](./SECURITY_CHECKLIST.md) 确保你的密钥不会意外泄露
- 运行 `npm run build` 测试生产环境构建
