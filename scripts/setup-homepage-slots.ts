import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_VERSION = '2026-03-11';
const ZH_LANGUAGE = '🇨🇳 Zh-CN';
const PROPERTY_NAME = '首页位置';
const applyChanges = process.argv.includes('--apply');
const options = [
  { name: '封面文章', color: 'blue' as const },
  { name: '精选 02', color: 'purple' as const },
  { name: '精选 03', color: 'green' as const },
  { name: '不展示', color: 'gray' as const },
];

const token = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token || !databaseId) {
  throw new Error('NOTION_TOKEN/NOTION_SECRET and NOTION_DATABASE_ID are required');
}

const notion = new Client({ auth: token, notionVersion: NOTION_VERSION, timeoutMs: 120_000 });

type PageRow = {
  object: 'page';
  id: string;
  last_edited_time: string;
  properties: Record<string, {
    title?: Array<{ plain_text?: string }>;
    rich_text?: Array<{ plain_text?: string }>;
    select?: { name?: string } | null;
    checkbox?: boolean;
    date?: { start?: string } | null;
  }>;
};

function isPageRow(value: unknown): value is PageRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as { object?: string; id?: string; properties?: unknown };
  return row.object === 'page' && typeof row.id === 'string' && Boolean(row.properties);
}

function text(items: Array<{ plain_text?: string }> | undefined): string {
  return (items || []).map((item) => item.plain_text || '').join('');
}

async function getDataSourceId(): Promise<string> {
  if (process.env.NOTION_DATA_SOURCE_ID) return process.env.NOTION_DATA_SOURCE_ID;
  const database = await notion.databases.retrieve({ database_id: databaseId! });
  const source = 'data_sources' in database ? database.data_sources?.[0] : undefined;
  if (!source?.id) throw new Error('No Notion data source found');
  return source.id;
}

async function queryChinesePages(dataSourceId: string): Promise<PageRow[]> {
  const rows: PageRow[] = [];
  let cursor: string | undefined;
  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
      filter: {
        and: [
          {
            or: [
              { property: 'Status', select: { equals: '✅ Published' } },
              { property: 'Published', checkbox: { equals: true } },
            ],
          },
          {
            or: [
              { property: 'Language', select: { equals: ZH_LANGUAGE } },
              { property: 'Language', select: { is_empty: true } },
            ],
          },
        ],
      },
      sorts: [{ property: 'Published Date', direction: 'descending' }],
    });
    rows.push(...response.results.filter(isPageRow));
    cursor = response.has_more ? response.next_cursor || undefined : undefined;
  } while (cursor);
  return rows.filter((page) => {
    const type = page.properties.Type?.select?.name?.toLowerCase();
    return type !== 'page' && type !== 'announcement';
  });
}

async function backUpSchema(dataSourceId: string, schema: unknown) {
  const directory = path.resolve('output/notion-backups');
  await mkdir(directory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(directory, `${timestamp}-before-homepage-slots.json`);
  const payload = `${JSON.stringify(schema, null, 2)}\n`;
  const checksum = createHash('sha256').update(payload).digest('hex');
  await writeFile(backupPath, payload, { mode: 0o600 });
  await writeFile(`${backupPath}.sha256`, `${checksum}  ${path.basename(backupPath)}\n`, { mode: 0o600 });
  return { dataSourceId, backupPath, checksum };
}

async function main() {
  const dataSourceId = await getDataSourceId();
  const schema = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const pages = await queryChinesePages(dataSourceId);
  const currentTopThree = pages.slice(0, 3).map((page, index) => ({
    id: page.id,
    title: text(page.properties.Title?.title),
    slug: text(page.properties.Slug?.rich_text),
    publishedAt: page.properties['Published Date']?.date?.start || page.last_edited_time,
    slot: options[index].name,
  }));

  console.log(JSON.stringify({
    mode: applyChanges ? 'apply' : 'dry-run',
    dataSourceId,
    property: PROPERTY_NAME,
    options: options.map((option) => option.name),
    currentTopThree,
  }, null, 2));

  if (!applyChanges) return;

  const backup = await backUpSchema(dataSourceId, schema);
  console.log(JSON.stringify({ backup }, null, 2));

  const existingProperty = 'properties' in schema ? schema.properties?.[PROPERTY_NAME] : undefined;
  const hasAssignments = pages.some((page) => Boolean(page.properties[PROPERTY_NAME]?.select?.name));
  if (!existingProperty) {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: {
        [PROPERTY_NAME]: {
          type: 'select',
          select: { options },
        },
      },
    });
  }

  const refreshed = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const property = 'properties' in refreshed ? refreshed.properties?.[PROPERTY_NAME] : undefined;
  if (!property || property.type !== 'select') {
    throw new Error(`Notion property ${PROPERTY_NAME} was not created as a select`);
  }

  const selectedNames = new Set(property.select.options.map((option) => option.name));
  for (const option of options) {
    if (!selectedNames.has(option.name)) throw new Error(`Missing Notion option: ${option.name}`);
  }

  if (!existingProperty || !hasAssignments) {
    for (const item of currentTopThree) {
      await notion.pages.update({
        page_id: item.id,
        properties: { [PROPERTY_NAME]: { select: { name: item.slot } } },
      });
    }
  }

  const verified = [];
  const pagesAfter = await queryChinesePages(dataSourceId);
  for (const page of pagesAfter) {
    const value = page.properties[PROPERTY_NAME]?.select?.name;
    if (!value || value === '不展示') continue;
    verified.push({ slug: text(page.properties.Slug?.rich_text), slot: value });
  }

  const uniqueSlots = new Set(verified.map((item) => item.slot));
  console.log(JSON.stringify({
    seededDefaults: !existingProperty || !hasAssignments,
    verified,
    allVerified: ['封面文章', '精选 02', '精选 03'].every((slot) => uniqueSlots.has(slot)),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
