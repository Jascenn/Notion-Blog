import assert from 'node:assert/strict';
import test from 'node:test';

import { analyticsToCsv } from './analytics-export.mjs';
import {
  collectAnalyticsRange,
  previousShanghaiDate,
  rangeForShanghaiDate,
} from './analytics-sync.mjs';

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

test('rejects invalid export ranges before making network requests', async () => {
  await assert.rejects(collectAnalyticsRange({ startAt: 2, endAt: 1 }), /Invalid analytics range/);
});

test('collects an export range through the free share API', async () => {
  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(String(input));
    requests.push({ url, headers: options.headers || {} });

    if (url.pathname === '/api/share/demo-slug') {
      return Response.json({ token: 'share-token' });
    }
    if (url.pathname.endsWith('/stats')) {
      return Response.json({ pageviews: 3, visitors: 2, visits: 2, bounces: 1 });
    }
    if (url.pathname.endsWith('/pageviews')) {
      return Response.json({ pageviews: [{ x: 1, y: 3 }], sessions: [{ x: 1, y: 2 }] });
    }
    if (url.pathname.endsWith('/metrics')) {
      return Response.json([]);
    }
    return new Response('Not found', { status: 404 });
  };

  try {
    const result = await collectAnalyticsRange({
      startAt: 1,
      endAt: 2,
      gateway: 'https://gateway.example/api/',
      shareSlug: 'demo-slug',
      websiteId: 'website-id',
    });

    assert.equal(result.provider, 'umami-share');
    assert.equal(result.stats.pageviews, 3);
    assert.deepEqual(result.metrics.channel, []);
    assert.equal(requests.length, 11);
    assert.equal(requests[1].headers['x-umami-share-token'], 'share-token');
  } finally {
    globalThis.fetch = originalFetch;
  }
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
