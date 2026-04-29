import { NextResponse } from 'next/server';
import { getPostsOnly } from '@/lib/notion';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio').replace(/\/$/, '');

  try {
    const posts = await getPostsOnly();

    const now = new Date().toISOString();

    const urls: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [
      { loc: `${siteUrl}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
      { loc: `${siteUrl}/about`, lastmod: now, changefreq: 'monthly', priority: '0.8' },
      { loc: `${siteUrl}/search`, lastmod: now, changefreq: 'weekly', priority: '0.5' },
    ];

    for (const post of posts) {
      urls.push({
        loc: `${siteUrl}/${post.slug}`,
        lastmod: new Date(post.publishedAt || now).toISOString(),
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(body, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Failed to build sitemap', error);
    return new NextResponse('Sitemap unavailable', { status: 500 });
  }
}
