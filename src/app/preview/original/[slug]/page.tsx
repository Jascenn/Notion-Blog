import type { Metadata } from 'next';
import BlogPostView from '@/components/BlogPostView';
import { getPosts } from '@/lib/notion';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '文章 · 原版预览',
  robots: { index: false, follow: false },
};

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default function OriginalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogPostView params={params} routePrefix="/preview/original" />;
}
