import BlogCard from '@/components/BlogCard';
import { getPostsOnly } from '@/lib/notion';


export default async function Home() {
  const posts = await getPostsOnly();

  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <div className="pb-16">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">暂无文章</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              可能是网络连接问题或 Notion 配置问题，请稍后刷新重试
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
