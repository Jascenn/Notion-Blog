import BlogCard from '@/components/BlogCard';
import { getPostsOnly, getAnnouncements } from '@/lib/notion';

export default async function Home() {
  // 从 Notion 获取数据
  const [posts, announcements] = await Promise.all([
    getPostsOnly(),
    getAnnouncements()
  ]);

  // 按置顶状态排序文章
  const sortedPosts = posts.sort((a, b) => {
    // 置顶文章在前
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // 同样置顶状态按时间排序
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* 公告区域 */}
      {announcements.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            📢 <span className="ml-2">公告</span>
          </h2>
          <div className="space-y-4">
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">
                      {announcement.excerpt}
                    </p>
                  </div>
                  <time className="text-xs text-blue-600 dark:text-blue-300 ml-4 whitespace-nowrap">
                    {formatDate(announcement.publishedAt)}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="pb-16">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">暂无文章</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              请检查 Notion 配置或添加一些内容
            </p>
          </div>
        ) : (
          <div>
            {sortedPosts.map((post) => (
              <div key={post.id} className="relative">
                {post.pinned && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
                      📌 置顶
                    </div>
                  </div>
                )}
                <BlogCard post={post} publishedAtStr={formatDate(post.publishedAt)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
