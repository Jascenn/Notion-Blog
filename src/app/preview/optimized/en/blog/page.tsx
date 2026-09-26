import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';
import { OptimizedArchive } from '@/components/preview/OptimizedPages';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Articles · Optimized Preview',
  robots: { index: false, follow: false },
};

export default async function OptimizedEnglishBlogPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly(), 'en');
  return <OptimizedArchive posts={posts} locale="en" />;
}
