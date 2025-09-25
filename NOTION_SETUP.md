# Notion 博客集成设置指南

## 第一步：创建 Notion Integration

1. 访问 [Notion Developers](https://developers.notion.com/)
2. 点击 "My integrations"
3. 点击 "New integration"
4. 填写信息：
   - Name: `博客 CMS`
   - Logo: 可选
   - Associated workspace: 选择你的工作空间
5. 点击 "Submit"
6. 复制 "Internal Integration Token"

## 第二步：创建 Notion Database

创建一个新的 Database，包含以下属性：

| 属性名称 | 类型 | 说明 |
|---------|------|------|
| Title | Title | 文章标题（必需） |
| Slug | Rich text | URL 路径（可选，留空会自动生成） |
| Excerpt | Rich text | 文章摘要 |
| Published Date | Date | 发布日期 |
| Tags | Multi-select | 标签 |
| Published | Checkbox | 是否发布 |

## 第三步：共享 Database

1. 在你的 Database 页面，点击右上角的 "Share"
2. 点击 "Add people, emails, groups, or integrations"
3. 选择你刚创建的 Integration
4. 给予 "Full access" 权限
5. 点击 "Invite"

## 第四步：配置环境变量

1. 复制 Database 的 URL 中的 ID：
   ```
   https://www.notion.so/your-database-id?v=...
                     ^^^^^^^^^^^^^^^^
   ```

2. 在项目根目录的 `.env.local` 文件中设置：
   ```env
   NOTION_TOKEN=your_integration_token_here
   NOTION_DATABASE_ID=your_database_id_here
   ```

## 第五步：测试配置

1. 在 Notion Database 中添加一篇测试文章
2. 确保 "Published" 勾选为 true
3. 运行开发服务器：`npm run dev`
4. 访问 http://localhost:3000

## Notion Database 示例结构

```
博客文章 Database
├── 🌟 我的第一篇文章
│   ├── Slug: my-first-post
│   ├── Excerpt: 这是我的第一篇博客文章...
│   ├── Published Date: 2024-01-01
│   ├── Tags: 随笔, 开始
│   └── Published: ✅
└── 📝 技术分享
    ├── Slug: tech-sharing
    ├── Excerpt: 分享一些技术心得...
    ├── Published Date: 2024-01-02
    ├── Tags: 技术, 分享
    └── Published: ✅
```

## 注意事项

1. **文章内容**：直接在 Notion 页面中编写，支持所有 Notion 的富文本功能
2. **Slug 生成**：如果不填写 Slug，系统会自动根据标题生成
3. **发布控制**：只有勾选了 "Published" 的文章才会显示
4. **图片支持**：Notion 中的图片会自动转换为 Markdown
5. **更新延迟**：修改后可能需要重新构建才能看到更改

## 故障排除

### 文章不显示
- 检查 "Published" 是否勾选
- 确认 Integration 有访问权限
- 查看浏览器控制台的错误信息

### 环境变量错误
- 确认 `.env.local` 文件在项目根目录
- 重启开发服务器
- 检查 Token 和 Database ID 是否正确

### 权限问题
- 重新分享 Database 给 Integration
- 确认给予了正确的访问权限