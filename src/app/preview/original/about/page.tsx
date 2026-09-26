import type { Metadata } from 'next';
import AboutPage from '@/app/about/page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '关于 · 原版预览',
  robots: { index: false, follow: false },
};

export default AboutPage;
