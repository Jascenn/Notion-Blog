export interface NotionPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  tags: string[];
  published: boolean;
  cover?: string | null;
  pinned?: boolean;
  type?: 'post' | 'page' | 'announcement';
}

// Notion API 请求头
const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
});

// Fetch 选项，禁用缓存实现实时更新
const getFetchOptions = () => ({
  next: { revalidate: 0 }, // 禁用缓存
  cache: 'no-store' as RequestCache, // 不存储缓存
});

// 带超时的 fetch 函数
async function fetchWithTimeout(url: string, options: any, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Mock 数据作为备用
const mockPosts: NotionPost[] = [
  {
    id: '1',
    title: '📷 图文随笔：四季更替',
    excerpt: '记录四季的变化，感受时间的流逝，每一个季节都有它独特的美。从春的新绿到冬的纯白，每一帧都值得珍藏。',
    publishedAt: '2024-12-25',
    slug: 'seasons-notes',
    tags: ['随笔', '生活', '摄影', '四季'],
    published: true,
    cover: null,
    content: '# 四季更替\n\n记录四季的变化，感受时间的流逝，每一个季节都有它独特的美。\n\n## 春天的故事\n\n万物复苏的季节...\n\n## 夏日时光\n\n热烈而充满活力...'
  },
  {
    id: '2',
    title: '🚀 架构笔记：我的博客技术栈',
    excerpt: '分享这个博客的技术选型和架构设计，以及为什么选择这些技术。从 Next.js 到 Notion CMS，每个选择都有它的理由。',
    publishedAt: '2024-12-20',
    slug: 'blog-stack-notes',
    tags: ['技术', '架构', 'Next.js', 'Notion'],
    published: true,
    cover: null,
    content: '# 博客技术栈\n\n这个博客使用了现代化的技术栈，追求简洁和高效。\n\n## 前端架构\n\n- **Framework**: Next.js 15\n- **Styling**: Tailwind CSS\n- **Font**: LXGW WenKai\n\n## 内容管理\n\n- **CMS**: Notion\n- **Markdown**: react-markdown'
  },
  {
    id: '3',
    title: '💡 效率工具：打造完美的开发环境',
    excerpt: '分享我的开发工具和工作流，包括编辑器配置、命令行工具、以及各种提升效率的小技巧。',
    publishedAt: '2024-12-15',
    slug: 'dev-tools-setup',
    tags: ['工具', '效率', '开发', 'VSCode'],
    published: true,
    cover: null,
    content: '# 开发环境配置\n\n一个好的开发环境能够大大提升工作效率。\n\n## 编辑器\n\n使用 VSCode 作为主力编辑器...\n\n## 终端工具\n\n- iTerm2\n- Oh My Zsh\n- 各种有用的命令行工具'
  },
  {
    id: '4',
    title: '🎨 设计思考：极简主义的魅力',
    excerpt: '探讨极简主义在设计中的应用，从用户界面到用户体验，少即是多的设计哲学如何改变我们的思考方式。',
    publishedAt: '2024-12-10',
    slug: 'minimalism-design',
    tags: ['设计', '极简', 'UI/UX', '哲学'],
    published: true,
    cover: null,
    content: '# 极简主义设计\n\n少即是多，这是极简主义设计的核心理念。\n\n## 设计原则\n\n1. **简洁性** - 去除不必要的元素\n2. **功能性** - 专注于核心功能\n3. **可读性** - 确保信息清晰传达'
  },
  {
    id: '5',
    title: '📚 读书笔记：《深度工作》',
    excerpt: 'Cal Newport 的《深度工作》读后感，分享如何在分心的时代培养专注力，提升工作质量和效率。',
    publishedAt: '2024-12-05',
    slug: 'deep-work-notes',
    tags: ['读书', '效率', '专注', '成长'],
    published: true,
    cover: null,
    content: '# 深度工作读后感\n\n在这个信息爆炸的时代，如何保持专注成为了一种稀缺的能力。\n\n## 核心观点\n\n深度工作是在无干扰的状态下专注进行职业活动的能力...\n\n## 实践方法\n\n1. 设定专门的工作时间\n2. 创造无干扰的环境\n3. 培养专注的习惯'
  },
  {
    id: '6',
    title: '🌱 生活感悟：慢下来的艺术',
    excerpt: '在快节奏的现代生活中，我们是否忘记了慢下来的重要性？分享一些关于慢生活的思考和体验。',
    publishedAt: '2024-11-28',
    slug: 'slow-living-art',
    tags: ['生活', '感悟', '慢生活', '哲学'],
    published: true,
    cover: null,
    content: '# 慢下来的艺术\n\n在这个快节奏的时代，慢下来成为了一种奢侈。\n\n## 慢的意义\n\n慢不是懒惰，而是一种生活态度...\n\n## 实践方式\n\n- 每天留出思考的时间\n- 专注于当下的体验\n- 减少不必要的忙碌'
  }
];

// 获取所有已发布的文章
export async function getPosts(): Promise<NotionPost[]> {
  try {
    const response = await fetchWithTimeout(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: getHeaders(),
      ...getFetchOptions(),
      body: JSON.stringify({
        filter: {
          or: [
            {
              property: 'Published',
              checkbox: {
                equals: true,
              },
            },
            {
              property: 'Status',
              select: {
                equals: '✅ Published',
              },
            },
            {
              property: 'Status',
              select: {
                equals: 'Published',
              },
            }
          ]
        },
        sorts: [
          {
            property: 'Published Date',
            direction: 'descending',
          },
        ],
      }),
    }, 5000); // 5秒超时

    if (!response.ok) {
      console.error('Notion API Error:', response.status, await response.text());
      console.log('🔄 Using mock data as fallback...');
      return mockPosts;
    }

    const data = await response.json();
    console.log(`[DEBUG] Notion API 返回了 ${data.results?.length} 条结果`);

    if (data.results?.length === 0) {
      console.log('[DEBUG] 过滤条件:', JSON.stringify({
        databaseId: process.env.NOTION_DATABASE_ID,
        notionTokenPrefix: (process.env.NOTION_TOKEN || process.env.NOTION_SECRET || '').substring(0, 10)
      }));
    }

    const posts = await Promise.all(
      data.results.map(async (page: any) => {
        try {
          // 获取页面内容
          const contentResponse = await fetchWithTimeout(`https://api.notion.com/v1/blocks/${page.id}/children`, {
            headers: getHeaders(),
            ...getFetchOptions(),
          }, 3000); // 3秒超时

          let content = '';
          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            content = blocksToMarkdown(contentData.results);
          }

          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt: getPlainText(page.properties.Summary?.rich_text || []) || content.substring(0, 150) + '...',
            content: content,
            publishedAt: page.properties['Published Date']?.date?.start || new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: any) => ({
              name: tag.name,
              color: tag.color
            })) || [],
            published: page.properties.Published?.checkbox || (page.properties.Status?.select?.name === '✅ Published'),
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            pinned: page.properties.Pinned?.checkbox || false,
            type: page.properties.Type?.select?.name || 'post',
          };
        } catch (error) {
          console.error(`Error fetching content for page ${page.id}:`, error);
          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt: getPlainText(page.properties.Summary?.rich_text || []) || '内容加载失败...',
            content: '内容暂时无法加载，请稍后再试。',
            publishedAt: page.properties['Published Date']?.date?.start || new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: any) => ({
              name: tag.name,
              color: tag.color
            })) || [],
            published: page.properties.Published?.checkbox || false,
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            pinned: page.properties.Pinned?.checkbox || false,
            type: page.properties.Type?.select?.name || 'post',
          };
        }
      })
    );

    return posts;
  } catch (error) {
    console.error('Error fetching posts from Notion:', error);
    console.log('🔄 Using mock data as fallback...');
    return mockPosts;
  }
}

