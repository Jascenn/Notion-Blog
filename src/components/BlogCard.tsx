'use client';

import LinkPrefetch from './LinkPrefetch';
import ReadingTime from './ReadingTime';
import { NotionPost } from '@/lib/notion';

interface BlogCardProps {
  post: NotionPost;
  publishedAtStr?: string;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const timeDisplay = formatDate(post.publishedAt);

  return (
    <article className="py-4 border-b border-gray-100 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/30 dark:hover:bg-gray-800/10 transition-colors">
      {/* 标题和时间 */}
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <LinkPrefetch
          href={`/${post.slug}`}
          className="text-[17px] font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-1"
        >
          {post.title}
        </LinkPrefetch>
        <time className="text-[13px] text-gray-400 dark:text-gray-500 font-mono shrink-0">
          {timeDisplay}
        </time>
      </div>

      {/* 摘要和元信息 */}
      {!post.pinned && post.type !== 'announcement' && (
        <div className="space-y-2.5">
          {post.excerpt && (
            <p className="text-[14px] text-gray-500 dark:text-gray-400 line-clamp-1 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                {post.tags.map((tag: any) => (
                  <span
                    key={tag.name}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-medium notion-tag-${tag.color}`}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 阅读时间 */}
            {post.content && (
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[11px]">
                <ReadingTime content={post.content} />
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}