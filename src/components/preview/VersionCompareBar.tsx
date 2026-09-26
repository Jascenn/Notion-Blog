'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function VersionCompareBar() {
  const pathname = usePathname();
  const originalPrefix = '/preview/original';
  const optimizedPrefix = '/preview/optimized';
  const isOptimized = pathname.startsWith(optimizedPrefix);
  const isEnglish = pathname === `${optimizedPrefix}/en` || pathname.startsWith(`${optimizedPrefix}/en/`);
  const currentPrefix = isOptimized ? optimizedPrefix : originalPrefix;
  const rawSuffix = pathname.slice(currentPrefix.length);
  const suffix = isEnglish ? rawSuffix.replace(/^\/en/, '') : rawSuffix;
  const originalSuffix = suffix === '/blog' ? '' : suffix;
  const optimizedSuffix = isEnglish ? `/en${suffix}` : suffix;
  const versions = [
    { href: `${originalPrefix}${originalSuffix}`, label: '原版', active: !isOptimized },
    { href: `${optimizedPrefix}${optimizedSuffix}`, label: '优化版', active: isOptimized },
  ];

  return (
    <aside className="sticky top-[4.1rem] z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto flex min-h-12 max-w-4xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
          {isEnglish ? 'Full-site preview · production is unchanged' : '整站版本预览，不影响线上'}
        </p>
        <nav aria-label={isEnglish ? 'Version switcher' : '首页版本切换'} className="flex w-full items-center sm:w-auto">
          {versions.map((version) => {
            const active = version.active;
            return (
              <Link
                key={version.href}
                href={version.href}
                aria-current={active ? 'page' : undefined}
                className={`flex-1 border px-5 py-2 text-center text-sm active:translate-y-px sm:flex-none ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-gray-950'
                    : 'border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400 dark:hover:text-white'
                } ${version.href === '/preview/optimized' ? '-ml-px' : ''}`}
              >
                {isEnglish ? (version.active ? 'Optimized' : 'Original') : version.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
