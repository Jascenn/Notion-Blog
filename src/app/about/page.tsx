import type { Metadata } from 'next';
import { getAboutPage } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '关于',
  description: '了解凌一的个人经历、创作理念与正在构建的项目。',
  alternates: {
    canonical: '/about',
    languages: { 'zh-CN': '/about', 'en-US': '/en/about' },
  },
};

export default async function AboutPage() {
  const about = await getAboutPage();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.me').replace(/\/$/, '');
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: '凌一 LingYi',
    alternateName: 'LingYi_Stu',
    url: `${siteUrl}/about`,
    image: `${siteUrl}/凌一-头像.png`,
    description: '全栈开发者与 AI 工具构建者，分享技术实践、项目经验与生活思考。',
    sameAs: ['https://github.com/Jascenn'],
    knowsAbout: ['全栈开发', 'AI 工具', 'Claude Code', '效率工作流'],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <OptimizedAbout about={about} />
    </>
  );
}
