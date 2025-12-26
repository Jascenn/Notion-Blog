# 图片展示与加载优化方案

## 1. 核心问题

* **URL 时效性**：Notion 原生图片链接（S3 签名 URL）具有一小时左右的有效期，直接硬编码会导致页面在缓存后图片失效。
* **比例失调**：Notion 内容多变，长图或极宽图在固定容器中容易被切断或拉伸。
* **加载性能**：未经过 WebP 转换或尺寸预处理，全尺寸加载对移动端不友好。

## 2. 解决方案

### 2.1 引入 `NotionImage` 高性能组件

* **代理分发**：利用 `next/image` 的 loader 或中间件代理 Notion 图片请求，解决签名失效问题。
* **渐进渲染**：使用 `placeholder="blur"` 配合 Base64 占位符，提升 LCP 指标。
* **自适应布局**：
  * 采用 `object-fit: contain` 或 `cover` 的智能切换逻辑。
  * 在 Markdown 渲染层为图片增加最小高度，避免布局偏移（CLS）。

### 2.2 交互增强：图片预览系统

* **全屏灯箱**：集成基于 `Dialog` (Headless UI) 或原生弹窗的预览功能。
* **智能缩放**：
  * 支持“一键查看原图”。
  * 针对移动端手势优化缩放体验。
* **元信息展示**：通过 Notion 的 `caption` 属性提取，在图片底部展示优雅的图注。

## 3. 实施细节

1. 在 `src/components/` 创建专属 `NotionImage.tsx`。
2. 修改 `src/components/MarkdownContent.tsx`，将原生的 `<img>` 标签替换为 `NotionImage`。
3. 在全局变量中管理图片防抖与预加载逻辑。
