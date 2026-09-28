'use client';

import { useEffect, useRef, useState } from 'react';
import type { OptimizedLocale } from '@/lib/optimized-i18n';
import styles from '@/app/preview/optimized/optimized.module.css';

type CopyStatus = 'idle' | 'copied' | 'failed';

async function writeToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) throw new Error('Copy command failed');
}

export default function CopyContactButton({ value, locale }: { value: string; locale: OptimizedLocale }) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const en = locale === 'en';

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const handleCopy = async () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);

    try {
      await writeToClipboard(value);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }

    resetTimer.current = setTimeout(() => setStatus('idle'), 2200);
  };

  const hint = status === 'copied'
    ? (en ? 'Copied ✓' : '已复制 ✓')
    : status === 'failed'
      ? (en ? 'Copy failed' : '复制失败')
      : '';

  return (
    <button
      type="button"
      className={styles.copyContactButton}
      onClick={handleCopy}
      aria-label={en ? `Copy WeChat ID ${value}` : `复制微信号 ${value}`}
      data-umami-event="contact-copy"
      data-umami-event-contact="wechat"
    >
      <span className={styles.copyContactValue}>{value}</span>
      {hint && <span className={styles.copyContactHint} aria-live="polite">{hint}</span>}
    </button>
  );
}
