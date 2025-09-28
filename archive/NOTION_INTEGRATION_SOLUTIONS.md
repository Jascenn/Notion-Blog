# Notion Blog Integration Solutions

这个文档记录了在集成 Notion CMS 到 Next.js 博客过程中遇到的问题和解决方案。

## 1. React Math Processing 错误

### 问题
使用 ReactMarkdown 时出现 `TypeError: Cannot set properties of undefined (setting 'value')` 错误，导致浏览器崩溃。

### 原因
remarkMath 和 rehypeKatex 插件与 React 19 和 Next.js 15 不兼容。

### 解决方案
从 ReactMarkdown 配置中移除数学处理插件：

```typescript
// src/components/MarkdownContent.tsx
// 移除这些导入
// import remarkMath from 'remark-math';
// import rehypeKatex from 'rehype-katex';

// 使用简化配置
remarkPlugins={[remarkGfm]}
rehypePlugins={[rehypeRaw, rehypeHighlight]}
```

## 2. Notion 嵌套内容层级问题

### 问题
列表、标注、折叠等嵌套内容无法正常显示。

### 原因
`notion.ts` 中的嵌套功能被意外禁用（`if (false && ...)`）。

### 解决方案
重新启用嵌套功能并限制深度：

```typescript
// src/lib/notion.ts
// 将 if (false && block.has_children) 改为：
if (block.has_children && depth < 2) {
  const children = await getChildrenBlocks(block.id);
  // 处理嵌套内容...
}
```

## 3. 换行符处理问题

### 问题
Notion 中的换行在渲染时丢失。

### 错误方案
- 硬编码特定文本的换行处理
- 在 React 组件中手动插入 `<br>` 标签

### 正确解决方案
使用 Notion API 实际数据，将 `\n` 转换为 Markdown 强制换行格式：

```typescript
// src/lib/notion.ts
// 将Notion的换行符转换为Markdown的强制换行格式
if (content.includes('\n')) {
  console.log('Found line breaks in text, converting to Markdown format');
  content = content.replace(/\n/g, '  \n');
}
```

### 关键原则
- **绝不硬编码**：所有格式化都应基于 Notion API 返回的实际数据
- **使用 Markdown 标准**：`  \n` 是 Markdown 的强制换行语法

## 4. 颜色格式处理

### 问题
Notion 中的颜色标注（如"外来词"的混合背景和文字颜色）显示不正确。

### 错误方案
根据用户描述硬编码颜色样式。

### 正确解决方案
完全依赖 Notion API 的颜色属性：

```typescript
// src/lib/notion.ts
// 处理背景色
if (annotation.color.includes('_background')) {
  const bgColor = annotation.color.replace('_background', '');
  content = `<span style="background-color: ${getColorValue(bgColor)}; padding: 2px 4px; border-radius: 3px;">${content}</span>`;
}

// 处理文字色
if (annotation.color && !annotation.color.includes('_background')) {
  content = `<span style="color: ${getColorValue(annotation.color)};">${content}</span>`;
}
```

## 5. 开发原则

### 核心原则
1. **数据驱动**：所有格式化逻辑都应基于 Notion API 返回的实际数据
2. **避免硬编码**：不要根据特定内容或用户描述硬编码样式
3. **使用标准格式**：遵循 Markdown 和 HTML 标准
4. **错误处理**：优雅处理网络错误和数据缺失

### 调试技巧
- 使用 `console.log` 查看 Notion API 返回的实际数据结构
- 检查 `plain_text` 字段中的特殊字符（如 `\n`）
- 验证颜色属性的具体值（如 `red_background`、`green` 等）

### 性能考虑
- 限制嵌套深度（如 `depth < 2`）防止无限递归
- 实现缓存机制减少 API 调用
- 使用指数退避重试处理网络超时

## 6. 常见错误模式

### 要避免的做法
```typescript
// ❌ 硬编码特定文本处理
if (text.includes('好的排版让内容更可信')) {
  return text.replace('。 ', '。\n');
}

// ❌ 假设颜色值
const yellowBg = '<span style="background: yellow; color: gray;">';

// ❌ 禁用功能
if (false && block.has_children) { ... }
```

### 推荐的做法
```typescript
// ✅ 基于实际数据处理
if (content.includes('\n')) {
  content = content.replace(/\n/g, '  \n');
}

// ✅ 使用 API 颜色属性
if (annotation.color.includes('_background')) {
  const bgColor = annotation.color.replace('_background', '');
  // 使用实际颜色值...
}

// ✅ 有条件启用功能
if (block.has_children && depth < 2) { ... }
```

这些解决方案确保了博客系统能够准确反映 Notion 中的原始内容和格式。