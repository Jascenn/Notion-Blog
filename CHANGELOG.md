# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add a CI workflow for lint, analytics tests, credential-free builds, and secret scanning.
- Add a pull-request template covering motivation, impact, verification and rollback.
- Add a PolyForm Noncommercial 1.0.0 license. Personal, research and other noncommercial use is permitted; commercial use requires separate permission.

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
