# 故障排除指南

## 🚨 常见问题

### 1. 图片显示问题

#### 问题：图片不显示或显示"加载失败"
**可能原因**：
- 图片 URL 无效或无法访问
- 网络连接问题
- Next.js 图片域名配置

**解决步骤**：
```bash
# 1. 检查图片 URL 是否可访问
curl -I "图片URL"

# 2. 检查 Next.js 配置
# next.config.js
module.exports = {
  images: {
    domains: ['your-image-domain.com'],
  },
}

# 3. 重启开发服务器
npm run dev
```

**验证方法**：
- 在浏览器中直接访问图片 URL
- 检查控制台网络标签页
- 查看是否有 CORS 错误

#### 问题：图片点击放大不工作
**检查项目**：
```typescript
// 确认 ImageComponent 中的事件处理
const handleImageClick = () => setIsZoomed(true);

// 检查 ESC 键监听
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsZoomed(false);
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 2. 音频/视频播放问题

#### 问题：音频不播放
**可能原因**：
- 浏览器不支持音频格式
- 文件 URL 无效
- 音频组件未正确渲染

**调试步骤**：
```javascript
// 1. 检查浏览器控制台错误
console.log('Audio element:', audioElement);
console.log('Can play MP3:', audioElement.canPlayType('audio/mp3'));

// 2. 检查音频 URL
fetch(audioUrl).then(response => {
  console.log('Audio URL status:', response.status);
});

// 3. 检查音频组件渲染
// 在 renderAudio 函数中添加调试
console.log('Rendering audio:', { url, type });
```

**支持的格式**：
- ✅ MP3 (所有现代浏览器)
- ✅ WAV (所有现代浏览器)
- ✅ OGG (Firefox, Chrome)
- ✅ M4A (Safari, Chrome)
- ✅ FLAC (Chrome, Firefox)
- ✅ AAC (Safari, Chrome)

#### 问题：视频不播放
**常见解决方案**：
```html
<!-- 确保视频标签配置正确 -->
<video controls preload="metadata">
  <source src="video.mp4" type="video/mp4">
  您的浏览器不支持视频播放
</video>
```

**检查项目**：
- 视频文件格式是否支持
- 服务器是否支持 Range 请求
- 网络连接是否稳定

### 3. Notion API 问题

#### 问题：无法获取 Notion 数据
**错误排查**：
```bash
# 1. 检查环境变量
echo $NOTION_API_KEY
echo $NOTION_DATABASE_ID

# 2. 测试 API 连接
curl -X POST https://api.notion.com/v1/databases/YOUR_DATABASE_ID/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Notion-Version: 2022-06-28"
```

**常见错误码**：
- `401 Unauthorized`: API 密钥无效
- `404 Not Found`: 数据库 ID 错误
- `403 Forbidden`: 权限不足

**解决方案**：
```typescript
// lib/notion.ts 中添加错误处理
export async function getDatabase() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
    });
    return response;
  } catch (error) {
    console.error('Notion API Error:', error);
    throw new Error('Failed to fetch from Notion API');
  }
}
```

#### 问题：页面内容不同步
**可能原因**：
- Notion 页面未发布
- 缓存问题
- API 限流

**解决步骤**：
1. 确认 Notion 页面已发布
2. 清除浏览器缓存
3. 重启开发服务器
4. 检查 API 请求频率

### 4. 样式显示问题

#### 问题：深色模式不工作
**检查项目**：
```javascript
// 1. 检查 Tailwind 配置
// tailwind.config.js
module.exports = {
  darkMode: 'class', // 确认是 'class' 模式
  // ...
}

// 2. 检查 HTML 类名
document.documentElement.classList.contains('dark');

// 3. 检查 CSS 变量
getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
```

**常见问题**：
- `darkMode: 'media'` 改为 `darkMode: 'class'`
- 确保根元素有 `dark` 类名
- 检查 CSS 类的优先级

#### 问题：响应式布局异常
**调试方法**：
```css
/* 临时添加边框调试 */
.notion-column-list { border: 2px solid red; }
.notion-column { border: 1px solid blue; }

/* 检查网格布局 */
.notion-column-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
```

**移动端检查**：
- 使用浏览器开发工具的设备模拟器
- 检查视口 meta 标签
- 验证媒体查询断点

### 5. 开发环境问题

#### 问题：端口被占用
**现象**：`Port 3000 is in use, using available port 3002`

**解决方案**：
```bash
# 1. 查找占用端口的进程
lsof -ti:3000

