# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.2] - 2026-11-03

### Changed
- 🛡️ **内容分型闸门（白名单加失败关闭）**：文章流改为只认 Type 为「📝 Post」「📣 Announcement」的记录。新增纯函数模块 `src/lib/post-type.ts` 统一解析与判定（含 Config 与 unknown 类型）；`getPostsOnly` 把白名单推进 Notion 查询条件并在返回后用 `isArticleRecord` 复核；Type 解析由「认不出默认 post」改为「认不出不当文章」。`getPostBySlug` 同步加同一闸门，Page、Config 与未标注记录按 slug 也打不开；相关文章与文章静态路径改走 `getPostsOnly`。新增 `node --test` 回归测试（tests/post-type.test.ts）锁死规则，防 About 类记录再次漏入
- ⚙️ **站点配置读取（首个配置项：公告条）**：新增 `getConfig(key)`，读博客库中 Type 为「⚙️ Config」、Slug 为配置键的记录，值取 Summary；首页顶部公告条接 `announcement-bar` 配置，已发布才生效，预览镜像页可读草稿供测试；取不到配置时不显示，不影响页面
- 🧩 **关于页小节标题别名**：`AboutStructured` 的特殊节识别放宽，「关于我」「我的项目」「联系方式」等同义标题也能命中对应版式，降低误改标题导致版式静默掉落的概率

## [2.3.1] - 2026-11-03

### Fixed
- 🐛 **关于页被误算成文章**：Notion 的 Type 选项名带 emoji 前缀（如「📄 Page」），`getPosts` 却用纯 `page` 逐字比对，永远匹配不上，Page 类记录被默认当成 post，导致中英文 About 混进文章索引、首页最近文章、搜索、RSS 与 sitemap，文章计数虚增（12 篇含 About，实为 11 篇）。改为按关键词解析 Type，并让 `getPostsOnly` 额外排除保留 slug `about`，关于页只走独立的 /about 路由

## [2.3.0] - 2026-11-01

