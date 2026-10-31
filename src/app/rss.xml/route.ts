import { NextResponse } from 'next/server';
import { getPostsOnly } from '@/lib/notion';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.me').replace(/\/$/, '');

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
    <title><![CDATA[凌一 LingYi的博客]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[全栈开发实践、AI 工具探索、效率工作流与生活随笔，记录从 0 到 1 的构建过程。]]></description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
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
