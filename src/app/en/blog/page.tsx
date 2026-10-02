import type { Metadata } from 'next';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';
import { OptimizedArchive } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Articles',
  description: 'All articles and build notes from LingYi.',
  alternates: {
    canonical: '/en/blog',
    languages: { 'zh-CN': '/blog', 'en-US': '/en/blog', 'x-default': '/blog' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
    title: 'Articles from LingYi',
    description: 'All articles and build notes from LingYi.',
  },
};

export default async function EnglishBlogPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly('en'), 'en');
  return <OptimizedArchive posts={posts} locale="en" routeRoot="/en" />;
}
