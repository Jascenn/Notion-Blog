'use client';

import { useEffect, useRef } from 'react';
import {
  GISCUS_CONFIG,
  hasGiscusReturnParam,
  resolveGiscusLang,
  resolveGiscusTheme,
} from '@/lib/giscus';

interface GiscusCommentsProps {
  slug: string;
  locale?: 'zh' | 'en';
  enabled?: boolean;
}

const USER_SCROLL_EVENTS: Array<keyof WindowEventMap> = [
  'wheel',
  'touchstart',
  'keydown',
  'pointerdown',
];

export default function GiscusComments({
  slug,
  locale = 'zh',
  enabled = true,
}: GiscusCommentsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!enabled || !GISCUS_CONFIG.categoryId || !section || !container) {
      return;
    }

    container.innerHTML = '';

    const isCurrentDark = () => document.documentElement.classList.contains('dark');
    const getTheme = () => resolveGiscusTheme(isCurrentDark(), window.location.origin);

    let loaded = false;
    const loadScript = () => {
      if (loaded) return;
      loaded = true;

      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-repo', GISCUS_CONFIG.repo);
      script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId);
      script.setAttribute('data-category', GISCUS_CONFIG.category);
      script.setAttribute('data-category-id', GISCUS_CONFIG.categoryId);
      script.setAttribute('data-mapping', 'specific');
      script.setAttribute('data-term', slug);
      script.setAttribute('data-strict', '1');
      script.setAttribute('data-reactions-enabled', '1');
      script.setAttribute('data-emit-metadata', '0');
      script.setAttribute('data-input-position', 'bottom');
      script.setAttribute('data-theme', getTheme());
      script.setAttribute('data-lang', resolveGiscusLang(locale));
      container.appendChild(script);
    };

    // 监听全站深浅色切换，向已加载的 Giscus iframe 同步主题
    const themeObserver = new MutationObserver(() => {
      const iframe = container.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: getTheme() } } },
        'https://giscus.app',
      );
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    let intersectionObserver: IntersectionObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let pinTimer: number | null = null;

    const stopPinning = () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (pinTimer !== null) {
        window.clearTimeout(pinTimer);
        pinTimer = null;
      }
      USER_SCROLL_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, stopPinning);
      });
    };

    // 从 GitHub 登录回跳时（URL 带 ?giscus=），立即加载并将评论框锚定在可视区底部，避免上方图片撑高页面
    if (hasGiscusReturnParam(window.location.search) && 'ResizeObserver' in window) {
      const pinToBottom = () => {
        container.scrollIntoView({ block: 'end', behavior: 'instant' });
      };
      resizeObserver = new ResizeObserver(pinToBottom);
      resizeObserver.observe(document.body);
      USER_SCROLL_EVENTS.forEach((eventName) => {
        window.addEventListener(eventName, stopPinning, { passive: true });
      });
      pinTimer = window.setTimeout(stopPinning, 15000);
      loadScript();
      pinToBottom();
    } else if ('IntersectionObserver' in window) {
      // 观察有真实尺寸的外层 section（避免空 div 高度为 0 不触发相交），提前 3 屏预加载
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          intersectionObserver?.disconnect();
          intersectionObserver = null;
          loadScript();
        },
        { rootMargin: '0px 0px 300% 0px' },
      );
      intersectionObserver.observe(section);
    } else {
      loadScript();
    }

    return () => {
      themeObserver.disconnect();
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      stopPinning();
      container.innerHTML = '';
    };
  }, [slug, locale, enabled]);

  if (!enabled || !GISCUS_CONFIG.categoryId) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      aria-label={locale === 'en' ? 'Comments' : '评论区'}
      className="border-t border-gray-200 dark:border-gray-700 pt-10 mt-12"
    >
      <div ref={containerRef} className="giscus min-h-[1px]" />
    </section>
  );
}
