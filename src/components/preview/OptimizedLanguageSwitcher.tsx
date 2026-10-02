'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import styles from '@/app/preview/optimized/optimized.module.css';

const PREVIEW_ROOT = '/preview/optimized';
const PREVIEW_EN_ROOT = `${PREVIEW_ROOT}/en`;

export default function OptimizedLanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isPreview = pathname === PREVIEW_ROOT || pathname.startsWith(`${PREVIEW_ROOT}/`);
  const zhRoot = isPreview ? PREVIEW_ROOT : '';
  const enRoot = isPreview ? PREVIEW_EN_ROOT : '/en';
  const isEnglish = pathname === enRoot || pathname.startsWith(`${enRoot}/`);
  const suffix = isEnglish ? pathname.slice(enRoot.length) : pathname.slice(zhRoot.length);
  const query = searchParams.toString();
  const querySuffix = query ? `?${query}` : '';
  const zhHref = `${zhRoot}${suffix}${querySuffix}` || '/';
  const enHref = `${enRoot}${suffix}${querySuffix}`;

  useEffect(() => {
    document.documentElement.lang = isEnglish ? 'en' : 'zh-CN';
    return () => {
      document.documentElement.lang = 'zh-CN';
    };
  }, [isEnglish]);

  return (
    <nav className={styles.languageSwitcher} aria-label={isEnglish ? 'Language' : '语言切换'}>
      <a href={zhHref} className={!isEnglish ? styles.languageActive : undefined} aria-current={!isEnglish ? 'page' : undefined}>中</a>
      <span aria-hidden="true">/</span>
      <a href={enHref} className={isEnglish ? styles.languageActive : undefined} aria-current={isEnglish ? 'page' : undefined}>EN</a>
    </nav>
  );
}
