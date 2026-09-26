import HomepageVariant from '@/components/demo/HomepageVariants';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OptimizedPreviewPage() {
  const posts = localizeOptimizedPosts(await getPostsOnly(), 'zh');
  return (
    <HomepageVariant
      variant="curated"
      posts={posts}
      showDemoSwitcher={false}
      routePrefix="/preview/optimized"
    />
  );
}
