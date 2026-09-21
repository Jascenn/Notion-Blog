import assert from 'node:assert/strict';
import test from 'node:test';

import { analyticsToCsv } from './analytics-export.mjs';
import { previousShanghaiDate, rangeForShanghaiDate } from './analytics-sync.mjs';

test('returns the previous Shanghai calendar day after midnight', () => {
  assert.equal(previousShanghaiDate(new Date('2026-09-19T16:30:00.000Z')), '2026-09-19');
});

test('uses the prior day before Shanghai midnight', () => {
  assert.equal(previousShanghaiDate(new Date('2026-09-19T15:59:59.999Z')), '2026-09-18');
});

test('handles year boundaries', () => {
  assert.equal(previousShanghaiDate(new Date('2025-12-31T16:00:00.000Z')), '2025-12-31');
});

test('builds exact Shanghai day boundaries', () => {
  assert.deepEqual(rangeForShanghaiDate('2026-09-19'), {
    startAt: Date.parse('2026-09-19T00:00:00+08:00'),
    endAt: Date.parse('2026-09-20T00:00:00+08:00'),
  });
});

test('exports analytics as import-friendly long-form CSV', () => {
  const csv = analyticsToCsv({
    stats: { pageviews: 3 },
    pageviews: { pageviews: [{ x: 1_789_776_000_000, y: 3 }] },
    metrics: { path: [{ x: '/notes,ideas', y: 2 }] },
  });

  assert.match(csv, /^\uFEFFdataset,metric,timestamp,label,value\n/);
  assert.match(csv, /stats,pageviews,,,3/);
  assert.match(csv, /timeseries,pageviews,1789776000000,,3/);
  assert.match(csv, /dimension,path,,"\/notes,ideas",2/);
});
