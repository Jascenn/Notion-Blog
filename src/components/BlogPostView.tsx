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

interface BlogPostViewProps {
  params: Promise<{ slug: string }>;
  routePrefix?: string;
}

export default async function BlogPostView({ params, routePrefix = '' }: BlogPostViewProps) {
  const { slug } = await params;
  let post: Awaited<ReturnType<typeof getPostBySlug>> = null;
  let allPosts: Awaited<ReturnType<typeof getPosts>> = [];

  try {
    post = await getPostBySlug(slug);
    allPosts = await getPosts();
  } catch (error) {
    logger.error('Error loading post', error);
  }

  if (!post) notFound();

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio';
  const postUrl = `${siteUrl}/${slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    url: postUrl,
    author: { '@type': 'Person', name: '凌一 LingYi', url: `${siteUrl}/about` },
    publisher: { '@type': 'Person', name: '凌一 LingYi' },
    mainEntityOfPage: postUrl,
    ...(post.cover ? { image: post.cover.startsWith('http') ? post.cover : `${siteUrl}${post.cover}` } : {}),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="pb-16">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{post.title}</h1>
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
                      href={`${routePrefix}/search?tags=${encodeURIComponent(tag.name)}`}
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

        <div id="article-content" className="mb-12">
          <MarkdownContent content={post.content} />
        </div>

        <footer className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <ReadingStats slug={slug} />
            <div className="flex items-center gap-3">
              <ShareButtons title={post.title} url={postUrl} description={post.excerpt} />
              <ExportPDFAdvanced
                title={post.title}
                date={formatDate(post.publishedAt)}
                tags={post.tags.map((tag) => tag.name)}
                filename={post.slug}
                contentId="article-content"
              />
            </div>
          </div>
        </footer>
      </article>

      <TableOfContents content={post.content} />
      <RelatedPosts currentPost={post} allPosts={allPosts} hrefPrefix={routePrefix} />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-12 mt-16">
        <Link
          href={routePrefix || '/'}
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-1"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
