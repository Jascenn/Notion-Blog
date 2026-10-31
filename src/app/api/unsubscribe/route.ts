import { NextRequest, NextResponse } from 'next/server';
import { markUnsubscribed } from '@/lib/subscribe';
import { verifySubscriberToken } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

function page(title: string, body: string, extra = ''): NextResponse {
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title}</title></head>
<body style="margin:0;background:#f7f7f5;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;">
  <main style="max-width:560px;margin:64px auto;padding:32px 28px;background:#fff;border-radius:8px;">
    <h1 style="margin:0 0 12px;font-size:20px;color:#37352f;">${title}</h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#787774;">${body}</p>
    ${extra}
  </main>
</body></html>`;
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } });
}

export async function GET(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const token = request.nextUrl.searchParams.get('token') || '';
  if (!email || !verifySubscriberToken(email, token)) {
    return page('链接无效', '退订链接校验失败，请直接回复邮件联系我们处理。');
  }
  const extra = `<form method="post" action="/api/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}" style="margin-top:20px;">
    <button type="submit" style="background:#37352f;color:#fff;border:none;border-radius:6px;padding:10px 20px;font-size:14px;cursor:pointer;">确认退订</button>
  </form>`;
  return page('确认退订', `即将为 ${email} 退订 lingyi.me 的周刊邮件，确认后立即生效。`, extra);
}

export async function POST(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const token = request.nextUrl.searchParams.get('token') || '';
  if (!email || !verifySubscriberToken(email, token)) {
    return page('链接无效', '退订链接校验失败，请直接回复邮件联系我们处理。');
  }

  try {
    await markUnsubscribed(email);
    // One-Click POST（邮件客户端发起）要求 200/202 返回；浏览器表单也复用这个结果页
    return page('已退订', `${email} 已退订周刊邮件，不会再收到更新通知。RSS 订阅不受影响。`);
  } catch (error) {
    console.error('[unsubscribe] 退订处理失败', error);
    return page('退订失败', '处理退订请求时出现问题，请稍后重试或直接回复邮件联系我们。');
  }
}
