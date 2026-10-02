import type { Metadata } from 'next';
import HomepageVariant from '@/components/demo/HomepageVariants';
import { getPostsOnly } from '@/lib/notion';
import { localizeOptimizedPosts } from '@/lib/optimized-i18n';
import { getSiteUrl } from '@/lib/site-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: { 'zh-CN': '/', 'en-US': '/en', 'x-default': '/' },
  },
};

export default async function Home() {
  const posts = localizeOptimizedPosts(await getPostsOnly(), 'zh');
  const siteUrl = getSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '凌一 LingYi 的博客',
    url: siteUrl,
    description: '全栈开发实践、AI 工具探索、效率工作流与生活随笔，记录从 0 到 1 的构建过程。',
    author: { '@type': 'Person', name: '凌一 LingYi', url: `${siteUrl}/about` },
    inLanguage: ['zh-CN', 'en-US'],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomepageVariant variant="curated" posts={posts} showDemoSwitcher={false} />
    </>
  );
}
