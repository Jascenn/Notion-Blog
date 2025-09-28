# 开发指南

## 🏗️ 项目架构

### 技术栈
- **Next.js 15** - React 框架 (App Router + Turbopack)
- **React 19** - UI 库 (hooks + 函数组件)
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Notion API** - 内容管理

### 核心依赖
```json
{
  "@notionhq/client": "^2.2.3",
  "react-markdown": "^8.0.7",
  "remark-gfm": "^3.0.1",
  "rehype-raw": "^6.1.1",
  "rehype-highlight": "^6.0.0"
}
```

## 🚀 环境设置

### 1. 系统要求
- Node.js 18.17+
- npm 9+ 或 yarn 1.22+
- Git 2.0+

### 2. 安装步骤
```bash
# 克隆仓库
git clone <repository-url>
cd simple-blog

# 安装依赖
npm install

# 环境配置
cp .env.example .env.local
```

### 3. 环境变量
```env
# .env.local
NOTION_API_KEY=secret_xxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxx
```

### 4. 启动开发
```bash
# 开发服务器
npm run dev

# 构建项目
npm run build

# 生产预览
npm start
```

## 📁 项目结构

```
src/
├── app/                      # Next.js App Router
│   ├── [slug]/              # 博客文章页面
│   │   └── page.tsx         # 动态路由处理
│   ├── about/               # 关于页面
│   ├── search/              # 搜索功能
│   ├── test-formats/        # 格式测试页面
│   ├── globals.css          # 全局样式
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页
├── components/              # 可复用组件
│   ├── MarkdownContent.tsx  # 🎯 核心渲染组件
│   ├── BlogCard.tsx         # 博客卡片
│   ├── LinkPrefetch.tsx     # 链接预加载
│   └── ...
└── lib/                     # 工具库
    ├── notion.ts            # Notion API 集成
    └── logger.ts            # 日志工具
```

## 🧩 核心组件

### MarkdownContent.tsx
博客系统的核心，负责渲染所有 Notion 块类型。

#### 主要功能
```typescript
export default function MarkdownContent({ content }: MarkdownContentProps) {
  // 1. HTML 标签清理
  const cleanedContent = React.useMemo(() => {
    // 移除孤立标签，修复不匹配问题
  }, [content]);

  // 2. ReactMarkdown 配置
  const components = {
    // 图片组件
    img: ({ src, alt }) => <ImageComponent src={src} alt={alt} />,

    // 代码块组件
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,

    // 自定义 div 处理
    div: ({ node, className, children, ...properties }) => {
      // 处理 Notion 特殊块类型
    }
  };

  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}
```

#### 支持的块类型处理
```typescript
// Notion Embed 组件
const NotionEmbed = ({ type, url, caption, videoType, name }) => {
  switch (type) {
    case 'image': return renderImage();
    case 'video': return renderVideo();
    case 'audio': return renderAudio();
    case 'file': return renderFile();
    case 'bookmark': return renderBookmark();
    case 'embed': return renderGenericEmbed();
  }
};
```

### ImageComponent
专业的图片显示组件。

```typescript
const ImageComponent = ({ src, alt }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  // 点击放大功能
  const handleImageClick = () => setIsZoomed(true);

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="my-6 relative group cursor-pointer">
      {/* 图片显示 */}
      {/* 放大模态框 */}
      {/* 加载动画 */}
      {/* 错误处理 */}
    </div>
  );
};
```

## 🎨 样式系统

### Tailwind CSS 配置
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      typography: {
        // 自定义 prose 样式
      }
    }
  }
};
```

### CSS-in-JS 样式
```typescript
// 组件内样式
<style jsx global>{`
  .notion-callout {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  }

  .dark .notion-callout {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
`}</style>
```

### 深色模式实现
```css
/* 颜色变量 */
.text-red { color: #e03e3e !important; }
.dark .text-red { color: #ff6b6b !important; }

.bg-blue { background-color: #dbeafe !important; }
.dark .bg-blue { background-color: rgba(30, 107, 153, 0.2) !important; }
```

## 🔧 开发工作流

### 1. 添加新块类型
```typescript
// 1. 在 MarkdownContent.tsx 中添加处理
case 'new_block_type':
  return <NewBlockComponent {...props} />;

// 2. 创建渲染组件
const NewBlockComponent = ({ data }) => {
  return (
    <div className="new-block">
      {/* 渲染逻辑 */}
    </div>
  );
};

// 3. 添加样式
.new-block {
  /* 浅色模式样式 */
}
.dark .new-block {
  /* 深色模式样式 */
}

// 4. 在测试页面验证
```

### 2. 媒体类型扩展
```typescript
// 在 NotionEmbed 组件中添加
const renderNewMedia = () => {
  // 平台检测
  if (url?.includes('new-platform.com')) {
    return <iframe src={embedUrl} />;
  }

  // 文件格式检测
  if (url?.match(/\.(new-format)$/i)) {
    return <NewMediaPlayer src={url} />;
  }

  // 回退处理
  return <LinkFallback url={url} />;
};
```

### 3. 样式开发规范
```typescript
// 优先使用 Tailwind 类
<div className="flex items-center gap-4 p-6 rounded-lg">

// 组件特定样式使用 CSS-in-JS
<style jsx>{`
  .custom-component {
    /* 特殊样式 */
  }
`}</style>

// 确保深色模式兼容
<div className="bg-white dark:bg-gray-800">
```

## 🧪 测试开发

### 格式测试页面
```typescript
// /src/app/test-formats/page.tsx
export default function TestFormatsPage() {
  const testContent = `
    # 测试标题

    这是段落测试

    <div class="notion-embed" data-embed-type="video" data-url="...">
    </div>
  `;

  return (
    <div>
      <MarkdownContent content={testContent} />
    </div>
  );
}
```

### 开发调试
```typescript
// 开发环境调试信息
if (process.env.NODE_ENV === 'development') {
  console.warn('HTML div tags mismatch');
  logger.debug('Block rendering', { type, data });
}
```

## 🚀 性能优化

### 代码分割
```typescript
// 动态导入组件
const MathComponent = dynamic(() => import('./MathComponent'), {
  ssr: false,
  loading: () => <div>加载中...</div>
});
```

### 图片优化
```typescript
// Next.js Image 优化
<Image
  src={src}
  alt={alt}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 缓存策略
```typescript
// API 响应缓存
export const revalidate = 3600; // 1小时

// 静态生成
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

## 📊 监控调试

### 开发工具
- **Next.js DevTools**: 路由和渲染调试
- **React DevTools**: 组件状态检查
- **Lighthouse**: 性能分析
- **Chrome DevTools**: 网络和性能

### 日志系统
```typescript
// lib/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  }
};
```

### 错误边界
```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Component error boundary', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 🔄 版本控制

### Git 工作流
```bash
# 功能开发
git checkout -b feature/new-block-type
git add .
git commit -m "feat: add new block type support"
git push origin feature/new-block-type

# 代码审查
# 创建 Pull Request
# 合并到主分支
```

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

---

**下一步**: 查看 [组件文档](./COMPONENTS.md) 了解详细的组件 API