# Contributing

Simple Blog reads published content from Notion and is deployed to Vercel at
`https://lingyi.me`. Notion credentials, content rendering, public routes, and
deployment configuration are production-sensitive.

## Branches and commits

- Use a short-lived branch: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, or
  `chore/<topic>`.
- Keep one intent per pull request. Do not mix Notion schema changes, visual
  changes, analytics, and deployment changes.
- Use Conventional Commits in English, for example:
  `fix(notion): preserve cover images after a database migration`.
- Do not commit `.env` files, Notion integration tokens, Vercel tokens, Sentry
  credentials, private draft links, or raw analytics exports.

## Content and deployment rules

- Treat published Notion content as production content. Do not reword or
  restructure the author's articles without an explicit content request.
- Change the Notion schema only when the code, `.env.example`, and README are
  updated together.
- Preserve HTML sanitization, the image-host allowlist, and security headers
  when changing rendering code.
- Builds must remain usable without production content credentials; do not
  make CI depend on a private Notion database.
- Update the developer log `CHANGELOG.md` for repository changes. Do not mix it
  with the site's user-facing content.

## Before opening a pull request

```bash
npm ci
npm run lint
npm run test:analytics
npm run build
```

- Explain the effect on Notion fields, public routes, SEO metadata, analytics,
  and CI.
- Include desktop and mobile screenshots for page changes.
- State the rollback path. Revert the pull request to restore the previous
  deployment; a Notion schema change must include its own recovery steps.

Report security issues according to [SECURITY.md](SECURITY.md).
