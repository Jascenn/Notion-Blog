import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';
import OptimizedSearchClient from '@/components/preview/OptimizedSearchClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all articles by title, summary, or topic.',
  robots: { index: false, follow: true },
  alternates: { languages: { 'zh-CN': '/search', 'en-US': '/en/search' } },
};

export default async function EnglishSearchPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly('en'), 'en')
    .filter((post) => post.type !== 'announcement')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <OptimizedSearchClient posts={posts} locale="en" routeRoot="/en" />
    </Suspense>
  );
}
