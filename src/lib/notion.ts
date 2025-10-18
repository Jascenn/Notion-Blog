import { logger } from './logger';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

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

// Notion API 响应类型
interface NotionRichText {
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  text?: {
    link?: {
      url?: string | null;
    };
  };
}

interface NotionSelect {
  name: string;
}

interface NotionMultiSelect {
  name: string;
}

interface NotionCheckbox {
  checkbox: boolean;
}

interface NotionDate {
  start: string;
}

interface NotionFile {
  url: string;
}

interface NotionCover {
  external?: NotionFile;
  file?: NotionFile;
}

interface NotionProperties {
  Title?: { title: NotionRichText[] };
  Slug?: { rich_text: NotionRichText[] };
  Summary?: { rich_text: NotionRichText[] };
  'Published Date'?: { date?: NotionDate };
  Tags?: { multi_select: NotionMultiSelect[] };
  Published?: NotionCheckbox;
  Status?: { select?: NotionSelect };
  Type?: { select?: NotionSelect };
}

interface NotionPage {
  id: string;
  properties: NotionProperties;
  cover?: NotionCover;
  last_edited_time: string;
}

// Notion 块内容类型
interface NotionBlockContent {
  rich_text?: NotionRichText[];
  language?: string;
  caption?: NotionRichText[];
  url?: string;
  name?: string;
  color?: string;
  table_width?: number;
  is_toggleable?: boolean;
  children?: NotionBlock[];
  icon?: {
    emoji?: string;
    external?: { url: string };
    file?: { url: string };
  };
  external?: { url: string };
  file?: { url: string };
  table_row?: {
    cells: NotionRichText[][];
  };
  bookmark?: {
    url: string;
  };
}

interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  // 具体的块类型属性
  paragraph?: NotionBlockContent;
  heading_1?: NotionBlockContent;
  heading_2?: NotionBlockContent;
  heading_3?: NotionBlockContent;
  bulleted_list_item?: NotionBlockContent;
  numbered_list_item?: NotionBlockContent;
  code?: NotionBlockContent;
  quote?: NotionBlockContent;
  image?: NotionBlockContent & {
    external?: { url: string };
    file?: { url: string };
  };
  video?: NotionBlockContent & {
    external?: { url: string };
    file?: { url: string };
  };
  audio?: NotionBlockContent & {
    external?: { url: string };
    file?: { url: string };
  };
  file?: NotionBlockContent & {
    external?: { url: string };
    file?: { url: string };
  };
  embed?: { url: string };
  table?: { table_width: number };
  callout?: NotionBlockContent;
  toggle?: NotionBlockContent;
  column_list?: NotionBlockContent;
  column?: NotionBlockContent;
  table_row?: { cells: NotionRichText[][] };
  table?: {
    table_width: number;
    has_column_header?: boolean;
    has_row_header?: boolean;
  };
  bookmark?: {
    caption?: NotionRichText[];
    url: string;
  };
  equation?: {
    expression: string;
  };
  pdf?: NotionBlockContent;
  // 通用索引签名作为后备
  [key: string]: NotionBlockContent | string | number | boolean | undefined;
}

interface FetchOptions {
  method?: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  next?: { revalidate: number };
  cache?: RequestCache;
}

// Notion API 请求头
const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.NOTION_TOKEN || process.env.NOTION_SECRET}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
});

// Fetch 选项，合理的缓存策略
const getFetchOptions = () => ({
  next: { revalidate: 300 }, // 5分钟缓存
  cache: 'force-cache' as RequestCache, // 启用缓存
});

// Notion 客户端与 Markdown 转换器缓存，避免重复初始化
let notionClient: Client | null = null;
let notionMarkdown: NotionToMarkdown | null = null;

function ensureNotionMarkdown(): NotionToMarkdown | null {
  if (notionMarkdown) {
    return notionMarkdown;
  }

  const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
  if (!notionToken) {
    return null;
  }

  try {
    notionClient = new Client({ auth: notionToken });
    notionMarkdown = new NotionToMarkdown({ notionClient });
    return notionMarkdown;
  } catch (error) {
    logger.error('初始化 Notion Markdown 转换器失败', error);
    notionClient = null;
    notionMarkdown = null;
    return null;
  }
}

// 请求缓存和限流
const childrenCache = new Map<string, { data: NotionBlock[]; timestamp: number }>();
const pageCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = process.env.NODE_ENV === 'development' ? 10 * 1000 : 2 * 60 * 1000; // 开发环境10秒，生产环境2分钟
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 1; // 减少到1个并发请求
const REQUEST_DELAY = 200; // 增加请求间延迟到200ms

// 请求队列处理
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const batch = requestQueue.splice(0, MAX_CONCURRENT_REQUESTS);
    await Promise.all(batch.map(fn => fn().catch(() => {}))); // 忽略错误

    // 在批次之间添加更长延迟
    if (requestQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
    }
  }

  isProcessingQueue = false;
}

// 带超时和重试的 fetch 函数
async function fetchWithTimeout(url: string, options: FetchOptions, timeout = 60000, retries = 3) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // 如果是网络错误，重试
      if (!response.ok && attempt < retries && (response.status >= 500 || response.status === 429)) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // 指数退避
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      // 只有网络错误才重试
      if (attempt < retries && lastError.message.includes('fetch failed') ||
          lastError.message.includes('ECONNRESET') ||
          lastError.message.includes('ETIMEDOUT') ||
          lastError.message.includes('AbortError')) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // 指数退避
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Unknown fetch error');
}

