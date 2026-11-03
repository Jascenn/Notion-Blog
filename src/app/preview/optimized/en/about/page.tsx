import type { Metadata } from 'next';
import { getAboutPage, getAboutSectionsMarkdown, getConfig } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'About · Optimized Preview',
  robots: { index: false, follow: false },
};

export default async function OptimizedEnglishAboutPage() {
  const about = await getAboutPage('en');
  const assembled = await getAboutSectionsMarkdown('en', true);
  if (about && assembled) about.content = assembled;
  const storyUrl = await getConfig('about-story-url', true);
  return <OptimizedAbout about={about} locale="en" storyUrl={storyUrl} />;
}
