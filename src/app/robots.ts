import type { MetadataRoute } from 'next';
import { absoluteSiteUrl, getSiteUrl } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot'],
        allow: '/',
      },
      {
        userAgent: ['ChatGPT-User', 'Claude-User', 'Perplexity-User'],
        allow: '/',
      },
      {
        userAgent: ['GPTBot', 'CCBot', 'Meta-ExternalAgent', 'Google-Extended', 'Bytespider'],
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/views/',
      },
    ],
    sitemap: absoluteSiteUrl('/sitemap.xml'),
    host: getSiteUrl(),
  };
}