// 根据 slug 获取单篇文章
export async function getPostBySlug(slug: string): Promise<NotionPost | null> {
  try {
    const response = await fetchWithTimeout(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: getHeaders(),
      ...getFetchOptions(),
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: 'Published',
              checkbox: {
                equals: true,
              },
            },
            {
              property: 'Slug',
              rich_text: {
                equals: slug,
              },
            },
          ],
        },
      }),
    }, 5000);

    if (!response.ok) {
      console.error('Notion API Error:', response.status, await response.text());
      // 尝试从 mock 数据中查找匹配的文章
      const matchingPost = mockPosts.find(post => post.slug === slug);
      return matchingPost || null;
    }

    const data = await response.json();

    if (data.results.length === 0) {
      // 尝试从 mock 数据中查找匹配的文章
      const matchingPost = mockPosts.find(post => post.slug === slug);
      return matchingPost || null;
    }

    const page = data.results[0];

    // 获取页面内容
    try {
      const contentResponse = await fetchWithTimeout(`https://api.notion.com/v1/blocks/${page.id}/children`, {
        headers: getHeaders(),
        ...getFetchOptions(),
      }, 3000);

      let content = '';
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        content = blocksToMarkdown(contentData.results);
      }

      return {
        id: page.id,
        title: getPlainText(page.properties.Title?.title || []),
        slug: getPlainText(page.properties.Slug?.rich_text || []),
        excerpt: getPlainText(page.properties.Excerpt?.rich_text || []),
        content: content,
        publishedAt: page.properties['Published Date']?.date?.start || new Date().toISOString(),
        tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
        published: page.properties.Published?.checkbox || false,
        cover: page.cover?.external?.url || page.cover?.file?.url || null,
      };
    } catch (contentError) {
      console.error(`Error fetching content for page ${page.id}:`, contentError);
      // 返回基本信息，内容为空
      return {
        id: page.id,
        title: getPlainText(page.properties.Title?.title || []),
        slug: getPlainText(page.properties.Slug?.rich_text || []),
        excerpt: getPlainText(page.properties.Excerpt?.rich_text || []),
        content: '内容暂时无法加载，请稍后再试。',
        publishedAt: page.properties['Published Date']?.date?.start || new Date().toISOString(),
        tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
        published: page.properties.Published?.checkbox || false,
        cover: page.cover?.external?.url || page.cover?.file?.url || null,
      };
    }
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    // 尝试从 mock 数据中查找匹配的文章
    const matchingPost = mockPosts.find(post => post.slug === slug);
    return matchingPost || null;
  }
}

