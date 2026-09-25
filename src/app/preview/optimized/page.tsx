import HomepageVariant from '@/components/demo/HomepageVariants';
import { getPostsOnly } from '@/lib/notion';

export const revalidate = 60;

export default async function OptimizedPreviewPage() {
  const posts = await getPostsOnly();
  return <HomepageVariant variant="curated" posts={posts} showDemoSwitcher={false} />;
}
