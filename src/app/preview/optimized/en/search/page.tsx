import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';
import OptimizedSearchClient from '@/components/preview/OptimizedSearchClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Search · Optimized Preview',
  robots: { index: false, follow: false },
};

export default async function OptimizedEnglishSearchPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly(), 'en')
    .filter((post) => post.type !== 'announcement')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OptimizedSearchClient posts={posts} locale="en" />
    </Suspense>
  );
}
