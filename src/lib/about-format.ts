// 关于页正文格式解析（纯函数，供组件与测试共用）。
// 约定（2026-11-03 调研后定版）：
// - 节的身份优先看标题末尾的标记，如「我运营的项目 [projects]」，标记外的标题文字可任意改；
//   没有标记时按标题关键词别名识别；都认不出就按普通节渲染（降级显示，内容不丢）。
// - 项目节支持两种写法：旧式「[名称](链接)：说明」一段一项；新式一个项目一个 ### 小标题，
//   段内第一个链接即项目地址，没链接也能成卡。
// - 正文开头的 <details> 折叠块是编辑说明，解析前整块剥离，不进页面。

export type AboutSectionData = { heading: string; paragraphs: string[] };
export type AboutSectionKind = 'who' | 'projects' | 'contact' | 'generic';

export const H3_MARKER = '§H3§ ';

const TOKEN_KINDS: Record<string, AboutSectionKind> = {
  who: 'who',
  projects: 'projects',
  contact: 'contact',
};

// 从标题里拆出末尾标记：返回展示标题、标记与节类型。
export function classifyAboutSection(heading: string): { display: string; token: string | null; kind: AboutSectionKind } {
  const m = heading.match(/^(.*?)\s*\[([a-z][a-z0-9-]*)\]\s*$/);
  const display = (m ? m[1] : heading).trim();
  const token = m ? m[2] : null;
  if (token && TOKEN_KINDS[token]) return { display, token, kind: TOKEN_KINDS[token] };
  if (/我是谁|关于我|Who I am|About me/i.test(display)) return { display, token, kind: 'who' };
  if (/我运营的项目|我的项目|运营的项目|What I run|Projects/i.test(display)) return { display, token, kind: 'projects' };
  if (/联系我|联系方式|Contact/i.test(display)) return { display, token, kind: 'contact' };
  return { display, token, kind: 'generic' };
}

// 剥离正文开头的编辑说明折叠块（<details>...</details>）。
export function stripLeadingGuide(content: string): string {
  const trimmed = content.replace(/^\s+/, '');
  if (!/^<details[\s>]/i.test(trimmed)) return content;
  const end = trimmed.toLowerCase().indexOf('</details>');
  if (end < 0) return content;
  return trimmed.slice(end + '</details>'.length).replace(/^\s+/, '');
}

export function parseAboutMarkdown(content: string): { intro: string[]; sections: AboutSectionData[] } {
  const intro: string[] = [];
  const sections: AboutSectionData[] = [];
  let current: AboutSectionData | null = null;
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join(' ').trim();
    if (text) (current ? current.paragraphs : intro).push(text);
    buf = [];
  };
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      flush();
      current = { heading: h[1].trim(), paragraphs: [] };
      sections.push(current);
      continue;
    }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3 && current) {
      flush();
      current.paragraphs.push(H3_MARKER + h3[1].trim());
      continue;
    }
    if (/^#\s+/.test(line)) continue;
    if (line === '') { flush(); continue; }
    buf.push(line);
  }
  flush();
  return { intro, sections };
}

export type AboutProjectCard = { name: string; url: string | null; desc: string };

// 把项目节的段落解析成卡片：兼容旧式链接行与新式 ### 小标题分组。
export function parseProjectEntries(paragraphs: string[]): { cards: AboutProjectCard[]; rest: string[] } {
  const cards: AboutProjectCard[] = [];
  const rest: string[] = [];
  let i = 0;
  while (i < paragraphs.length) {
    const p = paragraphs[i];
    if (p.startsWith(H3_MARKER)) {
      const rawName = p.slice(H3_MARKER.length).trim();
      const nameLink = rawName.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const body: string[] = [];
      i += 1;
      while (i < paragraphs.length && !paragraphs[i].startsWith(H3_MARKER)) {
        body.push(paragraphs[i]);
        i += 1;
      }
      const bodyText = body.join(' ');
      const link = bodyText.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/) || bodyText.match(/(https?:\/\/[^\s)]+)/);
      const url = nameLink ? nameLink[2] : link ? (link[2] || link[1]) : null;
      const desc = bodyText
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1')
        .trim();
      cards.push({ name: nameLink ? nameLink[1] : rawName, url, desc });
      continue;
    }
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[：:]\s*([\s\S]+)$/);
    if (m) cards.push({ name: m[1], url: m[2], desc: m[3] });
    else rest.push(p);
    i += 1;
  }
  return { cards, rest };
}

export type AboutContactsOverride = {
  email?: string | null;
  wechat?: string | null;
  github?: string | null;
  x?: string | null;
  xiaohongshu?: string | null;
};
