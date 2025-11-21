'use client';

import { useEffect, useState } from 'react';
import { slugifyHeading } from '@/lib/slugifyHeading';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    // 从 Markdown 内容中提取标题
    const extractTocFromMarkdown = (markdown: string): TocItem[] => {
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const items: TocItem[] = [];
      let match;

      while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = slugifyHeading(text);

        items.push({ id, text, level });
      }

      return items;
    };

    const items = extractTocFromMarkdown(content);
    setTocItems(items);
  }, [content]);

  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // 初始设置
    setWindowWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 滚动监听，高亮当前章节
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -60% 0%',
        threshold: 0,
      }
    );

    // 延迟观察，确保 DOM 已渲染
    const timeoutId = setTimeout(() => {
      tocItems.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [tocItems]);

  const handleTocClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  // 计算响应式位置
  const getResponsivePosition = () => {
    if (windowWidth >= 1536) { // 2xl
      return { right: '2rem', width: '20rem' }; // right-8, w-80
    } else if (windowWidth >= 1280) { // xl
      return { right: '1.5rem', width: '18rem' }; // right-6, w-72
    } else if (windowWidth >= 1024) { // lg
      return { right: '1rem', width: '16rem' }; // right-4, w-64
    } else {
      return null; // 小屏幕不显示
    }
  };

  const position = getResponsivePosition();

  if (!position) {
    return null;
  }

  return (
    <div
      className="toc-hover-area group fixed top-32 z-30"
      style={{
        right: position.right,
        display: windowWidth >= 1024 ? 'block' : 'none'
      }}
    >
      {/* 隐藏状态的小提示 */}
      <div className="absolute top-0 right-0 group-hover:opacity-0 group-hover:pointer-events-none transition-opacity duration-200">
        <div className="flex flex-col items-end space-y-2 p-2">
          {tocItems.slice(0, 10).map(({ id, text, level }) => {
            // 根据标题层级和长度计算横条宽度
            const baseWidth = level === 1 ? 24 : level === 2 ? 20 : 16;
            const textLength = text.length;
            const width = Math.min(Math.max(baseWidth + textLength * 0.5, 12), 28);

            return (
              <div
                key={id}
                className={`h-0.5 rounded-full ${
                  activeId === id ? 'bg-gray-800' : 'bg-gray-300'
                }`}
                style={{ width: `${width}px` }}
              ></div>
            );
          })}
          {tocItems.length > 10 && (
            <div className="h-0.5 bg-gray-200 rounded-full" style={{ width: '8px' }}></div>
          )}
        </div>
      </div>

      {/* 触发区域扩展 */}
      <div className="absolute -top-4 -right-4 w-20 h-24 bg-transparent"></div>

      {/* 完整目录面板 - 悬停时显示 */}
      <nav
        className="absolute top-0 right-0 transform translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out"
        style={{ width: position.width }}
      >
        <div className="py-4 px-2">
          <ul className="space-y-1 max-h-96 overflow-y-auto">
            {tocItems.map(({ id, text, level }) => (
              <li key={id}>
                <button
                  onClick={() => handleTocClick(id)}
                  className={`group/item relative flex items-center w-full text-left py-1.5 px-2 rounded text-sm transition-all duration-150 ${
                    activeId === id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{
                    paddingLeft: `${8 + (level - 1) * 16}px`,
                    fontSize: '14px',
                    fontWeight: level === 1 ? '500' : '400'
                  }}
                >
                  <span className="truncate leading-tight">{text}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}
