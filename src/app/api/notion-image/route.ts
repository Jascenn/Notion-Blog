import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Notion 附件图片代理
 *
 * 参数：
 * - u: 原始附件 URL（必须是允许的 Notion/AWS 域名）
 * - b: 图片所属 block id（可选，签名过期时用它向 Notion API 换新签名）
 * - p: 图片所属 page id（可选，用于 cover 的兜底刷新）
 *
 * v 参数是去掉签名后的资源路径，仅用于稳定缓存键；图片内容变化时路径也会变化。
 * 成功响应带长期浏览器/CDN缓存头，签名过期后仍可继续提供已缓存内容。
 */

const ALLOWED_HOST_SUFFIXES = ['.amazonaws.com', '.notion.so'];
const IMAGE_FETCH_TIMEOUT_MS = 15000;

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return false;
    return ALLOWED_HOST_SUFFIXES.some((suffix) => url.hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

let cachedClient: Client | null = null;
function notionClient(): Client | null {
  const token = process.env.NOTION_TOKEN || process.env.NOTION_SECRET;
  if (!token) return null;
  if (!cachedClient) cachedClient = new Client({ auth: token });
  return cachedClient;
}

interface FileishUrl {
  file?: { url?: string };
  external?: { url?: string };
}

/** 用 block/page id 向 Notion API 换取新的签名 URL */
async function resolveFreshUrl(blockId?: string | null, pageId?: string | null): Promise<string | null> {
  const notion = notionClient();
  if (!notion) return null;

  try {
    if (blockId) {
      const block = await notion.blocks.retrieve({ block_id: blockId });
      if ('type' in block && typeof block.type === 'string') {
        const content = (block as unknown as Record<string, unknown>)[block.type] as FileishUrl | undefined;
        const url = content?.file?.url || content?.external?.url;
        if (url && isAllowedUrl(url)) return url;
      }
    }
    if (pageId) {
      const page = await notion.pages.retrieve({ page_id: pageId });
      const cover = (page as unknown as { cover?: FileishUrl }).cover;
      const url = cover?.file?.url || cover?.external?.url;
      if (url && isAllowedUrl(url)) return url;
    }
  } catch (error) {
    logger.warn('[notion-image] 刷新签名失败', error);
  }
  return null;
}

async function fetchUpstream(url: string): Promise<{ body: ReadableStream<Uint8Array>; contentType: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { redirect: 'follow', signal: controller.signal });
    // 防御重定向跳出白名单域名
    if (res.url && !isAllowedUrl(res.url)) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) return null;
    if (!/^(image|video|audio)\//.test(contentType) && contentType !== 'application/pdf') return null;
    if (!res.body) return null;
    return { body: res.body, contentType };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get('u');
  const blockId = req.nextUrl.searchParams.get('b');
  const pageId = req.nextUrl.searchParams.get('p');

  if (!u && !blockId && !pageId) {
    return new NextResponse('Bad request', { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const noStore = { 'Cache-Control': 'no-store' } as const;

  // 1) 优先直接使用请求带来的签名 URL（数据缓存会按 URL去重，重复请求不打 S3）
  let target = u && isAllowedUrl(u) ? u : null;
  let result = target ? await fetchUpstream(target) : null;

  // 2) 失败且提供了 block/page id 时，换取新签名重试
  if (!result) {
    const fresh = await resolveFreshUrl(blockId, pageId);
    if (fresh) {
      target = fresh;
      result = await fetchUpstream(fresh);
    }
  }

  if (!result) {
    return new NextResponse('Image unavailable', { status: 404, headers: noStore });
  }

  const headers = new Headers();
  headers.set('Content-Type', result.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable');
  return new NextResponse(result.body, { status: 200, headers });
}
