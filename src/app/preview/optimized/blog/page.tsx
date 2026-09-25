import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import { OptimizedArchive } from '@/components/preview/OptimizedPages';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '文章索引 · 优化版预览',
  robots: { index: false, follow: false },
};

export default async function OptimizedBlogPage() {
  const posts = await getPostsOnly();
  return <OptimizedArchive posts={posts} />;
}