# 2. 终止进程
kill -9 $(lsof -ti:3000)

# 3. 或指定其他端口
npm run dev -- -p 3001
```

#### 问题：热重载不工作
**可能原因**：
- 文件监听限制
- Turbopack 配置问题
- 文件路径问题

**解决步骤**：
```bash
# 1. 增加文件监听限制 (macOS)
echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf
echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf

# 2. 重启开发服务器
npm run dev

# 3. 清除缓存
rm -rf .next
npm run dev
```

#### 问题：TypeScript 错误
**常见错误处理**：
```typescript
// 1. 类型断言
const element = document.getElementById('id') as HTMLElement;

// 2. 可选链
const data = response?.data?.results;

// 3. 类型守卫
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// 4. 忽略类型检查 (临时)
// @ts-ignore
const result = someUntypedFunction();
```

### 6. 构建和部署问题

#### 问题：构建失败
**常见错误**：
```bash
# 1. 内存不足
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 2. 类型检查错误
npm run build -- --no-lint

# 3. 清除缓存
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### 问题：Vercel 部署失败
**检查项目**：
1. 环境变量是否正确设置
2. 构建命令是否正确
3. Node.js 版本是否兼容

**Vercel 配置**：
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 🔧 调试工具

### 1. 浏览器开发工具

#### 控制台调试
```javascript
// 检查 React 组件状态
// 安装 React DevTools 扩展

// 检查 DOM 元素
document.querySelector('.notion-embed');

// 检查网络请求
fetch('/api/posts').then(console.log);

// 性能分析
console.time('render');
// ... 渲染代码
console.timeEnd('render');
```

#### 网络调试
- **检查 API 请求**：Network 标签页
- **查看响应数据**：点击请求查看详情
- **检查缓存**：Disable cache 选项

### 2. Next.js 调试

#### 开发模式调试
```javascript
// next.config.js
module.exports = {
  env: {
    CUSTOM_KEY: 'my-value',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}
```

#### 服务端渲染调试
```typescript
// 页面组件中添加调试
export async function getServerSideProps() {
  console.log('Server-side rendering...');

  try {
    const data = await fetchData();
    return { props: { data } };
  } catch (error) {
    console.error('SSR Error:', error);
    return { props: { data: null } };
  }
}
```

### 3. 性能分析

#### Lighthouse 审计
```bash
# 安装 Lighthouse CLI
npm install -g @lhci/cli

# 运行性能审计
lhci autorun --upload.target=temporary-public-storage
```

#### 核心网络指标
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

## 📋 问题排查清单

### 基础检查
- [ ] 开发服务器正在运行
- [ ] 环境变量正确配置
- [ ] 网络连接正常
- [ ] 浏览器控制台无错误

### 格式渲染检查
- [ ] 访问测试页面 `/test-formats`
- [ ] 21种格式正常显示
- [ ] 深色模式切换正常
- [ ] 移动端显示正常

### 媒体功能检查
- [ ] 图片正常加载和显示
- [ ] 点击放大功能正常
- [ ] 音频播放器正常
- [ ] 视频播放器正常
- [ ] 文件下载功能正常

### 性能检查
- [ ] 页面加载速度 < 3s
- [ ] 图片懒加载正常
- [ ] 代码分割正常
- [ ] 缓存策略生效

## 🆘 获取帮助

### 在线资源
- **Next.js 文档**: https://nextjs.org/docs
- **React 文档**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Notion API**: https://developers.notion.com

### 社区支持
- **Stack Overflow**: 搜索相关标签
- **GitHub Issues**: 查看项目 issues
- **Discord/Slack**: 开发者社区

### 报告问题
提交问题时请包含：
1. **环境信息**: 操作系统、浏览器版本、Node.js 版本
2. **复现步骤**: 详细的操作步骤
3. **错误信息**: 控制台错误和堆栈跟踪
4. **预期行为**: 应该如何工作
5. **实际行为**: 实际发生了什么

---

**问题仍未解决？** 请访问项目 GitHub 仓库提交 Issue，或查看 [开发文档](./DEVELOPMENT.md) 获取更多技术细节。