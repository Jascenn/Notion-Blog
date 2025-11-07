# 性能优化指南

本文档记录了 Simple Blog 的性能优化策略，帮助提升全球访问速度。

## 🚀 已实施的优化

### 1. 增量静态再生成（ISR）

**实施位置：**
- `src/app/page.tsx` - 首页文章列表
- `src/app/[slug]/page.tsx` - 文章详情页

**配置：**
```typescript
export const revalidate = 60; // 60 秒重新验证
```

**优势：**
- ✅ 首次访问后页面被缓存在 CDN 边缘节点
- ✅ 全球访问速度从 3-5 秒降低到 50-200ms
- ✅ 减少 Notion API 调用次数，降低成本
- ✅ 即使 Notion API 响应慢，用户仍能快速访问缓存内容

**工作原理：**
1. 用户首次访问 → 从 Notion 获取数据 → 渲染页面 → 缓存到 CDN
2. 后续 60 秒内的访问 → 直接从 CDN 返回缓存
3. 60 秒后首次访问 → 返回缓存（快速） + 后台更新数据
4. 更新完成后的访问 → 返回最新内容

---

### 2. 图片优化

**Next.js 图片配置：**
```typescript
images: {
  // 图片缓存 7 天
  minimumCacheTTL: 604800,
  // 支持现代格式
  formats: ['image/avif', 'image/webp'],
  // 响应式尺寸
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
}
```

**优势：**
- ✅ 自动转换为 WebP/AVIF 格式（体积减少 30-50%）
- ✅ 响应式图片，移动端加载更小尺寸
- ✅ 懒加载，只加载可视区域的图片
- ✅ 图片缓存 7 天，减少重复下载

**工具类：**
- `src/lib/image-optimizer.ts` - Notion 图片 URL 优化

---

### 3. CDN 和缓存策略

**Vercel 边缘网络配置：**
```json
{
  "regions": ["iad1", "sfo1", "hnd1", "fra1", "sin1"]
}
```

**全球节点分布：**
- 🇺🇸 美东（iad1）- 弗吉尼亚
- 🇺🇸 美西（sfo1）- 旧金山
- 🇯🇵 东京（hnd1）
- 🇩🇪 法兰克福（fra1）
- 🇸🇬 新加坡（sin1）

**缓存策略：**
- 静态资源：缓存 1 年（`max-age=31536000`）
- API 响应：缓存 60 秒，过期后 30 秒内返回旧内容（`stale-while-revalidate`）
- 图片：缓存 7 天

---

### 4. 构建优化

**配置：**
```typescript
{
  compress: true,        // 启用 gzip/brotli 压缩
  output: 'standalone',  // 优化的独立输出
}
```

**优势：**
- ✅ 文本资源压缩 70-80%
- ✅ 减少传输时间
- ✅ 更快的首屏加载

---

## 📊 性能指标

### 优化前
- **首页加载时间：** 3-5 秒
- **文章详情页：** 4-6 秒
- **Notion API 调用：** 每次访问都调用
- **全球访问延迟：** 500-2000ms（取决于距离）

### 优化后（预期）
- **首页加载时间：** 50-200ms（缓存命中）
- **文章详情页：** 100-300ms（缓存命中）
- **Notion API 调用：** 每 60 秒最多 1 次
- **全球访问延迟：** 50-150ms（CDN 边缘节点）

### 改善幅度
- ⚡ **速度提升：** 10-30 倍
- 📉 **API 调用减少：** 95%+
- 🌍 **全球覆盖：** 5 个边缘区域

---

## 🔍 监控和测试

### 推荐工具

1. **Vercel Analytics**
   - 实时性能监控
   - Core Web Vitals 指标
   - 地理分布数据

2. **Google PageSpeed Insights**
   ```bash
   https://pagespeed.web.dev/
   ```
   - 测试网址：https://lingyi.bio
   - 目标：Performance Score > 90

3. **WebPageTest**
   ```bash
   https://www.webpagetest.org/
   ```
   - 多地区测试
   - 详细的瀑布图分析

4. **Lighthouse**
   ```bash
   # Chrome DevTools > Lighthouse
   ```
   - 性能审计
   - 最佳实践检查

### 性能指标目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 最大内容绘制 |
| FID (First Input Delay) | < 100ms | 首次输入延迟 |
| CLS (Cumulative Layout Shift) | < 0.1 | 累积布局偏移 |
| TTFB (Time to First Byte) | < 600ms | 首字节时间 |
| FCP (First Contentful Paint) | < 1.8s | 首次内容绘制 |

---

## 🛠 进一步优化建议

### 短期（已实施）
- ✅ 启用 ISR（增量静态再生成）
- ✅ 优化图片配置
- ✅ 配置 CDN 缓存策略
- ✅ 启用压缩

### 中期（可选）
- 🔄 实施 Vercel Edge Functions 用于动态内容
- 🔄 添加 Redis 缓存层（已有 Vercel KV）
- 🔄 优化字体加载（preload 关键字体）
- 🔄 代码分割优化

### 长期（可选）
- 🔮 考虑使用 Cloudflare Workers 作为额外的 CDN 层
- 🔮 实施 Service Worker 用于离线访问
- 🔮 添加预加载/预连接优化
- 🔮 考虑使用 Notion API 的增量同步

---

## 📝 部署检查清单

在部署性能优化后，请检查：

- [ ] ISR 配置已添加到所有关键页面
- [ ] `vercel.json` 已提交到版本控制
- [ ] `next.config.ts` 图片优化配置已更新
- [ ] Vercel 环境变量已配置（KV_URL 等）
- [ ] 测试缓存是否生效（刷新页面，检查响应头）
- [ ] 使用 Chrome DevTools Network 面板验证：
  - 静态资源是否有 `cache-control` 头
  - 图片是否转换为 WebP/AVIF
  - 响应时间是否显著降低

---

## 🔗 相关资源

- [Next.js ISR 文档](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Vercel Edge Network](https://vercel.com/docs/edge-network/overview)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Vercel Analytics](https://vercel.com/analytics)
- [Web Vitals](https://web.dev/vitals/)

---

## 💡 性能优化最佳实践

1. **定期监控**：使用 Vercel Analytics 和 Google PageSpeed Insights
2. **测试不同地区**：使用 WebPageTest 从全球多个位置测试
3. **优先级排序**：
   - 首屏内容最重要
   - 交互性次之
   - 装饰性内容最后
4. **渐进式增强**：确保核心功能在慢速网络下仍可用
5. **持续优化**：定期审查性能指标，寻找改进空间

---

**最后更新：** 2025-11-08
**维护者：** Simple Blog Team
