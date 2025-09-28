# 数学公式渲染解决方案

**创建时间**: 2025-09-28
**问题**: React 19 + Next.js 15 环境下数学公式渲染兼容性问题

## 🔍 问题分析

### 当前状态
- ✅ Notion equation 块正确转换为 `$$...$$` 格式
- ❌ 缺少渲染库将 LaTeX 转换为可视化公式
- ❌ remark-math + rehype-katex 与 React 19 不兼容

### 兼容性问题
```bash
# 传统方案的问题
npm install remark-math rehype-katex
# Error: Module not compatible with React 19
```

## 💡 解决方案

### 方案一：客户端渲染 (推荐) ⭐

使用客户端组件动态渲染数学公式，避免 SSR 兼容性问题。

#### 1. 安装 KaTeX
```bash
npm install katex
npm install --save-dev @types/katex
```

#### 2. 创建数学公式组件
```typescript
// src/components/MathFormula.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  expression: string;
  displayMode?: boolean;
}

export default function MathFormula({ expression, displayMode = true }: MathFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && expression) {
      try {
        katex.render(expression, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: '#cc0000',
          strict: false
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<span class="math-error">公式渲染失败: ${expression}</span>`;
        }
      }
    }
  }, [expression, displayMode]);

  return (
    <div
      ref={containerRef}
      className={displayMode ? 'math-display' : 'math-inline'}
      style={{
        textAlign: displayMode ? 'center' : 'inherit',
        margin: displayMode ? '1rem 0' : '0'
      }}
    />
  );
}
```

#### 3. 修改 MarkdownContent 组件
```typescript
// src/components/MarkdownContent.tsx
import MathFormula from './MathFormula';

// 在 ReactMarkdown components 中添加
components={{
  // ... 其他组件
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');

    // 检查是否为数学公式
    if (className === 'language-math' || className === 'math') {
      const expression = String(children).replace(/\n$/, '');
      return <MathFormula expression={expression} displayMode={true} />;
    }

    // 普通代码块
    if (match) {
      return (
        <CodeBlock>
          <code className={className} {...props}>
            {children}
          </code>
        </CodeBlock>
      );
    }

    // 行内代码
    return <code className={className} {...props}>{children}</code>;
  },
  // 处理 $$...$$ 块
  p: ({ children, ...props }) => {
    const text = String(children);

    // 检查是否包含 $$...$$
    if (text.startsWith('$$') && text.endsWith('$$')) {
      const expression = text.slice(2, -2);
      return <MathFormula expression={expression} displayMode={true} />;
    }

    // 检查行内公式 $...$
    if (text.includes('$')) {
      const parts = text.split(/\$([^$]+)\$/g);
      const elements = parts.map((part, index) => {
        if (index % 2 === 1) {
          return <MathFormula key={index} expression={part} displayMode={false} />;
        }
        return part;
      });
      return <p {...props}>{elements}</p>;
    }

    return <p {...props}>{children}</p>;
  }
}}
```

### 方案二：使用 MathJax (备选)

MathJax 3 对 React 19 支持更好。

#### 1. 安装 MathJax
```bash
npm install mathjax@3
```

#### 2. 创建 MathJax 组件
```typescript
// src/components/MathJax.tsx
'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    MathJax: any;
  }
}

export default function MathJax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 动态加载 MathJax
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.onload = () => {
        window.MathJax = {
          tex: {
            inlineMath: [['$', '$']],
            displayMath: [['$$', '$$']]
          },
          svg: {
            fontCache: 'global'
          }
        };
        if (ref.current) {
          window.MathJax.typesetPromise([ref.current]);
        }
      };
      document.head.appendChild(script);
    } else if (ref.current) {
      window.MathJax.typesetPromise([ref.current]);
    }
  }, [children]);

  return <div ref={ref}>{children}</div>;
}
```

### 方案三：服务端预渲染 (高级)

在构建时预渲染数学公式为 SVG/HTML。

#### 1. 创建预处理函数
```typescript
// src/lib/preprocessMath.ts
import katex from 'katex';

export function preprocessMarkdown(markdown: string): string {
  // 处理块级公式 $$...$$
  markdown = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (match, expression) => {
    try {
      const html = katex.renderToString(expression, {
        displayMode: true,
        throwOnError: false
      });
      return `<div class="math-block">${html}</div>`;
    } catch (error) {
      return match; // 保持原样
    }
  });

  // 处理行内公式 $...$
  markdown = markdown.replace(/\$([^$\n]+)\$/g, (match, expression) => {
    try {
      const html = katex.renderToString(expression, {
        displayMode: false,
        throwOnError: false
      });
      return `<span class="math-inline">${html}</span>`;
    } catch (error) {
      return match; // 保持原样
    }
  });

  return markdown;
}
```

## 🎨 样式配置

添加数学公式样式：

```css
/* src/app/globals.css */

/* KaTeX 样式覆盖 */
.katex {
  font-size: 1.1em;
}

.katex-display {
  margin: 1.5rem 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5rem;
}

/* 深色模式适配 */
.dark .katex {
  color: #e2e8f0;
}

/* 错误样式 */
.math-error {
  color: #ef4444;
  font-family: monospace;
  background: #fee;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

.dark .math-error {
  background: #451a1a;
  color: #fca5a5;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .katex-display {
    font-size: 0.9em;
  }
}
```

## 🧪 测试用例

### 测试内容
```markdown
# 数学公式测试

## 行内公式
这是一个行内公式 $E = mc^2$，以及另一个 $\sqrt{a^2 + b^2}$。

## 块级公式
$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

## 矩阵
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$
```

## ⚡ 性能优化

### 1. 懒加载
```typescript
// 仅在需要时加载 KaTeX
const MathFormula = dynamic(() => import('./MathFormula'), {
  loading: () => <span>加载公式...</span>,
  ssr: false
});
```

### 2. 缓存渲染结果
```typescript
const formulaCache = new Map<string, string>();

function renderFormula(expression: string): string {
  if (formulaCache.has(expression)) {
    return formulaCache.get(expression)!;
  }

  const html = katex.renderToString(expression);
  formulaCache.set(expression, html);
  return html;
}
```

## 🚀 实施步骤

1. **选择方案** - 推荐方案一（客户端 KaTeX）
2. **安装依赖** - `npm install katex`
3. **创建组件** - MathFormula.tsx
4. **集成到 MarkdownContent** - 修改 components 配置
5. **添加样式** - 更新 globals.css
6. **测试验证** - 创建包含公式的测试文章

## 📋 检查清单

- [ ] 安装 KaTeX 或 MathJax
- [ ] 创建数学公式组件
- [ ] 集成到 Markdown 渲染器
- [ ] 添加错误处理
- [ ] 配置深色模式样式
- [ ] 测试各种公式类型
- [ ] 优化移动端显示
- [ ] 添加加载状态

## 🔗 参考资源

- [KaTeX 官方文档](https://katex.org/)
- [MathJax 3 文档](https://docs.mathjax.org/)
- [Next.js 15 动态导入](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [React 19 兼容性指南](https://react.dev/blog/2024/04/25/react-19)

---

**推荐度**: ⭐⭐⭐⭐⭐ 方案一（客户端 KaTeX）
**难度**: 中等
**耗时**: 1-2 小时