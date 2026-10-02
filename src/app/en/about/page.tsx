import type { Metadata } from 'next';
import { getAboutPage } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'About',
  description: 'About LingYi, the projects he is building, and the ideas behind this site.',
  alternates: {
    canonical: '/en/about',
    languages: { 'zh-CN': '/about', 'en-US': '/en/about', 'x-default': '/about' },
  },
  openGraph: {
    type: 'profile',
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
    title: 'About LingYi',
    description: 'About LingYi, the projects he is building, and the ideas behind this site.',
  },
};

export default async function EnglishAboutPage() {
  const about = await getAboutPage('en');
  return <OptimizedAbout about={about} locale="en" />;
}
