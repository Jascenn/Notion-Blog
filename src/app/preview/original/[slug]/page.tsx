import type { Metadata } from 'next';
import BlogPostView from '@/components/BlogPostView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '文章 · 原版预览',
  robots: { index: false, follow: false },
};

export default function OriginalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogPostView params={params} routePrefix="/preview/original" />;
}
