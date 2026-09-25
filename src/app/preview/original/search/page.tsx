import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import SearchClient from '@/app/search/SearchClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '搜索 · 原版预览',
  robots: { index: false, follow: false },
};

export default async function OriginalSearchPage() {
  const posts = (await getPostsOnly())
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SearchClient
        initialPosts={posts}
        routePrefix="/preview/original"
        homeHref="/preview/original"
      />
    </Suspense>
  );
}
