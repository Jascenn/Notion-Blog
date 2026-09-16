import { notFound } from 'next/navigation';
import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import ReadingTime from '@/components/ReadingTime';
import ReadingStats from '@/components/ReadingStats';
import ShareButtons from '@/components/ShareButtons';
import ExportPDFAdvanced from '@/components/ExportPDFAdvanced';
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

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPostBySlug>> = null;
  let allPosts: Awaited<ReturnType<typeof getPosts>> = [];
  try {
    post = await getPostBySlug(slug);
    allPosts = await getPosts();
  } catch (error) {
    logger.error('Error loading post', error);
  }

  // 注意：notFound() 通过抛出特殊信号实现 404，不能放在 try/catch 内，
  // 否则信号被吞掉后不存在的文章会以 200 状态码返回（软 404）
  if (!post) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 获取完整 URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio';
  const postUrl = `${siteUrl}/${slug}`;

  // 文章结构化数据（SEO）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.publishedAt,
    url: postUrl,
    author: {
      '@type': 'Person',
      name: '凌一 LingYi',
      url: `${siteUrl}/about`,
    },
    publisher: {
      '@type': 'Person',
      name: '凌一 LingYi',
    },
    mainEntityOfPage: postUrl,
    ...(post.cover ? { image: post.cover.startsWith('http') ? post.cover : `${siteUrl}${post.cover}` } : {}),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="pb-16">
          {/* 标题和元信息 */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {post.title}
            </h1>

            {/* 文章元信息：时间、阅读时间、标签 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <time>{formatDate(post.publishedAt)}</time>
              <span>•</span>
              <ReadingTime content={post.content} />
              {post.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.name}
                        href={`/search?tags=${encodeURIComponent(tag.name)}`}
                        className={`px-2 py-1 rounded text-xs transition-colors notion-tag-${tag.color}`}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* 文章内容 */}
          <div id="article-content" className="mb-12">
            <MarkdownContent content={post.content} />
          </div>

          {/* 文章底部：阅读统计、分享按钮、导出按钮 */}
          <footer className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* 左侧：阅读统计 */}
              <ReadingStats slug={slug} />

              {/* 右侧：分享和导出按钮 */}
              <div className="flex items-center gap-3">
                <ShareButtons
                  title={post.title}
                  url={postUrl}
                  description={post.excerpt}
                />
                <ExportPDFAdvanced
                  title={post.title}
                  date={formatDate(post.publishedAt)}
                  tags={post.tags.map(t => t.name)}
                  filename={post.slug}
                  contentId="article-content"
                />
              </div>
            </div>
          </footer>
        </article>

        {/* 目录 */}
        <TableOfContents content={post.content} />

        {/* 相关文章 */}
        <RelatedPosts currentPost={post} allPosts={allPosts} />

        {/* 返回首页链接 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-12 mt-16">
          <Link
            href="/"
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-1"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    );
}
