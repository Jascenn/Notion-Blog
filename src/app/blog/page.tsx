import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';
import { OptimizedArchive } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '文章',
  description: '凌一的全部文章与构建记录。',
  alternates: {
    canonical: '/blog',
    languages: { 'zh-CN': '/blog', 'en-US': '/en/blog', 'x-default': '/blog' },
  },
};

export default async function BlogPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly(), 'zh');
  return <OptimizedArchive posts={posts} routeRoot="" />;
}
