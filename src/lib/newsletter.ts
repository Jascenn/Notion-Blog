import { Client } from '@notionhq/client';
import { logger } from '@/lib/logger';
import { getFirstDataSourceId } from '@/lib/subscribe';

const SENT_LOG_TITLE = '发送记录';
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
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!retryable(error)) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
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

export function buildNewsletterEmail(post: { title: string; excerpt?: string; slug: string }): {
  subject: string;
  html: string;
} {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.me').replace(/\/$/, '');
  const link = `${siteUrl}/${post.slug}`;
  const subject = post.title;
  const html = `
<div style="max-width:560px;margin:0 auto;font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.7;color:#1f2937;">
  <h2 style="margin:24px 0 8px;"><a href="${link}" style="color:#111827;text-decoration:none;">${post.title}</a></h2>
  <p style="margin:0 0 16px;color:#6b7280;">${post.excerpt || ''}</p>
  <p style="margin:0 0 24px;"><a href="${link}" style="color:#2563eb;">阅读全文 →</a></p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 12px;" />
  <p style="margin:0;font-size:12px;color:#9ca3af;">来自凌一的博客 · 你收到这封邮件是因为订阅了 lingyi.me 的文章更新，如不想继续接收请回复告知。</p>
</div>`;
  return { subject, html };
}

export async function sendNewsletterBatch(recipients: string[], subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY 未配置');
  const domain = ['lingyi', 'me'].join('.');
  const from = process.env.NEWSLETTER_FROM || `LingYi <newsletter@${domain}>`;

  for (let start = 0; start < recipients.length; start += 50) {
    const batch = recipients.slice(start, start + 50);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [from], bcc: batch, subject, html }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend 发送失败 ${response.status}: ${body.slice(0, 200)}`);
    }
  }
  logger.info('[newsletter] 已发送', recipients.length, '位订阅者');
}
