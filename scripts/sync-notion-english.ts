import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NOTION_VERSION = '2026-03-11';
const ZH_LANGUAGE = '🇨🇳 Zh-CN';
const EN_LANGUAGE = '🇺🇸 En-US';
const DRAFT_STATUS = '✍️ Draft';
const PUBLISHED_STATUS = '✅ Published';
const applyChanges = process.argv.includes('--apply');
const verifyOnly = process.argv.includes('--verify-only');
const publishTranslations = process.argv.includes('--publish');
const requestedSlugs = (process.argv.find((argument) => argument.startsWith('--slugs='))?.slice('--slugs='.length)
  || process.argv.find((argument) => argument.startsWith('--slug='))?.slice('--slug='.length)
  || '')
  .split(',')
  .filter(Boolean);
const reuseBackupPath = process.argv.find((argument) => argument.startsWith('--reuse-backup='))?.slice('--reuse-backup='.length);
const translationRoot = path.resolve('output/translations');

const translationMetadata = {
  '20251018-essay-post': {
    title: 'October 18, 2025 — Notes',
    excerpt: 'A few lessons and small tips from sharing community operations content.',
  },
  '20251019-essay-post': {
    title: 'October 19, 2025 — Notes',
    excerpt: 'Today I suddenly realized I have been writing for 875 days. Time really flies.',
  },
  '20251020-essay-post': {
    title: 'October 20, 2025 — Notes',
    excerpt: 'Today I finally launched the websites I built.',
  },
  '20251021-essay-post': {
    title: 'October 21, 2025 — Notes',
    excerpt: 'Share the result first, and the feeling that someone is watching will keep you moving.',
  },
  '20251024-essay-post': {
    title: 'October 23, 2025 — Notes',
    excerpt: 'ChatGPT Atlas is here.',
  },
  '20251220-essay-post': {
    title: 'December 20, 2025 — Notes',
    excerpt: 'It simply is not for me.',
  },
  '20251228-sui-sui-nian': {
    title: 'December 28, 2025 — Notes',
    excerpt: 'A few recent updates, including renewals for the accountability community.',
  },
  '20260102-2025-report': {
    title: 'Goodbye, 2025. Hello, 2026.',
    excerpt: 'My 2025 annual review.',
  },
  '20260106-ai-quanzhan': {
    title: 'Building a Full-Stack Project with AI-Assisted Programming',
    excerpt: 'I finally completed a full-stack project from scratch.',
  },
  'blog-stack-notes': {
    title: '🚀 Architecture Notes: My Blog Technology Stack',
    excerpt: 'The technology choices behind this site, from Notion to the frontend framework and deployment.',
  },
  'my-first-post': {
    title: '🌟 My First Post',
    excerpt: 'My first blog post, and a brief introduction to why I started writing.',
  },
} as const;

const captionOverrides: Record<string, Record<number, string>> = {
  '20260102-2025-report': {
    2: 'Notion Calendar — September daily records',
  },
};

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

type RichTextRequest = {
  type: 'text';
  text: { content: string; link?: { url: string } | null };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
};

type BlockRow = {
  object: 'block';
  id: string;
  type: string;
  has_children: boolean;
  [key: string]: unknown;
};

type MediaDescriptor = {
  blockId: string;
  type: 'image' | 'file' | 'pdf';
  url: string;
  filename: string;
  internal: boolean;
  caption: RichTextRequest[];
};

type Translation = {
  slug: keyof typeof translationMetadata;
  title: string;
  excerpt: string;
  content: string;
};

const token = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token || !databaseId) {
  throw new Error('NOTION_TOKEN/NOTION_SECRET and NOTION_DATABASE_ID are required');
}

const notion = new Client({
  auth: token,
  notionVersion: NOTION_VERSION,
  // Large screenshots in the source articles can take several minutes to
  // cross the user's network. The SDK default of 60 seconds is too short.
  timeoutMs: 10 * 60 * 1000,
});

function plainText(items: Array<{ plain_text?: string }> | undefined): string {
  return (items || []).map((item) => item.plain_text || '').join('');
}

