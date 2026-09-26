'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import previewStyles from '@/app/preview/optimized/optimized.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isOptimizedPreview = pathname.startsWith('/preview/optimized');

  if (isOptimizedPreview) {
    const isEnglish = pathname === '/preview/optimized/en' || pathname.startsWith('/preview/optimized/en/');
    const previewRoot = isEnglish ? '/preview/optimized/en' : '/preview/optimized';
    return (
      <footer className={previewStyles.siteFooter}>
        <div className={previewStyles.footerInner}>
          <div>
            <p className={previewStyles.footerStatement}>{isEnglish ? 'Document the work while it is being built.' : '把正在做的事，认真记录下来。'}</p>
            <p className={previewStyles.footerMeta}>© {isEnglish ? 'LingYi' : '凌一'} · 2024 - {currentYear}</p>
          </div>
          <nav className={previewStyles.footerLinks} aria-label={isEnglish ? 'Footer navigation' : '页脚导航'}>
            <Link href={`${previewRoot}/blog`}>{isEnglish ? 'Articles' : '文章'}</Link>
            <Link href={`${previewRoot}/about`}>{isEnglish ? 'About' : '关于'}</Link>
            <Link href={`${previewRoot}/search`}>{isEnglish ? 'Search' : '搜索'}</Link>
            <a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer">lingyi.tools</a>
          </nav>
          <div className={previewStyles.footerFriends}>
            <span>{isEnglish ? 'FRIENDS' : 'FRIENDS / 友链'}</span>
            <a
              href="https://dkfile.net"
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="friend-link-click"
              data-umami-event-site="dkfile.net"
            >
              DKFile
            </a>
          </div>
        </div>
      </footer>
    );
  }

  const aboutHref = pathname.startsWith('/preview/original') ? '/preview/original/about' : '/about';

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © <Link href={aboutHref} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">凌一</Link> 2024 - {currentYear}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            友情链接：<a href="https://dkfile.net" target="_blank" rel="noopener noreferrer" data-umami-event="friend-link-click" data-umami-event-site="dkfile.net" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">DKFile</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
