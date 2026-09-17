import { NextResponse } from 'next/server';
import { getPostsOnly } from '@/lib/notion';

export const revalidate = 3600; // 1 hour

export async function GET() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio').replace(/\/$/, '');

  try {
    const posts = await getPostsOnly();

    const newestPostUpdate = posts.reduce<string | undefined>((latest, post) => {
      const candidate = post.updatedAt || post.publishedAt;
      if (!candidate || Number.isNaN(Date.parse(candidate))) return latest;
      if (!latest || Date.parse(candidate) > Date.parse(latest)) return candidate;
      return latest;
    }, undefined);

    const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [
      { loc: `${siteUrl}/`, lastmod: newestPostUpdate, changefreq: 'daily', priority: '1.0' },
      { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.8' },
    ];

    for (const post of posts) {
      urls.push({
        loc: `${siteUrl}/${post.slug}`,
        lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>
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
