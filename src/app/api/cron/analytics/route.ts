import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  collectDailyAnalytics,
  previousShanghaiDate,
  upsertAnalyticsInNotion,
} from '@/lib/analytics-sync.mjs';

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

  try {
    const date = request.nextUrl.searchParams.get('date') || previousShanghaiDate();
    const snapshot = await collectDailyAnalytics({ date });
    const notion = await upsertAnalyticsInNotion(snapshot);
    return NextResponse.json(
      { ok: true, notion, stats: snapshot.stats },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Scheduled analytics sync failed', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: { 'Cache-Control': 'private, no-store' } }
    );
  }
}
