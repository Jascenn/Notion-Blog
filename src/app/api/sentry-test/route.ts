import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  throw new Error('Sentry integration smoke test — this should appear in Sentry dashboard');
  return NextResponse.json({ ok: true });
}
