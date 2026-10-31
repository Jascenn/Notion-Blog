import crypto from 'node:crypto';
import { Client } from '@notionhq/client';
import { render } from '@react-email/render';
import { logger } from '@/lib/logger';
import { getFirstDataSourceId } from '@/lib/subscribe';
import { ConfirmEmail, WelcomeEmail } from '@/lib/emails/transactional-emails';
import DigestEmail, { type DigestPost } from '@/lib/emails/digest-email';

const SENT_LOG_TITLE = '发送记录';
const UNSUB_PLACEHOLDER = '{{UNSUB_URL}}';
let sentLogDataSourceId: string | null = null;

function notionClient(): Client {
  return new Client({ auth: process.env.NOTION_TOKEN || process.env.NOTION_SECRET });
}

function retryable(error: unknown): boolean {
  const status = (error as { status?: number }).status;
  const code = (error as { code?: string }).code;
  return status === 429 || status === 500 || status === 502 || status === 503 || code === 'rate_limited';
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!retryable(error)) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw lastError;
}

async function createSentLogDataSource(notion: Client, parentPageId: string): Promise<string> {
  const database = await withRetry(() =>
    notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: SENT_LOG_TITLE } }],
      initial_data_source: {
        properties: {
          Slug: { title: {} },
          SentAt: { date: {} },
          Recipients: { number: {} },
        },
      },
    }),
  );
  const dataSourceId = getFirstDataSourceId(database);
  if (!dataSourceId) throw new Error('创建发送记录数据库成功但未返回 data source id');
  return dataSourceId;
}

export async function ensureSentLogDataSource(): Promise<string> {
  if (sentLogDataSourceId) return sentLogDataSourceId;

  const configuredId = process.env.NEWSLETTER_SENT_LOG_DATABASE_ID;
  if (configuredId) {
    const database = await withRetry(() => notionClient().databases.retrieve({ database_id: configuredId }));
    const dataSourceId = getFirstDataSourceId(database);
    if (!dataSourceId) throw new Error('发送记录数据库没有可用的 data source');
    sentLogDataSourceId = dataSourceId;
    return dataSourceId;
  }

  const parentPageId = process.env.NOTION_SUBSCRIBERS_PARENT_PAGE_ID;
  if (!parentPageId) {
    throw new Error('NEWSLETTER_SENT_LOG_DATABASE_ID 或 NOTION_SUBSCRIBERS_PARENT_PAGE_ID 未配置');
  }

  const notion = notionClient();
  try {
    sentLogDataSourceId = await createSentLogDataSource(notion, parentPageId);
  } catch (error) {
    const response = await withRetry(() =>
      notion.search({ filter: { property: 'object', value: 'data_source' }, query: SENT_LOG_TITLE, page_size: 10 }),
    );
    const found = response.results.find((result) =>
      (result as { title?: Array<{ plain_text?: string }> }).title?.some((text) => text.plain_text === SENT_LOG_TITLE),
    );
    if (!found?.id) throw error;
    sentLogDataSourceId = found.id;
  }
  return sentLogDataSourceId;
}

export async function hasBeenSent(slug: string): Promise<boolean> {
  const dataSourceId = await ensureSentLogDataSource();
  const response = await withRetry(() =>
    notionClient().dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: 'Slug', title: { equals: slug } },
      page_size: 1,
    }),
  );
  return response.results.length > 0;
}

export async function recordSent(slug: string, recipients: number): Promise<void> {
  const dataSourceId = await ensureSentLogDataSource();
  await withRetry(() =>
    notionClient().pages.create({
      parent: { type: 'data_source_id', data_source_id: dataSourceId },
      properties: {
        Slug: { title: [{ text: { content: slug } }] },
        SentAt: { date: { start: new Date().toISOString() } },
        Recipients: { number: recipients },
      },
    }),
  );
}

/** 退信 / 投诉等投递事件写入发送记录，同一条事件只记一次 */
export async function recordDeliveryEvent(type: string, email: string, messageId: string): Promise<void> {
  const slug = `${type}:${email}:${messageId}`;
  if (await hasBeenSent(slug)) return;
  await recordSent(slug, 1);
}

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.me').replace(/\/$/, '');
}

/** 订阅确认 token：HMAC 截断即可防伪造，不需要可逆 */
export function signSubscriberToken(email: string): string {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET || process.env.CRON_SECRET;
  if (!secret) throw new Error('NEWSLETTER_TOKEN_SECRET 或 CRON_SECRET 未配置，无法签发订阅确认链接');
  return crypto.createHmac('sha256', secret).update(email).digest('hex').slice(0, 32);
}

export function verifySubscriberToken(email: string, token: string): boolean {
  const expected = signSubscriberToken(email);
  if (typeof token !== 'string' || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

async function resendRequest<T>(path: string, body?: unknown): Promise<T> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY 未配置');
  const response = await fetch(`https://api.resend.com${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'lingyi-blog-newsletter/1.0',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend ${path} 失败 ${response.status}: ${text.slice(0, 200)}`);
  }
  return (await response.json()) as T;
}

export function newsletterFrom(): string {
  const domain = ['lingyi', 'me'].join('.');
  return process.env.NEWSLETTER_FROM || `LingYi <newsletter@${domain}>`;
}

export async function sendTransactionalEmail(to: string, subject: string, html: string, text: string): Promise<void> {
  await resendRequest('/emails', { from: newsletterFrom(), to, subject, html, text });
}

/** 一键退订链接：GET 出确认页，POST 直接收订（RFC 8058 One-Click） */
export function unsubscribeUrl(email: string): string {
  return `${siteOrigin()}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${signSubscriberToken(email)}`;
}

export async function renderConfirmEmail(confirmUrl: string): Promise<{ html: string; text: string }> {
  return {
    html: await render(<ConfirmEmail confirmUrl={confirmUrl} />),
    text: await render(<ConfirmEmail confirmUrl={confirmUrl} />, { plainText: true }),
  };
}

export async function renderWelcomeEmail(posts: Array<{ title: string; url: string }>): Promise<{ html: string; text: string }> {
  const siteUrl = siteOrigin();
  return {
    html: await render(<WelcomeEmail siteUrl={siteUrl} posts={posts} />),
    text: await render(<WelcomeEmail siteUrl={siteUrl} posts={posts} />, { plainText: true }),
  };
}

export async function renderDigestEmail(posts: DigestPost[], issueLabel: string): Promise<{ html: string; text: string }> {
  return {
    html: await render(<DigestEmail posts={posts} issueLabel={issueLabel} siteUrl={siteOrigin()} />),
    text: await render(<DigestEmail posts={posts} issueLabel={issueLabel} siteUrl={siteOrigin()} />, {
      plainText: true,
    }),
  };
}

/**
 * 逐人发送周刊：现有 Resend key 仅 Sending access，无法管理 Audience/Broadcast，
 * 改为每人一封，退订链接与 List-Unsubscribe 头按收件人个性化（Gmail/Yahoo 合规）
 */
export async function sendDigestToRecipients(recipients: string[], subject: string, html: string, text: string): Promise<void> {
  for (const email of recipients) {
    const unsub = unsubscribeUrl(email);
    await resendRequest('/emails', {
      from: newsletterFrom(),
      to: [email],
      subject,
      html: html.replaceAll(UNSUB_PLACEHOLDER, unsub),
      text: text.replaceAll(UNSUB_PLACEHOLDER, unsub),
      headers: {
        'List-Unsubscribe': `<${unsub}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
  }
  logger.info('[newsletter] 周刊已逐人发送', recipients.length, '位订阅者');
}
