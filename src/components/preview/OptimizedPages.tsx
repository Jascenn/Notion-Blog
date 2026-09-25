import Link from 'next/link';
import MarkdownContent from '@/components/MarkdownContent';
import ReadingStats from '@/components/ReadingStats';
import ReadingTime from '@/components/ReadingTime';
import ShareButtons from '@/components/ShareButtons';
import ExportPDFAdvanced from '@/components/ExportPDFAdvanced';
import type { NotionPost } from '@/lib/notion';
import styles from '@/app/preview/optimized/optimized.module.css';

const PREVIEW_ROOT = '/preview/optimized';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

function sortedPosts(posts: NotionPost[]) {
  return [...posts]
    .filter((post) => post.type !== 'announcement')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function OptimizedArchive({ posts }: { posts: NotionPost[] }) {
  const visiblePosts = sortedPosts(posts);

  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>ARCHIVE / 文章索引</span>
            <h1>所有记录，<br />按时间展开。</h1>
          </div>
          <div>
            <p className={styles.pageIntro}>
              从构建工具到整理生活，这里保留完整的文章脉络。你可以顺着时间阅读，也可以去搜索页按主题筛选。
            </p>
            <p className={styles.pageMeta}>{String(visiblePosts.length).padStart(2, '0')} ARTICLES · SINCE 2024</p>
          </div>
        </header>

        <section className={styles.archiveList} aria-label="全部文章">
          {visiblePosts.map((post, index) => (
            <Link key={post.id} href={`${PREVIEW_ROOT}/${post.slug}`} className={styles.archiveRow}>
              <span className={styles.archiveNumber}>{String(index + 1).padStart(2, '0')}</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
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

export function OptimizedAbout({ about }: { about: NotionPost | null }) {
  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.kicker}>ABOUT / 关于凌一</span>
            <h1>做具体的事，<br />留下真实的记录。</h1>
          </div>
          <p className={styles.pageIntro}>
            我是凌一，一名持续学习的全栈开发者。这个网站既是写作空间，也是公开的构建档案。
          </p>
        </header>

        <div className={styles.aboutGrid}>
          <main>
            <p className={styles.aboutLead}>
              我关心的不只是“做出了什么”，也关心一个想法如何被拆开、验证，再慢慢变成可以使用的东西。
            </p>
            <div className={styles.aboutBody}>
              {about?.content ? (
                <MarkdownContent content={about.content} />
              ) : (
                <>
                  <p>这里主要记录全栈开发、AI 工具、效率工作流，以及工作和生活里值得复盘的片段。</p>
                  <p>我相信好的代码和好的文章很像，都需要克制、清楚，也需要经得住真实使用。</p>
                </>
              )}
            </div>
          </main>

          <aside className={styles.aboutAside}>
            <dl>
              <div className={styles.factBlock}>
                <dt>CURRENT PROJECT</dt>
                <dd><a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer">lingyi.tools ↗</a></dd>
              </div>
              <div className={styles.factBlock}>
                <dt>FOCUS</dt>
                <dd>AI 实践 · 前端开发<br />效率工作流 · 生活随笔</dd>
              </div>
              <div className={styles.factBlock}>
                <dt>GITHUB</dt>
                <dd><a href="https://github.com/Jascenn" target="_blank" rel="noopener noreferrer">@Jascenn ↗</a></dd>
              </div>
              <div className={styles.factBlock}>
                <dt>CONTACT</dt>
                <dd><a href="mailto:1286324609@qq.com">1286324609@qq.com</a></dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function OptimizedArticle({ post, allPosts }: { post: NotionPost; allPosts: NotionPost[] }) {
  const related = sortedPosts(allPosts).filter((candidate) => candidate.id !== post.id).slice(0, 3);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio').replace(/\/$/, '');
  const postUrl = `${siteUrl}/${post.slug}`;

  return (
    <div className={styles.siteRoot}>
      <article className={styles.articlePage}>
        <header className={styles.articleHeader}>
          <span className={styles.kicker}>FIELD NOTE / 构建记录</span>
          <h1>{post.title}</h1>
          {post.excerpt && <p className={styles.articleExcerpt}>{post.excerpt}</p>}
          <div className={styles.articleMeta}>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span>·</span>
            <ReadingTime content={post.content} />
            <span>·</span>
            <span>LINGYI</span>
          </div>
        </header>

        <div className={styles.articleLayout}>
          <div className={styles.articleBody} id="article-content">
            <MarkdownContent content={post.content} />

            <div className={styles.articleActions}>
              <ReadingStats slug={post.slug} />
              <div className="flex flex-wrap items-center gap-3">
                <ShareButtons title={post.title} url={postUrl} description={post.excerpt} />
                <ExportPDFAdvanced
                  title={post.title}
                  date={formatDate(post.publishedAt)}
                  tags={post.tags.map((tag) => tag.name)}
                  filename={post.slug}
                  contentId="article-content"
                />
              </div>
            </div>
          </div>

          <aside className={styles.articleAside}>
            <div className={styles.articleTags}>
              {post.tags.length > 0 ? post.tags.map((tag) => (
                <Link key={tag.name} href={`${PREVIEW_ROOT}/search?tags=${encodeURIComponent(tag.name)}`}>
                  {tag.name}
                </Link>
              )) : <span>构建记录</span>}
            </div>
            <p>这是一篇来自凌一公开工作台的记录，关于构建、学习，以及把想法真正做出来的过程。</p>
          </aside>
        </div>

        {related.length > 0 && (
          <section className={styles.relatedSection} aria-labelledby="related-title">
            <div className={styles.sectionHead}>
              <span className={styles.sectionIndex}>NEXT</span>
              <h2 id="related-title">继续阅读</h2>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((candidate) => (
                <Link key={candidate.id} href={`${PREVIEW_ROOT}/${candidate.slug}`} className={styles.relatedCard}>
                  <time dateTime={candidate.publishedAt}>{formatDate(candidate.publishedAt)}</time>
                  <h3>{candidate.title}</h3>
                  <p>{candidate.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Link href={`${PREVIEW_ROOT}/blog`} className={styles.backLink}>← 返回文章索引</Link>
      </article>
    </div>
  );
}
