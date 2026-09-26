import Link from 'next/link';
import Image from 'next/image';
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
  const title = !en && about?.title ? about.title : en ? 'LingYi / LingYi_Stu' : '凌一 / LingYi_Stu';
  const tagline = !en && about?.excerpt ? about.excerpt : 'Keep it simple, stay focused.';

  return (
    <div className={styles.siteRoot}>
      <div className={styles.page}>
        <header className={`${styles.pageHeader} ${styles.aboutHeader}`}>
          <div>
            <span className={styles.kicker}>{en ? 'ABOUT / LINGYI' : 'ABOUT / 关于凌一'}</span>
            <h1>{title}</h1>
          </div>
          <div className={styles.aboutProfile}>
            <Image className={styles.aboutAvatar} src="/凌一-头像.png" alt={en ? 'LingYi portrait' : '凌一头像'} width={112} height={112} priority />
            <div>
              <span>PROFILE / 01</span>
              <p>{tagline}</p>
            </div>
          </div>
        </header>

        <main className={styles.aboutContent}>
          {!en && about?.content ? (
            <div className={styles.aboutBody}>
              <MarkdownContent content={about.content} />
            </div>
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
                <h2>CURRENTLY FOCUSING ON</h2>
                <ul className={styles.aboutList}>
                  <li>{en ? 'Building the lingyi.tools online toolkit' : '构建 lingyi.tools 在线工具集'}</li>
                  <li>{en ? 'Exploring the intersection of AI and frontend development' : '探索 AI 与前端开发的结合'}</li>
                  <li>{en ? 'Improving user experience and performance' : '优化用户体验与性能'}</li>
                </ul>
              </section>

              <section className={styles.aboutSection}>
                <h2>SELECTED PROJECTS</h2>
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
                <h2>TECH STACK</h2>
                <div className={styles.aboutTech}>
                  {['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Python', 'Git'].map((tech) => <span key={tech}>{tech}</span>)}
                </div>
              </section>

              <section className={styles.aboutSection}>
                <h2>GET IN TOUCH</h2>
                <div className={styles.aboutContacts}>
                  <div><span>Email</span><a href="mailto:1286324609@qq.com">1286324609@qq.com</a></div>
                  <div><span>GitHub</span><a href="https://github.com/Jascenn" target="_blank" rel="noopener noreferrer" data-umami-event="profile-click" data-umami-event-platform="github">@Jascenn</a></div>
                  <div><span>WeChat</span><strong>Help000000</strong></div>
                  <div><span>Website</span><a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer" data-umami-event="project-click" data-umami-event-project="lingyi.tools">lingyi.tools</a></div>
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

export function OptimizedArticle({ post, allPosts, locale = 'zh' }: { post: NotionPost; allPosts: NotionPost[]; locale?: OptimizedLocale }) {
  const related = sortedPosts(allPosts).filter((candidate) => candidate.id !== post.id).slice(0, 3);
  const en = locale === 'en';
  const root = optimizedRoots[locale];
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio').replace(/\/$/, '');
  const postUrl = `${siteUrl}${en ? '/en' : ''}/${post.slug}`;

  return (
    <div className={styles.siteRoot}>
      <article className={styles.articlePage}>
        <header className={styles.articleHeader}>
          <span className={styles.kicker}>{en ? 'FIELD NOTE / BUILD LOG' : 'FIELD NOTE / 构建记录'}</span>
          <h1>{post.title}</h1>
          <div className={styles.articleHeaderDetails}>
            <div>
              {post.excerpt && <p className={styles.articleExcerpt}>{post.excerpt}</p>}
              <div className={styles.articleMeta}>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
                <span>·</span>
                <ReadingTime content={post.content} locale={locale} />
                <span>·</span>
                <span>LINGYI</span>
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
        </header>

        <div className={styles.articleLayout}>
          <div className={styles.articleBodyOriginal} id="article-content">
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
