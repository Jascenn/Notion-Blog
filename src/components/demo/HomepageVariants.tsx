import Link from 'next/link';
import ReadingTime from '@/components/ReadingTime';
import type { NotionPost } from '@/lib/notion';
import type { OptimizedLocale } from '@/lib/optimized-i18n';
import styles from '@/app/demo/demo.module.css';

export const DEMO_VARIANTS = [
  {
    id: 'minimal',
    mark: 'A',
    name: '极简写作',
    description: '最接近原站，强化个人定位、代表文章和阅读路径。',
  },
  {
    id: 'workspace',
    mark: 'B',
    name: '个人工作台',
    description: '突出正在做的项目、内容主题和近期更新。',
  },
  {
    id: 'magazine',
    mark: 'C',
    name: '清爽杂志',
    description: '更鲜明的版式层级，仍沿用原来的黑白灰与蓝色。',
  },
  {
    id: 'curated',
    mark: 'D',
    name: '编辑工作台',
    description: '把你选中的项目、分类、封面文章和文章列表合成一个完整首页。',
  },
] as const;

export type DemoVariant = (typeof DEMO_VARIANTS)[number]['id'];

function formatDate(date: string, compact = false, locale: OptimizedLocale = 'zh') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'zh-CN', {
    ...(compact ? {} : { year: 'numeric' }),
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(date));
}

function articleHref(post: NotionPost, routePrefix = '') {
  return `${routePrefix}/${post.slug}`;
}