// 辅助函数：提取纯文本
function getPlainText(richText: any[]): string {
  return richText.map((text) => text.plain_text).join('');
}

// 辅助函数：生成 slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]/g, '') // 保留中文字符
    .replace(/\s+/g, '-')
    .trim();
}

// 辅助函数：将 Notion 块转换为 Markdown
function blocksToMarkdown(blocks: any[]): string {
  let markdown = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'paragraph':
        const paragraphText = getPlainText(block.paragraph?.rich_text || []);
        // 如果是空段落（有内容的才加文字，没内容的作为空行保留）
        if (paragraphText.trim()) {
          markdown += paragraphText + '\n\n';
        } else {
          // 在 Notion 中用户常用的空行，使用空格占位以保留视觉间距
          markdown += '&nbsp;\n\n';
        }
        break;

      case 'heading_1':
        const h1Text = getPlainText(block.heading_1?.rich_text || []);
        if (h1Text.trim()) {
          markdown += `# ${h1Text}\n\n`;
        }
        break;

      case 'heading_2':
        const h2Text = getPlainText(block.heading_2?.rich_text || []);
        if (h2Text.trim()) {
          markdown += `## ${h2Text}\n\n`;
        }
        break;

      case 'heading_3':
        const h3Text = getPlainText(block.heading_3?.rich_text || []);
        if (h3Text.trim()) {
          markdown += `### ${h3Text}\n\n`;
        }
        break;

      case 'bulleted_list_item':
        const listText = getPlainText(block.bulleted_list_item?.rich_text || []);
        if (listText.trim()) {
          markdown += `- ${listText}\n`;
        }
        break;

      case 'numbered_list_item':
        const numberedText = getPlainText(block.numbered_list_item?.rich_text || []);
        if (numberedText.trim()) {
          markdown += `1. ${numberedText}\n`;
        }
        break;

      case 'code':
        const codeText = getPlainText(block.code?.rich_text || []);
        const language = block.code?.language || '';
        if (codeText.trim()) {
          markdown += `\`\`\`${language}\n${codeText}\n\`\`\`\n\n`;
        }
        break;

      case 'quote':
        const quoteText = getPlainText(block.quote?.rich_text || []);
        if (quoteText.trim()) {
          markdown += `> ${quoteText}\n\n`;
        }
        break;

      case 'image':
        const imageUrl = block.image?.external?.url || block.image?.file?.url;
        const imageCaption = getPlainText(block.image?.caption || []);
        if (imageUrl) {
          markdown += `![${imageCaption || '图片'}](${imageUrl})\n\n`;
        }
        break;

      case 'video':
        const videoUrl = block.video?.external?.url || block.video?.file?.url;
        const videoCaption = getPlainText(block.video?.caption || []);
        if (videoUrl) {
          // 对于视频，我们可以显示为链接或尝试嵌入
          markdown += `[📹 ${videoCaption || '视频'}](${videoUrl})\n\n`;
        }
        break;

      case 'file':
        const fileUrl = block.file?.external?.url || block.file?.file?.url;
        const fileName = block.file?.name || getPlainText(block.file?.caption || []);
        if (fileUrl) {
          markdown += `[📁 ${fileName || '文件'}](${fileUrl})\n\n`;
        }
        break;

      case 'embed':
        const embedUrl = block.embed?.url;
        if (embedUrl) {
          markdown += `[🔗 嵌入内容](${embedUrl})\n\n`;
        }
        break;

      case 'divider':
        markdown += `---\n\n`;
        break;

      case 'table':
        // 简单的表格处理
        if (block.table?.table_width > 0) {
          markdown += `\n| `;
          for (let i = 0; i < block.table.table_width; i++) {
            markdown += `列${i + 1} | `;
          }
          markdown += `\n| `;
          for (let i = 0; i < block.table.table_width; i++) {
            markdown += `--- | `;
          }
          markdown += `\n\n`;
        }
        break;

      default:
        // 对于不支持的块类型，尝试提取文本
        const defaultText = getPlainText(block[block.type]?.rich_text || []);
        if (defaultText.trim()) {
          markdown += defaultText + '\n\n';
        }
        break;
    }
  }

  return markdown.trim();
}

