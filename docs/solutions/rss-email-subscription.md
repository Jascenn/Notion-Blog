# RSS 订阅与邮件订阅系统设计

## 1. 背景与需求

博客需要完整的读者触达能力：RSS 面向技术读者（零成本、无隐私负担），邮件订阅面向普通读者（主动触达、可沉淀名单）。

## 2. RSS 层

### 2.1 Feed 输出（`src/app/rss.xml/route.ts`）

* 从 `getPostsOnly()` 拉取文章生成 RSS 2.0 XML。
* 频道标题/描述使用站点名称与简介（不要用 URL 当标题，阅读器里观感差）。
* 输出 `lastBuildDate`；`revalidate = 3600` + `s-maxage=3600` 缓存。

### 2.2 自动发现（易踩坑）

Next.js 的 metadata 是**按段浅合并**：子页面只要导出自己的 `alternates`，就会整体覆盖 root layout 的 `alternates.types`，导致 `<link rel="alternate" type="application/rss+xml">` 在文章页消失。

**解法**：`src/lib/site.ts` 导出共享常量 `RSS_ALTERNATE_TYPES`，每个有 `alternates` 的页面显式展开它。排查方法：直接查页面 HTML 里有没有 `rss+xml` link，不要只看 layout 代码。

### 2.3 订阅引导页（`/rss`）

* 展示 Feed 地址 + 一键复制按钮（`RssFeedUrl.tsx`）。
* 导航「订阅」必须指向引导页而不是裸 XML。

## 3. 邮件订阅层

### 3.1 收名单（`/api/subscribe` + `src/lib/subscribe.ts`）

* 邮箱正则校验 + 同 IP 每分钟 5 次限流 + Notion 查重。
* 订阅名单存 Notion（Email title + 状态 select）。
* Notion API 不允许在 workspace 顶级建库：需要先把某个页面共享给集成，再用 `NOTION_SUBSCRIBERS_PARENT_PAGE_ID` 让接口**首次调用时自动建库**，或用 `NOTION_SUBSCRIBERS_DATABASE_ID` 显式指定（生产推荐后者，避免首请求变慢）。

### 3.2 发信（`src/lib/newsletter.ts` + `/api/cron/newsletter`）

* Vercel Cron 每天 01:30 跑（`CRON_SECRET` Bearer 认证，与 analytics cron 同模式）。
* 取 24h 内发布的非 announcement 文章，查「发送记录」库去重后发送。
* Resend API 发信，每批最多 50 个收件人（bcc 批量）。
* `RESEND_API_KEY` 未配置时 cron 直接返回 skipped，不影响部署。
* 发送记录同样自动建库，去重依据是文章 slug。

## 4. 踩坑记录

| 问题 | 原因 | 解法 |
|------|------|------|
| 文章页没有 RSS 发现链接 | 子页面 metadata 覆盖 layout | 共享常量逐页展开 |
| Notion 401 | dotenv 默认只读 `.env`，项目配置在 `.env.local` | `dotenv.config({ path: '.env.local' })` |
| Notion 无法建库 | 集成权限里没有页面，且 workspace 顶级建库不支持 | 用户共享页面 + API 自动建库 |
| 暗色模式导航变暗正文不变 | Tailwind v4 `dark:` 默认跟随系统偏好 | `@custom-variant dark (&:where(.dark, .dark *))` |
| 订阅页双高亮 | `isArticle` 把不在排除清单的路径都当文章 | 排除 `/rss*` |

## 5. 验证清单

1. `/rss.xml` 返回 200 且含 `lastBuildDate`。
2. 文章页 head 有 `application/rss+xml` link。
3. 订阅 → Notion 出现记录；重复提交返回 `duplicate: true`。
4. 深色/浅色两种系统偏好下分别截图检查正文与订阅页。
5. cron 手动触发（带 `Authorization: Bearer $CRON_SECRET`）确认 skipped/sent 状态。
