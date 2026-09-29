import type { Metadata } from 'next';
import HomepageVariant from '@/components/demo/HomepageVariants';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'LingYi — Full-stack development, AI tools and workflows',
  description: 'Notes on full-stack development, AI tools, practical workflows and life.',
  alternates: {
    canonical: '/en',
    languages: { 'zh-CN': '/', 'en-US': '/en' },
  },
};

export default async function EnglishHomePage() {
  const posts = localizeOptimizedPosts(await getPostsOnly('en'), 'en');
  return <HomepageVariant variant="curated" posts={posts} showDemoSwitcher={false} routePrefix="/en" locale="en" />;
}
