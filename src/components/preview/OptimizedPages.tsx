import Link from 'next/link';
import Image from 'next/image';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import RelatedPosts from '@/components/RelatedPosts';
import ReadingStats from '@/components/ReadingStats';
import ReadingTime from '@/components/ReadingTime';
import ShareButtons from '@/components/ShareButtons';
import ExportPDFAdvanced from '@/components/ExportPDFAdvanced';
import ChangelogSection from '@/components/ChangelogSection';
import CopyContactButton from '@/components/preview/CopyContactButton';
import type { NotionPost } from '@/lib/notion';
import type { OptimizedLocale } from '@/lib/optimized-i18n';
import { optimizedRoots } from '@/lib/optimized-i18n';
import styles from '@/app/preview/optimized/optimized.module.css';

function formatDate(date: string, locale: OptimizedLocale = 'zh') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(date));
}

function sortedPosts(posts: NotionPost[]) {
  return [...posts]
    .filter((post) => post.type !== 'announcement')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

type AboutSectionData = { heading: string; paragraphs: string[] };

function parseAboutMarkdown(content: string): { intro: string[]; sections: AboutSectionData[] } {
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
    if (/^#\s+/.test(line)) continue;
    if (line === '') { flush(); continue; }
    buf.push(line);
  }
  flush();
  return { intro, sections };
}

function renderAboutInline(text: string, keyPrefix: string) {
  const clean = text.replace(/\\_/g, '_');
  return clean.split(/(\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!m) return <span key={`${keyPrefix}-${i}`}>{part}</span>;
    const external = /^https?:\/\//.test(m[2]);
    return external ? (
      <a key={`${keyPrefix}-${i}`} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>
    ) : (
      <a key={`${keyPrefix}-${i}`} href={m[2]}>{m[1]}</a>
    );
  });
}

function splitAboutLead(text: string, en: boolean): [string, string] {
  const idx = en ? text.indexOf('. ') : text.indexOf('。');
  if (idx < 0) return [text, ''];
  return en ? [text.slice(0, idx + 1), text.slice(idx + 2)] : [text.slice(0, idx + 1), text.slice(idx + 1)];
}

function AboutProjects({ paragraphs, sectionKey }: { paragraphs: string[]; sectionKey: string }) {
  const cards: { name: string; url: string; desc: string }[] = [];
  const rest: string[] = [];
  for (const p of paragraphs) {
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[：:]\s*([\s\S]+)$/);
    if (m) cards.push({ name: m[1], url: m[2], desc: m[3] });
    else rest.push(p);
  }
  return (
    <>
      {cards.length > 0 && (
        <div className={styles.aboutProjects}>
          {cards.map((c, i) => (
            <a key={`${sectionKey}-card-${i}`} href={c.url} target="_blank" rel="noopener noreferrer">
              <strong>{c.name}</strong>
              <p>{renderAboutInline(c.desc, `${sectionKey}-desc-${i}`)}</p>
            </a>
          ))}
        </div>
      )}
      {rest.map((p, i) => (
        <div key={`${sectionKey}-rest-${i}`} className={styles.aboutSectionBody}>
          <p>{renderAboutInline(p, `${sectionKey}-restp-${i}`)}</p>
        </div>
      ))}
    </>
  );
}

