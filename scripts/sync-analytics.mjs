#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import {
  collectDailyAnalytics,
  previousShanghaiDate,
  upsertAnalyticsInNotion,
} from '../src/lib/analytics-sync.mjs';

config({ path: '.env.local', quiet: true });
config({ quiet: true });

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, '').split('=');
    return [key, value.join('=') || true];
  })
);
const date = String(args.date || previousShanghaiDate());
const outputDir = resolve(String(args['output-dir'] || 'analytics-data'));
const dryRun = args['dry-run'] === true || args['dry-run'] === 'true';

try {
  const snapshot = await collectDailyAnalytics({ date });
  const [year, month] = date.split('-');
  const directory = resolve(outputDir, year, month);
  const output = resolve(directory, `${date}.json`);
  await mkdir(directory, { recursive: true });
  await writeFile(output, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');

  const notion = dryRun ? { status: 'dry-run', date } : await upsertAnalyticsInNotion(snapshot);
  console.log(JSON.stringify({ ok: true, output, notion, stats: snapshot.stats }, null, 2));
} catch (error) {
  console.error(`Analytics sync failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
