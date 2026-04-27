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
    <article className={`group py-3 transition-all duration-200 ${post.pinned || post.type === 'announcement'
        ? 'border-b border-gray-200 dark:border-gray-700 last:border-b-0'
        : 'border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
      }`}>
      {/* 标题和时间同一行 */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
        <LinkPrefetch
          href={`/${post.slug}`}
          className={`text-lg font-medium transition-all duration-200 flex-1 ${post.pinned
              ? 'text-gray-900 dark:text-gray-100 font-semibold hover:text-red-600 dark:hover:text-red-400 hover:translate-x-1'
              : post.type === 'announcement'
                ? 'text-gray-900 dark:text-gray-100 font-semibold hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1'
                : 'text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-x-1'
            }`}
        >
          {post.title}
        </LinkPrefetch>
        <time className="text-sm text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap shrink-0">
          {timeDisplay}
        </time>
      </div>

      {/* 摘要和标签 - 仅在非置顶和非公告文章时显示 */}
      {!post.pinned && post.type !== 'announcement' && post.excerpt && (
        <div className="space-y-3">
          {/* 摘要 */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {post.excerpt}
          </p>

          {/* 标签和阅读时间 */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors duration-200 notion-tag-${tag.color}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            {post.content && (
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <ReadingTime content={post.content} />
              </div>
            )}
          </div>
        </div>
      )}

    </article>
  );
}
