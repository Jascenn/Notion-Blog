/**
 * Notion 图片代理工具
 *
 * Notion 附件 URL（S3 / file.notion.so）带有约 1 小时的签名时效，直接写进
 * 预渲染 HTML 会随时间失效导致挂图。统一改走 /api/notion-image 代理：
 * - 图片字节经代理后以 immutable 缓存头输出，由 CDN 长期缓存
 * - HTML 仅写入 block/page id 与不含签名的资源路径，不泄露短期 S3 签名
 * - 签名过期时代理可用 blockId/pageId 重新向 Notion API 换取新签名，自愈
 */

const EXPIRING_URL_HOST_SUFFIXES = ['.amazonaws.com', '.notion.so'];

export function isExpiringNotionUrl(url: string): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return EXPIRING_URL_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export interface ProxiedImageOptions {
  /** 图片所属 block 的 id，签名过期时代理用它换取新签名 */
  blockId?: string;
  /** 图片所属页面的 id（用于 cover），签名过期时代理用它换取新签名 */
  pageId?: string;
}

export function toProxiedImageUrl(url: string | null | undefined, opts: ProxiedImageOptions = {}): string {
  if (!url || !isExpiringNotionUrl(url)) return url || '';
  const params = new URLSearchParams();
  if (opts.blockId) params.set('b', opts.blockId);
  if (opts.pageId) params.set('p', opts.pageId);

  if (opts.blockId || opts.pageId) {
    try {
      params.set('v', new URL(url).pathname);
    } catch {
      // URL 已由 isExpiringNotionUrl 校验；这里只保留无签名兜底。
    }
  } else {
    params.set('u', url);
  }

  return `/api/notion-image?${params.toString()}`;
}
