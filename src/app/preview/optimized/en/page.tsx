import type { Metadata } from 'next';
import HomepageVariant from '@/components/demo/HomepageVariants';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'LingYi · Optimized Preview',
  robots: { index: false, follow: false },
};

export default async function OptimizedEnglishPreviewPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly('en', true), 'en');
  return <HomepageVariant variant="curated" posts={posts} showDemoSwitcher={false} routePrefix="/preview/optimized/en" locale="en" />;
}
