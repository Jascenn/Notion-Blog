import type { Metadata } from 'next';
import { getAboutPost, getAboutContacts, getConfig } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'About · Optimized Preview',
  robots: { index: false, follow: false },
};

export default async function OptimizedEnglishAboutPage() {
  const about = await getAboutPost('en', true);
  const storyUrl = await getConfig('about-story-url', true);
  const contacts = await getAboutContacts(true);
  return <OptimizedAbout about={about} locale="en" storyUrl={storyUrl} contacts={contacts} />;
}