function normalizeMarkdown(markdown: string): string {
  let mediaIndex = 0;
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/^!\[.*\]\(.*\)(?: \{[^\n]*\})?$/gm, () => `[[MEDIA_${++mediaIndex}]]`)
    .replace(/^<(?:file|pdf|audio|video)\b[^>]*>.*<\/(?:file|pdf|audio|video)>$/gm, () => `[[MEDIA_${++mediaIndex}]]`)
    .replace(/\[(https?:\/\/[^\]]+)\]\(\1\)/g, '$1')
    .replace(/\[([A-Za-z0-9.-]+)\]\(https?:\/\/\1\/?\)/g, '$1')
    // Notion automatically turns bare localhost addresses into Markdown links.
    // Treat that presentation-only normalization as equivalent to the source.
    .replace(/\[localhost:(\d+)\]\(http:\/\/localhost:\1\/?\)/g, 'localhost:$1')
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

function isBlockRow(value: unknown): value is BlockRow {
  if (!value || typeof value !== 'object') return false;
  const row = value as { object?: string; id?: string; type?: string };
  return row.object === 'block' && typeof row.id === 'string' && typeof row.type === 'string';
}

function requestRichText(value: unknown): RichTextRequest[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): RichTextRequest[] => {
    if (!item || typeof item !== 'object') return [];
    const richText = item as {
      type?: string;
      plain_text?: string;
      text?: { content?: string; link?: { url?: string } | null };
      href?: string | null;
      annotations?: RichTextRequest['annotations'];
    };
    if (richText.type !== 'text') return [];
    const content = richText.text?.content ?? richText.plain_text ?? '';
    const url = richText.text?.link?.url ?? richText.href ?? undefined;
    return [{
      type: 'text',
      text: { content, ...(url ? { link: { url } } : {}) },
      annotations: richText.annotations,
    }];
  });
}

function captionFor(slug: string, imageIndex: number, sourceCaption: RichTextRequest[]): RichTextRequest[] {
  const override = captionOverrides[slug]?.[imageIndex];
  if (!override) return sourceCaption;
  return [{ type: 'text', text: { content: override } }];
}

function safeFilename(url: string, fallback: string): string {
  try {
    const value = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).at(-1) || fallback);
    return value.length <= 180 ? value : fallback;
  } catch {
    return fallback;
  }
}

function mediaFromBlock(block: BlockRow, requireUrl = true): MediaDescriptor | null {
  if (!['image', 'file', 'pdf'].includes(block.type)) return null;
  const type = block.type as MediaDescriptor['type'];
  const payload = block[type] as {
    type?: string;
    file?: { url?: string };
    external?: { url?: string };
    caption?: unknown;
    name?: string;
  } | undefined;
  const url = payload?.file?.url || payload?.external?.url || '';
  if (requireUrl && !url) throw new Error(`No downloadable URL found for ${type} block ${block.id}`);
  const extension = type === 'image' ? 'png' : type === 'pdf' ? 'pdf' : 'bin';
  return {
    blockId: block.id,
    type,
    url,
    filename: payload?.name || safeFilename(url, `${type}-${block.id}.${extension}`),
    internal: payload?.type === 'file' || Boolean(payload?.file),
    caption: requestRichText(payload?.caption),
  };
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

async function listBlockTree(blockId: string): Promise<BlockRow[]> {
  const rows: BlockRow[] = [];
  let cursor: string | undefined;
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor,
    });
    for (const result of response.results) {
      if (!isBlockRow(result)) continue;
      rows.push(result);
      if (result.has_children) rows.push(...await listBlockTree(result.id));
    }
    cursor = response.has_more ? response.next_cursor || undefined : undefined;
  } while (cursor);
  return rows;
}

async function getPageMedia(pageId: string, requireUrl = true): Promise<MediaDescriptor[]> {
  const blocks = await listBlockTree(pageId);
  return blocks
    .map((block) => mediaFromBlock(block, requireUrl))
    .filter((media): media is MediaDescriptor => Boolean(media));
}

