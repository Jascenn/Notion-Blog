import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 手动 capture，绕开 onRequestError 钩子
  Sentry.captureMessage('Sentry smoke test (manual captureMessage) — ' + new Date().toISOString(), 'error');
  Sentry.captureException(new Error('Sentry smoke test (manual captureException) — ' + new Date().toISOString()));

  // 等 flush 把队列发出（serverless 退出前）
  await Sentry.flush(2000);

  // 然后再 throw 测自动捕获
  throw new Error('Sentry smoke test (auto onRequestError) — ' + new Date().toISOString());
}
