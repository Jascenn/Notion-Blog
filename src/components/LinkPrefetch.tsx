'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface LinkPrefetchProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetchDelay?: number;
}

// tw93 风格的链接预加载组件
export default function LinkPrefetch({
  href,
  children,
  className = '',
  prefetchDelay = 100 // 悬停100ms后开始预加载
}: LinkPrefetchProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;

    const handleMouseEnter = () => {
      // 延迟预加载，避免快速滑过时的无效请求
      timeoutRef.current = setTimeout(() => {
        // 使用 Next.js 内置的 prefetch
        const linkElement = document.createElement('link');
        linkElement.rel = 'prefetch';
        linkElement.href = href;
        linkElement.as = 'document';
        document.head.appendChild(linkElement);
      }, prefetchDelay);
    };

    const handleMouseLeave = () => {
      // 清除预加载定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    link.addEventListener('mouseenter', handleMouseEnter);
    link.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      link.removeEventListener('mouseenter', handleMouseEnter);
      link.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [href, prefetchDelay]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      prefetch={false} // 禁用自动预加载，使用自定义逻辑
    >
      {children}
    </Link>
  );
}