async function loadTranslations(): Promise<Translation[]> {
  const entries = Object.entries(translationMetadata).filter(([slug]) => requestedSlugs.length === 0 || requestedSlugs.includes(slug));
  if (requestedSlugs.length > 0 && entries.length !== requestedSlugs.length) {
    const known = new Set(entries.map(([slug]) => slug));
    throw new Error(`Unknown translation slug(s): ${requestedSlugs.filter((slug) => !known.has(slug)).join(', ')}`);
  }
  return Promise.all(entries.map(async ([slug, metadata]) => ({
    slug: slug as keyof typeof translationMetadata,
    ...metadata,
    content: await readFile(path.join(translationRoot, slug, 'translation.md'), 'utf8'),
  })));
}

function validateTranslationStructure(translation: Translation, media: MediaDescriptor[]) {
  const images = media.filter((item) => item.type === 'image');
  const files = media.filter((item) => item.type !== 'image');
  const imageTokens = [...translation.content.matchAll(/\[\[IMAGE_(\d+)\]\]/g)].map((match) => Number(match[1]));
  const fileTokens = [...translation.content.matchAll(/\[\[FILE_(\d+)\]\]/g)].map((match) => Number(match[1]));
  const expectedImages = images.map((_, index) => index + 1);
  const expectedFiles = files.map((_, index) => index + 1);
  if (JSON.stringify(imageTokens) !== JSON.stringify(expectedImages)) {
    throw new Error(`${translation.slug}: image placeholders ${imageTokens} do not match source images ${expectedImages}`);
  }
  if (JSON.stringify(fileTokens) !== JSON.stringify(expectedFiles)) {
    throw new Error(`${translation.slug}: file placeholders ${fileTokens} do not match source files ${expectedFiles}`);
  }
  if (/[\u3400-\u9fff]/u.test(translation.content)) {
    throw new Error(`${translation.slug}: untranslated Chinese characters remain in translation.md`);
  }
}

function captionText(caption: RichTextRequest[]): string {
  return caption.map((item) => item.text.content).join('').replace(/[\[\]]/g, '');
}

