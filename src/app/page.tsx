import BlogCard from '@/components/BlogCard';
import { getPostsOnly } from '@/lib/notion';

// 启用增量静态再生成（ISR）- 每 60 秒重新验证一次
export const revalidate = 60;

export default async function Home() {
  const posts = await getPostsOnly();

  // 分离公告、置顶文章和普通文章
  const announcementPosts = posts.filter(post => post.type === 'announcement');
  const pinnedPosts = posts.filter(post => post.pinned && post.type !== 'announcement');
  const regularPosts = posts.filter(post => !post.pinned && post.type !== 'announcement');

  // 按时间排序
  const sortedAnnouncements = [...announcementPosts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const sortedPinned = [...pinnedPosts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const sortedRegular = [...regularPosts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // 合并：公告 > 置顶文章 > 普通文章
  const sortedPosts = [...sortedAnnouncements, ...sortedPinned, ...sortedRegular];

  // 网站结构化数据（SEO）
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '凌一 LingYi 的博客',
    url: siteUrl,
    description: '全栈开发实践、AI 工具探索、效率工作流与生活随笔，记录从 0 到 1 的构建过程。',
    author: {
      '@type': 'Person',
      name: '凌一 LingYi',
      url: `${siteUrl}/about`,
    },
    inLanguage: 'zh-CN',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 首页 h1：仅用于语义结构（SEO/无障碍），不改变视觉样式 */}
      <h1 className="sr-only">凌一 LingYi 的博客</h1>
      <div className="pb-16">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">暂无文章</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              可能是网络连接问题或 Notion 配置问题，请稍后刷新重试
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 公告区域 */}
            {sortedAnnouncements.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">📢</span>
                  <h2 className="text-base font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    公告
                  </h2>
                  <span className="ml-auto text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                    {sortedAnnouncements.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sortedAnnouncements.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* 置顶文章区域 */}
            {sortedPinned.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow duration-300 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xl">📌</span>
                  <h2 className="text-base font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">
                    置顶文章
                  </h2>
                  <span className="ml-auto text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-full">
                    {sortedPinned.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sortedPinned.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* 普通文章区域 */}
            {sortedRegular.length > 0 && (
              <div className="space-y-6">
                <h2 className="sr-only">全部文章</h2>
                {sortedRegular.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
