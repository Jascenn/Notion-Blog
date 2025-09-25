'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Blog', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'RSS', href: '/rss' },
    { name: 'Search', href: '/search' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white backdrop-blur-sm bg-opacity-95 dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Brand/Name - 英文艺术字 */}
          <div className="flex items-center">
            <Link href="/" className="group relative">
              <span className="text-xl sm:text-2xl font-light text-gray-900 dark:text-gray-100 transition-all duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 tracking-widest italic" style={{fontFamily: '"Georgia", "Times New Roman", serif', fontVariant: 'small-caps'}}>
                LingYi
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-300 dark:bg-gray-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Navigation Links & Theme Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-6">
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
            <div className="flex sm:hidden items-center space-x-3">
              {['Blog', 'Search'].map((item) => {
                const href = item === 'Blog' ? '/' : `/${item.toLowerCase()}`;
                return (
                  <Link
                    key={item}
                    href={href}
                    className={`text-sm transition-colors dark:text-gray-200 ${
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