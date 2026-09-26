'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from '@/app/preview/optimized/optimized.module.css';

const ROOT = '/preview/optimized';
const EN_ROOT = `${ROOT}/en`;

export default function OptimizedLanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isEnglish = pathname === EN_ROOT || pathname.startsWith(`${EN_ROOT}/`);
  const suffix = isEnglish ? pathname.slice(EN_ROOT.length) : pathname.slice(ROOT.length);
  const query = searchParams.toString();
  const querySuffix = query ? `?${query}` : '';
  const zhHref = `${ROOT}${suffix}${querySuffix}`;
  const enHref = `${EN_ROOT}${suffix}${querySuffix}`;

  useEffect(() => {
    document.documentElement.lang = isEnglish ? 'en' : 'zh-CN';
    return () => {
      document.documentElement.lang = 'zh-CN';
    };
  }, [isEnglish]);

  return (
    <nav className={styles.languageSwitcher} aria-label={isEnglish ? 'Language' : '语言切换'}>
      <Link href={zhHref} className={!isEnglish ? styles.languageActive : undefined} aria-current={!isEnglish ? 'page' : undefined}>中</Link>
      <span aria-hidden="true">/</span>
      <Link href={enHref} className={isEnglish ? styles.languageActive : undefined} aria-current={isEnglish ? 'page' : undefined}>EN</Link>
    </nav>
  );
}
