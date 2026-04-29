import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  const client = Sentry.getClient();

  return NextResponse.json({
    dsn_present: !!dsn,
    dsn_length: dsn?.length || 0,
    dsn_prefix: dsn ? dsn.substring(0, 30) + '...' : null,
    node_env: process.env.NODE_ENV,
    runtime: process.env.NEXT_RUNTIME,
    vercel_env: process.env.VERCEL_ENV,
    sentry_client_initialized: !!client,
    sentry_client_dsn: client?.getDsn()?.host || null,
  });
}
