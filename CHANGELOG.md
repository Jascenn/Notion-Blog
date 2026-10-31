# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
