import { timingSafeEqual } from 'node:crypto';
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { getPostsOnly } from '@/lib/notion';
import { listActiveSubscribers } from '@/lib/subscribe';
import {
  hasBeenSent,
  recordSent,
  renderDigestEmail,
  sendDigestToRecipients,
  siteOrigin,
} from '@/lib/newsletter';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization') || '';
  const expected = secret ? `Bearer ${secret}` : '';
  if (!secret || authorization.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authorization), Buffer.from(expected));
}

/** 北京时间的本周一（YYYY-MM-DD），用作周刊期号去重 */
function currentWeekMonday(): string {
  const shanghai = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const day = shanghai.getUTCDay();
  const monday = new Date(shanghai.getTime() - ((day + 6) % 7) * 24 * 60 * 60 * 1000);
  return monday.toISOString().slice(0, 10);
}

function formatShanghaiDate(iso: string): string {
  const date = new Date(new Date(iso).getTime() + 8 * 60 * 60 * 1000);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${month}.${day}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: true, skipped: 'RESEND_API_KEY 未配置，跳过发送' },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  try {
    const posts = await getPostsOnly();
    const windowDays = Number(process.env.NEWSLETTER_DIGEST_DAYS || 7);
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    const recent = posts.filter(
      (post) => post.type !== 'announcement' && new Date(post.publishedAt).getTime() >= cutoff,
    );

    if (recent.length === 0) {
      return NextResponse.json(
        { ok: true, checked: 0, skipped: 'no-posts' },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    const monday = currentWeekMonday();
    const issueSlug = `digest-${monday}`;
    if (await hasBeenSent(issueSlug)) {
      return NextResponse.json(
        { ok: true, skipped: 'already-sent', issue: issueSlug },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    const subscribers = await listActiveSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json(
        { ok: true, skipped: 'no-subscribers' },
        { headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    const siteUrl = siteOrigin();
    const sunday = new Date(new Date(`${monday}T00:00:00Z`).getTime() + 6 * 24 * 60 * 60 * 1000);
    const issueLabel = `本周 ${recent.length} 篇更新 · ${monday.slice(5).replace('-', '.')} - ${sunday.toISOString().slice(5, 10).replace('-', '.')}`;
    const digestPosts = recent
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map((post) => ({
        title: post.title,
        excerpt: post.excerpt || '',
        url: `${siteUrl}/${post.slug}`,
        coverUrl: post.cover ? (post.cover.startsWith('http') ? post.cover : `${siteUrl}${post.cover}`) : undefined,
        dateLabel: formatShanghaiDate(post.publishedAt),
      }));

    const subject = `凌一 newsletter｜本周 ${recent.length} 篇更新（${monday.slice(5).replace('-', '.')} - ${sunday.toISOString().slice(5, 10).replace('-', '.')}）`;
    const { html, text } = await renderDigestEmail(digestPosts, issueLabel);
    await sendDigestToRecipients(subscribers, subject, html, text);
    await recordSent(issueSlug, subscribers.length);

    return NextResponse.json(
      { ok: true, issue: issueSlug, posts: recent.length, recipients: subscribers.length },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    Sentry.captureException(error, { tags: { job: 'newsletter-cron', site: 'lingyi.me' } });
    console.error('Newsletter cron failed', error);
    return NextResponse.json({ ok: false, error: 'Newsletter send failed' }, { status: 500 });
  }
}
