# 文本换行与空段落丢失修复方案

## 1. 问题现象

* **软换行失效**：在 Notion 文本块中使用 `Shift + Enter` 输入的换行，在 Next.js 前端渲染时被忽略，导致多行文本挤在同一行。
* **空行被吞**：在 Notion 中连续按下 `Enter` 创建的空行段落，在 Markdown 解析过程中被视为“无内容节点”而自动过滤，导致文章段落间失去了作者预设的呼吸感（视觉留白）。

## 2. 技术归因

1. **Markdown 规范**：标准的 CommonMark 规范通常忽略单个换行符（Treats newlines as spaces），除非一行末尾有两个空格或使用 `<br />`。
2. **Notion API 数据结构**：Notion 返回的 `paragraph` 块如果内容为空，其 `rich_text` 数组为空，转换脚本通常会跳过这些块。

## 3. 解决方案

### 3.1 软换行支持 (Soft Breaks)

**目标**：让 `Shift + Enter` 能够正确渲染为 `<br />`。

**实施文件**：`src/components/MarkdownContent.tsx`

**操作步骤**：

1. 引入 `remark-breaks` 插件。

   ```bash
   npm install remark-breaks
   ```

2. 在 `ReactMarkdown` 组件配置中启用该插件。

   ```tsx
   import remarkBreaks from 'remark-breaks';
   
   // ...
   
   <ReactMarkdown
     remarkPlugins={[remarkGfm, remarkBreaks]} // 添加插件
     // ...
   />
   ```

### 3.2 空段落保留 (Empty Paragraphs)

**目标**：保留用户特意留下的空白段落作为视觉间距。

**实施文件**：`src/lib/notion.ts`

**操作步骤**：
在 `blocksToMarkdown` 转换逻辑中，拦截空段落并注入不间断空格 (`&nbsp;`)。

```typescript
case 'paragraph':
  const paragraphText = getPlainText(block.paragraph?.rich_text || []);
  
  if (paragraphText.trim()) {
    // 正常段落
    markdown += paragraphText + '\n\n';
  } else {
    // 空段落修复：注入占位符，强制保留视觉高度
    markdown += '&nbsp;\n\n';
  }
  break;
```

### 3.3 样式修正

**实施文件**：`src/components/MarkdownContent.tsx` (CSS)

为了防止含有 `<br>` 或空内容的段落产生不可控的巨大间距，需要配合 CSS 微调：

```css
/* 修正空行的大间距问题，使其只占一个字符高度 */
.prose p:has(br), .prose p:empty {
  margin-bottom: 0 !important;
  line-height: 1 !important;
  min-height: 1em;
}
```

## 4. 验证结果

* 输入 `Line 1` + (Shift+Enter) + `Line 2` -> 前端显示为紧凑换行。
* 输入 `Para 1` + (Enter) + (Enter) + `Para 2` -> 前端显示为两个段落中间有一个明显的空行间距。
