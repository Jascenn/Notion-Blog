# PDF 导出功能文档

**版本**: v1.0.0
**更新日期**: 2025-09-28
**功能状态**: ✅ 已实现

## 📋 功能概述

Simple Blog 现已支持将文章导出为 PDF 格式，包含以下特性：

- 🎨 **精美封面页** - 包含标题、作者、日期、标签
- 📄 **完整内容导出** - 保留文章格式和样式
- 📊 **进度指示** - 实时显示导出进度
- 🎯 **智能分页** - 自动处理多页内容
- 🌗 **样式优化** - PDF 专用样式调整
- 📱 **响应式按钮** - 适配移动端和桌面端

## 🚀 使用方法

### 用户使用

1. 打开任意文章页面
2. 在文章标题下方找到"导出 PDF"按钮
3. 点击按钮开始导出
4. 等待进度条完成
5. PDF 文件会自动下载到本地

### 文件命名规则

```
{文章slug}-{YYYY-MM-DD}.pdf
```

例如：`my-first-blog-2025-09-28.pdf`

## 🛠️ 技术实现

### 依赖包

```json
{
  "jspdf": "^2.5.2",
  "html2canvas": "^1.4.1"
}
```

### 组件结构

```
src/components/
├── ExportPDF.tsx           # 基础导出组件
└── ExportPDFAdvanced.tsx   # 高级导出组件（推荐使用）
```

### 核心代码

#### 1. 在文章页面集成

```typescript
// src/app/[slug]/page.tsx
import ExportPDFAdvanced from '@/components/ExportPDFAdvanced';

// 在文章标题下方添加
<ExportPDFAdvanced
  title={post.title}
  date={formatDate(post.publishedAt)}
  tags={post.tags}
  filename={post.slug}
  contentId="article-content"
/>
```

#### 2. 组件参数说明

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| title | string | PDF 标题 | 必填 |
| author | string | 作者名称 | "Simple Blog" |
| date | string | 发布日期 | 当前日期 |
| tags | string[] | 文章标签 | [] |
| filename | string | 文件名前缀 | "document" |
| contentId | string | 内容元素ID | "article-content" |

## 🎨 PDF 样式优化

### 封面页设计

- 浅灰色背景 (#F5F7FA)
- 标题使用 24px 字体
- 元信息使用 12px 字体
- 底部包含生成信息

### 内容页优化

```javascript
// 代码块优化
pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

// 图片优化
img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px auto;
}

// 标题优化
h1, h2, h3 {
  page-break-after: avoid;
  margin-top: 24px;
  margin-bottom: 12px;
}

// 段落优化
p {
  line-height: 1.8;
  margin-bottom: 16px;
}
```

## 🔧 高级功能

### 1. 进度条显示

```typescript
const [exportProgress, setExportProgress] = useState(0);

// 更新进度
setExportProgress(10); // 开始
setExportProgress(40); // 样式处理
setExportProgress(60); // Canvas 生成
setExportProgress(80); // PDF 生成
setExportProgress(100); // 完成
```

### 2. 错误处理

```typescript
try {
  // 导出逻辑
} catch (error) {
  logger.error('PDF 导出失败:', error);
  alert('PDF 导出失败，请稍后重试');
}
```

### 3. 隐藏不需要的元素

```css
.no-pdf {
  /* 在 PDF 中会被隐藏 */
}
```

```javascript
// 隐藏按钮和交互元素
const hideElements = clonedElement.querySelectorAll(
  '.no-pdf, button, .export-pdf-button'
);
hideElements.forEach((el) => {
  el.style.display = 'none';
});
```

## 📊 性能优化

### 1. Canvas 配置

```javascript
await html2canvas(element, {
  scale: 2,           // 提高分辨率
  useCORS: true,      // 允许跨域图片
  logging: false,     // 关闭日志
  backgroundColor: '#ffffff',
  windowWidth: 840,
  windowHeight: element.scrollHeight
});
```

### 2. 内存管理

```javascript
// 使用克隆元素避免影响原页面
const clonedElement = element.cloneNode(true);

// 处理完成后移除
document.body.removeChild(clonedElement);
```

### 3. 分页处理

```javascript
// 自动计算页面高度
let heightLeft = contentHeight;
while (heightLeft > 0) {
  pdf.addPage();
  pdf.addImage(imgData, 'PNG', x, y, width, height);
  heightLeft -= pageHeight;
}
```

## 🐛 已知问题和解决方案

### 问题 1：中文字体显示

**问题**: jsPDF 默认不支持中文字体
**解决**: 使用 html2canvas 生成图片，避免字体问题

### 问题 2：跨域图片

**问题**: 外部图片可能导致跨域错误
**解决**: 设置 `useCORS: true` 或使用图片代理

### 问题 3：大文件导出

**问题**: 长文章可能导致内存溢出
**解决**: 分批处理或降低 canvas scale

## 🚀 未来改进

### 短期计划

1. **添加水印功能** - 可选的文档水印
2. **自定义封面** - 用户可选择封面样式
3. **批量导出** - 支持多篇文章打包导出

### 长期计划

1. **服务端生成** - 使用 Puppeteer 在服务端生成
2. **模板系统** - 多种 PDF 模板可选
3. **目录生成** - 自动生成文章目录
4. **注释功能** - 支持 PDF 注释和批注

## 📝 使用示例

### 基础使用

```tsx
<ExportPDF
  title="导出 PDF"
  filename="my-article"
  contentId="article-content"
/>
```

### 高级使用

```tsx
<ExportPDFAdvanced
  title="我的文章标题"
  author="张三"
  date="2025-09-28"
  tags={['技术', '前端', 'React']}
  filename="tech-article"
  contentId="main-content"
/>
```

### 自定义样式

```tsx
<ExportPDFAdvanced
  className="custom-pdf-button"
  // ... 其他属性
/>

<style jsx>{`
  .custom-pdf-button {
    background: linear-gradient(to right, #667eea, #764ba2);
    color: white;
  }
`}</style>
```

## 🔍 调试技巧

### 1. 启用日志

```javascript
await html2canvas(element, {
  logging: true,  // 开启调试日志
  // ...
});
```

### 2. 检查元素克隆

```javascript
// 暂时不移除克隆元素，检查样式
// document.body.removeChild(clonedElement);
clonedElement.style.left = '0';  // 显示在页面上
```

### 3. 分步调试

```javascript
console.log('Step 1: Element cloned');
console.log('Step 2: Styles applied');
console.log('Step 3: Canvas generated');
console.log('Step 4: PDF created');
```

## 📚 相关资源

- [jsPDF 官方文档](https://github.com/parallax/jsPDF)
- [html2canvas 文档](https://html2canvas.hertzen.com/)
- [PDF 最佳实践](https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf)

## 🏆 功能亮点

1. **零配置** - 开箱即用，无需额外配置
2. **进度反馈** - 实时显示导出进度
3. **样式保持** - 最大程度保留原文样式
4. **错误处理** - 友好的错误提示
5. **深色适配** - 自动适配深色模式按钮样式

## ✅ 测试清单

- [ ] 短文章导出（< 3页）
- [ ] 长文章导出（> 10页）
- [ ] 包含图片的文章
- [ ] 包含代码块的文章
- [ ] 包含表格的文章
- [ ] 中文内容导出
- [ ] 移动端导出
- [ ] 深色模式下导出

## 📞 支持

如有问题或建议，请提交 Issue 或 PR。

---

**文档版本**: 1.0.0
**最后更新**: 2025-09-28
**作者**: Claude Code Assistant