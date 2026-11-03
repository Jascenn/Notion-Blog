// 内容分型闸门（纯函数，可独立测试）。
//
// 原则：文章是白名单，不是黑名单。
// 只有明确标成 Post 或 Announcement 的记录才算文章；
// Page、Config、空值、认不出的新类型一律不当文章（失败关闭）。
// 这样以后往博客库里加任何新类型（配置、页面、别的），都不会漏进文章流。

export type PostKind = 'post' | 'announcement' | 'page' | 'config' | 'unknown';

// Notion 里 Type 选项名带 emoji 前缀（如 "📝 Post"、"⚙️ Config"），
// 只能按关键词匹配，不能逐字比对。
export function parsePostTypeName(rawName: string | null | undefined): PostKind {
  const raw = (rawName || '').toString().toLowerCase();
  if (!raw) return 'unknown';
  if (raw.includes('config')) return 'config';
  if (raw.includes('page')) return 'page';
  if (raw.includes('announcement')) return 'announcement';
  if (raw.includes('post')) return 'post';
  return 'unknown';
}

export function isArticleKind(kind: PostKind): boolean {
  return kind === 'post' || kind === 'announcement';
}

// 有专属路由、永远不算文章的保留 slug。
export const RESERVED_NON_ARTICLE_SLUGS: readonly string[] = ['about'];

export function isArticleRecord(record: { type?: string | null; slug?: string | null }): boolean {
  if (!record.type || !isArticleKind(record.type as PostKind)) return false;
  if (record.slug && RESERVED_NON_ARTICLE_SLUGS.includes(record.slug)) return false;
  return true;
}
