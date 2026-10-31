import { NextRequest, NextResponse } from 'next/server';
import { getPostsOnly } from '@/lib/notion';
import { confirmSubscriber } from '@/lib/subscribe';
import { renderWelcomeEmail, sendTransactionalEmail, siteOrigin, verifySubscriberToken } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

function page(title: string, body: string, ok: boolean): NextResponse {
  const color = ok ? '#37352f' : '#c0392b';
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title}</title></head>
<body style="margin:0;background:#f7f7f5;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;">
  <main style="max-width:560px;margin:64px auto;padding:32px 28px;background:#fff;border-radius:8px;">
    <h1 style="margin:0 0 12px;font-size:20px;color:${color};">${title}</h1>
    <p style="margin:0;font-size:15px;line-height:1.7;color:#787774;">${body}</p>
  </main>
</body></html>`;
  return new NextResponse(html, { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } });
}

export async function GET(request: NextRequest) {
  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  const token = request.nextUrl.searchParams.get('token') || '';
  if (!email || !token) {
    return page('链接无效', '确认链接缺少参数，请回到订阅页重新提交邮箱。', false);
  }

  try {
    if (!verifySubscriberToken(email, token)) {
      return page('链接无效', '确认链接校验失败或已过期，请回到订阅页重新提交邮箱。', false);
    }

    const changed = await confirmSubscriber(email);
    if (!changed) {
      return page('订阅已确认', '这个邮箱已在订阅名单中，无需重复确认。', true);
    }

    const siteUrl = siteOrigin();
    const latest = (await getPostsOnly())
      .filter((post) => post.type !== 'announcement')
      .slice(0, 3)
      .map((post) => ({ title: post.title, url: `${siteUrl}/${post.slug}` }));
    const { html, text } = await renderWelcomeEmail(latest);
    await sendTransactionalEmail(email, '欢迎订阅凌一的博客', html, text);

    return page('订阅已确认', '欢迎加入！之后每周一早上会收到一封汇总本周更新的邮件，欢迎邮件正在路上。', true);
  } catch (error) {
    console.error('[subscribe] 确认订阅失败', error);
    return page('确认失败', '处理确认请求时出现问题，请稍后重试或回到订阅页重新提交邮箱。', false);
  }
}