// Mock posts removed - using real Notion data only

// 获取所有已发布的文章
export async function getPosts(): Promise<NotionPost[]> {
  // 调试日志已移除

  // 如果在生产环境但缺少环境变量，这是一个错误
  const notionToken = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
  if (!notionToken || !process.env.NOTION_DATABASE_ID) {
    logger.error('Notion 环境变量缺失，请配置 NOTION_TOKEN/NOTION_SECRET 与 NOTION_DATABASE_ID');
    throw new Error('Notion configuration missing');
  }

  try {
    
    const response = await fetchWithTimeout(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: getHeaders(),
      ...getFetchOptions(),
      body: JSON.stringify({
        filter: {
          and: [
            // 主要条件：Status 必须是 Published（注意：Notion中可能包含emoji）
            {
              property: 'Status',
              select: { equals: '✅ Published' },
            },
            // 兼容条件：如果 Status 是 Published，Published 复选框也应该为 true（可选）
            // 注释掉下面的条件，让 Status 字段成为唯一判断标准
            // {
            //   property: 'Published',
            //   checkbox: { equals: true },
            // },
          ],
        },
        sorts: [
          { property: 'Published Date', direction: 'descending' },
        ],
      }),
    }, 20000); // 增加超时到20秒

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Notion API Error: ${response.status}`, errorText);
      throw new Error('Notion API error');
    }

    const data = await response.json();

    const posts = await Promise.all(
      data.results.map(async (page: NotionPage) => {
        try {
          const content = await getPageMarkdown(page.id);

          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt:
              getPlainText(page.properties.Summary?.rich_text || []) ||
              (content ? content.substring(0, 150) + '...' : ''),
            content: content,
            publishedAt:
              page.properties['Published Date']?.date?.start ||
              page.last_edited_time ||
              new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: NotionMultiSelect) => tag.name) || [],
            published:
              (page.properties.Status?.select?.name === 'Published') ||
              (page.properties.Published?.checkbox || false),
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            pinned: false,
            type: (() => {
              const raw = (page.properties.Type?.select?.name || '').toString().toLowerCase();
              if (raw === 'post' || raw === 'announcement' || raw === 'page') return raw as 'post'|'announcement'|'page';
              return 'post';
            })(),
          };
        } catch (error) {
          logger.error(`Error fetching content for page ${page.id}`, error);
          // 返回基本信息，内容为空
          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt:
              getPlainText(page.properties.Summary?.rich_text || []) ||
              '内容加载失败...',
            content: '内容暂时无法加载，请稍后再试。',
            publishedAt:
              page.properties['Published Date']?.date?.start ||
              page.last_edited_time ||
              new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: NotionMultiSelect) => tag.name) || [],
            published:
              (page.properties.Status?.select?.name === 'Published') ||
              (page.properties.Published?.checkbox || false),
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            pinned: false,
            type: (() => {
              const raw = (page.properties.Type?.select?.name || '').toString().toLowerCase();
              if (raw === 'post' || raw === 'announcement' || raw === 'page') return raw as 'post'|'announcement'|'page';
              return 'post';
            })(),
          };
        }
      })
    );

    
    return posts;
  } catch (error) {
    logger.error('Error fetching posts from Notion', error);
    // 返回空数组而不是抛出错误，让首页能正常显示
    return [];
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
              or: [
                { property: 'Status', select: { equals: '✅ Published' } },
                { property: 'Published', checkbox: { equals: true } },
              ],
            },
            { property: 'Slug', rich_text: { equals: slug } },
          ],
        },
      }),
    }, 15000);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Notion API Error: ${response.status}`, errorText);
      return null;
    }

    const data = await response.json();

    if (data.results.length === 0) {
      return null;
    }

    const page = data.results[0];

    // 获取页面内容
    try {
      const content = await getPageMarkdown(page.id);

      return {
        id: page.id,
        title: getPlainText(page.properties.Title?.title || []),
        slug: getPlainText(page.properties.Slug?.rich_text || []),
        excerpt:
          getPlainText(page.properties.Summary?.rich_text || []),
        content: content,
        publishedAt:
          page.properties['Published Date']?.date?.start ||
          page.last_edited_time ||
          new Date().toISOString(),
        tags: page.properties.Tags?.multi_select?.map((tag: NotionMultiSelect) => tag.name) || [],
        published:
          (page.properties.Status?.select?.name === 'Published') ||
          (page.properties.Published?.checkbox || false),
        cover: page.cover?.external?.url || page.cover?.file?.url || null,
      };
    } catch (contentError) {
      logger.error(`Error fetching content for page ${page.id}`, contentError);
      // 返回基本信息，内容为空
      return {
        id: page.id,
        title: getPlainText(page.properties.Title?.title || []),
        slug: getPlainText(page.properties.Slug?.rich_text || []),
        excerpt:
          getPlainText(page.properties.Summary?.rich_text || []),
        content: '内容暂时无法加载，请稍后再试。',
        publishedAt:
          page.properties['Published Date']?.date?.start ||
          page.last_edited_time ||
          new Date().toISOString(),
        tags: page.properties.Tags?.multi_select?.map((tag: NotionMultiSelect) => tag.name) || [],
        published:
          (page.properties.Status?.select?.name === 'Published') ||
          (page.properties.Published?.checkbox || false),
        cover: page.cover?.external?.url || page.cover?.file?.url || null,
      };
    }
  } catch (error) {
    logger.error('Error fetching post by slug', error);
    return null;
  }
}

