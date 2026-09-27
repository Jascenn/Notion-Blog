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
  if (!post) notFound();
  const localized = localizeOptimizedPost(post, 'en');
  return {
    title: localized.title,
    description: localized.excerpt,
    alternates: {
      canonical: `/en/${slug}`,
      languages: { 'zh-CN': `/${slug}`, 'en-US': `/en/${slug}` },
    },
    openGraph: {
      type: 'article',
      title: localized.title,
      description: localized.excerpt,
      publishedTime: localized.publishedAt,
      modifiedTime: localized.updatedAt || localized.publishedAt,
      url: `/en/${slug}`,
      images: localized.cover ? [{ url: localized.cover }] : [],
    },
  };
}

export default async function EnglishArticlePage({ params }: { params: Promise<{ slug: string }> }) {
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
      routeRoot="/en"
    />
  );
}
