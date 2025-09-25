'use client';

import LinkPrefetch from './LinkPrefetch';
import ReadingTime from './ReadingTime';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  slug: string;
  tags: string[];
  cover: string | null;
  content: string;
}

interface BlogCardProps {
  post: BlogPost;
  publishedAtStr: string;
}

export default function BlogCard({ post, publishedAtStr }: BlogCardProps) {
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
          <ReadingTime content={post.content} />
        </div>
      )}
    </article>
  );
}