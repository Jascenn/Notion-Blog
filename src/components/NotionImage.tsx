'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface NotionImageProps {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
    onLoadingComplete?: () => void;
    title?: string;
    onClick?: () => void;
}

/**
 * 高性能 Notion 图片组件
 * 使用 Next.js Image 进行自动格式转换、压缩和懒加载
 */
const NotionImage: React.FC<NotionImageProps> = ({
    src,
    alt,
    className = '',
    priority = false,
    onLoadingComplete,
    title,
    onClick,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // 如果没有 src，直接不渲染
    if (!src) return null;

    return (
        <div
            className={`relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 rounded-lg group ${className}`}
            style={{ minHeight: isLoading ? '200px' : 'auto' }}
        >
            {/* 加载占位符：只有在加载中且没有错误时显示 */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-400 animate-spin rounded-full"></div>
                </div>
            )}

            {/* 错误提示 */}
            {hasError && (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 text-gray-400">
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-xs">图片无法直接渲染，点击原始链接查看</span>
                    <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-xs text-blue-500 underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        打开原图
                    </a>
                </div>
            )}

            {!hasError && (
                <Image
                    src={src}
                    alt={alt || 'Blog image'}
                    width={1200} // 设置一个较大的默认宽度，Next.js 会自动按需缩放
                    height={675} // 默认 16:9
                    className={`
            w-full h-auto transition-all duration-700 ease-in-out
            ${isLoading ? 'scale-105 blur-lg opacity-0' : 'scale-100 blur-0 opacity-100'}
            ${className}
          `}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    priority={priority}
                    onLoadingComplete={() => {
                        setIsLoading(false);
                        onLoadingComplete?.();
                    }}
                    onError={() => {
                        setHasError(true);
                        setIsLoading(false);
                    }}
                    title={title}
                    onClick={onClick}
                    unoptimized={false} // 启用 Next.js 图片优化
                    style={{ objectFit: 'contain' }}
                />
            )}
        </div>
    );
};

export default NotionImage;
