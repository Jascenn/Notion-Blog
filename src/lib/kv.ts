import { kv } from '@vercel/kv';

// 检查是否配置了 KV
const hasKVConfig = () => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

/**
 * 获取文章浏览次数
 */
export async function getPostViews(slug: string): Promise<number> {
  // 如果没有配置 KV，返回 0（本地开发模式）
  if (!hasKVConfig()) {
    console.log('[KV] Not configured, returning 0 views');
    return 0;
  }

  try {
    const views = await kv.get<number>(`post:views:${slug}`);
    return views || 0;
  } catch (error) {
    console.error('Failed to get post views:', error);
    return 0;
  }
}

/**
 * 增加文章浏览次数
 */
export async function incrementPostViews(slug: string): Promise<number> {
  // 如果没有配置 KV，返回 0（本地开发模式）
  if (!hasKVConfig()) {
    console.log('[KV] Not configured, skipping increment');
    return 0;
  }

  try {
    const newViews = await kv.incr(`post:views:${slug}`);
    return newViews;
  } catch (error) {
    console.error('Failed to increment post views:', error);
    return 0;
  }
}

/**
 * 获取所有文章的浏览统计
 */
export async function getAllPostsViews(): Promise<Record<string, number>> {
  try {
    const keys = await kv.keys('post:views:*');
    const views: Record<string, number> = {};

    for (const key of keys) {
      const slug = key.replace('post:views:', '');
      const count = await kv.get<number>(key);
      if (count) {
        views[slug] = count;
      }
    }

    return views;
  } catch (error) {
    console.error('Failed to get all posts views:', error);
    return {};
  }
}
