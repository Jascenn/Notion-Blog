# 部署指南

## 🚀 快速部署到 Vercel

### 1. 准备工作

确保你已经完成以下步骤：
- ✅ 创建了 Notion Integration
- ✅ 设置了 Notion 数据库
- ✅ 获取了必要的环境变量

### 2. 推送代码到 GitHub

```bash
# 初始化 git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "🎉 Initial commit: Simple Blog with Notion CMS"

# 设置主分支
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/your-username/your-repo-name.git

# 推送代码
git push -u origin main
```

### 3. 在 Vercel 中部署

1. **导入项目**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "New Project"
   - 从 GitHub 导入你的仓库

2. **配置项目**
   - **Framework Preset**: Next.js (自动检测)
   - **Root Directory**: `./` (默认)
   - **Build Command**: `npm run build` (默认)
   - **Output Directory**: `.next` (默认)

3. **设置环境变量**

   在 Vercel 项目设置中添加以下环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `NOTION_SECRET` | `secret_xxxxx...` | Notion Integration Token |
   | `NOTION_DATABASE_ID` | `xxxxx...` | Notion 数据库 ID |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | 你的网站域名 |

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（通常需要 1-2 分钟）

### 4. 验证部署

部署完成后：
1. 访问 Vercel 提供的域名
2. 检查页面是否正常显示
3. 测试 Notion 内容是否正常加载
4. 测试搜索、深色模式等功能

## 🔧 故障排除

### 常见问题

#### 1. 构建失败
```
Error: Cannot find module '@/components/...'
```
**解决方案**: 检查 `tsconfig.json` 中的路径映射配置

#### 2. Notion API 连接失败
```
Error: Notion request failed
```
**解决方案**:
- 检查 `NOTION_SECRET` 是否正确
- 确认数据库已连接到 Integration
- 验证 `NOTION_DATABASE_ID` 是否正确

#### 3. 样式加载问题
```
Warning: CSS import failed
```
**解决方案**: 检查 Google Fonts 链接是否可访问

#### 4. 环境变量未生效
**解决方案**:
- 确保在 Vercel 中正确设置了环境变量
- 重新部署项目使环境变量生效

### 调试步骤

1. **查看构建日志**
   - 在 Vercel Dashboard → 项目 → Deployments
   - 点击失败的部署查看详细日志

2. **检查函数日志**
   - 在 Vercel Dashboard → 项目 → Functions
   - 查看运行时错误和 API 调用日志

3. **本地测试**
   ```bash
   # 使用生产环境变量本地测试
   npm run build
   npm run start
   ```

## 🌐 自定义域名

### 1. 在 Vercel 中配置

1. 进入项目设置 → Domains
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 2. DNS 配置示例

**使用 A 记录**:
```
Type: A
Name: @
Value: 76.76.19.61
```

**使用 CNAME 记录**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. 更新环境变量

将 `NEXT_PUBLIC_SITE_URL` 更新为你的自定义域名：
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🚀 CI/CD 自动部署

Vercel 会自动监听 GitHub 仓库的变化：

- **推送到 `main` 分支** → 自动部署到生产环境
- **推送到其他分支** → 创建预览部署
- **Pull Request** → 创建预览部署

### 自动部署流程

```bash
# 开发新功能
git checkout -b feature/new-feature
git add .
git commit -m "✨ Add new feature"
git push origin feature/new-feature

# 创建 Pull Request，Vercel 会自动创建预览部署

# 合并到 main 分支后自动部署到生产环境
```

## 📊 性能优化

### 1. 启用 Vercel Analytics

```bash
npm install @vercel/analytics
```

在 `layout.tsx` 中添加：
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. 启用 Vercel Speed Insights

```bash
npm install @vercel/speed-insights
```

### 3. 配置缓存策略

在 `next.config.js` 中：
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  }
}
```

## 🔐 安全配置

### 1. 环境变量安全
- 永远不要在代码中硬编码敏感信息
- 使用 `NEXT_PUBLIC_` 前缀暴露到客户端的变量要谨慎

### 2. API 限流
考虑为 Notion API 调用添加限流机制

### 3. CSP 配置
在 `next.config.js` 中添加内容安全策略

---

## 🎉 部署完成！

恭喜！你的博客已成功部署到 Vercel。现在你可以：

- 📝 在 Notion 中写文章，自动同步到网站
- 🎨 继续自定义样式和功能
- 📊 监控网站性能和访问统计
- 🔧 根据需要调整配置

**记住**: 每次推送代码到 GitHub，Vercel 都会自动重新部署你的网站！