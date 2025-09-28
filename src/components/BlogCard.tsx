'use client';

import LinkPrefetch from './LinkPrefetch';
import ReadingTime from './ReadingTime';
import { NotionPost } from '@/lib/notion';

interface BlogCardProps {
  post: NotionPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  // 检测用户的语言偏好
  const getUserLanguage = () => {
    if (typeof window !== 'undefined') {
      return navigator.language || navigator.languages[0] || 'zh-CN';
    }
    return 'zh-CN';
  };

  const userLanguage = getUserLanguage();
  const isEnglish = userLanguage.startsWith('en');

  // 智能时间格式化
  const formatTime = () => {
    const date = new Date(post.publishedAt);

    if (isEnglish) {
      // 英文模式：英文格式
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      // 中文模式：斜杠分隔格式 2025/09/25
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  const timeDisplay = formatTime();

  return (
    <article className="group py-6">
      {/* 标题和时间同一行 */}
      <div className="flex items-center justify-between mb-3">
        <LinkPrefetch
          href={`/${post.slug}`}
          className="text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-1 pr-4"
        >
          {post.title}
        </LinkPrefetch>
        <time className="text-sm text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
          {timeDisplay}
        </time>
      </div>

      {/* 摘要 */}
      {post.excerpt && (
        <div className="space-y-3">
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
            {post.excerpt}
          </p>

          {/* 标签和阅读时间 */}
          <div className="flex items-center justify-between">
            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <a
                    key={tag}
                    href={`/search?tags=${encodeURIComponent(tag)}`}
                    className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {tag}
                  </a>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-gray-400 text-xs">+{post.tags.length - 3}</span>
                )}
              </div>
            )}

            {/* 阅读时间 */}
            <ReadingTime content={post.content} />
          </div>
        </div>
      )}
    </article>
  );
}
