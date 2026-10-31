import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { markUnsubscribed } from '@/lib/subscribe';
import { recordDeliveryEvent } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

/** Svix 签名校验（Resend webhook 标准）：svix-id + svix-timestamp + 原始 body 的 HMAC */
function verifySvixSignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;
  const id = request.headers.get('svix-id');
  const timestamp = request.headers.get('svix-timestamp');
  const signatures = (request.headers.get('svix-signature') || '').split(' ').filter(Boolean);
  if (!id || !timestamp || signatures.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto.createHmac('sha256', key).update(`${id}.${timestamp}.${rawBody}`).digest('base64');
  return signatures.some((signature) => signature === `v1,${expected}`);
}

interface WebhookEvent {
  type: string;
  data: {
    email?: string;
    email_id?: string;
    message_id?: string;
    to?: string[];
    unsubscribed?: boolean;
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifySvixSignature(request, rawBody)) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  try {
    if (event.type === 'contact.updated' && event.data.unsubscribed && event.data.email) {
      await markUnsubscribed(event.data.email.toLowerCase());
      logger.info('[webhook] 已同步退订', event.data.email);
      return NextResponse.json({ ok: true });
    }

    if (event.type === 'email.bounced' || event.type === 'email.complained') {
      // bounced/complained 的 payload 没有 data.email，收件人只在 data.to 数组里
      const email = (event.data.email || event.data.to?.[0] || '').toLowerCase();
      if (!email) {
        return NextResponse.json({ ok: true, ignored: event.type });
      }
      const messageId = event.data.email_id || event.data.message_id || 'unknown';
      await recordDeliveryEvent(event.type, email, messageId);
      logger.info('[webhook] 已记录投递事件', event.type, email);
      return NextResponse.json({ ok: true });
    }

    // delivered / opened / clicked 等事件暂不落库
    return NextResponse.json({ ok: true, ignored: event.type });
  } catch (error) {
    console.error('[webhook] 处理 Resend 事件失败', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
