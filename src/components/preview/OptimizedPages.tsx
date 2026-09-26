import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import ReadingStats from '@/components/ReadingStats';
import ReadingTime from '@/components/ReadingTime';
import ShareButtons from '@/components/ShareButtons';
import ExportPDFAdvanced from '@/components/ExportPDFAdvanced';
import ChangelogSection from '@/components/ChangelogSection';
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

export function OptimizedArchive({ posts, locale = 'zh' }: { posts: NotionPost[]; locale?: OptimizedLocale }) {
  const visiblePosts = sortedPosts(posts);
  const en = locale === 'en';
  const root = optimizedRoots[locale];

  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>{en ? 'ARCHIVE' : 'ARCHIVE / 文章索引'}</span>
            <h1>{en ? <>Every note,<br />in chronological order.</> : <>所有记录，<br />按时间展开。</>}</h1>
          </div>
          <div>
            <p className={styles.pageIntro}>
              {en ? 'From building tools to organizing everyday life, this is the complete writing archive. Browse chronologically or use search to filter by topic.' : '从构建工具到整理生活，这里保留完整的文章脉络。你可以顺着时间阅读，也可以去搜索页按主题筛选。'}
            </p>
            <p className={styles.pageMeta}>{String(visiblePosts.length).padStart(2, '0')} ARTICLES · SINCE 2024</p>
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
  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>{en ? 'ABOUT / LINGYI' : 'ABOUT / 关于凌一'}</span>
            <h1>{en ? <>Build concrete things.<br />Leave honest records.</> : <>做具体的事，<br />留下真实的记录。</>}</h1>
          </div>
          <p className={styles.pageIntro}>
            {en ? 'I am LingYi, a full-stack developer who keeps learning. This site is both a writing space and a public archive of what I build.' : '我是凌一，一名持续学习的全栈开发者。这个网站既是写作空间，也是公开的构建档案。'}
          </p>
        </header>

        <div className={styles.aboutGrid}>
          <main>
            <p className={styles.aboutLead}>
              {en ? 'I care not only about what gets built, but also how an idea is broken down, tested, and gradually turned into something people can use.' : '我关心的不只是“做出了什么”，也关心一个想法如何被拆开、验证，再慢慢变成可以使用的东西。'}
            </p>
            <div className={styles.aboutBody}>
              {!en && about?.content ? (
                <MarkdownContent content={about.content} />
              ) : (
                <>
                  <p>{en ? 'I write about full-stack development, AI tools, productivity workflows, and moments from work and life that deserve reflection.' : '这里主要记录全栈开发、AI 工具、效率工作流，以及工作和生活里值得复盘的片段。'}</p>
                  <p>{en ? 'Good code and good writing have something in common: both should be restrained, clear, and able to withstand real use.' : '我相信好的代码和好的文章很像，都需要克制、清楚，也需要经得住真实使用。'}</p>
                </>
              )}
            </div>
          </main>

          <aside className={styles.aboutAside}>
            <dl>
              <div className={styles.factBlock}>
                <dt>CURRENT PROJECT</dt>
                <dd><a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer">lingyi.tools</a></dd>
              </div>
              <div className={styles.factBlock}>
                <dt>FOCUS</dt>
                <dd>{en ? <>AI in Practice · Frontend<br />Productivity · Life Notes</> : <>AI 实践 · 前端开发<br />效率工作流 · 生活随笔</>}</dd>
              </div>
              <div className={styles.factBlock}>
                <dt>GITHUB</dt>
                <dd><a href="https://github.com/Jascenn" target="_blank" rel="noopener noreferrer">@Jascenn</a></dd>
              </div>
              <div className={styles.factBlock}>
                <dt>CONTACT</dt>
                <dd><a href="mailto:1286324609@qq.com">1286324609@qq.com</a></dd>
              </div>
            </dl>
          </aside>
        </div>

        <ChangelogSection variant="optimized" locale={locale} />
      </div>
    </div>
  );
}

export function OptimizedArticle({ post, allPosts, locale = 'zh' }: { post: NotionPost; allPosts: NotionPost[]; locale?: OptimizedLocale }) {
  const related = sortedPosts(allPosts).filter((candidate) => candidate.id !== post.id).slice(0, 3);
  const en = locale === 'en';
  const root = optimizedRoots[locale];
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio').replace(/\/$/, '');
  const postUrl = `${siteUrl}/${post.slug}`;

  return (
    <div className={styles.siteRoot}>
      <article className={styles.articlePage}>
        <header className={styles.articleHeader}>
          <span className={styles.kicker}>{en ? 'FIELD NOTE / BUILD LOG' : 'FIELD NOTE / 构建记录'}</span>
          <h1>{post.title}</h1>
          {post.excerpt && <p className={styles.articleExcerpt}>{post.excerpt}</p>}
          <div className={styles.articleMeta}>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
            <span>·</span>
            <ReadingTime content={post.content} locale={locale} />
            <span>·</span>
            <span>LINGYI</span>
          </div>
        </header>

        <div className={styles.articleLayout}>
          <div className={styles.articleBody} id="article-content">
            <MarkdownContent content={post.content} />

            <div className={styles.articleActions}>
              <ReadingStats slug={post.slug} locale={locale} variant="editorial" />
              <div className="flex flex-wrap items-center gap-3">
                <ShareButtons title={post.title} url={postUrl} description={post.excerpt} locale={locale} variant="editorial" />
                <ExportPDFAdvanced
                  title={post.title}
                  author="LingYi"
                  date={formatDate(post.publishedAt, locale)}
                  tags={post.tags.map((tag) => tag.name)}
                  filename={post.slug}
                  contentId="article-content"
                  locale={locale}
                  variant="editorial"
                />
              </div>
            </div>
          </div>

          <aside className={styles.articleAside}>
            <div className={styles.articleTags}>
              {post.tags.length > 0 ? post.tags.map((tag) => (
                <Link key={tag.name} href={`${root}/search?tags=${encodeURIComponent(tag.name)}`}>
                  {tag.name}
                </Link>
              )) : <span>{en ? 'Build log' : '构建记录'}</span>}
            </div>
            <p>{en ? "A note from LingYi's public workspace about building, learning, and turning ideas into working things." : '这是一篇来自凌一公开工作台的记录，关于构建、学习，以及把想法真正做出来的过程。'}</p>
          </aside>
        </div>

        {related.length > 0 && (
          <section className={styles.relatedSection} aria-labelledby="related-title">
            <div className={styles.sectionHead}>
              <span className={styles.sectionIndex}>NEXT</span>
              <h2 id="related-title">{en ? 'Continue Reading' : '继续阅读'}</h2>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((candidate) => (
                <Link key={candidate.id} href={`${root}/${candidate.slug}`} className={styles.relatedCard}>
                  <time dateTime={candidate.publishedAt}>{formatDate(candidate.publishedAt, locale)}</time>
                  <h3>{candidate.title}</h3>
                  <p>{candidate.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link href={`${root}/blog`} className={styles.backLink}>{en ? '← Back to archive' : '← 返回文章索引'}</Link>
      </article>
    </div>
  );
}
