import { Client } from '@notionhq/client';
import type { GetDatabaseResponse } from '@notionhq/client';
import { logger } from '@/lib/logger';

// 「订阅名单」库由接口首次调用时在共享父页面下自动创建，
// 避免要求用户在 Notion 里手工按固定字段名建库
let subscribersDataSourceId: string | null = null;

const SUBSCRIBERS_DB_TITLE = '订阅名单';

export function getFirstDataSourceId(database: GetDatabaseResponse): string | null {
  if (!('data_sources' in database)) return null;
  return database.data_sources[0]?.id ?? null;
}

function isRetryableNotionError(error: unknown): boolean {
  const status = (error as { status?: number; code?: string }).status;
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
      if (!isRetryableNotionError(error)) break;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function createSubscribersDataSource(notion: Client, parentPageId: string): Promise<string> {
  const database = await withRetry(() =>
    notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: SUBSCRIBERS_DB_TITLE } }],
      initial_data_source: {
        properties: {
          Email: { title: {} },
          状态: {
            select: {
              options: [{ name: '已订阅' }, { name: '已退订' }],
            },
          },
        },
      },
    }),
  );
  const dataSourceId = getFirstDataSourceId(database);
  if (!dataSourceId) {
    throw new Error('创建订阅名单数据库成功但未返回 data source id');
  }
  logger.info('[subscribe] 已创建订阅名单数据库', dataSourceId);
  return dataSourceId;
}

async function findSubscribersDataSource(notion: Client): Promise<string | null> {
  const response = await withRetry(() =>
    notion.search({
      filter: { property: 'object', value: 'data_source' },
      query: SUBSCRIBERS_DB_TITLE,
      page_size: 10,
    }),
  );
  const found = response.results.find((result) =>
    (result as { title?: Array<{ plain_text?: string }> }).title?.some(
      (text) => text.plain_text === SUBSCRIBERS_DB_TITLE,
    ),
  );
  return found?.id ?? null;
}

export async function ensureSubscribersDataSource(): Promise<string> {
  if (subscribersDataSourceId) return subscribersDataSourceId;

  const configuredId = process.env.NOTION_SUBSCRIBERS_DATABASE_ID;
  if (configuredId) {
    const notion = new Client({ auth: process.env.NOTION_TOKEN || process.env.NOTION_SECRET });
    const database = await withRetry(() => notion.databases.retrieve({ database_id: configuredId }));
    const dataSourceId = getFirstDataSourceId(database);
    if (!dataSourceId) throw new Error('订阅名单数据库没有可用的 data source');
    subscribersDataSourceId = dataSourceId;
    return dataSourceId;
  }

  const parentPageId = process.env.NOTION_SUBSCRIBERS_PARENT_PAGE_ID;
  if (!parentPageId) {
    throw new Error('NOTION_SUBSCRIBERS_DATABASE_ID 或 NOTION_SUBSCRIBERS_PARENT_PAGE_ID 未配置');
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN || process.env.NOTION_SECRET });
  try {
    subscribersDataSourceId = await createSubscribersDataSource(notion, parentPageId);
  } catch (error) {
    // 上次创建可能成功但响应丢失，此时按标题找回
    const existingId = await findSubscribersDataSource(notion);
    if (!existingId) throw error;
    subscribersDataSourceId = existingId;
  }
  return subscribersDataSourceId;
}

export async function listActiveSubscribers(): Promise<string[]> {
  const notion = new Client({ auth: process.env.NOTION_TOKEN || process.env.NOTION_SECRET });
  const dataSourceId = await ensureSubscribersDataSource();
  const emails: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await withRetry(() =>
      notion.dataSources.query({
        data_source_id: dataSourceId,
        filter: {
          property: '状态',
          select: { equals: '已订阅' },
        },
        page_size: 100,
        start_cursor: cursor,
      }),
    );
    for (const page of response.results) {
      const email = (page as { properties?: Record<string, { title?: Array<{ plain_text?: string }> }> })
        .properties?.Email?.title?.[0]?.plain_text;
      if (email) emails.push(email);
    }
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return emails;
}

export type SubscribeStatus = '待确认' | '已订阅' | '已退订';

export async function subscribeEmail(email: string): Promise<{ duplicate: boolean; status: SubscribeStatus | null }> {
  const dataSourceId = await ensureSubscribersDataSource();
  const notion = new Client({ auth: process.env.NOTION_TOKEN || process.env.NOTION_SECRET });

  const existing = await withRetry(() =>
    notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: 'Email',
        title: { equals: email },
      },
      page_size: 1,
    }),
  );
  if (existing.results.length > 0) {
    const status = (existing.results[0] as { properties?: Record<string, { select?: { name?: string } }> })
      .properties?.状态?.select?.name;
    return { duplicate: true, status: (status as SubscribeStatus) ?? null };
  }

  await withRetry(() =>
    notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: dataSourceId },
      properties: {
        Email: { title: [{ text: { content: email } }] },
        // 双重确认：先落「待确认」，点击确认邮件后才进入正式名单
        状态: { select: { name: '待确认' } },
      },
    }),
  );
  return { duplicate: false, status: null };
}

async function findSubscriberPageId(notion: Client, dataSourceId: string, email: string): Promise<string | null> {
  const response = await withRetry(() =>
    notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: 'Email', title: { equals: email } },
      page_size: 1,
    }),
  );
  return response.results[0]?.id ?? null;
}

/** 确认订阅：待确认 / 已退订 → 已订阅，返回是否发生了状态变化 */
export async function confirmSubscriber(email: string): Promise<boolean> {
  const dataSourceId = await ensureSubscribersDataSource();
  const notion = new Client({ auth: process.env.NOTION_TOKEN || process.env.NOTION_SECRET });
  const pageId = await findSubscriberPageId(notion, dataSourceId, email);
  if (!pageId) return false;

  const page = await withRetry(() => notion.pages.retrieve({ page_id: pageId }) as Promise<{
    properties?: Record<string, { select?: { name?: string } }>;
  }>);
  const current = page.properties?.状态?.select?.name;
  await withRetry(() =>
    notion.pages.update({ page_id: pageId, properties: { 状态: { select: { name: '已订阅' } } } }),
  );
  return current !== '已订阅';
}

/** Resend webhook 退订同步；邮箱不存在时静默忽略 */
export async function markUnsubscribed(email: string): Promise<boolean> {
  const dataSourceId = await ensureSubscribersDataSource();
  const notion = new Client({ auth: process.env.NOTION_TOKEN || process.env.NOTION_SECRET });
  const pageId = await findSubscriberPageId(notion, dataSourceId, email);
  if (!pageId) return false;
  await withRetry(() =>
    notion.pages.update({ page_id: pageId, properties: { 状态: { select: { name: '已退订' } } } }),
  );
  return true;
}
