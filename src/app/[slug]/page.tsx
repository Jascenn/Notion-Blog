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
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return {
        title: '文章未找到',
      };
    }

    return {
      title: post.title,
      description: post.excerpt || post.title,
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        images: post.cover ? [post.cover] : [],
      },
    };
  } catch (error) {
    logger.error('Error generating metadata', error);
    return {
      title: '文章未找到',
    };
  }
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    const allPosts = await getPosts();

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

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 min-h-screen">
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
                        key={tag}
                        href={`/search?tags=${encodeURIComponent(tag)}`}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {tag}
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
                  tags={post.tags}
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
  } catch (error) {
    logger.error('Error loading post', error);

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            加载失败
          </h1>
          <p className="text-gray-600 mb-8">
            无法从 Notion 加载文章内容，请检查配置。
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }
}
