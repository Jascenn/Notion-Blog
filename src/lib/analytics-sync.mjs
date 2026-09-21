import { Client } from '@notionhq/client';

const DEFAULT_GATEWAY = 'https://gateway-us.umami.is/api';
const DEFAULT_TIME_ZONE = 'Asia/Shanghai';
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_RICH_TEXT_LENGTH = 1_900;
const METRIC_TYPES = ['path', 'referrer', 'channel', 'country', 'device', 'browser', 'os', 'event'];

function required(value, name) {
  if (!value) throw new Error(`Missing required configuration: ${name}`);
  return value;
}

function assertDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid date "${value}". Expected YYYY-MM-DD.`);
  }

  const [year, month, day] = value.split('-').map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date "${value}".`);
  }

  return value;
}

export function previousShanghaiDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DEFAULT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const current = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const previousCalendarDate = new Date(
    Date.UTC(Number(current.year), Number(current.month) - 1, Number(current.day) - 1)
  );
  return previousCalendarDate.toISOString().slice(0, 10);
}

export function rangeForShanghaiDate(date) {
  const normalized = assertDate(date);
  const startAt = new Date(`${normalized}T00:00:00+08:00`).getTime();
  return { startAt, endAt: startAt + 86_400_000 };
}

async function requestJson(url, options = {}, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${body.slice(0, 300)}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
      }
    }
  }

  throw lastError;
}

async function getShareToken({ gateway, shareSlug }) {
  const data = await requestJson(`${gateway}/share/${encodeURIComponent(shareSlug)}`, {
    headers: { Accept: 'application/json' },
  });
  return required(data.token, 'Umami share token');
}

