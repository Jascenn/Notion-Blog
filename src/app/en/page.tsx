import type { Metadata } from 'next';
import HomepageVariant from '@/components/demo/HomepageVariants';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';
import { getSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'LingYi — Full-stack development, AI tools and workflows',
  description: 'Notes on full-stack development, AI tools, practical workflows and life.',
  alternates: {
    canonical: '/en',
    languages: { 'zh-CN': '/', 'en-US': '/en', 'x-default': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
    title: 'LingYi — Full-stack development, AI tools and workflows',
    description: 'Notes on full-stack development, AI tools, practical workflows and life.',
  },
};

export default async function EnglishHomePage() {
  const posts = localizeOptimizedPosts(await getPostsOnly('en'), 'en');
  const siteUrl = getSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "LingYi's Blog",
    url: `${siteUrl}/en`,
    description: 'Notes on full-stack development, AI tools, practical workflows and life.',
    author: { '@type': 'Person', name: 'LingYi', url: `${siteUrl}/en/about` },
    inLanguage: 'en-US',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomepageVariant variant="curated" posts={posts} showDemoSwitcher={false} routePrefix="/en" locale="en" />
    </>
  );
}
