# Security Policy

## Supported version

Security fixes are applied to the latest `main` and the deployed
`https://lingyi.me` site.

## Report a vulnerability privately

Do not open a public issue for a vulnerability or include Notion integration
tokens, Vercel or Sentry credentials, private draft links, analytics exports,
or personal data. Use GitHub private vulnerability reporting from the
repository Security tab. If that option is unavailable, contact the repository
owner through a private GitHub channel.

Useful reports include the affected route or file, a minimal reproduction, the
expected and observed behavior, and the impact. Redact personal data and
tokens from screenshots and logs.

## In scope

- exposure of Notion, Vercel, Sentry, analytics, or other deployment secrets;
- bypassing HTML sanitization or the allowed image-host policy;
- cross-site scripting through Notion block content or Markdown rendering;
- an unauthenticated path that can read private drafts or write to Notion;
- a deployment or rewrite rule that exposes another origin or private route;
- accidental publication of local exports, backups, or private analytics.

## Safe research

Use a preview deployment and non-sensitive test content. Do not access private
accounts, alter production content, or publish an unpatched proof of concept.
