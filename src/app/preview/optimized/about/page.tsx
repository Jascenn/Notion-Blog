import type { Metadata } from 'next';
import { getAboutPage } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';

export const revalidate = 60;

export const metadata: Metadata = {
  title: '关于 · 优化版预览',
  robots: { index: false, follow: false },
};

export default async function OptimizedAboutPage() {
  const about = await getAboutPage();
  return <OptimizedAbout about={about} />;
}