function AboutContacts({ paragraphs, en, locale }: { paragraphs: string[]; en: boolean; locale: OptimizedLocale }) {
  const all = paragraphs.join('\n');
  const email = all.match(/\[([^\]]+)\]\((mailto:[^)]+)\)/);
  const wechat = all.match(/(?:微信|WeChat)\s+([A-Za-z0-9_-]{4,})/);
  const github = all.match(/GitHub[^[\n]*\[([^\]]+)\]\((https?:\/\/github\.com\/[^)\s]+)\)/);
  const x = all.match(/(?:^|[，,\s])X\s*(?:是)?\s*\[([^\]]+)\]\((https?:\/\/x\.com\/[^)\s]+)\)/m);
  const xhs = en ? all.match(/Xiaohongshu[\s\S]*?search for\s+([^.]+)\./) : all.match(/小红书搜「?([^，。\s]+)」?/);
  if (!email || !wechat) {
    return (
      <div className={styles.aboutSectionBody}>
        {paragraphs.map((p, i) => (<p key={`contact-fallback-${i}`}>{renderAboutInline(p, `contact-fallback-${i}`)}</p>))}
      </div>
    );
  }
  const handleOf = (url: string) => `@${url.replace(/\/$/, '').split('/').pop()}`;
  return (
    <div className={styles.aboutContacts}>
      <div><span>{en ? 'Email' : '邮箱'}</span><a href={email[2]}>{email[1]}</a></div>
      {github && (<div><span>GitHub</span><a href={github[2]} target="_blank" rel="noopener noreferrer">{handleOf(github[2])}</a></div>)}
      <div><span>{en ? 'WeChat' : '微信'}</span><CopyContactButton value={wechat[1]} locale={locale} /></div>
      {x && (<div><span>X</span><a href={x[2]} target="_blank" rel="noopener noreferrer">{handleOf(x[2])}</a></div>)}
      <div><span>{en ? 'Website' : '网站'}</span><a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer">lingyi.tools</a></div>
      {xhs && (<div><span>{en ? 'Xiaohongshu' : '小红书'}</span><span>{xhs[1].trim()}</span></div>)}
      <a className={styles.aboutStory} href="https://mp.weixin.qq.com/s/57ZddMBqXFTP89YJs3lR9A" target="_blank" rel="noopener noreferrer">
        {en ? 'Learn more about my story →' : '了解更多关于我的故事 →'}
      </a>
    </div>
  );
}