function DemoSwitcher({ active }: { active: DemoVariant }) {
  return (
    <div className={styles.switcher} aria-label="Demo 方案切换">
      <Link href="/demo" className={styles.switcherBack}>全部方案</Link>
      <div>
        {DEMO_VARIANTS.map((variant) => (
          <Link
            key={variant.id}
            href={`/demo/${variant.id}`}
            className={active === variant.id ? styles.switcherActive : undefined}
            aria-current={active === variant.id ? 'page' : undefined}
          >
            <span>{variant.mark}</span>{variant.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MinimalVariant({ posts }: { posts: NotionPost[] }) {
  const [featured, ...latest] = posts;

  return (
    <div className={`${styles.variant} ${styles.minimal}`}>
      <header className={styles.minimalHero}>
        <p className={styles.eyebrow}>LINGYI / PERSONAL BLOG</p>
        <h1>记录真实的构建过程，<br />也记录生活本身。</h1>
        <p className={styles.minimalIntro}>
          我是凌一，一名持续学习的全栈开发者。这里写 AI 工具、产品实践、效率工作流，以及那些值得被记住的普通日子。
        </p>
        <div className={styles.textActions}>
          {featured && <Link href={articleHref(featured)}>阅读最新文章 <span>→</span></Link>}
          <Link href="/about">关于我</Link>
        </div>
      </header>

      {featured && (
        <section className={styles.minimalFeatured} aria-labelledby="minimal-featured-title">
          <div className={styles.sectionLabel}>推荐阅读</div>
          <Link href={articleHref(featured)} data-umami-event="demo-article-click" data-umami-event-variant="minimal">
            <div>
              <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
              <h2 id="minimal-featured-title">{featured.title}</h2>
              <p>{featured.excerpt}</p>
            </div>
            <span className={styles.minimalArrow}>↗</span>
          </Link>
        </section>
      )}

      <section className={styles.minimalArchive} aria-labelledby="minimal-archive-title">
        <div className={styles.minimalSectionHead}>
          <h2 id="minimal-archive-title">最近文章</h2>
          <Link href="/search">查看全部</Link>
        </div>
        <div>
          {latest.slice(0, 7).map((post) => (
            <article key={post.id}>
              <Link href={articleHref(post)} data-umami-event="demo-article-click" data-umami-event-variant="minimal">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function WorkspaceVariant({ posts }: { posts: NotionPost[] }) {
  const featured = posts.slice(0, 2);

  return (
    <div className={`${styles.variant} ${styles.workspace}`}>
      <header className={styles.workspaceHero}>
        <div>
          <p className={styles.eyebrow}>WELCOME TO MY WORKSPACE</p>
          <h1>你好，我是凌一。<br />我在持续把想法做出来。</h1>
          <p>全栈开发、AI 工具与自动化实践。这里既是博客，也是我的公开工作台。</p>
        </div>
        <aside className={styles.workspaceStatus}>
          <div><span className={styles.statusDot} /> 当前项目</div>
          <a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer" data-umami-event="project-click" data-umami-event-project="lingyi.tools">
            <strong>lingyi.tools</strong>
            <span>AI 工具导航与个人策展</span>
          </a>
          <dl>
            <div><dt>文章</dt><dd>{posts.length}</dd></div>
            <div><dt>主题</dt><dd>AI / DEV / LIFE</dd></div>
          </dl>
        </aside>
      </header>

      <div className={styles.workspaceRail} aria-label="内容主题">
        <span>AI 实践</span><span>全栈开发</span><span>效率工作流</span><span>生活随笔</span>
      </div>

      <section className={styles.workspaceLatest} aria-labelledby="workspace-latest-title">
        <div className={styles.workspaceSectionHead}>
          <div><span>01</span><h2 id="workspace-latest-title">近期重点</h2></div>
          <p>正在写、正在做，也正在复盘。</p>
        </div>
        <div className={styles.workspaceCards}>
          {featured.map((post, index) => (
            <article key={post.id}>
              <Link href={articleHref(post)} data-umami-event="demo-article-click" data-umami-event-variant="workspace">
                <div className={styles.workspaceCardTop}>
                  <span>0{index + 1}</span>
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className={styles.workspaceCardBottom}>
                  <span>{post.tags?.[0]?.name || '构建记录'}</span>
                  {post.content && <ReadingTime content={post.content} />}
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.workspaceStream} aria-labelledby="workspace-stream-title">
        <div className={styles.workspaceSectionHead}>
          <div><span>02</span><h2 id="workspace-stream-title">更新流</h2></div>
          <Link href="/search">搜索文章 →</Link>
        </div>
        <div className={styles.streamGrid}>
          {posts.slice(2, 8).map((post) => (
            <article key={post.id}>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, true)}</time>
              <Link href={articleHref(post)} data-umami-event="demo-article-click" data-umami-event-variant="workspace">
                <h3>{post.title}</h3>
              </Link>
              <p>{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function MagazineVariant({ posts }: { posts: NotionPost[] }) {
  const [lead, second, third, ...archive] = posts;

  return (
    <div className={`${styles.variant} ${styles.magazine}`}>
      <header className={styles.magazineMasthead}>
        <div><span>LINGYI JOURNAL</span><span>ISSUE 01 · 2026</span></div>
        <h1>技术、工具与<br /><em>正在发生的生活</em></h1>
        <p>一个关于构建、学习和持续行动的个人刊物。</p>
      </header>

      {lead && (
        <section className={styles.magazineLead} aria-labelledby="magazine-lead-title">
          <Link href={articleHref(lead)} data-umami-event="demo-article-click" data-umami-event-variant="magazine">
            <div className={styles.magazineLeadNumber}>01</div>
            <div>
              <p className={styles.eyebrow}>COVER STORY / 封面文章</p>
              <h2 id="magazine-lead-title">{lead.title}</h2>
              <p>{lead.excerpt}</p>
              <span>继续阅读 →</span>
            </div>
            <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time>
          </Link>
        </section>
      )}

      <section className={styles.magazineColumns} aria-label="精选文章">
        {[second, third].filter((post): post is NotionPost => Boolean(post)).map((post, index) => (
          <article key={post.id}>
            <span className={styles.magazineIndex}>0{index + 2}</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <h2><Link href={articleHref(post)} data-umami-event="demo-article-click" data-umami-event-variant="magazine">{post.title}</Link></h2>
            <p>{post.excerpt}</p>
            <div>{post.tags?.slice(0, 2).map((tag) => <span key={tag.name}>{tag.name}</span>)}</div>
          </article>
        ))}
        <aside>
          <p className={styles.eyebrow}>EDITOR&apos;S NOTE</p>
          <blockquote>“先做出一个真实的版本，再从结果里找到下一步。”</blockquote>
          <Link href="/about">认识凌一 →</Link>
        </aside>
      </section>

      <section className={styles.magazineArchive} aria-labelledby="magazine-archive-title">
        <div className={styles.magazineArchiveHead}>
          <h2 id="magazine-archive-title">Archive / 文章索引</h2>
          <Link href="/rss">RSS 订阅</Link>
        </div>
        <div>
          {archive.slice(0, 6).map((post, index) => (
            <article key={post.id}>
              <span>{String(index + 4).padStart(2, '0')}</span>
              <Link href={articleHref(post)} data-umami-event="demo-article-click" data-umami-event-variant="magazine">{post.title}</Link>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function CuratedVariant({ posts, routePrefix = '', locale = 'zh' }: { posts: NotionPost[]; routePrefix?: string; locale?: OptimizedLocale }) {
  const [cover, second, third, ...remaining] = posts;
  const latest = remaining.slice(0, 9);
  const en = locale === 'en';
  const topics = en
    ? [
        { label: 'AI in Practice', query: 'AI' },
        { label: 'Frontend', query: 'Tech' },
        { label: 'Productivity', query: 'workflow' },
        { label: 'Life Notes', query: 'Notes' },
      ]
    : [
        { label: 'AI 实践', query: 'AI' },
        { label: '前端开发', query: '前端' },
        { label: '效率工作流', query: '效率' },
        { label: '生活随笔', query: '生活' },
      ];

  return (
    <div className={`${styles.variant} ${styles.curated}`}>
      <header className={styles.workspaceHero}>
        <div>
          <p className={styles.eyebrow}>LINGYI / BUILD · WRITE · LIVE</p>
          <h1>{en ? <>Document the work,<br />while it is being built.</> : <>把正在做的事，<br />认真记录下来。</>}</h1>
          <p>{en ? 'Full-stack development, AI tools, and better workflows. This is both my blog and an open, continuously updated workspace.' : '全栈开发、AI 工具与效率实践。这里既是我的博客，也是一个持续更新的公开工作台。'}</p>
        </div>
        <aside className={styles.workspaceStatus}>
          <div><span className={styles.statusDot} /> {en ? 'CURRENT PROJECT' : '当前项目'}</div>
          <a href="https://lingyi.tools" target="_blank" rel="noopener noreferrer" data-umami-event="project-click" data-umami-event-project="lingyi.tools">
            <strong>lingyi.tools</strong>
            <span>{en ? 'A curated directory of AI tools' : 'AI 工具导航与个人策展'}</span>
          </a>
          <dl>
            <div><dt>{en ? 'STATUS' : '状态'}</dt><dd>{en ? 'Building in public' : '持续构建中'}</dd></div>
            <div><dt>{en ? 'NOTES' : '记录'}</dt><dd>{posts.length} {en ? 'articles' : '篇文章'}</dd></div>
          </dl>
        </aside>
      </header>

      <nav className={styles.curatedTopics} aria-label={en ? 'Topics' : '内容分类'}>
        {topics.map((topic, index) => (
          <Link key={topic.label} href={`${routePrefix}/search?q=${encodeURIComponent(topic.query)}`}>
            <span>0{index + 1}</span>{topic.label}<b>↗</b>
          </Link>
        ))}
      </nav>

      <section className={styles.curatedEditorial} aria-labelledby="curated-editorial-title">
        <div className={styles.curatedSectionHead}>
          <div><span>01</span><h2 id="curated-editorial-title">{en ? "Editor's Picks" : '编辑精选'}</h2></div>
          <p>{en ? 'Three recent notes worth starting with.' : '从最近的记录中，挑出三篇值得先读的文章。'}</p>
        </div>

        {cover && (
          <div className={styles.magazineLead}>
            <Link href={articleHref(cover, routePrefix)} data-umami-event="demo-article-click" data-umami-event-variant="curated">
              <div className={styles.magazineLeadNumber}>01</div>
              <div>
                <p className={styles.eyebrow}>{en ? 'COVER STORY' : 'COVER STORY / 封面文章'}</p>
                <h2>{cover.title}</h2>
                <p>{cover.excerpt}</p>
                <span>{en ? 'Continue reading →' : '继续阅读 →'}</span>
              </div>
              <time dateTime={cover.publishedAt}>{formatDate(cover.publishedAt, false, locale)}</time>
            </Link>
          </div>
        )}

        <div className={styles.magazineColumns}>
          {[second, third].filter((post): post is NotionPost => Boolean(post)).map((post, index) => (
            <article key={post.id}>
              <span className={styles.magazineIndex}>0{index + 2}</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, false, locale)}</time>
              <h2><Link href={articleHref(post, routePrefix)} data-umami-event="demo-article-click" data-umami-event-variant="curated">{post.title}</Link></h2>
              <p>{post.excerpt}</p>
              <div>{post.tags?.slice(0, 2).map((tag) => <span key={tag.name}>{tag.name}</span>)}</div>
            </article>
          ))}
          <aside>
            <p className={styles.eyebrow}>EDITOR&apos;S NOTE</p>
            <blockquote>{en ? '“Ship something real first. Let the result show you what comes next.”' : '“先做出一个真实的版本，再从结果里找到下一步。”'}</blockquote>
            <Link href={`${routePrefix}/about`}>{en ? 'About LingYi →' : '关于凌一 →'}</Link>
          </aside>
        </div>
      </section>

      {latest.length > 0 && (
        <section className={`${styles.minimalArchive} ${styles.curatedLatest}`} aria-labelledby="curated-latest-title">
          <div className={styles.curatedSectionHead}>
            <div><span>02</span><h2 id="curated-latest-title">{en ? 'Latest Articles' : '最近文章'}</h2></div>
            <Link href={`${routePrefix}/blog`}>{en ? 'View all articles →' : '查看全部文章 →'}</Link>
          </div>
          <div>
            {latest.map((post) => (
              <article key={post.id}>
                <Link href={articleHref(post, routePrefix)} data-umami-event="demo-article-click" data-umami-event-variant="curated">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, false, locale)}</time>
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                  </div>
                  <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HomepageVariant({
  variant,
  posts,
  showDemoSwitcher = true,
  routePrefix = '',
  locale = 'zh',
}: {
  variant: DemoVariant;
  posts: NotionPost[];
  showDemoSwitcher?: boolean;
  routePrefix?: string;
  locale?: OptimizedLocale;
}) {
  const sortedPosts = [...posts]
    .filter((post) => post.type !== 'announcement')
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className={styles.demoRoot}>
      {showDemoSwitcher && <DemoSwitcher active={variant} />}
      {variant === 'minimal' && <MinimalVariant posts={sortedPosts} />}
      {variant === 'workspace' && <WorkspaceVariant posts={sortedPosts} />}
      {variant === 'magazine' && <MagazineVariant posts={sortedPosts} />}
      {variant === 'curated' && <CuratedVariant posts={sortedPosts} routePrefix={routePrefix} locale={locale} />}
    </div>
  );
}
