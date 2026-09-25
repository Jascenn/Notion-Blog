import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import OptimizedSearchClient from '@/components/preview/OptimizedSearchClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '搜索 · 优化版预览',
  robots: { index: false, follow: false },
};

export default async function OptimizedSearchPage() {
  const posts = (await getPostsOnly())
    .filter((post) => post.type !== 'announcement')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OptimizedSearchClient posts={posts} />
    </Suspense>
  );
}
