import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GISCUS_CONFIG,
  GISCUS_LOAD_TIMEOUT_MS,
  getDiscussionsFallbackUrl,
  hasGiscusReturnParam,
  isCommentsEnabled,
  resolveGiscusLang,
  resolveGiscusTheme,
} from './giscus';

test('GISCUS_CONFIG 包含有效的默认仓库与分类 ID', () => {
  assert.equal(GISCUS_CONFIG.repo, 'Jascenn/Notion-Blog');
  assert.equal(GISCUS_CONFIG.repoId, 'R_kgDOH1UIBg');
  assert.equal(GISCUS_CONFIG.category, 'Announcements');
  assert.equal(GISCUS_CONFIG.categoryId, 'DIC_kwDOH1UIBs4DMFvl');
  assert.ok(GISCUS_CONFIG.themeVersion.length > 0);
});

test('isCommentsEnabled 未配置或空值默认开启，关闭关键词返回 false', () => {
  assert.equal(isCommentsEnabled(undefined), true);
  assert.equal(isCommentsEnabled(null), true);
  assert.equal(isCommentsEnabled(''), true);
  assert.equal(isCommentsEnabled('   '), true);
  assert.equal(isCommentsEnabled('true'), true);
  assert.equal(isCommentsEnabled('on'), true);

  assert.equal(isCommentsEnabled('false'), false);
  assert.equal(isCommentsEnabled(' FALSE '), false);
  assert.equal(isCommentsEnabled('0'), false);
  assert.equal(isCommentsEnabled('off'), false);
  assert.equal(isCommentsEnabled('no'), false);
  assert.equal(isCommentsEnabled('disabled'), false);
});

test('resolveGiscusLang 正确映射中英文语言代码', () => {
  assert.equal(resolveGiscusLang('zh'), 'zh-CN');
  assert.equal(resolveGiscusLang('en'), 'en');
});

test('resolveGiscusTheme 线上 HTTPS 使用自定义 CSS，本地与非 HTTPS 回退内置主题', () => {
  assert.equal(
    resolveGiscusTheme(false, 'https://lingyi.me'),
    `https://lingyi.me/styles/giscus-light.css?v=${GISCUS_CONFIG.themeVersion}`,
  );
  assert.equal(
    resolveGiscusTheme(true, 'https://lingyi.me/'),
    `https://lingyi.me/styles/giscus-dark.css?v=${GISCUS_CONFIG.themeVersion}`,
  );

  assert.equal(resolveGiscusTheme(false, 'http://localhost:3000'), 'light');
  assert.equal(resolveGiscusTheme(true, 'http://localhost:3000'), 'dark_dimmed');
  assert.equal(resolveGiscusTheme(false, 'https://localhost:3000'), 'light');
  assert.equal(resolveGiscusTheme(true, 'https://127.0.0.1:3000'), 'dark_dimmed');
  assert.equal(resolveGiscusTheme(false, undefined), 'light');
  assert.equal(resolveGiscusTheme(true, ''), 'dark_dimmed');
});

test('hasGiscusReturnParam 精确识别登录回跳参数', () => {
  assert.equal(hasGiscusReturnParam('?giscus=abc'), true);
  assert.equal(hasGiscusReturnParam('?foo=1&giscus=abc'), true);
  assert.equal(hasGiscusReturnParam('?giscus='), true);
  assert.equal(hasGiscusReturnParam(''), false);
  assert.equal(hasGiscusReturnParam('?foo=giscus'), false);
  assert.equal(hasGiscusReturnParam('?other=1'), false);
});

test('getDiscussionsFallbackUrl 正确构造 Discussions 兜底链接', () => {
  assert.equal(GISCUS_LOAD_TIMEOUT_MS, 10000);
  assert.equal(
    getDiscussionsFallbackUrl(),
    'https://github.com/Jascenn/Notion-Blog/discussions/categories/announcements',
  );
  assert.equal(
    getDiscussionsFallbackUrl('Jascenn/Notion-Blog', 'General'),
    'https://github.com/Jascenn/Notion-Blog/discussions/categories/general',
  );
  assert.equal(
    getDiscussionsFallbackUrl('Jascenn/Notion-Blog', ''),
    'https://github.com/Jascenn/Notion-Blog/discussions',
  );
  assert.equal(
    getDiscussionsFallbackUrl('Jascenn/Notion-Blog', 'Q&A'),
    'https://github.com/Jascenn/Notion-Blog/discussions/categories/q%26a',
  );
});
