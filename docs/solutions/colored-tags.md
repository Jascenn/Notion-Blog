# 彩色标签系统设计方案

## 1. 核心需求

* **颜色同步**：将 Notion 后台定义的 9 种官方颜色（Gray, Brown, Orange, Yellow, Green, Blue, Purple, Pink, Red）1:1 还原到前端。
* **样式统一**：告别单调的文本，采用“药丸背景 + 柔顺内边距”的视觉呈现。
* **数据结构升级**：将原本的 `string[]` 标签名数组升级为包含属性的 `Object[]`。

## 2. 技术实现

### 2.1 数据获取层 (Notion API)

* 修改 `src/lib/notion/client.ts` 或 `notion.ts`。
* 在解析 `multi_select` 属性时，提取 `name` 和 `color` 两个字段。

```typescript
{
  name: tag.name,
  color: tag.color // 对应 Notion 枚举：blue, green, etc.
}
```

### 2.2 全局样式层 (Tailwind + CSS)

* 在 `globals.css` 中定义色彩映射表。
* 针对每种 Notion 颜色，配置 Light/Dark 模式下的背景色和文字色。
* **示例代码**：

```css
/* Notion Blue 映射 */
.notion-tag-blue {
  @apply bg-blue-50 text-blue-600 border-blue-100;
}
.dark .notion-tag-blue {
  @apply bg-blue-900/30 text-blue-300 border-blue-800;
}
```

### 2.3 UI 组件层

* **形状定义**：采用 `rounded` 或 `rounded-lg` 方圆风格，增加现代感。
* **Emoji 策略**：前端不强制添加 Emoji，而是通过数据源透传或全局统一标识，避免图标冗余堆叠。

## 3. 优势

* **视觉还原度高**：用户在 Notion 中的配置能即时呈现在网页端。
* **可维护性**：新增标签无需修改代码，颜色代码自动映射。