### Added
- 🪪 **关于页结构化数据**：/about 与 /en/about 输出 ProfilePage + Person 的 JSON-LD @graph（身份描述、knowsAbout 六项、sameAs 五条、worksFor），并新增 FAQPage（中英各四问），供搜索引擎与 AI 准确识别凌一（[#37](https://github.com/Jascenn/Notion-Blog/pull/37)）
- 🇬🇧 英文关于页新建 Notion 记录（En-US）并发布，英文正文与中文一样走 Notion 数据源

### Changed
- ✍️ 关于页中英文正文全面重写（个人品牌 GEO 定稿口径）：身份句顺序对齐、数字改模糊口径、删除专业方向与常见问题可见节
- 🧩 `OptimizedAbout` 改为中英文都渲染 Notion 正文（此前英文页永远走写死 fallback），标题优先用 Notion 记录标题
- 📄 `public/llms.txt` 换品牌口径简介，项目与身份去掉 LionCC 与 OpenClaw 两行，lingyi.tools 改「运营」口径并补新词雷达
- 📮 关于页联系邮箱由旧 QQ 邮箱换为 lingyi@lingyi.me（正文在 Notion 侧更新）
- 📝 站点更新日志（ChangelogSection）新增 v2.3.0 条目（中英各一份）

## [2.2.1] - 2026-10-31

### Fixed
- 📥 周刊投递监控收不到退信数据：Resend 真实 `email.bounced` / `email.complained` 事件的 payload 没有 `data.email` 字段，收件人在 `data.to[0]`，webhook 因此把事件当无关数据忽略 → 取值改为 `data.email || data.to[0]` 回退（[#26](https://github.com/Jascenn/Notion-Blog/pull/26)）

### Changed
- ✉️ 周刊模板加入开场白与结尾（自我介绍 + 本期概览 + 下周见），不再开头直接甩文章列表
- 🅰️ 邮件字体栈与网站主题对齐：霞鹜文楷（LXGW WenKai）优先，苹方/雅黑回退；邮件头加载 webfont，支持客户端（Apple Mail 系列）可看到与网站一致的字体，Gmail/Outlook 自动回退系统字体（[#27](https://github.com/Jascenn/Notion-Blog/pull/27)）

## [2.2.0] - 2026-10-31

### Added
- ✉️ **邮件订阅全面升级**
  - 双重确认（Double Opt-in）：订阅先收确认邮件，点击确认后进入名单，防止恶意刷名单
  - 欢迎邮件：确认订阅后自动发送，附最近三篇文章与 RSS 地址
  - 每周聚合周刊：每周一 08:00（北京时间）汇总最近 7 天新文章，逐人送达
  - 一键退订：邮件加 List-Unsubscribe / List-Unsubscribe-Post 合规头（RFC 8058），自建退订页实时更新 Notion 名单状态
  - 退信/投诉监控：`email.bounced`、`email.complained` 事件写入 Notion 发送记录
- 🎨 **邮件模板重写（React Email）**
  - 品牌头（凌一 · LingYi + 期号日期）、文章封面图、收件箱预览摘要（preheader）
  - `color-scheme` 适配暗色模式客户端，附纯文本版本提升投递率
  - 主题行统一为「凌一 newsletter｜本周 N 篇更新（日期区间）」

### Changed
- 发送策略从「新文章发布次日凌晨单发」改为「每周一聚合发送」，cron 调整为周一 UTC 00:00
- 退信/投诉事件（email.bounced、email.complained）经 webhook 记录进 Notion 发送记录

### 配置
- 新增环境变量：可选 `NEWSLETTER_TOKEN_SECRET`、`NEWSLETTER_DIGEST_DAYS`；如启用退信/投诉 webhook 需配置 `RESEND_WEBHOOK_SECRET`

## [2.1.1] - 2026-10-31

### Fixed
- 🌙 暗色模式下文章正文与页面背景不变暗：为 Tailwind v4 声明基于 class 的 `dark` 变体，`dark:` 工具类改为跟随站内主题切换
- 🔵 订阅页「文章」与「订阅」同时高亮：`isArticle` 判断排除 `/rss` 路径
- 🎨 订阅页复制按钮与邮件订阅表单补充暗色样式

## [2.1.0] - 2026-10-31

### Added
- ✉️ **邮件订阅**
  - 订阅页新增邮箱表单，新文章发布时可收到邮件通知（名单写入 Notion「订阅名单」库）
  - `POST /api/subscribe`：邮箱校验、同 IP 限流、重复订阅识别
  - Notion 订阅名单库支持自动创建（`NOTION_SUBSCRIBERS_PARENT_PAGE_ID`）或显式指定（`NOTION_SUBSCRIBERS_DATABASE_ID`）
- 📋 RSS 订阅地址一键复制按钮

### Changed
- 🧭 导航「订阅」入口从 `/rss.xml` 裸 XML 改为 `/rss` 订阅引导页
- 🔍 全站 10 个页面的 `metadata.alternates` 补齐 RSS 自动发现链接（此前被子页面 metadata 覆盖丢失）
- 📰 Feed 元数据完善：频道标题/描述改为站点名称与简介，新增 `lastBuildDate`

## [Unreleased]

### Added

- Add a CI workflow for lint, analytics tests, credential-free builds, and secret scanning.
- Add a pull-request template covering motivation, impact, verification and rollback.
- Add a PolyForm Noncommercial 1.0.0 license. Personal, research and other noncommercial use is permitted; commercial use requires separate permission.
- Add contribution and security guidance, issue forms, CODEOWNERS, and monthly dependency-update checks.

### Changed

- Align the README, `package.json` and lockfile license metadata with the repository license.

### Rollback

- Revert the license commit to restore the previous README and package metadata.
- The website-facing changelog component and production content are not modified.

## [1.4.3] - 2026-10-22

### Added

- Add Google Analytics 4 tracking (`G-E4M631F46C`) alongside the existing Umami integration.

## [1.4.2] - 2026-10-22

### Fixed

- Add `og:url` to static pages and align the sitemap root URL with the homepage canonical.

## [1.4.1] - 2026-10-09

### Changed

- Simplify the 404 page to match the lingyi.tools visual language.

## [1.4.0] - 2026-04-28

### Added

- Preserve Notion tag colors.
- Add security headers and an image-host allowlist.
- Add Notion setup, security checklist and solution documentation.

### Fixed

- Remove the image transformer that broke signed Notion/S3 image URLs.
- Prevent indented Notion paragraphs from rendering as code blocks.
