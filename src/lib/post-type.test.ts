import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePostTypeName, isArticleKind, isArticleRecord } from './post-type';

// 2026-11-03 事故回归：About（📄 Page）曾被默认当成 post 混进文章列表。
// 这组测试锁死「白名单 + 失败关闭」的闸门规则。

test('parsePostTypeName 按关键词解析带 emoji 的选项名', () => {
  assert.equal(parsePostTypeName('📝 Post'), 'post');
  assert.equal(parsePostTypeName('📣 Announcement'), 'announcement');
  assert.equal(parsePostTypeName('📄 Page'), 'page');
  assert.equal(parsePostTypeName('⚙️ Config'), 'config');
});

test('parsePostTypeName 对空值与新类型失败关闭', () => {
  assert.equal(parsePostTypeName(''), 'unknown');
  assert.equal(parsePostTypeName(null), 'unknown');
  assert.equal(parsePostTypeName(undefined), 'unknown');
  assert.equal(parsePostTypeName('🔖 Bookmark'), 'unknown');
});

test('isArticleKind 只放行 post 与 announcement', () => {
  assert.equal(isArticleKind('post'), true);
  assert.equal(isArticleKind('announcement'), true);
  assert.equal(isArticleKind('page'), false);
  assert.equal(isArticleKind('config'), false);
  assert.equal(isArticleKind('unknown'), false);
});

test('isArticleRecord：Page 与 Config 无论如何不算文章', () => {
  assert.equal(isArticleRecord({ type: 'page', slug: 'about' }), false);
  assert.equal(isArticleRecord({ type: 'page', slug: 'links' }), false);
  assert.equal(isArticleRecord({ type: 'config', slug: 'contact-email' }), false);
  assert.equal(isArticleRecord({ type: 'unknown', slug: 'whatever' }), false);
  assert.equal(isArticleRecord({ slug: 'no-type' }), false);
  assert.equal(isArticleRecord({}), false);
});

test('isArticleRecord：保留 slug about 即使标成 Post 也不算文章', () => {
  assert.equal(isArticleRecord({ type: 'post', slug: 'about' }), false);
  assert.equal(isArticleRecord({ type: 'post', slug: 'hello-world' }), true);
  assert.equal(isArticleRecord({ type: 'announcement', slug: 'site-update' }), true);
});
