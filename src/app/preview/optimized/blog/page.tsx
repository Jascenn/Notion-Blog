import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import { OptimizedArchive } from '@/components/preview/OptimizedPages';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '文章索引 · 优化版预览',
  robots: { index: false, follow: false },
};

export default async function OptimizedBlogPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly(), 'zh');
  return <OptimizedArchive posts={posts} />;
}
