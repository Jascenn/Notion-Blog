import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { englishPosts } from '../src/lib/optimized-i18n';

dotenv.config({ path: '.env.local' });

const NOTION_VERSION = '2026-03-11';
const ZH_LANGUAGE = '🇨🇳 Zh-CN';
const EN_LANGUAGE = '🇺🇸 En-US';
const DRAFT_STATUS = '✍️ Draft';
const applyChanges = process.argv.includes('--apply');

type PropertyMap = Record<string, {
  title?: Array<{ plain_text?: string }>;
  rich_text?: Array<{ plain_text?: string }>;
  select?: { name?: string } | null;
  multi_select?: Array<{ name: string }>;
  checkbox?: boolean;
  date?: { start?: string } | null;
}>;

type PageRow = {
  object: 'page';
  id: string;
  url?: string;
  properties: PropertyMap;
};

const token = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token || !databaseId) {
  throw new Error('NOTION_TOKEN/NOTION_SECRET and NOTION_DATABASE_ID are required');
}

const notion = new Client({ auth: token, notionVersion: NOTION_VERSION });

function plainText(items: Array<{ plain_text?: string }> | undefined): string {
  return (items || []).map((item) => item.plain_text || '').join('');
}

function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '$1')
    .replace(/\[([A-Za-z0-9.-]+)\]\(https?:\/\/\1\/?\)/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function isPublished(page: PageRow): boolean {
  return page.properties.Published?.checkbox === true
    || page.properties.Status?.select?.name === '✅ Published';
}

function isPageRow(value: unknown): value is PageRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as { object?: string; id?: string; properties?: unknown };
  return row.object === 'page' && typeof row.id === 'string' && Boolean(row.properties);
}

async function getDataSourceId(): Promise<string> {
  if (process.env.NOTION_DATA_SOURCE_ID) return process.env.NOTION_DATA_SOURCE_ID;
  const database = await notion.databases.retrieve({ database_id: databaseId! });
  if (!('data_sources' in database) || !database.data_sources[0]?.id) {
    throw new Error('No data source found in the configured Notion database');
  }
  return database.data_sources[0].id;
}

async function queryAllPages(dataSourceId: string): Promise<PageRow[]> {
  const rows: PageRow[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: cursor,
      result_type: 'page',
    });
    rows.push(...response.results.filter(isPageRow));
    cursor = response.has_more ? response.next_cursor || undefined : undefined;
  } while (cursor);

  return rows;
}

async function backUpNotion(dataSourceId: string, pages: PageRow[]) {
  const entries = [];
  for (const page of pages) {
    const content = await notion.pages.retrieveMarkdown({ page_id: page.id });
    entries.push({
      id: page.id,
      url: page.url,
      properties: page.properties,
      markdown: content.markdown,
      truncated: content.truncated,
      unknownBlockIds: content.unknown_block_ids,
    });
  }

  const backup = JSON.stringify({
    createdAt: new Date().toISOString(),
    notionVersion: NOTION_VERSION,
    databaseId,
    dataSourceId,
    pages: entries,
  }, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = path.resolve('output/notion-backups');
  const backupPath = path.join(directory, `${timestamp}-before-english-sync.json`);
  const checksum = createHash('sha256').update(backup).digest('hex');

  await mkdir(directory, { recursive: true });
  await writeFile(backupPath, backup, 'utf8');
  await writeFile(`${backupPath}.sha256`, `${checksum}  ${path.basename(backupPath)}\n`, 'utf8');

  return { backupPath, checksum };
}

async function main() {
  const dataSourceId = await getDataSourceId();
  const pages = await queryAllPages(dataSourceId);
  const chineseBySlug = new Map<string, PageRow>();
  const englishBySlug = new Map<string, PageRow>();

  for (const page of pages) {
    const slug = plainText(page.properties.Slug?.rich_text);
    const language = page.properties.Language?.select?.name;
    if (!slug) continue;
    if (language === EN_LANGUAGE) englishBySlug.set(slug, page);
    if (language === ZH_LANGUAGE || !language) {
      const current = chineseBySlug.get(slug);
      if (!current || (isPublished(page) && !isPublished(current))) {
        chineseBySlug.set(slug, page);
      }
    }
  }

  const plan = Object.entries(englishPosts).map(([slug, translation]) => {
    const source = chineseBySlug.get(slug);
    if (!source) throw new Error(`Chinese source page not found for ${slug}`);
    return {
      slug,
      title: translation.title,
      action: englishBySlug.has(slug) ? 'update' : 'create',
      source,
      translation,
    };
  });

  console.log(JSON.stringify({
    mode: applyChanges ? 'apply' : 'dry-run',
    dataSourceId,
    existingPages: pages.length,
    englishPagesBefore: englishBySlug.size,
    planned: plan.map(({ slug, title, action }) => ({ slug, title, action })),
  }, null, 2));

  if (!applyChanges) return;

  const backup = await backUpNotion(dataSourceId, pages);
  console.log(JSON.stringify({ backup }, null, 2));

  const written: Array<{ slug: string; id: string; action: string; verified: boolean }> = [];

  for (const item of plan) {
    const sourceProperties = item.source.properties;
    const publishedDate = sourceProperties['Published Date']?.date?.start;
    const typeName = sourceProperties.Type?.select?.name || '📝 Post';
    const tags = sourceProperties.Tags?.multi_select || [];
    const properties = {
      Title: { title: [{ type: 'text' as const, text: { content: item.translation.title } }] },
      Slug: { rich_text: [{ type: 'text' as const, text: { content: item.slug } }] },
      Summary: { rich_text: [{ type: 'text' as const, text: { content: item.translation.excerpt } }] },
      Published: { checkbox: false },
      Status: { select: { name: DRAFT_STATUS } },
      Type: { select: { name: typeName } },
      Language: { select: { name: EN_LANGUAGE } },
      'Published Date': { date: publishedDate ? { start: publishedDate } : null },
      Tags: { multi_select: tags.map((tag) => ({ name: tag.name })) },
      Pinned: { checkbox: false },
    };

    const existing = englishBySlug.get(item.slug);
    let pageId: string;

    if (existing) {
      await notion.pages.update({ page_id: existing.id, properties });
      await notion.pages.updateMarkdown({
        page_id: existing.id,
        type: 'replace_content',
        replace_content: { new_str: item.translation.content },
      });
      pageId = existing.id;
    } else {
      const created = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        icon: { type: 'emoji', emoji: '🇺🇸' },
        properties,
        markdown: item.translation.content,
      });
      pageId = created.id;
    }

    const readBack = await notion.pages.retrieveMarkdown({ page_id: pageId });
    const verified = normalizeMarkdown(readBack.markdown) === normalizeMarkdown(item.translation.content);
    if (!verified) {
      throw new Error(`Notion read-back mismatch for ${item.slug}`);
    }
    written.push({ slug: item.slug, id: pageId, action: item.action, verified });
  }

  const after = await queryAllPages(dataSourceId);
  const englishAfter = after.filter((page) => page.properties.Language?.select?.name === EN_LANGUAGE);
  console.log(JSON.stringify({
    written,
    englishPagesAfter: englishAfter.length,
    allVerified: written.every((item) => item.verified),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
