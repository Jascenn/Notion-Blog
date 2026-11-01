import type { Metadata } from 'next';
import { getAboutPage } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';
import { RSS_ALTERNATE_TYPES } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: '关于',
  description: '了解凌一的个人经历、创作理念与正在构建的项目。',
  alternates: {
    ...RSS_ALTERNATE_TYPES,
    canonical: '/about',
    languages: { 'zh-CN': '/about', 'en-US': '/en/about' },
  },
  openGraph: { url: '/about' },
};

export default async function AboutPage() {
  const about = await getAboutPage();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.me').replace(/\/$/, '');
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/about/#webpage`,
        url: `${siteUrl}/about`,
        mainEntity: { '@id': `${siteUrl}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: '凌一',
        alternateName: ['LingYi', 'Jascen', 'LingYi_Stu'],
        url: siteUrl,
        description: '独立 AI 创作者，运营着 AI 工具导航 lingyi.tools，做 AI 工具测评与应用，也长期做 Notion 知识管理。',
        jobTitle: '独立 AI 创作者',
        knowsAbout: ['AI 工具测评与应用', 'AI 编程', 'Notion 知识管理', '自动化工作流', '效率工具', '社群运营'],
        sameAs: [
          'https://github.com/Jascenn',
          'https://x.com/LingYi_Stu',
          'https://www.linkedin.com/in/%E6%96%87-%E7%BD%97-b61694316/',
          'https://lingyi.tools',
          'https://radar.lingyi.tools',
        ],
        worksFor: { '@type': 'Organization', name: 'LingYi Tools', url: 'https://lingyi.tools' },
      },
    ],
  };
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '凌一是谁？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '凌一（LingYi）是独立 AI 创作者，运营着 AI 工具导航 lingyi.tools，做 AI 工具测评与应用，也长期做 Notion 知识管理，一个人按一人企业的方式做内容和产品。早年做过 6 年电信与 IDC 运维。',
        },
      },
      {
        '@type': 'Question',
        name: '凌一运营了哪些产品？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '主要运营 AI 工具导航 LingYi Tools（lingyi.tools），另外还运营新词雷达、Muse Codes、Site Data Cleaner 等小产品。',
        },
      },
      {
        '@type': 'Question',
        name: 'LingYi Tools 是什么？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '一个人工审核的 AI 工具导航站，收录了一百多个工具、十几个分类，推荐位只放我用过、也愿意推荐的工具。',
        },
      },
      {
        '@type': 'Question',
        name: '怎么联系凌一？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '邮箱 lingyi@lingyi.me；工具收录与合作走 lingyi.tools 的投稿入口，或邮件 support@lingyi.tools。',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <OptimizedAbout about={about} />
    </>
  );
}
