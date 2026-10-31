import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/subscribe';
import { renderConfirmEmail, sendTransactionalEmail, signSubscriberToken, siteOrigin } from '@/lib/newsletter';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// 进程内简易限流：同一 IP 每分钟最多 5 次
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || record.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  record.count += 1;
  return record.count > 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: '请求太频繁，请稍后再试。' }, { status: 429 });
  }

  let email = '';
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return NextResponse.json({ error: '请求格式错误。' }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: '请输入有效的邮箱地址。' }, { status: 400 });
  }

  try {
    const result = await subscribeEmail(email);
    if (result.duplicate && result.status === '已订阅') {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    // 新订阅 / 待确认 / 已退订后重新订阅：都发确认邮件完成双重确认
    const siteUrl = siteOrigin();
    const confirmUrl = `${siteUrl}/api/subscribe/confirm?email=${encodeURIComponent(email)}&token=${signSubscriberToken(email)}`;
    const { html, text } = await renderConfirmEmail(confirmUrl);
    await sendTransactionalEmail(email, '确认订阅凌一的博客', html, text);
    return NextResponse.json({ ok: true, needsConfirmation: true });
  } catch (error) {
    console.error('[subscribe] 订阅处理失败', error);
    return NextResponse.json({ error: '订阅失败，请稍后重试。' }, { status: 500 });
  }
}
