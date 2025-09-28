import MarkdownContent from '@/components/MarkdownContent';

export default function TestFormatsPage() {
  // 测试用的 markdown 内容，包含各种格式
  const testContent = `
# 格式测试页面

## 1. 基础文本测试
这是一个普通段落，包含 **粗体文字**、*斜体文字* 和 \`行内代码\`。

### 三级标题测试
这是三级标题下的内容。

## 2. 列表测试

### 无序列表
- 第一层项目
  - 第二层项目
    - 第三层项目
- 另一个第一层项目

### 有序列表
1. 第一项
2. 第二项
   1. 嵌套第一项
   2. 嵌套第二项
3. 第三项

## 3. 引用块测试
> 这是一个引用块的内容。
> 可以包含多行文字。

## 4. 代码块测试
\`\`\`javascript
function testFunction() {
  console.log('Hello, World!');
  return true;
}
\`\`\`

## 5. Callout 测试
<div class="notion-callout" data-color="blue_background">
  <div class="notion-callout-icon">
    <span class="notion-callout-emoji">💡</span>
  </div>
  <div class="notion-callout-body">
    <div>这是一个蓝色背景的 Callout 提示框</div>
  </div>
</div>

## 6. Toggle 测试
<details class="notion-toggle">
  <summary>点击展开内容</summary>
  <div class="notion-toggle-children">
    这是折叠的内容，点击上方可以展开或收起。
  </div>
</details>

## 7. 多列布局测试
<div class="notion-columns-wrapper" data-columns='["**左栏**\\n- 适合放步骤\\n- 或放定义", "**右栏**\\n- 适合放示例\\n- 或放对比图"]'></div>

## 8. 表格测试
<div class="notion-table-wrapper">
  <table class="notion-table">
    <thead>
      <tr>
        <th>格式名称</th>
        <th>状态</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>段落</td>
        <td>✅ 正常</td>
        <td>基础文本显示</td>
      </tr>
      <tr>
        <td>列表</td>
        <td>✅ 正常</td>
        <td>支持多层嵌套</td>
      </tr>
      <tr>
        <td>代码块</td>
        <td>✅ 正常</td>
        <td>语法高亮 + 复制功能</td>
      </tr>
    </tbody>
  </table>
</div>

## 9. 嵌入内容测试

### 图片测试 (格式9)
![随机风景图片](https://picsum.photos/500/300)

![山景图片](https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop)

![固定测试图片](https://picsum.photos/id/10/500/300)

### 视频测试 (格式10)
<div class="notion-embed" data-embed-type="video" data-url="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4" data-video-type="file" data-caption="示例MP4视频.mp4"></div>

<div class="notion-embed" data-embed-type="video" data-url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" data-video-type="file" data-caption="Big Buck Bunny 测试视频"></div>

### 音频测试 (格式11)
<div class="notion-embed" data-embed-type="audio" data-url="https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3" data-caption="Kalimba 示例音乐"></div>

<div class="notion-embed" data-embed-type="audio" data-url="https://file-examples.com/storage/fe68c97de659980ffb70cd9/2017/11/file_example_MP3_700KB.mp3" data-caption="示例音频文件.mp3"></div>

### 文件下载测试 (格式12)
<div class="notion-embed" data-embed-type="file" data-url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" data-name="W3C测试PDF文档.pdf"></div>

<div class="notion-embed" data-embed-type="file" data-url="https://www.learningcontainer.com/wp-content/uploads/2019/09/sample-pdf-file.pdf" data-name="示例PDF文档.pdf"></div>

<div class="notion-embed" data-embed-type="file" data-url="https://raw.githubusercontent.com/elastic/elasticsearch/master/README.md" data-name="README文档.md"></div>

<div class="notion-embed" data-embed-type="file" data-url="https://jsonplaceholder.typicode.com/posts" data-name="API数据.json"></div>

### 书签测试
<div class="notion-embed" data-embed-type="bookmark" data-url="https://spotify.com/track/example" data-caption="测试书签链接"></div>

### 视频测试
<div class="notion-embed" data-embed-type="video" data-url="https://youtube.com/watch?v=dQw4w9WgXcQ" data-video-type="youtube"></div>

### 音频测试
<div class="notion-embed" data-embed-type="audio" data-url="https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC"></div>

## 10. 分割线测试
---

## 11. 链接测试
这是一个 [外部链接](https://example.com) 的测试。

## 12. 图片测试
![测试图片](https://picsum.photos/400/200)

## 测试完成
如果所有格式都正确显示，说明渲染系统工作正常！
`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h1 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            🧪 Notion 格式测试页面
          </h1>
          <p className="text-yellow-700 dark:text-yellow-300">
            这是一个临时测试页面，用于验证各种 Notion 块格式的显示效果。
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            访问地址: <code>http://localhost:3003/test-formats</code>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <MarkdownContent content={testContent} />
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            🔍 测试说明
          </h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>✅ 应该正常工作:</strong> 段落、标题、列表、引用、代码块、表格、分割线</p>
            <p><strong>🔧 正在修复:</strong> 文件下载、书签链接、多列布局</p>
            <p><strong>⚠️ 已搁置:</strong> 数学公式</p>
            <p><strong>🎯 新功能:</strong> PDF导出、深色模式、响应式设计</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: 'Notion 格式测试页面 | Simple Blog',
    description: '用于测试和验证各种 Notion 块格式的显示效果',
    robots: 'noindex, nofollow', // 防止搜索引擎索引测试页面
  };
}