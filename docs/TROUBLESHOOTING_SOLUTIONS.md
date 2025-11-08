# 技术问题解决方案

本文档记录项目开发和部署过程中遇到的技术问题及解决方案。

## 字体加载问题

### 问题描述
**时间**: 2025-11-08
**症状**: 手机端访问博客时显示系统默认字体，而非预期的霞鹜文楷字体
**影响**: 移动端用户体验下降，字体风格不统一

### 问题分析

#### 根本原因
1. **CDN 访问受限**: GitHub 部署版本使用 Google Fonts CDN (`fonts.googleapis.com`)，在某些地区或网络环境下访问受限
2. **移动网络环境**: 手机网络对 Google 服务的访问可能被阻断或速度很慢
3. **字体加载失败**: 当字体 CDN 无法访问时，浏览器回退到 CSS 中定义的系统默认字体

#### 版本差异对比

| 项目 | GitHub 线上版本 | 本地开发版本 |
|------|----------------|-------------|
| **字体源** | Google Fonts | jsDelivr CDN |
| **URL** | `fonts.googleapis.com/css2?family=LXGW+WenKai` | `cdn.jsdelivr.net/npm/lxgw-wenkai-webfont` |
| **国内访问** | ❌ 不稳定 | ✅ 稳定 |
| **字体定义** | 硬编码字体名称 | CSS 变量 `var(--font-sans)` |

### 解决方案

#### 1. 切换字体 CDN 源

**修改前** (`src/app/layout.tsx`):
```tsx
<link
  href="https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&display=swap"
  rel="stylesheet"
/>
```

**修改后**:
```tsx
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.1.0/style.css"
/>
```

**原因**: jsDelivr 是一个全球 CDN，在中国大陆访问更稳定可靠。

#### 2. 使用 CSS 变量统一管理字体

**修改前** (`src/app/globals.css`):
```css
body {
  font-family: "LXGW WenKai", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", ... !important;
}
```

**修改后**:
```css
@theme inline {
  --font-sans: "LXGW WenKai", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", ...;
}

body {
  font-family: var(--font-sans);
}
```

**好处**:
- 统一管理字体配置
- 便于维护和修改
- 提高代码可读性

#### 3. 移除本地字体文件

删除了项目中的本地字体文件：
- `src/fonts/LXGWWenKai-Regular.woff2`
- `src/fonts/LXGWWenKai-Bold.woff2`

**原因**:
- 减小仓库体积
- 统一使用 CDN 加载，避免重复
- CDN 加载有更好的缓存策略

### 相关代码变更

**提交记录**:
```
commit 234ed50
fix: 优化字体加载策略，修复移动端字体显示问题

- 将字体 CDN 从 Google Fonts 切换至 jsDelivr，提升国内访问稳定性
- 删除本地字体文件，统一使用 CDN 加载减小仓库体积
- 使用 CSS 变量统一管理字体配置，提高可维护性
- 修复移动端因 Google Fonts 访问受限导致的字体回退问题
```

**影响文件**:
- `src/app/layout.tsx` - 字体 CDN 链接
- `src/app/globals.css` - 字体变量定义和使用
- `src/fonts/` - 删除本地字体文件

### 验证方法

1. **桌面端测试**
   - 打开浏览器开发者工具 (F12)
   - Network 标签页中查看字体文件加载
   - 检查 `lxgw-wenkai-webfont` 是否成功加载

2. **移动端测试**
   - 手机浏览器访问博客
   - 检查中文字体是否为手写风格
   - 对比系统默认字体，应有明显区别

3. **字体检测脚本**
   ```javascript
   // 在浏览器控制台运行
   document.fonts.check('16px "LXGW WenKai"')
   // 返回 true 表示字体已加载
   ```

### 预防措施

1. **本地测试**: 在推送代码前，确保本地和 GitHub 代码一致
2. **多端验证**: 使用不同设备和网络环境测试
3. **CDN 选择**: 优先选择国内可访问的 CDN 服务
4. **字体回退**: 始终在 font-family 中定义合适的回退字体

---

## Vercel 部署配置问题

### 问题描述
**时间**: 2025-11-08
**症状**: 手动部署时报错 "Deploying Serverless Functions to multiple regions is restricted"
**影响**: 无法在免费计划下使用多区域部署

### 问题分析

**配置问题** (`vercel.json`):
```json
{
  "regions": ["iad1", "sfo1", "hnd1", "fra1", "sin1"]
}
```

**限制**: 多区域部署是 Vercel Pro 和 Enterprise 计划的功能，免费计划不支持。

### 解决方案

**修改配置**:
```json
{
  "framework": "nextjs"
  // 移除 regions 配置
}
```

**提交记录**:
```
commit c292218
fix: 移除多区域部署配置以兼容免费计划

- 移除 regions 配置项，该功能仅在 Pro/Enterprise 计划可用
- 使用 Vercel 默认区域进行部署
```

### 影响
- 使用 Vercel 默认的最优区域部署
- 对大多数用户访问速度影响不大
- 如需多区域部署，需升级到 Pro 计划

---

## 总结

### 经验教训

1. **本地开发与生产环境同步**
   - 及时提交本地修改到 Git
   - 确保线上代码与本地一致
   - 使用 Git diff 检查差异

2. **CDN 选择策略**
   - 优先选择国内可访问的 CDN
   - 考虑目标用户的网络环境
   - 准备好 CDN 降级方案

3. **配置文件管理**
   - 了解不同套餐的功能限制
   - 根据实际需求配置功能
   - 避免使用不支持的功能

### 最佳实践

1. **字体加载**
   - 使用可靠的 CDN 服务
   - 定义完整的字体回退链
   - 考虑使用 Next.js font optimization

2. **部署前检查**
   - 运行 `git status` 确认所有更改已提交
   - 使用 `git diff origin/main` 对比远程差异
   - 本地构建测试 (`npm run build`)

3. **监控和验证**
   - 部署后多端测试
   - 检查关键功能是否正常
   - 查看控制台错误日志

---

**文档维护**: 遇到新问题时及时更新本文档
**最后更新**: 2025-11-08
