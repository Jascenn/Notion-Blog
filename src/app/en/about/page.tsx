import type { Metadata } from 'next';
import { getAboutPage, getAboutSectionsMarkdown, getConfig } from '@/lib/notion';
import { OptimizedAbout } from '@/components/preview/OptimizedPages';
import { RSS_ALTERNATE_TYPES } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'About',
  description: 'About LingYi, the projects he is building, and the ideas behind this site.',
  alternates: {
    ...RSS_ALTERNATE_TYPES,
    canonical: '/en/about',
    languages: { 'zh-CN': '/about', 'en-US': '/en/about' },
  },
  openGraph: { url: '/en/about' },
};

export default async function EnglishAboutPage() {
  const about = await getAboutPage('en');
  const assembled = await getAboutSectionsMarkdown('en');
  if (about && assembled) about.content = assembled;
  const storyUrl = await getConfig('about-story-url');
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.me').replace(/\/$/, '');
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/en/about/#webpage`,
        url: `${siteUrl}/en/about`,
        mainEntity: { '@id': `${siteUrl}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: '凌一',
        alternateName: ['LingYi', 'Jascen', 'LingYi_Stu'],
        url: siteUrl,
        description: 'Independent AI creator who runs LingYi Tools (lingyi.tools), an AI tools directory, tests AI tools and writes about applied AI, and has long worked on Notion knowledge management.',
        jobTitle: 'Independent AI Creator',
        knowsAbout: ['AI tool reviews and applications', 'AI-assisted coding', 'Notion knowledge management', 'Automation workflows', 'Productivity tools', 'Community operations'],
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
        name: 'Who is LingYi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LingYi is an independent AI creator. He runs LingYi Tools (lingyi.tools), an AI tools directory, tests AI tools and writes about applied AI, and has long worked on Notion knowledge management, running content and products on his own, the one-person-company way. Earlier he spent six years in telecom and IDC operations.',
        },
      },
      {
        '@type': 'Question',
        name: 'What products does LingYi run?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mainly LingYi Tools (lingyi.tools), an AI tools directory, plus smaller products such as Word Radar, Muse Codes, and Site Data Cleaner.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is LingYi Tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'An AI tools directory reviewed by hand, listing over a hundred tools in more than a dozen categories. The recommendation slots only carry tools I have used and am willing to recommend.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I contact LingYi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Email lingyi@lingyi.me. For tool listings and partnerships, use the submission channel on lingyi.tools, or email support@lingyi.tools.',
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <OptimizedAbout about={about} locale="en" storyUrl={storyUrl} />
    </>
  );
}