// 辅助函数：提取纯文本
function getPlainText(richText: NotionRichText[]): string {
  return richText.map((text) => text.plain_text).join('');
}

// 新函数：将 Rich Text 转换为带格式的 Markdown
function getRichTextMarkdown(richText: NotionRichText[]): string {
  return richText.map((text) => {
    let content = text.plain_text;

    // 将Notion的换行符转换为Markdown的强制换行格式
    if (content.includes('\n')) {
      content = content.replace(/\n/g, '  \n');
    }
    const linkUrl = text.href || text.text?.link?.url || null;

    // 如果没有注释或格式，直接返回文本
    if (!text.annotations) {
      return linkUrl ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${content}</a>` : content;
    }

    const annotations = text.annotations;


    // 应用文本格式（按顺序应用，避免格式冲突）
    if (annotations.code) {
      content = `\`${content}\``;
    } else {
      // 粗体
      if (annotations.bold) {
        content = `**${content}**`;
      }

      // 斜体
      if (annotations.italic) {
        content = `*${content}*`;
      }

      // 删除线
      if (annotations.strikethrough) {
        content = `~~${content}~~`;
      }

      // 下划线（Markdown 不直接支持，使用 HTML）
      if (annotations.underline) {
        content = `<u>${content}</u>`;
      }
    }

    // 处理颜色和背景色 - 支持混合样式
    if (annotations.color && annotations.color !== 'default') {

      // 文字颜色映射
      const textColorMap: Record<string, string> = {
        'red': '#e03e3e',
        'orange': '#fd8200',
        'yellow': '#dfab01',
        'green': '#0e6e6e',
        'blue': '#1e6b99',
        'purple': '#6b46c1',
        'brown': '#a97153',
        'gray': '#6b7280',
      };

      // 背景色映射
      const backgroundColorMap: Record<string, string> = {
        'red_background': '#ffeaea',
        'orange_background': '#ffefd5',
        'yellow_background': '#fefce8',
        'green_background': '#dcfce7',
        'blue_background': '#dbeafe',
        'purple_background': '#ede9fe',
        'brown_background': '#fef3e2',
        'gray_background': '#f5f5f5',
      };

      let styles: string[] = [];

      // 检查是否有背景色
      if (annotations.color.endsWith('_background')) {
        const backgroundColor = backgroundColorMap[annotations.color];
        if (backgroundColor) {
          styles.push(`background-color: ${backgroundColor}`);
          styles.push('padding: 2px 4px');
          styles.push('border-radius: 3px');
        }
      } else {
        // 检查是否有文字颜色
        const textColor = textColorMap[annotations.color];
        if (textColor) {
          styles.push(`color: ${textColor}`);
        }
      }

      // 根据Notion API返回的颜色信息处理样式
      // 不做任何硬编码或特殊文本处理，完全基于API数据

      if (styles.length > 0) {
        const styledContent = `<span style="${styles.join('; ')}">${content}</span>`;
        content = styledContent;
      }
    }

    if (linkUrl) {
      return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${content}</a>`;
    }

    return content;
  }).join('');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function renderCalloutIcon(icon?: NotionBlockContent['icon']): string {
  if (!icon) {
    return '<span class="notion-callout-emoji">💡</span>';
  }

  if (icon.emoji) {
    return `<span class="notion-callout-emoji">${escapeHtml(icon.emoji)}</span>`;
  }

  const imageUrl = icon.external?.url || icon.file?.url;
  if (imageUrl) {
    return `<span class="notion-callout-image"><img src="${escapeAttribute(imageUrl)}" alt="" loading="lazy" /></span>`;
  }

  return '<span class="notion-callout-emoji">💡</span>';
}

function extractFileName(rawUrl: string): string {
  if (!rawUrl) {
    return '未命名文件';
  }

  try {
    const withoutQuery = rawUrl.split('?')[0];
    const decoded = decodeURIComponent(withoutQuery);
    const segments = decoded.split('/');
    const lastSegment = segments.pop();
    if (lastSegment && lastSegment.trim().length > 0) {
      return lastSegment;
    }
  } catch (error) {
    logger.debug('文件名解析失败', error);
  }

  return '未命名文件';
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
// 获取子块的辅助函数 - 带缓存和限流
async function getChildrenBlocks(blockId: string): Promise<NotionBlock[]> {
  // 检查缓存
  const cached = childrenCache.get(blockId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  return new Promise((resolve) => {
    const fetchChildren = async () => {
      try {
        const response = await fetchWithTimeout(`https://api.notion.com/v1/blocks/${blockId}/children`, {
          headers: getHeaders(),
          ...getFetchOptions(),
        }, 12000); // 增加超时时间

        if (!response.ok) {
          resolve([]); // 静默失败
          return;
        }

        const data = await response.json();
        const children = data.results || [];

        // 缓存结果
        childrenCache.set(blockId, {
          data: children,
          timestamp: Date.now()
        });

        resolve(children);
      } catch (error) {
        logger.debug(`获取子块失败: ${blockId}`, error);
        // 网络错误时直接返回空数组
        resolve([]);
      }
    };

    // 将请求加入队列
    requestQueue.push(fetchChildren);
    processQueue(); // 启动队列处理
  });
}

