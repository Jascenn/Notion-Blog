'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GISCUS_CONFIG,
  GISCUS_LOAD_TIMEOUT_MS,
  getDiscussionsFallbackUrl,
  hasGiscusReturnParam,
  resolveGiscusLang,
  resolveGiscusTheme,
} from '@/lib/giscus';

interface GiscusCommentsProps {
  slug: string;
  locale?: 'zh' | 'en';
  enabled?: boolean;
}

type GiscusLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

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
  const [status, setStatus] = useState<GiscusLoadStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);

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
    let settled = false;
    let loadTimeoutTimer: number | null = null;
    let activeIframe: HTMLIFrameElement | null = null;

    const clearLoadTimeout = () => {
      if (loadTimeoutTimer !== null) {
        window.clearTimeout(loadTimeoutTimer);
        loadTimeoutTimer = null;
      }
    };

    const markLoaded = () => {
      if (settled) return;
      settled = true;
      clearLoadTimeout();
      setStatus('loaded');
    };

    const markError = () => {
      if (settled) return;
      settled = true;
      clearLoadTimeout();
      setStatus('error');
    };

    const handleGiscusMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://giscus.app') return;
      if (typeof event.data === 'object' && event.data !== null && 'giscus' in event.data) {
        markLoaded();
      }
    };
    window.addEventListener('message', handleGiscusMessage);

    // 监测 iframe 插入并绑定 load 事件，确保脚本或 iframe 就绪后立即消隐加载提示
    const iframeObserver = new MutationObserver(() => {
      const iframe = container.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
      if (!iframe || iframe === activeIframe) return;
      activeIframe = iframe;
      iframe.addEventListener('load', markLoaded, { once: true });
    });
    iframeObserver.observe(container, { childList: true });

    const loadScript = () => {
      if (loaded) return;
      loaded = true;
      settled = false;
      setStatus('loading');

      clearLoadTimeout();
      loadTimeoutTimer = window.setTimeout(() => {
        markError();
      }, GISCUS_LOAD_TIMEOUT_MS);

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
      script.onerror = () => {
        markError();
      };
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

    // 从 GitHub 登录回跳时（URL 带 ?giscus=），或点击重试时，立即加载评论区
    if (retryCount > 0) {
      loadScript();
    } else if (hasGiscusReturnParam(window.location.search) && 'ResizeObserver' in window) {
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
      window.removeEventListener('message', handleGiscusMessage);
      iframeObserver.disconnect();
      if (activeIframe) {
        activeIframe.removeEventListener('load', markLoaded);
        activeIframe = null;
      }
      themeObserver.disconnect();
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        intersectionObserver = null;
      }
      clearLoadTimeout();
      stopPinning();
      container.innerHTML = '';
    };
  }, [slug, locale, enabled, retryCount]);

  if (!enabled || !GISCUS_CONFIG.categoryId) {
    return null;
  }

  const en = locale === 'en';
  const fallbackUrl = getDiscussionsFallbackUrl();

  return (
    <section
      ref={sectionRef}
      aria-label={en ? 'Comments' : '评论区'}
      className="border-t border-gray-200 dark:border-gray-700 pt-10 mt-12"
    >
      {status === 'loading' && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {en ? 'Loading comments…' : '正在加载评论区…'}
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            {en
              ? 'Comments failed to load (giscus.app may be unreachable).'
              : '评论区暂未加载，可能是当前网络无法连接 giscus.app。'}
          </span>
          <button
            type="button"
            onClick={() => setRetryCount((n) => n + 1)}
            className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {en ? 'Retry' : '重试'}
          </button>
          <span aria-hidden="true">·</span>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {en ? 'Join on GitHub Discussions ↗' : '前往 GitHub Discussions 参与讨论 ↗'}
          </a>
        </p>
      )}
      <div ref={containerRef} className="giscus min-h-[1px]" />
    </section>
  );
}
