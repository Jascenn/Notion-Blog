'use client';

import { useEffect, useState } from 'react';

// tw93 风格的外链检测和图标显示
export default function ExternalLinkIcon() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 为所有外链添加新窗口打开和图标
    const handleExternalLinks = () => {
      const links = document.querySelectorAll('a[href^="http"], a[href^="https"]');

      links.forEach((link) => {
        const anchor = link as HTMLAnchorElement;
        const currentDomain = window.location.hostname;
        const linkDomain = new URL(anchor.href).hostname;

        // 检查是否为外链
        if (linkDomain !== currentDomain) {
          // 添加新窗口打开属性
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';

          // 添加外链图标（如果还没有的话）
          if (!anchor.querySelector('.external-link-icon')) {
            const icon = document.createElement('span');
            icon.className = 'external-link-icon inline-block ml-1 opacity-60';
            icon.innerHTML = '↗';
            icon.style.fontSize = '0.8em';
            anchor.appendChild(icon);
          }
        }
      });
    };

    // 初始处理
    handleExternalLinks();

    // 监听DOM变化，处理动态添加的链接
    const observer = new MutationObserver(handleExternalLinks);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // 服务器端不渲染任何内容
  if (!mounted) {
    return null;
  }

  return null; // 这个组件只处理副作用，不渲染内容
}