function AboutStructured({ content, locale }: { content: string; locale: OptimizedLocale }) {
  const en = locale === 'en';
  const { intro, sections } = parseAboutMarkdown(content);
  const whoIdx = sections.findIndex((s) => /我是谁|关于我|Who I am|About me/i.test(s.heading));
  const who = whoIdx >= 0 ? sections[whoIdx] : null;
  const [lead, introRest] = intro.length > 0 ? splitAboutLead(intro[0], en) : ['', ''];
  const introBody = [...(who ? who.paragraphs : []), introRest, ...intro.slice(1)].filter(Boolean).join(en ? ' ' : '');
  return (
    <div className={`${styles.aboutOriginal} ${styles.aboutBody}`}>
      <section className={styles.aboutSection}>
        <h2>{en ? 'INTRODUCTION' : '个人简介'}</h2>
        <div className={styles.aboutSectionBody}>
          {lead && (<p className={styles.aboutLead}>{renderAboutInline(lead, 'about-lead')}</p>)}
          {introBody && (<p>{renderAboutInline(introBody, 'about-intro-body')}</p>)}
        </div>
      </section>
      {sections.map((s, i) => {
        if (i === whoIdx) return null;
        const isProjects = /我运营的项目|我的项目|运营的项目|What I run|Projects/i.test(s.heading);
        const isContact = /联系我|联系方式|Contact/i.test(s.heading);
        return (
          <section key={`about-sec-${i}`} className={styles.aboutSection}>
            <h2>{s.heading}</h2>
            {isProjects ? (
              <AboutProjects paragraphs={s.paragraphs} sectionKey={`about-sec-${i}`} />
            ) : isContact ? (
              <AboutContacts paragraphs={s.paragraphs} en={en} locale={locale} />
            ) : (
              <div className={styles.aboutSectionBody}>
                {s.paragraphs.map((p, j) => (<p key={`about-sec-${i}-${j}`}>{renderAboutInline(p, `about-sec-${i}-${j}`)}</p>))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function OptimizedArchive({ posts, locale = 'zh', routeRoot }: { posts: NotionPost[]; locale?: OptimizedLocale; routeRoot?: string }) {
  const visiblePosts = sortedPosts(posts);
  const en = locale === 'en';
  const root = routeRoot ?? optimizedRoots[locale];

  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>{en ? 'ARCHIVE' : '文章索引'}</span>
            <h1>{en ? <>Every note,<br />in chronological order.</> : <>所有记录，<br />按时间展开。</>}</h1>
          </div>
          <div>
            <p className={styles.pageIntro}>
              {en ? 'From building tools to organizing everyday life, this is the complete writing archive. Browse chronologically or use search to filter by topic.' : '从构建工具到整理生活，这里保留完整的文章脉络。你可以顺着时间阅读，也可以去搜索页按主题筛选。'}
            </p>
            <p className={styles.pageMeta}>
              {en
                ? `${String(visiblePosts.length).padStart(2, '0')} ARTICLES · SINCE 2024`
                : `${String(visiblePosts.length).padStart(2, '0')} 篇文章 · 自 2024 年起`}
            </p>
          </div>
        </header>

        <section className={styles.archiveList} aria-label={en ? 'All articles' : '全部文章'}>
          {visiblePosts.map((post, index) => (
            <Link key={post.id} href={`${root}/${post.slug}`} className={styles.archiveRow}>
              <span className={styles.archiveNumber}>{String(index + 1).padStart(2, '0')}</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
              <div className={styles.archiveCopy}>
                <h2>{post.title}</h2>
                {post.excerpt && <p>{post.excerpt}</p>}
              </div>
              <div className={styles.archiveTags}>
                {post.tags.slice(0, 2).map((tag) => <span key={tag.name}>{tag.name}</span>)}
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export function OptimizedAbout({ about, locale = 'zh' }: { about: NotionPost | null; locale?: OptimizedLocale }) {
  const en = locale === 'en';
  const title = about?.title ? about.title : en ? 'LingYi / LingYi_Stu' : '凌一 / LingYi_Stu';
  const tagline = !en && about?.excerpt
    ? about.excerpt
    : en
      ? 'Keep it simple, stay focused.'
      : '保持简单，保持专注。';

  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={`${styles.pageHeader} ${styles.aboutHeader}`}>
          <div>
            <span className={styles.kicker}>{en ? 'ABOUT LINGYI' : '关于凌一'}</span>
            <h1>{title}</h1>
          </div>
          <div className={styles.aboutProfile}>
            <Image className={styles.aboutAvatar} src="/凌一-头像.png" alt={en ? 'LingYi portrait' : '凌一头像'} width={112} height={112} priority />
            <div>
              <span>{en ? 'MOTTO' : '个人签名'}</span>
              <p>{tagline}</p>
            </div>
          </div>
        </header>

        <main className={styles.aboutContent}>
          {about?.content ? (
            <AboutStructured content={about.content} locale={locale} />
          ) : (
            <div className={styles.aboutOriginal}>
              <section className={styles.aboutSection}>
                <h2>{en ? 'INTRODUCTION' : '个人简介'}</h2>
                <div className={styles.aboutSectionBody}>
                  <p className={styles.aboutLead}>{en ? 'Full-stack developer focused on creating simple yet powerful digital experiences.' : '全栈开发者，专注于创建简洁而强大的数字体验。'}</p>
                  <p>{en ? 'I believe good code, like good writing, needs repeated thought and refinement. Here I share technical reflections, project experience, and observations from life.' : '我相信好的代码如同好的文章，需要反复推敲和打磨。在这里，我分享技术思考、项目经验和生活感悟。'}</p>
                </div>
              </section>

              <section className={styles.aboutSection}>
                <h2>{en ? 'CURRENTLY FOCUSING ON' : '近期关注'}</h2>
                <ul className={styles.aboutList}>
                  <li>{en ? 'Building the lingyi.tools online toolkit' : '构建 lingyi.tools 在线工具集'}</li>
                  <li>{en ? 'Exploring the intersection of AI and frontend development' : '探索 AI 与前端开发的结合'}</li>
                  <li>{en ? 'Improving user experience and performance' : '优化用户体验与性能'}</li>
                </ul>
              </section>

              <section className={styles.aboutSection}>
                <h2>{en ? 'SELECTED PROJECTS' : '精选项目'}</h2>
                <div className={styles.aboutProjects}>
                  <a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer" data-umami-event="project-click" data-umami-event-project="lingyi.tools">
                    <strong>lingyi.tools</strong><span>↗</span>
                    <p>{en ? 'A practical online toolkit for everyday tasks, including base conversion and password checks.' : '实用在线工具集合，包含进制转换、密码检测等日常工具'}</p>
                  </a>
                  <div><strong>{en ? 'Personal blog system' : '个人博客系统'}</strong><p>{en ? 'A minimal blog built with Next.js, with Markdown support and real-time search.' : '基于 Next.js 构建的极简博客，支持 Markdown 和实时搜索'}</p></div>
                  <div><strong>{en ? 'Open-source contributions' : '开源贡献'}</strong><p>{en ? 'Active in open-source communities, with ongoing code and documentation contributions.' : '活跃于开源社区，持续贡献代码和文档'}</p></div>
                </div>
              </section>

              <section className={styles.aboutSection}>
                <h2>{en ? 'TECH STACK' : '技术栈'}</h2>
                <div className={styles.aboutTech}>
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Python', 'Git'].map((tech) => <span key={tech}>{tech}</span>)}
                </div>
              </section>

              <section className={styles.aboutSection}>
                <h2>{en ? 'GET IN TOUCH' : '联系方式'}</h2>
                <div className={styles.aboutContacts}>
                  <div><span>{en ? 'Email' : '邮箱'}</span><a href="mailto:1286324609@qq.com">1286324609@qq.com</a></div>
                  <div><span>GitHub</span><a href="https://github.com/Jascenn" target="_blank" rel="noopener noreferrer" data-umami-event="profile-click" data-umami-event-platform="github">@Jascenn</a></div>
                  <div><span>{en ? 'WeChat' : '微信'}</span><CopyContactButton value="Help000000" locale={locale} /></div>
                  <div><span>{en ? 'Website' : '网站'}</span><a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer" data-umami-event="project-click" data-umami-event-project="lingyi.tools">lingyi.tools</a></div>
                  <a className={styles.aboutStory} href="https://mp.weixin.qq.com/s/57ZddMBqXFTP89YJs3lR9A" target="_blank" rel="noopener noreferrer" data-umami-event="profile-story-click">
                    {en ? 'Learn more about my story →' : '了解更多关于我的故事 →'}
                  </a>
                </div>
              </section>
            </div>
          )}
        </main>

        <ChangelogSection variant="optimized" locale={locale} />
      </div>
    </div>
  );
}

export function OptimizedArticle({ post, allPosts, locale = 'zh', routeRoot }: { post: NotionPost; allPosts: NotionPost[]; locale?: OptimizedLocale; routeRoot?: string }) {
  const en = locale === 'en';
  const root = routeRoot ?? optimizedRoots[locale];
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.me').replace(/\/$/, '');
  const postUrl = `${siteUrl}${en ? '/en' : ''}/${post.slug}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 min-h-screen">
      <article className="pb-16">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
            <span>•</span>
            <ReadingTime content={post.content} locale={locale} />
            {post.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.name}
                      href={`${root}/search?tags=${encodeURIComponent(tag.name)}`}
                      className={`px-2 py-1 rounded text-xs transition-colors notion-tag-${tag.color}`}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        <div id="article-content" className="mb-12">
          <MarkdownContent content={post.content} />
        </div>

        <footer className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <ReadingStats slug={post.slug} locale={locale} />
            <div className="flex items-center gap-3">
              <ShareButtons title={post.title} url={postUrl} description={post.excerpt} locale={locale} />
              <ExportPDFAdvanced
                title={post.title}
                date={formatDate(post.publishedAt, locale)}
                tags={post.tags.map((tag) => tag.name)}
                filename={post.slug}
                contentId="article-content"
                locale={locale}
              />
            </div>
          </div>
        </footer>
      </article>

      <TableOfContents content={post.content} />
      <RelatedPosts currentPost={post} allPosts={allPosts} hrefPrefix={root} locale={locale} />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-8 pb-12 mt-16">
        <Link
          href={root}
          className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-1"
        >
          {en ? '← Back to home' : '← 返回首页'}
        </Link>
      </div>
    </div>
  );
}
