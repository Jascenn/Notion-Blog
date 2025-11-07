/**
 * 图片优化工具
 * 用于优化 Notion 图片 URL 的加载速度
 */

/**
 * 优化 Notion 图片 URL
 * Notion 图片 URL 通常很长且包含签名，我们可以通过 Next.js Image Optimization 来优化
 */
export function optimizeNotionImageUrl(url: string, width?: number): string {
  if (!url) return '';

  // 如果是 Notion 的图片，使用 Next.js Image Optimization API
  if (url.includes('prod-files-secure.s3') || url.includes('amazonaws.com')) {
    // 移除 Notion URL 中不必要的查询参数（保留必要的签名）
    try {
      const urlObj = new URL(url);
      // 保留必要的 AWS 签名参数
      const keysToKeep = [
        'X-Amz-Algorithm',
        'X-Amz-Credential',
        'X-Amz-Date',
        'X-Amz-Expires',
        'X-Amz-Signature',
        'X-Amz-SignedHeaders',
        'X-Amz-Security-Token'
      ];

      // 创建新的 URLSearchParams，只保留必要参数
      const newParams = new URLSearchParams();
      keysToKeep.forEach(key => {
        const value = urlObj.searchParams.get(key);
        if (value) {
          newParams.set(key, value);
        }
      });

      urlObj.search = newParams.toString();
      return urlObj.toString();
    } catch (error) {
      console.error('Error optimizing Notion image URL:', error);
      return url;
    }
  }

  return url;
}

/**
 * 获取优化的图片尺寸
 */
export function getOptimizedImageSize(originalWidth?: number): number {
  if (!originalWidth) return 1200;

  // 常见的响应式尺寸断点
  const sizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

  // 找到最接近但不小于原始宽度的尺寸
  const optimizedSize = sizes.find(size => size >= originalWidth);

  return optimizedSize || 1200;
}

/**
 * 检查是否为外部图片
 */
export function isExternalImage(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 为图片 URL 添加缓存破坏参数
 */
export function addCacheBuster(url: string, timestamp?: number): string {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const ts = timestamp || Date.now();
    urlObj.searchParams.set('v', ts.toString());
    return urlObj.toString();
  } catch {
    return url;
  }
}
