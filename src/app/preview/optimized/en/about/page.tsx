import type { Metadata } from 'next';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';

export const metadata: Metadata = {
  title: 'About · Optimized Preview',
  robots: { index: false, follow: false },
};

export default function OptimizedEnglishAboutPage() {
  return <OptimizedAbout about={null} locale="en" />;
}
