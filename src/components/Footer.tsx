'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import previewStyles from '@/app/preview/optimized/optimized.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isOptimizedPreview = pathname.startsWith('/preview/optimized');

  if (isOptimizedPreview) {
    return (
      <footer className={previewStyles.siteFooter}>
        <div className={previewStyles.footerInner}>
          <div>
            <p className={previewStyles.footerStatement}>把正在做的事，认真记录下来。</p>
            <p className={previewStyles.footerMeta}>© 凌一 · 2024 - {currentYear}</p>
          </div>
          <nav className={previewStyles.footerLinks} aria-label="页脚导航">
            <Link href="/preview/optimized/blog">文章</Link>
            <Link href="/preview/optimized/about">关于</Link>
            <Link href="/preview/optimized/search">搜索</Link>
            <a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer">lingyi.tools ↗</a>
          </nav>
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