function materializeMarkdown(translation: Translation, media: MediaDescriptor[]): string {
  const images = media.filter((item) => item.type === 'image');
  const files = media.filter((item) => item.type !== 'image');
  let content = translation.content;

  images.forEach((image, index) => {
    const caption = captionFor(translation.slug, index + 1, image.caption);
    content = content.replace(`[[IMAGE_${index + 1}]]`, `![${captionText(caption)}](${image.url})`);
  });
  files.forEach((file, index) => {
    const caption = captionText(file.caption);
    content = content.replace(
      `[[FILE_${index + 1}]]`,
      `<${file.type} src="${file.url}">${caption}</${file.type}>`,
    );
  });
  return content;
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

async function reuseBackup(backupPath: string) {
  const absolutePath = path.resolve(backupPath);
  const [backup, checksumFile] = await Promise.all([
    readFile(absolutePath, 'utf8'),
    readFile(`${absolutePath}.sha256`, 'utf8'),
  ]);
  const checksum = createHash('sha256').update(backup).digest('hex');
  if (!checksumFile.startsWith(checksum)) {
    throw new Error(`Backup checksum mismatch: ${absolutePath}`);
  }
  return { backupPath: absolutePath, checksum };
}

async function downloadMedia(media: MediaDescriptor): Promise<{ bytes: ArrayBuffer; contentType: string }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(media.url, { signal: AbortSignal.timeout(5 * 60 * 1000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type')?.split(';')[0] || 'application/octet-stream';
      return { bytes: await response.arrayBuffer(), contentType };
    } catch (error) {
      lastError = error;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
  const cause = lastError instanceof Error && lastError.cause ? `; cause=${String(lastError.cause)}` : '';
  throw new Error(`Failed to download ${media.filename} after 4 attempts: ${String(lastError)}${cause}`);
}

async function uploadToNotion(media: MediaDescriptor): Promise<string> {
  const { bytes, contentType } = await downloadMedia(media);
  if (bytes.byteLength > 20 * 1024 * 1024) {
    throw new Error(`${media.filename} is larger than the 20 MiB direct-upload limit`);
  }
  const created = await notion.fileUploads.create({
    mode: 'single_part',
    filename: media.filename,
    content_type: contentType,
  });
  const sent = await notion.fileUploads.send({
    file_upload_id: created.id,
    file: {
      filename: media.filename,
      data: new Blob([bytes], { type: contentType }),
    },
  });
  if (sent.status !== 'uploaded') {
    throw new Error(`Notion did not finish uploading ${media.filename}; status=${sent.status}`);
  }
  return sent.id;
}

async function replaceTargetMedia(
  slug: string,
  sourceMedia: MediaDescriptor[],
  targetMedia: MediaDescriptor[],
) {
  if (sourceMedia.length !== targetMedia.length) {
    throw new Error(`${slug}: target has ${targetMedia.length} media blocks; expected ${sourceMedia.length}`);
  }

  let imageIndex = 0;
  for (let index = 0; index < sourceMedia.length; index += 1) {
    const source = sourceMedia[index];
    const target = targetMedia[index];
    if (source.type !== target.type) {
      throw new Error(`${slug}: media ${index + 1} type mismatch (${source.type} vs ${target.type})`);
    }
    if (source.type === 'image') imageIndex += 1;
    const caption = source.type === 'image'
      ? captionFor(slug, imageIndex, source.caption)
      : source.caption;
    const attachment = source.internal
      ? { file_upload: { id: await uploadToNotion(source) } }
      : { external: { url: source.url } };
    const value = {
      ...attachment,
      caption,
      ...(source.type === 'file' ? { name: source.filename } : {}),
    };
    await notion.blocks.update({
      block_id: target.blockId,
      [target.type]: value,
    } as Parameters<typeof notion.blocks.update>[0]);
  }
}

async function main() {
  if (publishTranslations && !applyChanges) {
    throw new Error('--publish must be used together with --apply');
  }
  if (publishTranslations && verifyOnly) {
    throw new Error('--publish and --verify-only cannot be used together');
  }

  const translations = await loadTranslations();
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

  const plan = [];
  for (const translation of translations) {
    const source = chineseBySlug.get(translation.slug);
    if (!source) throw new Error(`Chinese source page not found for ${translation.slug}`);
    const sourceMedia = await getPageMedia(source.id);
    validateTranslationStructure(translation, sourceMedia);
    plan.push({
      slug: translation.slug,
      title: translation.title,
      action: englishBySlug.has(translation.slug) ? 'update' : 'create',
      source,
      sourceMedia,
      translation,
    });
  }

  console.log(JSON.stringify({
    mode: verifyOnly ? 'verify-only' : publishTranslations ? 'publish' : applyChanges ? 'apply' : 'dry-run',
    dataSourceId,
    existingPages: pages.length,
    englishPagesBefore: englishBySlug.size,
    planned: plan.map(({ slug, title, action, sourceMedia }) => ({
      slug,
      title,
      action,
      images: sourceMedia.filter((item) => item.type === 'image').length,
      files: sourceMedia.filter((item) => item.type !== 'image').length,
    })),
  }, null, 2));

  if (verifyOnly) {
    const verified = [];
    for (const item of plan) {
      const existing = englishBySlug.get(item.slug);
      if (!existing) throw new Error(`${item.slug}: English page does not exist`);
      const markdown = materializeMarkdown(item.translation, item.sourceMedia);
      const [readBack, targetMedia] = await Promise.all([
        notion.pages.retrieveMarkdown({ page_id: existing.id }),
        getPageMedia(existing.id, false),
      ]);
      const mediaTypesMatch = targetMedia.length === item.sourceMedia.length
        && targetMedia.every((target, index) => target.type === item.sourceMedia[index]?.type && Boolean(target.url));
      const contentMatches = normalizeMarkdown(readBack.markdown) === normalizeMarkdown(markdown);
      verified.push({
        slug: item.slug,
        contentMatches,
        mediaTypesMatch,
        media: targetMedia.length,
        truncated: readBack.truncated,
        unknownBlocks: readBack.unknown_block_ids.length,
      });
    }
    console.log(JSON.stringify({
      verified,
      allVerified: verified.every((item) => item.contentMatches
        && item.mediaTypesMatch
        && !item.truncated
        && item.unknownBlocks === 0),
    }, null, 2));
    return;
  }

  if (!applyChanges) return;

  const backup = reuseBackupPath
    ? await reuseBackup(reuseBackupPath)
    : await backUpNotion(dataSourceId, pages);
  console.log(JSON.stringify({ backup }, null, 2));

  if (publishTranslations) {
    const published = [];
    for (const item of plan) {
      const existing = englishBySlug.get(item.slug);
      if (!existing) throw new Error(`${item.slug}: English page does not exist`);

      const markdown = materializeMarkdown(item.translation, item.sourceMedia);
      const [readBack, targetMedia] = await Promise.all([
        notion.pages.retrieveMarkdown({ page_id: existing.id }),
        getPageMedia(existing.id, false),
      ]);
      const contentMatches = normalizeMarkdown(readBack.markdown) === normalizeMarkdown(markdown);
      const mediaTypesMatch = targetMedia.length === item.sourceMedia.length
        && targetMedia.every((target, index) => target.type === item.sourceMedia[index]?.type && Boolean(target.url));
      if (!contentMatches || !mediaTypesMatch || readBack.truncated || readBack.unknown_block_ids.length > 0) {
        throw new Error(`${item.slug}: refusing to publish because content verification failed`);
      }

      await notion.pages.update({
        page_id: existing.id,
        properties: {
          Published: { checkbox: true },
          Status: { select: { name: PUBLISHED_STATUS } },
        },
      });
      const updated = await notion.pages.retrieve({ page_id: existing.id });
      if (!isPageRow(updated) || !isPublished(updated)) {
        throw new Error(`${item.slug}: publish status did not persist`);
      }
      published.push({ slug: item.slug, id: existing.id, verified: true });
    }
    console.log(JSON.stringify({ published, allPublished: published.length === plan.length }, null, 2));
    return;
  }

  const written: Array<{ slug: string; id: string; action: string; verified: boolean; media: number }> = [];

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
    const markdown = materializeMarkdown(item.translation, item.sourceMedia);
    const existing = englishBySlug.get(item.slug);
    let pageId: string;

    if (existing) {
      await notion.pages.update({ page_id: existing.id, properties });
      await notion.pages.updateMarkdown({
        page_id: existing.id,
        type: 'replace_content',
        replace_content: { new_str: markdown },
      });
      pageId = existing.id;
    } else {
      const created = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        icon: { type: 'emoji', emoji: '🇺🇸' },
        properties,
        markdown,
      });
      pageId = created.id;
    }

    const targetMedia = await getPageMedia(pageId, false);
    await replaceTargetMedia(item.slug, item.sourceMedia, targetMedia);
    const readBack = await notion.pages.retrieveMarkdown({ page_id: pageId });
    if (readBack.truncated || readBack.unknown_block_ids.length > 0) {
      throw new Error(`${item.slug}: Notion read-back was truncated or contained unknown blocks`);
    }
    const verified = normalizeMarkdown(readBack.markdown) === normalizeMarkdown(markdown);
    if (!verified) {
      const directory = path.resolve('output/notion-sync-mismatches');
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, `${item.slug}-expected.md`), normalizeMarkdown(markdown), 'utf8');
      await writeFile(path.join(directory, `${item.slug}-actual.md`), normalizeMarkdown(readBack.markdown), 'utf8');
      throw new Error(`Notion read-back mismatch for ${item.slug}`);
    }
    written.push({
      slug: item.slug,
      id: pageId,
      action: item.action,
      verified,
      media: targetMedia.length,
    });
    console.log(JSON.stringify({ synced: written.at(-1) }));
  }

  const after = await queryAllPages(dataSourceId);
  const englishAfter = after.filter((page) => page.properties.Language?.select?.name === EN_LANGUAGE);
  console.log(JSON.stringify({
    backup,
    written,
    englishPagesAfter: englishAfter.length,
    allVerified: written.every((item) => item.verified),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
