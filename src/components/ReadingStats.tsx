'use client';

import { useEffect, useState } from 'react';

interface ReadingStatsProps {
  slug: string;
}

export default function ReadingStats({ slug }: ReadingStatsProps) {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查是否已经记录过本次访问（使用 sessionStorage 防止同一会话重复计数）
    const hasViewed = sessionStorage.getItem(`viewed_${slug}`);

    const fetchAndIncrementViews = async () => {
      try {
        if (!hasViewed) {
          // 首次访问，增加计数
          const response = await fetch(`/api/views/${slug}`, {
            method: 'POST',
          });
          const data = await response.json();
          setViewCount(data.views || 0);

          // 标记为已访问
          sessionStorage.setItem(`viewed_${slug}`, 'true');
        } else {
          // 已访问过，只获取当前计数
          const response = await fetch(`/api/views/${slug}`);
          const data = await response.json();
          setViewCount(data.views || 0);
        }
      } catch (error) {
        console.error('Failed to fetch views:', error);
        setViewCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndIncrementViews();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
        <svg
          className="w-4 h-4 mr-1 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        <span>加载中...</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
      <svg
        className="w-4 h-4 mr-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <span>{viewCount.toLocaleString()} 次阅读</span>
    </div>
  );
}
