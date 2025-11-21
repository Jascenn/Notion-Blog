import { NextResponse } from 'next/server';
import { getPostsOnly } from '@/lib/notion';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio').replace(/\/$/, '');

  try {
    const posts = await getPostsOnly();

    const items = posts.map((post) => {
      const link = `${siteUrl}/${post.slug}`;
      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${link}</link>
          <guid isPermaLink="true">${link}</guid>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
          <description><![CDATA[${post.excerpt || ''}]]></description>
        </item>
      `;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${siteUrl}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[来自 ${siteUrl} 的最新文章]]></description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Failed to build RSS feed', error);
    return new NextResponse('RSS feed unavailable', { status: 500 });
  }
}
