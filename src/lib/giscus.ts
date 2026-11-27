// Giscus 评论系统配置与纯函数工具模块

export interface GiscusConfig {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  themeVersion: string;
}

export const GISCUS_CONFIG: GiscusConfig = {
  repo: (process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`) || 'Jascenn/Notion-Blog',
  repoId: process.env.NEXT_PUBLIC_GISCUS_REPO_ID || 'R_kgDOH1UIBg',
  category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Announcements',
  categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || 'DIC_kwDOH1UIBs4DMFvl',
  themeVersion: '20261127',
};

export const GISCUS_LOAD_TIMEOUT_MS = 10000;

const DISABLED_VALUES = new Set(['false', '0', 'off', 'no', 'disabled']);

/**
 * 构造 Giscus 无法加载时的 GitHub Discussions 兜底跳转链接。
 */
export function getDiscussionsFallbackUrl(
  repo: string = GISCUS_CONFIG.repo,
  category: string = GISCUS_CONFIG.category,
): string {
  const base = `https://github.com/${repo}/discussions`;
  const normalizedCategory = category.trim().toLowerCase();
  if (!normalizedCategory) return base;
  return `${base}/categories/${encodeURIComponent(normalizedCategory)}`;
}

/**
 * 解析 Notion Config 项 `comments-enabled` 的值。
 * 未配置或为空字符串时默认开启；仅显式配置关闭词时返回 false。
 */
export function isCommentsEnabled(configValue: string | null | undefined): boolean {
  if (configValue == null) return true;
  const normalized = configValue.trim().toLowerCase();
  if (!normalized) return true;
  return !DISABLED_VALUES.has(normalized);
}

/**
 * 将站内语言标识映射为 Giscus 支持的界面语言代码。
 */
export function resolveGiscusLang(locale: 'zh' | 'en'): 'zh-CN' | 'en' {
  return locale === 'en' ? 'en' : 'zh-CN';
}

/**
 * 根据深浅色状态与当前站点 origin 解析 Giscus 主题。
 * 线上 HTTPS 环境加载同源自定义皮肤 CSS；本地开发 HTTP 环境回退到内置主题，避免 Mixed Content 拦截。
 */
export function resolveGiscusTheme(isDark: boolean, origin?: string): string {
  const fallback = isDark ? 'dark_dimmed' : 'light';
  if (!origin || !origin.startsWith('https://')) {
    return fallback;
  }

  try {
    const parsed = new URL(origin);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return fallback;
    }
    const baseOrigin = origin.replace(/\/$/, '');
    const styleName = isDark ? 'giscus-dark.css' : 'giscus-light.css';
    return `${baseOrigin}/styles/${styleName}?v=${GISCUS_CONFIG.themeVersion}`;
  } catch {
    return fallback;
  }
}

/**
 * 判断当前 URL 查询串是否包含 GitHub 登录回跳参数 `?giscus=`。
 */
export function hasGiscusReturnParam(search: string): boolean {
  return /[?&]giscus=/.test(search);
}
