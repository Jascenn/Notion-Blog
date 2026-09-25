import { notFound } from 'next/navigation';
import BlogPostView from '@/components/BlogPostView';
import { getPostBySlug, getPosts } from '@/lib/notion';
import { logger } from '@/lib/logger';

// 启用增量静态再生成（ISR）- 每 60 秒重新验证一次
export const revalidate = 60;

// 生成静态路径（可选：用于构建时的静态生成）
export async function generateStaticParams() {
  try {
    const posts = await getPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    logger.error('Error generating static params', error);
    return [];
  }
}

// 生成页面元数据
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // 文章不存在时在这里直接 404：若仅在页面组件中 notFound()，
  // 元数据会先正常解析导致 HTML shell 以 200 提交（软 404）
  if (!post) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio';

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: {
      canonical: `${siteUrl}/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.title,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      url: `${siteUrl}/${post.slug}`,
      images: post.cover ? [{ url: post.cover }] : [],
    },
    twitter: {
      card: post.cover ? 'summary_large_image' : 'summary',
      title: post.title,
      description: post.excerpt || post.title,
      images: post.cover ? [post.cover] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogPostView params={params} />;
}
