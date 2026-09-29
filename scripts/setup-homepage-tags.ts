import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_VERSION = '2026-03-11';
const ZH_LANGUAGE = '🇨🇳 Zh-CN';
const LEGACY_PROPERTY_NAME = '首页位置';
const TAG_PROPERTY_NAME = 'Tags';
const applyChanges = process.argv.includes('--apply');
const editorialTags = [
  { name: '封面文章', slot: 'cover', color: 'blue' as const },
  { name: '精选 02', slot: 'second', color: 'purple' as const },
  { name: '精选 03', slot: 'third', color: 'green' as const },
] as const;
const editorialTagNames = new Set<string>(editorialTags.map((tag) => tag.name));

const token = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token || !databaseId) {
  throw new Error('NOTION_TOKEN/NOTION_SECRET and NOTION_DATABASE_ID are required');
}

const notion = new Client({ auth: token, notionVersion: NOTION_VERSION, timeoutMs: 120_000 });

type MultiSelectOption = {
  id?: string;
  name: string;
  color?: string;
  description?: string | null;
};

type PageRow = {
  object: 'page';
  id: string;
  last_edited_time: string;
  properties: Record<string, {
    title?: Array<{ plain_text?: string }>;
    rich_text?: Array<{ plain_text?: string }>;
    select?: { name?: string } | null;
    multi_select?: MultiSelectOption[];
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

function tagNames(page: PageRow): string[] {
  return (page.properties[TAG_PROPERTY_NAME]?.multi_select || []).map((tag) => tag.name);
}

function editorialTag(page: PageRow): string | undefined {
  return tagNames(page).find((name) => editorialTagNames.has(name));
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

async function backUp(dataSourceId: string, schema: unknown, pages: PageRow[]) {
  const directory = path.resolve('output/notion-backups');
  await mkdir(directory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(directory, `${timestamp}-before-homepage-tags.json`);
  const pageSnapshot = pages.map((page) => ({
    id: page.id,
    title: text(page.properties.Title?.title),
    slug: text(page.properties.Slug?.rich_text),
    tags: tagNames(page),
    legacyHomepageSlot: page.properties[LEGACY_PROPERTY_NAME]?.select?.name || null,
  }));
  const payload = `${JSON.stringify({ dataSourceId, schema, pages: pageSnapshot }, null, 2)}\n`;
  const checksum = createHash('sha256').update(payload).digest('hex');
  await writeFile(backupPath, payload, { mode: 0o600 });
  await writeFile(`${backupPath}.sha256`, `${checksum}  ${path.basename(backupPath)}\n`, { mode: 0o600 });
  return { dataSourceId, backupPath, checksum };
}

function resolveAssignments(pages: PageRow[]): Map<string, string> {
  const assignments = new Map<string, string>();
  const claimed = new Set<string>();

  // A rerun keeps explicit editorial Tags as the source of truth.
  for (const page of pages) {
    const tag = editorialTag(page);
    if (tag && !claimed.has(tag)) {
      assignments.set(page.id, tag);
      claimed.add(tag);
    }
  }

  // First migration: carry over the old temporary property when a Tag is not set yet.
  for (const page of pages) {
    const legacy = page.properties[LEGACY_PROPERTY_NAME]?.select?.name;
    if (legacy && editorialTagNames.has(legacy) && !claimed.has(legacy)) {
      assignments.set(page.id, legacy);
      claimed.add(legacy);
    }
  }

  // Brand-new setup: fill any still-empty positions with the newest unused articles.
  for (const tag of editorialTags) {
    if (claimed.has(tag.name)) continue;
    const page = pages.find((candidate) => !assignments.has(candidate.id));
    if (!page) break;
    assignments.set(page.id, tag.name);
    claimed.add(tag.name);
  }

  return assignments;
}

async function main() {
  const dataSourceId = await getDataSourceId();
  const schema = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const pages = await queryChinesePages(dataSourceId);
  const assignments = resolveAssignments(pages);
  const planned = pages
    .filter((page) => assignments.has(page.id))
    .map((page) => ({
      id: page.id,
      title: text(page.properties.Title?.title),
      slug: text(page.properties.Slug?.rich_text),
      existingTags: tagNames(page),
      editorialTag: assignments.get(page.id),
    }));

  console.log(JSON.stringify({
    mode: applyChanges ? 'apply' : 'dry-run',
    dataSourceId,
    sourceOfTruth: TAG_PROPERTY_NAME,
    removeLegacyProperty: LEGACY_PROPERTY_NAME,
    planned,
  }, null, 2));

  if (!applyChanges) return;

  const backup = await backUp(dataSourceId, schema, pages);
  console.log(JSON.stringify({ backup }, null, 2));

  const properties = 'properties' in schema ? schema.properties : undefined;
  const tagsProperty = properties?.[TAG_PROPERTY_NAME];
  if (!tagsProperty || tagsProperty.type !== 'multi_select') {
    throw new Error(`${TAG_PROPERTY_NAME} must be an existing multi-select property`);
  }

  const existingOptions = tagsProperty.multi_select.options;
  const existingNames = new Set(existingOptions.map((option) => option.name));
  const missingOptions = editorialTags.filter((tag) => !existingNames.has(tag.name));
  if (missingOptions.length > 0) {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: {
        [TAG_PROPERTY_NAME]: {
          type: 'multi_select',
          multi_select: {
            options: [
              ...existingOptions.map((option) => ({
                id: option.id,
                name: option.name,
                color: option.color,
                description: option.description,
              })),
              ...missingOptions.map((option) => ({ name: option.name, color: option.color })),
            ],
          },
        },
      },
    });
  }

  for (const page of pages) {
    const ordinaryTags = tagNames(page).filter((name) => !editorialTagNames.has(name));
    const assigned = assignments.get(page.id);
    const nextTags = assigned ? [...ordinaryTags, assigned] : ordinaryTags;
    if (JSON.stringify(nextTags) === JSON.stringify(tagNames(page))) continue;
    await notion.pages.update({
      page_id: page.id,
      properties: {
        [TAG_PROPERTY_NAME]: { multi_select: nextTags.map((name) => ({ name })) },
      },
    });
  }

  if (properties?.[LEGACY_PROPERTY_NAME]) {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: { [LEGACY_PROPERTY_NAME]: null },
    });
  }

  const verifiedSchema = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const verifiedPages = await queryChinesePages(dataSourceId);
  const verified = verifiedPages.flatMap((page) => {
    const tags = tagNames(page).filter((name) => editorialTagNames.has(name));
    return tags.map((tag) => ({
      slug: text(page.properties.Slug?.rich_text),
      tag,
      allTags: tagNames(page),
    }));
  });
  const counts = Object.fromEntries(editorialTags.map((tag) => [
    tag.name,
    verified.filter((item) => item.tag === tag.name).length,
  ]));
  const schemaProperties = 'properties' in verifiedSchema ? verifiedSchema.properties : undefined;
  const ordinaryTagsPreserved = pages.every((before) => {
    const after = verifiedPages.find((page) => page.id === before.id);
    if (!after) return false;
    const afterNames = new Set(tagNames(after));
    return tagNames(before)
      .filter((name) => !editorialTagNames.has(name))
      .every((name) => afterNames.has(name));
  });
  const allVerified = editorialTags.every((tag) => counts[tag.name] === 1)
    && !schemaProperties?.[LEGACY_PROPERTY_NAME]
    && ordinaryTagsPreserved;

  console.log(JSON.stringify({
    verified,
    counts,
    legacyPropertyRemoved: !schemaProperties?.[LEGACY_PROPERTY_NAME],
    ordinaryTagsPreserved,
    allVerified,
  }, null, 2));

  if (!allVerified) throw new Error('Notion homepage Tags verification failed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