async function umamiGet({ gateway, websiteId, token, path, params }) {
  const url = new URL(`${gateway}/websites/${websiteId}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  return requestJson(url, {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer undefined',
      'x-umami-share-context': '1',
      'x-umami-share-token': token,
    },
  });
}

function normalizeMetric(items, keyName) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({ [keyName]: item.x || '', count: Number(item.y || 0) }));
}

async function collectShareRange({ gateway, shareSlug, websiteId, range, unit = 'day' }) {
  const cleanGateway = gateway.replace(/\/$/, '');
  const token = await getShareToken({
    gateway: cleanGateway,
    shareSlug: required(shareSlug, 'UMAMI_SHARE_SLUG'),
  });
  const context = {
    gateway: cleanGateway,
    websiteId: required(websiteId, 'UMAMI_WEBSITE_ID'),
    token,
  };
  const [stats, pageviews, ...metrics] = await Promise.all([
    umamiGet({ ...context, path: 'stats', params: range }),
    umamiGet({
      ...context,
      path: 'pageviews',
      params: { ...range, unit, timezone: DEFAULT_TIME_ZONE },
    }),
    ...METRIC_TYPES.map((type) =>
      umamiGet({ ...context, path: 'metrics', params: { ...range, type, limit: 500 } })
    ),
  ]);

  return {
    stats,
    pageviews,
    metricMap: Object.fromEntries(METRIC_TYPES.map((type, index) => [type, metrics[index]])),
    websiteId: context.websiteId,
  };
}

export async function collectAnalyticsRange({
  startAt,
  endAt,
  unit = 'day',
  gateway = process.env.UMAMI_SHARE_GATEWAY || DEFAULT_GATEWAY,
  shareSlug = process.env.UMAMI_SHARE_SLUG,
  websiteId = process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
} = {}) {
  if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || startAt >= endAt) {
    throw new Error('Invalid analytics range. Expected finite startAt < endAt timestamps.');
  }

  const collected = await collectShareRange({
    gateway,
    shareSlug,
    websiteId,
    range: { startAt, endAt },
    unit,
  });

  return {
    schemaVersion: 1,
    provider: 'umami-share',
    website: 'lingyi.bio',
    websiteId: collected.websiteId,
    generatedAt: new Date().toISOString(),
    timeZone: DEFAULT_TIME_ZONE,
    stats: collected.stats,
    pageviews: collected.pageviews,
    metrics: collected.metricMap,
  };
}

export async function collectDailyAnalytics({
  date = previousShanghaiDate(),
  gateway = process.env.UMAMI_SHARE_GATEWAY || DEFAULT_GATEWAY,
  shareSlug = process.env.UMAMI_SHARE_SLUG,
  websiteId = process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
} = {}) {
  const normalizedDate = assertDate(date);
  const range = rangeForShanghaiDate(normalizedDate);
  const collected = await collectShareRange({ gateway, shareSlug, websiteId, range });
  const { stats, pageviews, metricMap } = collected;

  const visits = Number(stats.visits || 0);

  return {
    schemaVersion: 1,
    provider: 'umami-share',
    website: 'lingyi.bio',
    websiteId: collected.websiteId,
    generatedAt: new Date().toISOString(),
    timeZone: DEFAULT_TIME_ZONE,
    date: normalizedDate,
    range,
    stats: {
      pageviews: Number(stats.pageviews || 0),
      visitors: Number(stats.visitors || 0),
      visits,
      bounces: Number(stats.bounces || 0),
      totalTimeSeconds: Number(stats.totaltime || 0),
      averageTimeSeconds: visits
        ? Math.round((Number(stats.totaltime || 0) / visits) * 10) / 10
        : 0,
    },
    pageviews,
    metrics: {
      pages: normalizeMetric(metricMap.path, 'path'),
      referrers: normalizeMetric(metricMap.referrer, 'source'),
      countries: normalizeMetric(metricMap.country, 'country'),
      devices: normalizeMetric(metricMap.device, 'device'),
      browsers: normalizeMetric(metricMap.browser, 'browser'),
      operatingSystems: normalizeMetric(metricMap.os, 'os'),
      events: normalizeMetric(metricMap.event, 'event'),
    },
  };
}

function richText(value) {
  return [{ type: 'text', text: { content: String(value).slice(0, MAX_RICH_TEXT_LENGTH) } }];
}

function notionProperties(snapshot) {
  const topPages = snapshot.metrics.pages
    .slice(0, 5)
    .map((item) => `${item.path || '/'} (${item.count})`)
    .join('、');
  const primarySource = snapshot.metrics.referrers[0]?.source || '直接访问';

  return {
    Name: { title: richText(snapshot.date) },
    日期: { date: { start: snapshot.date } },
    浏览量: { number: snapshot.stats.pageviews },
    访客: { number: snapshot.stats.visitors },
    会话: { number: snapshot.stats.visits },
    跳出: { number: snapshot.stats.bounces },
    平均停留秒: { number: snapshot.stats.averageTimeSeconds },
    热门页面: { rich_text: richText(topPages || '无') },
    主要来源: { rich_text: richText(primarySource) },
    备注: { rich_text: [] },
  };
}

function propertyValue(property) {
  if (!property) return null;
  if (property.type === 'number') return property.number;
  if (property.type === 'date') return property.date?.start || null;
  if (property.type === 'title')
    return property.title?.map((item) => item.plain_text).join('') || '';
  if (property.type === 'rich_text') {
    return property.rich_text?.map((item) => item.plain_text).join('') || '';
  }
  return null;
}

function desiredValue(property) {
  if ('number' in property) return property.number;
  if ('date' in property) return property.date?.start || null;
  if ('title' in property) return property.title?.map((item) => item.text.content).join('') || '';
  if ('rich_text' in property)
    return property.rich_text?.map((item) => item.text.content).join('') || '';
  return null;
}

function hasChanges(page, desired) {
  return Object.entries(desired).some(
    ([name, property]) => propertyValue(page.properties?.[name]) !== desiredValue(property)
  );
}

export async function upsertAnalyticsInNotion(
  snapshot,
  {
    notionToken = process.env.NOTION_ANALYTICS_TOKEN || process.env.NOTION_TOKEN,
    dataSourceId = process.env.NOTION_ANALYTICS_DATA_SOURCE_ID,
  } = {}
) {
  const notion = new Client({
    auth: required(notionToken, 'NOTION_ANALYTICS_TOKEN or NOTION_TOKEN'),
  });
  const sourceId = required(dataSourceId, 'NOTION_ANALYTICS_DATA_SOURCE_ID');
  const desired = notionProperties(snapshot);
  const existing = await notion.dataSources.query({
    data_source_id: sourceId,
    filter: { property: '日期', date: { equals: snapshot.date } },
    page_size: 10,
  });

  if (existing.results.length > 1) {
    throw new Error(
      `Found ${existing.results.length} Notion rows for ${snapshot.date}; refusing to guess.`
    );
  }

  const page = existing.results[0];
  if (!page) {
    const created = await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: sourceId },
      properties: desired,
    });
    return { status: 'created', pageId: created.id, date: snapshot.date };
  }

  if (!('properties' in page) || !hasChanges(page, desired)) {
    return { status: 'unchanged', pageId: page.id, date: snapshot.date };
  }

  await notion.pages.update({ page_id: page.id, properties: desired });
  return { status: 'updated', pageId: page.id, date: snapshot.date };
}
