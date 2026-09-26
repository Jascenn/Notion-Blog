import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug, getPosts } from '@/lib/notion';
import { localizeOptimizedPost, localizeOptimizedPosts } from '@/lib/optimized-i18n';
import { OptimizedArticle } from '@/components/preview/OptimizedPages';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Article · Optimized Preview',
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

export default async function OptimizedEnglishArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!post) notFound();

  return (
    <OptimizedArticle
      post={localizeOptimizedPost(post, 'en')}
      allPosts={localizeOptimizedPosts(allPosts, 'en')}
      locale="en"
    />
  );
}
