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

### 3.1 收名单（双重确认，`/api/subscribe` + `src/lib/subscribe.ts`）

* 邮箱正则校验 + 同 IP 每分钟 5 次限流 + Notion 查重。
* 订阅名单存 Notion（Email title + 状态 select：待确认 / 已订阅 / 已退订）。
* 双重确认（Double Opt-in）：订阅先落「待确认」并发确认邮件（HMAC token 链接，`NEWSLETTER_TOKEN_SECRET` 签名，回退 `CRON_SECRET`），`GET /api/subscribe/confirm` 确认后置「已订阅」并发欢迎邮件（附最近三篇文章 + RSS 地址）。
* Notion API 不允许在 workspace 顶级建库：需要先把某个页面共享给集成，再用 `NOTION_SUBSCRIBERS_PARENT_PAGE_ID` 让接口**首次调用时自动建库**，或用 `NOTION_SUBSCRIBERS_DATABASE_ID` 显式指定（生产推荐后者，避免首请求变慢）。

### 3.2 发信（每周聚合周刊，`src/lib/newsletter.tsx` + `/api/cron/newsletter`）

* Vercel Cron 每周一 UTC 00:00（北京 08:00）跑（`CRON_SECRET` Bearer 认证，与 analytics cron 同模式）。
* 取最近 7 天（`NEWSLETTER_DIGEST_DAYS` 可调）发布的非 announcement 文章，按「digest-<周一日期>」查「发送记录」库去重；无新文章直接 skipped。
* Resend API 发信，**逐人发送**而非 bcc 批量：现有 Resend key 仅 Sending access，退订链接需要按收件人个性化（Gmail/Yahoo 合规）。
* 一键退订：邮件带 `List-Unsubscribe` / `List-Unsubscribe-Post`（RFC 8058）头，正文页脚个性化退订链接 → `/api/unsubscribe` 确认页 → Notion 置「已退订」。
* `RESEND_API_KEY` 未配置时 cron 直接返回 skipped，不影响部署。

### 3.3 投递监控（`/api/webhooks/resend`）

* Resend webhook（Svix 签名校验，`RESEND_WEBHOOK_SECRET`）订阅 `contact.updated`（退订同步）、`email.bounced` / `email.complained`（写 Notion 发送记录，键：`事件:收件人:email_id`）。
* 事件 payload 结构差异见下方踩坑表。

### 3.4 邮件模板（React Email，`src/lib/emails/`）

* 周刊 `digest-email.tsx` / 确认与欢迎 `transactional-emails.tsx`；品牌头 + 期号、封面图（绝对 URL）、收件箱预览摘要（preheader）、`color-scheme` 暗色适配、纯文本版。
* 开场白 + 结尾问候（不直接甩文章列表）；主题行「凌一 newsletter｜本周 N 篇更新（日期区间）」。
* 字体与网站主题对齐：霞鹜文楷（LXGW WenKai）优先 + 苹方/雅黑回退；webfont 用 `<style>` 内 `@import` 加载，Gmail/Outlook 会剥离 → 自动回退系统字体，属预期行为。

## 4. 踩坑记录

| 问题 | 原因 | 解法 |
|------|------|------|
| 文章页没有 RSS 发现链接 | 子页面 metadata 覆盖 layout | 共享常量逐页展开 |
| Notion 401 | dotenv 默认只读 `.env`，项目配置在 `.env.local` | `dotenv.config({ path: '.env.local' })` |
| Notion 无法建库 | 集成权限里没有页面，且 workspace 顶级建库不支持 | 用户共享页面 + API 自动建库 |
| 暗色模式导航变暗正文不变 | Tailwind v4 `dark:` 默认跟随系统偏好 | `@custom-variant dark (&:where(.dark, .dark *))` |
| 订阅页双高亮 | `isArticle` 把不在排除清单的路径都当文章 | 排除 `/rss*` |
| Vercel Cron 鉴权一直失败 | 生产 `CRON_SECRET` 是空字符串；`vercel env pull` 默认只拉 development | 更新为真实密钥并重新部署；pull 时加 `--environment production` |
| 真实 bounced 事件被 webhook 忽略 | Resend 真实 `email.bounced`/`email.complained` payload 没有 `data.email`，收件人在 `data.to[0]` | `route.ts` 取 `data.email || data.to[0]` 回退，messageId 用 `email_id || message_id` |
| 本地验证 webhook 返回 403 | Cloudflare 拦截部分非浏览器 UA | 测试请求带 `User-Agent: Svix-Webhooks/1.0` |
| 邮件字体和网站不一致 | Gmail/Outlook 剥离 `<style>` 内 `@import`，无法加载 webfont | 字体栈兜底苹方/雅黑；Apple Mail 系列可正常加载，视为预期差异 |

## 5. 验证清单

1. `/rss.xml` 返回 200 且含 `lastBuildDate`。
2. 文章页 head 有 `application/rss+xml` link。
3. 订阅 → Notion 出现记录；重复提交返回 `duplicate: true`。
4. 深色/浅色两种系统偏好下分别截图检查正文与订阅页。
5. cron 手动触发（带 `Authorization: Bearer $CRON_SECRET`）确认 skipped/sent 状态。
6. webhook：正确签名返回 200 且事件落发送记录，伪造签名返回 401；测试后归档 Notion 测试行。
