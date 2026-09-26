import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getPosts } from '@/lib/notion';
import { localizeOptimizedPost, localizeOptimizedPosts } from '@/lib/optimized-i18n';
import { OptimizedArticle } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, 'en', true);
  const localizedPost = post ? localizeOptimizedPost(post, 'en') : null;

  return {
    title: localizedPost ? `${localizedPost.title} · Optimized Preview` : 'Article · Optimized Preview',
    description: localizedPost?.excerpt,
    robots: { index: false, follow: false },
  };
}

export default async function OptimizedEnglishArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug, 'en', true),
    getPosts('en', true),
  ]);
  if (!post) notFound();

  return (
    <OptimizedArticle
      post={localizeOptimizedPost(post, 'en')}
      allPosts={localizeOptimizedPosts(allPosts, 'en')}
      locale="en"
    />
  );
}
