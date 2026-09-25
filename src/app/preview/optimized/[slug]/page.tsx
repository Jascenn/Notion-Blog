import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getPosts } from '@/lib/notion';
import { OptimizedArticle } from '@/components/preview/OptimizedPages';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '文章 · 优化版预览',
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

export default async function OptimizedArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);

  if (!post) notFound();

  return <OptimizedArticle post={post} allPosts={allPosts} />;
}
