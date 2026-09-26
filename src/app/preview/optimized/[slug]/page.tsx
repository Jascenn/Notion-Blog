import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getPosts } from '@/lib/notion';
import { OptimizedArticle } from '@/components/preview/OptimizedPages';
import { localizeOptimizedPost, localizeOptimizedPosts } from '@/lib/optimized-i18n';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return {
    title: post ? `${post.title} · 优化版预览` : '文章 · 优化版预览',
    description: post?.excerpt,
    robots: { index: false, follow: false },
  };
}

export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function OptimizedArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);

  if (!post) notFound();

  return (
    <OptimizedArticle
      post={localizeOptimizedPost(post, 'zh')}
      allPosts={localizeOptimizedPosts(allPosts, 'zh')}
    />
  );
}
