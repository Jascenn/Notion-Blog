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

export function OptimizedArchive({ posts, locale = 'zh', routeRoot }: { posts: NotionPost[]; locale?: OptimizedLocale; routeRoot?: string }) {
  const visiblePosts = sortedPosts(posts);
  const en = locale === 'en';
  const root = routeRoot ?? optimizedRoots[locale];

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
            <span className={styles.kicker}>{en ? 'ABOUT / 01' : '关于凌一 / 01'}</span>
            <h1>{title}</h1>
          </div>
          <div className={styles.aboutProfile}>
            <Image className={styles.aboutAvatar} src="/凌一-头像.png" alt={en ? 'LingYi portrait' : '凌一头像'} width={112} height={112} priority />
            <div>
              <span>{en ? 'PROFILE' : '个人档案'}</span>
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
                  <div><span>{en ? 'WeChat' : '微信'}</span><strong>Help000000</strong></div>
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
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lingyi.bio').replace(/\/$/, '');
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