// 获取关于页面内容
export async function getAboutPage(): Promise<NotionPost | null> {
  try {
    const response = await fetchWithTimeout(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: getHeaders(),
      ...getFetchOptions(),
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: 'Published',
              checkbox: {
                equals: true,
              },
            },
            {
              property: 'Type',
              select: {
                equals: 'page',
              },
            },
            {
              property: 'Slug',
              rich_text: {
                equals: 'about',
              },
            },
          ],
        },
      }),
    }, 5000);

    if (!response.ok) {
      console.error('Notion API Error for About page:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.results.length === 0) {
      return null;
    }

    const page = data.results[0];

    // 获取页面内容
    try {
      const contentResponse = await fetchWithTimeout(`https://api.notion.com/v1/blocks/${page.id}/children`, {
        headers: getHeaders(),
        ...getFetchOptions(),
      }, 3000);

      let content = '';
      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        content = blocksToMarkdown(contentData.results);
      }

      return {
        id: page.id,
        title: getPlainText(page.properties.Title?.title || []),
        slug: 'about',
        excerpt: getPlainText(page.properties.Excerpt?.rich_text || []),
        content: content,
        publishedAt: page.properties['Published Date']?.date?.start || new Date().toISOString(),
        tags: [],
        published: page.properties.Published?.checkbox || false,
        cover: page.cover?.external?.url || page.cover?.file?.url || null,
        type: 'page',
      };
    } catch (contentError) {
      console.error(`Error fetching About page content:`, contentError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching About page:', error);
    return null;
  }
}

// 获取公告信息
export async function getAnnouncements(): Promise<NotionPost[]> {
  try {
    const response = await fetchWithTimeout(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: getHeaders(),
      ...getFetchOptions(),
      body: JSON.stringify({
        filter: {
          and: [
            {
              or: [
                {
                  property: 'Published',
                  checkbox: { equals: true },
                },
                {
                  property: 'Status',
                  select: { equals: '✅ Published' },
                },
                {
                  property: 'Status',
                  select: { equals: 'Published' },
                }
              ]
            },
            {
              property: 'Type',
              select: {
                equals: 'announcement',
              },
            },
          ],
        },
        sorts: [
          {
            property: 'Published Date',
            direction: 'descending',
          },
        ],
      }),
    }, 5000);

    if (!response.ok) {
      console.error('Notion API Error for Announcements:', response.status);
      return [];
    }

    const data = await response.json();

    const announcements = await Promise.all(
      data.results.map(async (page: any) => {
        try {
          const contentResponse = await fetchWithTimeout(`https://api.notion.com/v1/blocks/${page.id}/children`, {
            headers: getHeaders(),
            ...getFetchOptions(),
          }, 3000);

          let content = '';
          if (contentResponse.ok) {
            const contentData = await contentResponse.json();
            content = blocksToMarkdown(contentData.results);
          }

          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt: getPlainText(page.properties.Excerpt?.rich_text || []) || content.substring(0, 100) + '...',
            content: content,
            publishedAt: page.properties['Published Date']?.date?.start || new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
            published: page.properties.Published?.checkbox || false,
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            type: 'announcement' as const,
          };
        } catch (error) {
          console.error(`Error fetching announcement content for page ${page.id}:`, error);
          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt: getPlainText(page.properties.Excerpt?.rich_text || []) || '内容加载失败...',
            content: '内容暂时无法加载，请稍后再试。',
            publishedAt: page.properties['Published Date']?.date?.start || new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
            published: page.properties.Published?.checkbox || false,
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            type: 'announcement' as const,
          };
        }
      })
    );

    return announcements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

// 获取文章（过滤掉页面和公告）
export async function getPostsOnly(): Promise<NotionPost[]> {
  const allPosts = await getPosts();
  return allPosts.filter(post => post.type !== 'announcement' && post.type !== 'page');
}