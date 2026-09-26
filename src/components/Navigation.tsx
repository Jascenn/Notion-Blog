'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import OptimizedLanguageSwitcher from './preview/OptimizedLanguageSwitcher';
import previewStyles from '@/app/preview/optimized/optimized.module.css';

export default function Navigation() {
  const pathname = usePathname();
  const isOptimizedPreview = pathname.startsWith('/preview/optimized');
  const isOriginalPreview = pathname.startsWith('/preview/original');

  if (isOptimizedPreview) {
    const isEnglish = pathname === '/preview/optimized/en' || pathname.startsWith('/preview/optimized/en/');
    const previewRoot = isEnglish ? '/preview/optimized/en' : '/preview/optimized';
    const previewNavigation = [
      { name: isEnglish ? 'Articles' : '文章', href: `${previewRoot}/blog`, match: `${previewRoot}/blog`, id: 'articles' },
      { name: isEnglish ? 'About' : '关于', href: `${previewRoot}/about`, match: `${previewRoot}/about`, id: 'about' },
      { name: isEnglish ? 'Subscribe' : '订阅', href: '/rss.xml', match: '/rss.xml', id: 'subscribe' },
      { name: isEnglish ? 'Search' : '搜索', href: `${previewRoot}/search`, match: `${previewRoot}/search`, id: 'search' },
    ];
    const isArticle = !['', '/blog', '/about', '/search'].includes(pathname.replace(previewRoot, ''));

    return (
      <nav className={previewStyles.siteNav}>
        <div className={previewStyles.navInner}>
          <Link href={previewRoot} className={previewStyles.brand}>LingYi</Link>
          <div className={previewStyles.navUtility}>
            <div className={previewStyles.navLinks}>
              {previewNavigation.map((item) => {
                const active = pathname === item.match || (item.id === 'articles' && isArticle);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={active ? previewStyles.navActive : undefined}
                    target={item.id === 'subscribe' ? '_blank' : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <Suspense fallback={<span className={previewStyles.languageSwitcher}>中 / EN</span>}>
              <OptimizedLanguageSwitcher />
            </Suspense>
            <ThemeToggle locale={isEnglish ? 'en' : 'zh'} />
          </div>
        </div>
      </nav>
    );
  }

  const originalPrefix = isOriginalPreview ? '/preview/original' : '';

  const navigation = [
    { name: 'Blog', href: originalPrefix || '/' },
    { name: 'About', href: `${originalPrefix}/about` },
    { name: 'RSS', href: '/rss' },
    { name: 'Search', href: `${originalPrefix}/search` },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white backdrop-blur-sm bg-opacity-95 dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Brand/Name - 英文艺术字 */}
          <div className="flex items-center">
            <Link href={originalPrefix || '/'} className="group relative">
              <span className="text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100 transition-all duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 tracking-widest italic" style={{fontFamily: '"Georgia", "Times New Roman", serif', fontVariant: 'small-caps'}}>
                LingYi
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-300 dark:bg-gray-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Navigation Links & Theme Toggle */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="hidden sm:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-base transition-colors dark:text-gray-200 ${
                    pathname === item.href
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu - simplified */}
            <div className="flex sm:hidden items-center space-x-4">
              {['Blog', 'Search'].map((item) => {
                const href = item === 'Blog' ? (originalPrefix || '/') : `${originalPrefix}/${item.toLowerCase()}`;
                return (
                  <Link
                    key={item}
                    href={href}
                    className={`text-sm transition-colors dark:text-gray-200 whitespace-nowrap ${
                      pathname === href
                        ? 'text-gray-900 dark:text-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {item}
                  </Link>
                );
              })}
            </div>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