async function getPageMarkdown(pageId: string): Promise<string> {
  // 检查页面缓存
  const cached = pageCache.get(pageId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  let result = '';

  try {
    const blocks = await getChildrenBlocks(pageId);
    if (blocks.length > 0) {
      const customMarkdown = await blocksToMarkdown(blocks);
      if (customMarkdown.trim()) {
        result = customMarkdown;
      }
    }
  } catch (error) {
    logger.error(`自定义解析 Notion 内容失败: ${pageId}`, error);
  }

  // 如果自定义解析失败，退回 notion-to-md 确保至少有输出
  if (!result) {
    try {
      const converter = ensureNotionMarkdown();
      if (converter) {
        const mdBlocks = await converter.pageToMarkdown(pageId);
        const { parent } = converter.toMarkdownString(mdBlocks);
        if (parent.trim()) {
          result = parent;
        }
      }
    } catch (error) {
      logger.warn(`NotionToMarkdown 回退解析失败: ${pageId}`, error);
    }
  }

  // 缓存结果
  if (result) {
    pageCache.set(pageId, {
      data: result,
      timestamp: Date.now()
    });
  }

  return result;
}

async function blocksToMarkdown(blocks: NotionBlock[], depth = 0): Promise<string> {
  // 限制最大嵌套深度为4层，防止无限递归和性能问题
  const MAX_DEPTH = 4;
  let markdown = '';
  let currentListType: 'bulleted' | 'numbered' | null = null;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const nextBlock = blocks[i + 1];


    switch (block.type) {
      case 'paragraph':
        if (depth === 0) {
          currentListType = null;
        }
        const paragraphText = getRichTextMarkdown(block.paragraph?.rich_text || []);
        if (paragraphText.trim()) {
          if (depth > 0) {
            // 当在嵌套结构中时，段落作为子内容
            markdown += paragraphText + '\n';
          } else {
            markdown += paragraphText + '\n\n';
          }
        }
        break;

      case 'heading_1':
        currentListType = null;
        const h1Text = getRichTextMarkdown(block.heading_1?.rich_text || []);
        if (h1Text.trim()) {
          markdown += `# ${h1Text}\n\n`;
        }
        break;

      case 'heading_2':
        currentListType = null;
        const h2Text = getRichTextMarkdown(block.heading_2?.rich_text || []);
        if (h2Text.trim()) {
          markdown += `## ${h2Text}\n\n`;
        }
        break;

      case 'heading_3':
        currentListType = null;
        const h3Text = getRichTextMarkdown(block.heading_3?.rich_text || []);
        if (h3Text.trim()) {
          // 检查是否是可折叠标题
          if (block.heading_3?.is_toggleable && block.has_children && depth < 2) {
            // 处理为折叠块
            markdown += `<details class="notion-toggle" data-depth="${depth}">`;
            markdown += `<summary>${h3Text}</summary>`;
            const children = await getChildrenBlocks(block.id);
            if (children.length > 0) {
              const childContent = await blocksToMarkdown(children, depth + 1);
              markdown += `<div class="notion-toggle-children">${childContent}</div>`;
            }
            markdown += '</details>\n\n';
          } else {
            // 普通三级标题
            markdown += `### ${h3Text}\n\n`;
          }
        }
        break;

      case 'bulleted_list_item':
        if (currentListType !== 'bulleted') {
          currentListType = 'bulleted';
        }
        const listText = getRichTextMarkdown(block.bulleted_list_item?.rich_text || []);
        if (listText.trim()) {
          markdown += `- ${listText}`;
        } else {
          markdown += `-`;
        }
        // 启用嵌套功能，但限制深度为2级以减少API调用
        if (block.has_children && depth < 2) {
          const children = await getChildrenBlocks(block.id);
          if (children.length > 0) {
            const childrenMarkdown = await blocksToMarkdown(children, depth + 1);
            // 为子项目添加正确的缩进，每行前面加两个空格
            const lines = childrenMarkdown.split('\n');
            const indentedLines = lines.map(line => {
              if (line.trim() === '') return line;
              // 如果是列表项，直接缩进
              if (line.startsWith('- ') || line.match(/^\d+\. /)) {
                return `  ${line}`;
              } else {
                // 段落内容需要在新行且缩进
                return `  ${line}`;
              }
            });

            if (childrenMarkdown.trim()) {
              markdown += `\n${indentedLines.join('\n')}`;
            }
          }
        }
        // 完全移除列表项间空白
        if (nextBlock?.type !== 'bulleted_list_item') {
          markdown += '\n\n';
          currentListType = null;
        } else {
          markdown += '\n';
        }
        break;

      case 'numbered_list_item':
        if (currentListType !== 'numbered') {
          currentListType = 'numbered';
        }
        const numberedText = getRichTextMarkdown(block.numbered_list_item?.rich_text || []);
        if (numberedText.trim()) {
          markdown += `1. ${numberedText}`;
        } else {
          markdown += `1.`;
        }
        // 启用嵌套功能，但限制深度为2级以减少API调用
        if (block.has_children && depth < 2) {
          const children = await getChildrenBlocks(block.id);
          if (children.length > 0) {
            const childrenMarkdown = await blocksToMarkdown(children, depth + 1);
            // 为子项目添加正确的缩进，每行前面加三个空格（因为有序列表更宽）
            const lines = childrenMarkdown.split('\n');
            const indentedLines = lines.map(line => {
              if (line.trim() === '') return line;
              // 如果是列表项，直接缩进
              if (line.startsWith('- ') || line.match(/^\d+\. /)) {
                return `   ${line}`;
              } else {
                // 段落内容需要在新行且缩进
                return `   ${line}`;
              }
            });

            if (childrenMarkdown.trim()) {
              markdown += `\n${indentedLines.join('\n')}`;
            }
          }
        }
        // 完全移除列表项间空白
        if (nextBlock?.type !== 'numbered_list_item') {
          markdown += '\n\n';
          currentListType = null;
        } else {
          markdown += '\n';
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
        const quoteText = getRichTextMarkdown(block.quote?.rich_text || []);
        if (quoteText.trim()) {
          markdown += `> ${quoteText}\n\n`;
        }
        break;

      case 'image':
        const imageUrl = block.image?.external?.url || block.image?.file?.url;
        const imageCaption = getPlainText(block.image?.caption || []);
        if (imageUrl) {
          markdown += `![${imageCaption}](${imageUrl})\n\n`;
        }
        break;

      case 'video': {
        currentListType = null;
        const videoSource = block.video?.external?.url || block.video?.file?.url;
        const videoCaption = getPlainText(block.video?.caption || []);
        if (videoSource) {
          // 检查各种视频平台并转换为嵌入格式
          let embedUrl = videoSource;
          let platformType = 'generic';
          let canEmbed = false;

          try {
            const url = new URL(videoSource);
            const hostname = url.hostname.toLowerCase();

            // YouTube 处理
            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
              platformType = 'youtube';
              if (hostname === 'www.youtube.com' && url.pathname === '/watch') {
                const videoId = url.searchParams.get('v');
                if (videoId) {
                  embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  canEmbed = true;
                }
              } else if (hostname === 'youtu.be') {
                const videoId = url.pathname.slice(1);
                if (videoId) {
                  embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  canEmbed = true;
                }
              }
            }
            // Vimeo 处理
            else if (hostname.includes('vimeo.com')) {
              platformType = 'vimeo';
              const videoId = url.pathname.split('/').pop();
              if (videoId && /^\d+$/.test(videoId)) {
                embedUrl = `https://player.vimeo.com/video/${videoId}`;
                canEmbed = true;
              }
            }
            // Bilibili 处理
            else if (hostname.includes('bilibili.com')) {
              platformType = 'bilibili';
              const bvMatch = url.pathname.match(/\/video\/(BV\w+)/);
              if (bvMatch) {
                embedUrl = `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}`;
                canEmbed = true;
              }
            }
            // 腾讯视频处理
            else if (hostname.includes('v.qq.com')) {
              platformType = 'tencent';
              const vidMatch = url.pathname.match(/\/x\/page\/(\w+)\.html/) || url.pathname.match(/\/(\w+)\.html/);
              if (vidMatch) {
                embedUrl = `https://v.qq.com/txp/iframe/player.html?vid=${vidMatch[1]}`;
                canEmbed = true;
              }
            }
            // 优酷处理
            else if (hostname.includes('youku.com')) {
              platformType = 'youku';
              const idMatch = url.pathname.match(/\/v_show\/id_(\w+)/);
              if (idMatch) {
                embedUrl = `https://player.youku.com/embed/${idMatch[1]}`;
                canEmbed = true;
              }
            }
            // Twitch 处理
            else if (hostname.includes('twitch.tv')) {
              platformType = 'twitch';
              const channelMatch = url.pathname.match(/\/(\w+)$/);
              if (channelMatch) {
                embedUrl = `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}`;
                canEmbed = true;
              }
            }
            // Dailymotion 处理
            else if (hostname.includes('dailymotion.com')) {
              platformType = 'dailymotion';
              const videoMatch = url.pathname.match(/\/video\/(\w+)/);
              if (videoMatch) {
                embedUrl = `https://www.dailymotion.com/embed/video/${videoMatch[1]}`;
                canEmbed = true;
              }
            }
            // 直接视频文件格式
            else if (videoSource.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i)) {
              platformType = 'direct';
              canEmbed = true;
            }
          } catch (error) {
            // URL 解析失败，保持原始处理
          }

          if (canEmbed) {
            if (platformType === 'direct') {
              // 直接视频文件使用 HTML5 video 标签
              markdown += `<div class="video-container">
                <video controls class="w-full rounded-xl" preload="metadata">
                  <source src="${escapeAttribute(videoSource)}" />
                  您的浏览器不支持视频播放。
                </video>
                ${videoCaption ? `<p class="video-caption">${escapeAttribute(videoCaption)}</p>` : ''}
              </div>\n\n`;
            } else {
              // 其他平台使用 iframe 嵌入
              const allowAttribute = platformType === 'youtube'
                ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                : 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';

              markdown += `<div class="video-container ${platformType}-video">
                <iframe
                  src="${escapeAttribute(embedUrl)}"
                  title="${escapeAttribute(videoCaption || '视频')}"
                  frameborder="0"
                  allow="${allowAttribute}"
                  allowfullscreen
                  class="w-full aspect-video rounded-xl border border-gray-200"
                ></iframe>
                ${videoCaption ? `<p class="video-caption">${escapeAttribute(videoCaption)}</p>` : ''}
              </div>\n\n`;
            }
          } else {
            // 无法嵌入的视频，显示链接卡片
            const platformEmoji = {
              'youtube': '📺',
              'vimeo': '🎬',
              'bilibili': '📱',
              'tencent': '🎞️',
              'youku': '🎦',
              'twitch': '🎮',
              'dailymotion': '🎯',
              'generic': '▶️'
            }[platformType] || '▶️';

            markdown += `<div class="video-link ${platformType}-link">
              <div class="video-preview">
                <div class="video-icon">${platformEmoji}</div>
                <div class="video-info">
                  <p class="video-title">${escapeAttribute(videoCaption || '视频内容')}</p>
                  <p class="video-url">${escapeAttribute(videoSource)}</p>
                </div>
                <a href="${escapeAttribute(videoSource)}" target="_blank" rel="noopener noreferrer" class="video-button">观看视频</a>
              </div>
            </div>\n\n`;
          }
        }
        break;
      }

      case 'audio': {
        currentListType = null;
        const audioSource = block.audio?.external?.url || block.audio?.file?.url;
        const audioCaption = getPlainText(block.audio?.caption || []);
        if (audioSource) {
          // 检查各种音频平台并转换为嵌入格式
          let embedUrl = audioSource;
          let platformType = 'generic';
          let canEmbed = false;

          try {
            const url = new URL(audioSource);
            const hostname = url.hostname.toLowerCase();

            // Spotify 处理
            if (hostname.includes('spotify.com')) {
              platformType = 'spotify';
              const trackMatch = audioSource.match(/\/track\/([a-zA-Z0-9]+)/);
              const playlistMatch = audioSource.match(/\/playlist\/([a-zA-Z0-9]+)/);
              const albumMatch = audioSource.match(/\/album\/([a-zA-Z0-9]+)/);

              if (trackMatch) {
                embedUrl = `https://open.spotify.com/embed/track/${trackMatch[1]}`;
                canEmbed = true;
              } else if (playlistMatch) {
                embedUrl = `https://open.spotify.com/embed/playlist/${playlistMatch[1]}`;
                canEmbed = true;
              } else if (albumMatch) {
                embedUrl = `https://open.spotify.com/embed/album/${albumMatch[1]}`;
                canEmbed = true;
              }
            }
            // SoundCloud 处理
            else if (hostname.includes('soundcloud.com')) {
              platformType = 'soundcloud';
              // SoundCloud 需要使用 oEmbed API，这里显示为链接卡片
              canEmbed = false;
            }
            // Apple Music 处理
            else if (hostname.includes('music.apple.com')) {
              platformType = 'apple';
              canEmbed = false; // Apple Music 嵌入需要特殊处理
            }
            // 网易云音乐处理
            else if (hostname.includes('music.163.com')) {
              platformType = 'netease';
              const songMatch = audioSource.match(/song\?id=(\d+)/);
              if (songMatch) {
                embedUrl = `https://music.163.com/outchain/player?type=2&id=${songMatch[1]}&auto=0&height=90`;
                canEmbed = true;
              }
            }
            // QQ音乐处理
            else if (hostname.includes('y.qq.com')) {
              platformType = 'qq';
              canEmbed = false; // QQ音乐嵌入较复杂
            }
            // 直接音频文件格式
            else if (audioSource.match(/\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i)) {
              platformType = 'direct';
              canEmbed = true;
            }
          } catch (error) {
            // URL 解析失败，保持原始处理
          }

          if (canEmbed) {
            if (platformType === 'direct') {
              // 直接音频文件使用 HTML5 audio 标签
              markdown += `<div class="audio-container">
                <audio controls class="w-full rounded-lg" preload="metadata">
                  <source src="${escapeAttribute(audioSource)}" />
                  您的浏览器不支持音频播放。
                </audio>
                ${audioCaption ? `<p class="audio-caption">${escapeAttribute(audioCaption)}</p>` : ''}
              </div>\n\n`;
            } else {
              // 其他平台使用 iframe 嵌入
              const iframeHeight = platformType === 'spotify' ? '152' : '166';

              markdown += `<div class="audio-container ${platformType}-audio">
                <iframe
                  src="${escapeAttribute(embedUrl)}"
                  title="${escapeAttribute(audioCaption || '音频')}"
                  frameborder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style="width: 100%; height: ${iframeHeight}px; border-radius: 12px;"
                ></iframe>
                ${audioCaption ? `<p class="audio-caption">${escapeAttribute(audioCaption)}</p>` : ''}
              </div>\n\n`;
            }
          } else {
            // 无法嵌入的音频，显示链接卡片
            const platformEmoji = {
              'spotify': '🎵',
              'soundcloud': '🔊',
              'apple': '🎶',
              'netease': '🎼',
              'qq': '🎤',
              'generic': '🎧'
            }[platformType] || '🎧';

            markdown += `<div class="audio-link ${platformType}-link">
              <div class="audio-preview">
                <div class="audio-icon">${platformEmoji}</div>
                <div class="audio-info">
                  <p class="audio-title">${escapeAttribute(audioCaption || '音频内容')}</p>
                  <p class="audio-url">${escapeAttribute(audioSource)}</p>
                </div>
                <a href="${escapeAttribute(audioSource)}" target="_blank" rel="noopener noreferrer" class="audio-button">播放音频</a>
              </div>
            </div>\n\n`;
          }
        }
        break;
      }

      case 'file': {
        currentListType = null;
        const fileSource = block.file?.external?.url || block.file?.file?.url;
        const fileCaption = getPlainText(block.file?.caption || []);
        const fileName = block.file?.name || fileCaption || extractFileName(fileSource || '');
        if (fileSource) {
          markdown += `<div class="notion-embed" data-embed-type="file" data-url="${escapeAttribute(fileSource)}" data-caption="${escapeAttribute(fileCaption)}" data-name="${escapeAttribute(fileName)}"></div>\n\n`;
        }
        break;
      }

      case 'embed': {
        currentListType = null;
        const embedUrl = block.embed?.url;
        const embedCaption = getPlainText(block.embed?.caption || []);
        if (embedUrl) {
          // 检查是否是 Twitter 链接
          if (embedUrl.includes('twitter.com') || embedUrl.includes('x.com')) {
            // Twitter 嵌入 - 显示简洁的卡片样式
            markdown += `<div class="embed-link twitter-embed">
              <div class="embed-preview">
                <div class="embed-icon">🐦</div>
                <div class="embed-info">
                  <p class="embed-title">${escapeAttribute(embedCaption || 'Twitter 内容')}</p>
                  <p class="embed-url">${escapeAttribute(embedUrl)}</p>
                </div>
                <a href="${escapeAttribute(embedUrl)}" target="_blank" rel="noopener noreferrer" class="embed-button">查看推文</a>
              </div>
            </div>\n\n`;
          } else {
            // 其他嵌入内容，尝试使用 iframe
            try {
              const url = new URL(embedUrl);
              const domain = url.hostname;

              markdown += `<div class="embed-container">
                <iframe
                  src="${escapeAttribute(embedUrl)}"
                  title="${escapeAttribute(embedCaption || '嵌入内容')}"
                  frameborder="0"
                  class="w-full aspect-video rounded-xl border border-gray-200"
                  allowfullscreen
                ></iframe>
                ${embedCaption ? `<p class="embed-caption">${escapeAttribute(embedCaption)}</p>` : ''}
              </div>\n\n`;
            } catch (error) {
              // URL 解析失败，显示为链接卡片
              markdown += `<div class="embed-link">
                <div class="embed-preview">
                  <div class="embed-icon">🔗</div>
                  <div class="embed-info">
                    <p class="embed-title">${escapeAttribute(embedCaption || '嵌入内容')}</p>
                    <p class="embed-url">${escapeAttribute(embedUrl)}</p>
                  </div>
                  <a href="${escapeAttribute(embedUrl)}" target="_blank" rel="noopener noreferrer" class="embed-button">查看内容</a>
                </div>
              </div>\n\n`;
            }
          }
        }
        break;
      }

      case 'bookmark': {
        currentListType = null;
        const bookmarkUrl = block.bookmark?.url;
        const bookmarkCaption = getPlainText(block.bookmark?.caption || []);
        if (bookmarkUrl) {
          // 使用 notion-embed 格式，让 MarkdownContent.tsx 中的 NotionEmbed 组件处理
          markdown += `<div class="notion-embed" data-embed-type="bookmark" data-url="${escapeAttribute(bookmarkUrl)}" data-caption="${escapeAttribute(bookmarkCaption)}"></div>\n\n`;
        }
        break;
      }

      case 'equation': {
        currentListType = null;
        const expression = block.equation?.expression?.trim();
        if (expression) {
          markdown += `\n$$${expression}$$\n\n`;
        }
        break;
      }

      case 'divider':
        markdown += `---\n\n`;
        break;

      case 'table': {
        currentListType = null;
        let rows: NotionBlock[] = [];
        if (block.has_children && depth < 2) {
          rows = await getChildrenBlocks(block.id);
        }

        const hasColumnHeader = !!block.table?.has_column_header;
        const hasRowHeader = !!block.table?.has_row_header;

        let tableHtml = '<div class="notion-table-wrapper"><table class="notion-table">';

        const renderRow = (cells: NotionRichText[][], cellTag: 'th' | 'td', overrideRowHeader = false) => {
          let rowHtml = '<tr>';
          cells.forEach((cell, cellIndex) => {
            const isHeaderCell = overrideRowHeader && cellIndex === 0;
            const tag = isHeaderCell ? 'th' : cellTag;
            let cellContent = getRichTextMarkdown(cell) || '&nbsp;';

            // 处理表格中的Markdown格式，特别是代码格式
            cellContent = cellContent
              .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em>$1</em>')
              .replace(/~~([^~]+)~~/g, '<del>$1</del>')
              .replace(/<u>([^<]+)<\/u>/g, '<u>$1</u>');

            rowHtml += `<${tag}>${cellContent}</${tag}>`;
          });
          rowHtml += '</tr>';
          return rowHtml;
        };

        if (hasColumnHeader && rows.length > 0) {
          const headerRow = rows.shift();
          if (headerRow?.table_row?.cells) {
            tableHtml += '<thead>' + renderRow(headerRow.table_row.cells, 'th') + '</thead>';
          }
        }

        if (rows.length > 0) {
          tableHtml += '<tbody>';
          rows.forEach((row) => {
            if (!row.table_row?.cells) return;
            tableHtml += renderRow(row.table_row.cells, 'td', hasRowHeader);
          });
          tableHtml += '</tbody>';
        }

        tableHtml += '</table></div>\n\n';
        markdown += tableHtml;
        break;
      }

      case 'callout': {
        currentListType = null;
        const calloutContent = getRichTextMarkdown(block.callout?.rich_text || []);
        const calloutColor = block.callout?.color || 'default';
        const iconHtml = renderCalloutIcon(block.callout?.icon);

        let nestedContent = '';
        if (block.has_children && depth < 2) {
          const children = await getChildrenBlocks(block.id);
          if (children.length > 0) {
            nestedContent = await blocksToMarkdown(children, depth + 1);
          }
        }

        markdown += `<div class="notion-callout" data-color="${escapeAttribute(calloutColor)}">`;
        markdown += `<div class="notion-callout-icon">${iconHtml}</div>`;
        // 手动处理 callout 内容的换行
        const processedCalloutContent = calloutContent.replace(/  \n/g, '<br>');
        markdown += `<div class="notion-callout-body">${processedCalloutContent}`;
        if (nestedContent.trim()) {
          markdown += `<div class="notion-callout-children">${nestedContent}</div>`;
        }
        markdown += `</div></div>\n\n`;
        break;
      }

      case 'toggle': {
        currentListType = null;
        const toggleText = getRichTextMarkdown(block.toggle?.rich_text || []);
        if (toggleText.trim()) {
          markdown += `<details class="notion-toggle" data-depth="${depth}">`;
          markdown += `<summary>${toggleText}</summary>`;
          if (block.has_children && depth < 2) {
            const children = await getChildrenBlocks(block.id);
            if (children.length > 0) {
              const childContent = await blocksToMarkdown(children, depth + 1);
              markdown += `<div class="notion-toggle-children">${childContent}</div>`;
            }
          }
          markdown += '</details>\n\n';
        }
        break;
      }

      case 'column_list': {
        currentListType = null;
        if (block.has_children && depth < 2) {
          const children = await getChildrenBlocks(block.id);

          // 收集所有列的内容
          const columns: string[] = [];

          for (const column of children) {
            if (column.type === 'column') {
              if (column.has_children) {
                const columnChildren = await getChildrenBlocks(column.id);
                const columnContent = await blocksToMarkdown(columnChildren, depth + 1);
                columns.push(columnContent);
              } else {
                columns.push('');
              }
            }
          }

          // 使用特殊标记，让 MarkdownContent.tsx 处理
          markdown += `<div class="notion-columns-wrapper" data-columns='${JSON.stringify(columns).replace(/'/g, '&apos;')}'></div>\n\n`;
        }
        break;
      }

      case 'column':
        // column 应该由 column_list 统一处理，这里不单独处理
        // 如果单独出现的 column，包装在 notion-column 中
        currentListType = null;
        if (block.has_children && depth < 2) {
          const children = await getChildrenBlocks(block.id);
          const columnContent = await blocksToMarkdown(children, depth + 1);
          markdown += `<div class="notion-column">${columnContent}</div>\n\n`;
        }
        break;

      default:
        const blockContent = block[block.type] as NotionBlockContent | undefined;
        const defaultText = getPlainText(blockContent?.rich_text || []);
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
    }, 15000);

    if (!response.ok) {
      logger.error(`Notion API Error for About page: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.results.length === 0) {
      return null;
    }

    const page = data.results[0];

    // 获取页面内容
    try {
      const content = await getPageMarkdown(page.id);

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
      logger.error('Error fetching About page content', contentError);
      return null;
    }
  } catch (error) {
    logger.error('Error fetching About page', error);
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
                { property: 'Status', select: { equals: '✅ Published' } },
                { property: 'Published', checkbox: { equals: true } },
              ],
            },
            // 按你的数据库选项名称精确匹配："Announcement"
            { property: 'Type', select: { equals: 'Announcement' } },
          ],
        },
        sorts: [
          {
            property: 'Published Date',
            direction: 'descending',
          },
        ],
      }),
    }, 15000);

    if (!response.ok) {
      logger.error(`Notion API Error for Announcements: ${response.status}`);
      return [];
    }

    const data = await response.json();

    const announcements = await Promise.all(
      data.results.map(async (page: NotionPage) => {
        try {
          const content = await getPageMarkdown(page.id);

          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt:
              getPlainText(page.properties.Summary?.rich_text || []) ||
              (content ? content.substring(0, 100) + '...' : ''),
            content: content,
            publishedAt:
              page.properties['Published Date']?.date?.start ||
              page.last_edited_time ||
              new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: NotionMultiSelect) => tag.name) || [],
            published:
              (page.properties.Status?.select?.name === 'Published') ||
              (page.properties.Published?.checkbox || false),
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            type: 'announcement' as const,
          };
        } catch (error) {
          logger.error(`Error fetching announcement content for page ${page.id}`, error);
          return {
            id: page.id,
            title: getPlainText(page.properties.Title?.title || []),
            slug: getPlainText(page.properties.Slug?.rich_text || []) || generateSlug(getPlainText(page.properties.Title?.title || [])),
            excerpt:
              getPlainText(page.properties.Summary?.rich_text || []) ||
              '内容加载失败...',
            content: '内容暂时无法加载，请稍后再试。',
            publishedAt:
              page.properties['Published Date']?.date?.start ||
              page.last_edited_time ||
              new Date().toISOString(),
            tags: page.properties.Tags?.multi_select?.map((tag: NotionMultiSelect) => tag.name) || [],
            published:
              (page.properties.Status?.select?.name === 'Published') ||
              (page.properties.Published?.checkbox || false),
            cover: page.cover?.external?.url || page.cover?.file?.url || null,
            type: 'announcement' as const,
          };
        }
      })
    );

    
    return announcements;
  } catch (error) {
    logger.error('Error fetching announcements', error);
    return [];
  }
}

// 获取文章（过滤掉页面和公告）
export async function getPostsOnly(): Promise<NotionPost[]> {
  const allPosts = await getPosts();
  return allPosts.filter(post => post.type === 'post' || post.type === 'announcement' || !post.type);
}
