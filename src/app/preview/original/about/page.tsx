import type { Metadata } from 'next';
import AboutPage from '@/app/about/page';

export const metadata: Metadata = {
  title: '关于 · 原版预览',
  robots: { index: false, follow: false },
};

export default AboutPage;
