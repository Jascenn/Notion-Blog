import { timingSafeEqual } from 'node:crypto';
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { getPostsOnly } from '@/lib/notion';
import { listActiveSubscribers } from '@/lib/subscribe';
import { buildNewsletterEmail, hasBeenSent, recordSent, sendNewsletterBatch } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization') || '';
  const expected = secret ? `Bearer ${secret}` : '';
  if (!secret || authorization.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authorization), Buffer.from(expected));
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
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const recent = posts.filter(
      (post) => post.type !== 'announcement' && new Date(post.publishedAt).getTime() >= cutoff,
    );

    const results: Array<{ slug: string; status: string; recipients?: number }> = [];
    for (const post of recent) {
      if (await hasBeenSent(post.slug)) {
        results.push({ slug: post.slug, status: 'already-sent' });
        continue;
      }
      const subscribers = await listActiveSubscribers();
      if (subscribers.length === 0) {
        results.push({ slug: post.slug, status: 'no-subscribers' });
        continue;
      }
      const { subject, html } = buildNewsletterEmail(post);
      await sendNewsletterBatch(subscribers, subject, html);
      await recordSent(post.slug, subscribers.length);
      results.push({ slug: post.slug, status: 'sent', recipients: subscribers.length });
    }

    return NextResponse.json(
      { ok: true, checked: recent.length, results },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    Sentry.captureException(error, { tags: { job: 'newsletter-cron', site: 'lingyi.me' } });
    console.error('Newsletter cron failed', error);
    return NextResponse.json({ ok: false, error: 'Newsletter send failed' }, { status: 500 });
  }
}
