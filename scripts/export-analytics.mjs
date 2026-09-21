#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from 'dotenv';

import { analyticsToCsv } from '../src/lib/analytics-export.mjs';
import { collectAnalyticsRange } from '../src/lib/analytics-sync.mjs';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, '').split('=');
    return [key, value.join('=') || true];
  })
);

const apiBase = (process.env.UMAMI_API_BASE || 'https://api.umami.is/v1').replace(/\/$/, '');
const apiKey = process.env.UMAMI_API_KEY;
const shareSlug = process.env.UMAMI_SHARE_SLUG;
const websiteId = process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const days = Number(args.days || 30);
const format = String(args.format || 'json').toLowerCase();
const output = resolve(String(args.output || `analytics-${days}d.${format}`));

if ((!apiKey && !shareSlug) || !websiteId) {
  console.error(
    'Missing analytics credentials. Add UMAMI_WEBSITE_ID and either UMAMI_API_KEY or UMAMI_SHARE_SLUG to .env.local.'
  );
  process.exit(1);
}

if (!Number.isFinite(days) || days < 1 || days > 3650) {
  console.error('--days must be a number between 1 and 3650.');
  process.exit(1);
}

if (!['json', 'csv'].includes(format)) {
  console.error('--format must be either json or csv.');
  process.exit(1);
}

const endAt = Date.now();
const startAt = endAt - days * 24 * 60 * 60 * 1000;

async function request(path, params = {}) {
  const url = new URL(`${apiBase}/websites/${websiteId}/${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${body.slice(0, 500)}`);
  }

  return response.json();
}

const range = { startAt, endAt };
const metricTypes = ['path', 'referrer', 'channel', 'country', 'device', 'browser', 'os', 'event'];

try {
  const unit = days <= 2 ? 'hour' : 'day';
  const exportData = apiKey
    ? await (async () => {
        const [stats, pageviews, ...metricResults] = await Promise.all([
          request('stats', range),
          request('pageviews', { ...range, unit }),
          ...metricTypes.map((type) => request('metrics', { ...range, type, limit: 500 })),
        ]);
        return {
          schemaVersion: 1,
          provider: 'umami',
          websiteId,
          generatedAt: new Date().toISOString(),
          stats,
          pageviews,
          metrics: Object.fromEntries(
            metricTypes.map((type, index) => [type, metricResults[index]])
          ),
        };
      })()
    : await collectAnalyticsRange({ startAt, endAt, unit, websiteId, shareSlug });

  exportData.range = {
    days,
    startAt,
    endAt,
    start: new Date(startAt).toISOString(),
    end: new Date(endAt).toISOString(),
  };

  const content =
    format === 'csv' ? analyticsToCsv(exportData) : `${JSON.stringify(exportData, null, 2)}\n`;
  await writeFile(output, content, 'utf8');
  console.log(`Analytics exported to ${output}`);
} catch (error) {
  console.error(
    `Analytics export failed: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
