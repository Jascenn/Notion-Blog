/**
 * 将标题文本转换为锚点 ID，保证中文、英文及符号行为一致
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
