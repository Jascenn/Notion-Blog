import { kv } from '@vercel/kv';

/**
 * 获取文章浏览次数
 */
export async function getPostViews(slug: string): Promise<number> {
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
