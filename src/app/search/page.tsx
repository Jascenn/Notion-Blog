import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: '搜索',
  description: '搜索博客中的全部文章：按标题、摘要与标签筛选。',
  robots: { index: false, follow: true },
};

// 搜索页面加载组件
function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage() {
  const posts = await getPostsOnly();
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchClient initialPosts={sortedPosts} />
    </Suspense>
  );
}
