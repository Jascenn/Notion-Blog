import type { Metadata } from 'next';
import { getAboutPage, getAboutSectionsMarkdown, getAboutContacts, getConfig } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '关于 · 优化版预览',
  robots: { index: false, follow: false },
};

export default async function OptimizedAboutPage() {
  const about = await getAboutPage();
  const assembled = await getAboutSectionsMarkdown('zh', true);
  if (about && assembled) about.content = assembled;
  const storyUrl = await getConfig('about-story-url', true);
  const contacts = await getAboutContacts(true);
  return <OptimizedAbout about={about} storyUrl={storyUrl} contacts={contacts} />;
}
