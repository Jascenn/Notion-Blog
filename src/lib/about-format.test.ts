import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyAboutSection, parseAboutMarkdown, parseProjectEntries, stripLeadingGuide } from './about-format';

test('classifyAboutSection 优先认标题末尾标记并剥掉标记', () => {
  const a = classifyAboutSection('我的那些项目 [projects]');
  assert.equal(a.kind, 'projects');
  assert.equal(a.display, '我的那些项目');
  const b = classifyAboutSection('随便写点啥 [contact]');
  assert.equal(b.kind, 'contact');
  assert.equal(b.display, '随便写点啥');
});

test('classifyAboutSection 无标记走别名，认不出降级 generic', () => {
  assert.equal(classifyAboutSection('我运营的项目').kind, 'projects');
  assert.equal(classifyAboutSection('我的项目').kind, 'projects');
  assert.equal(classifyAboutSection('联系方式').kind, 'contact');
  assert.equal(classifyAboutSection('关于我').kind, 'who');
  assert.equal(classifyAboutSection('随便一节').kind, 'generic');
});

test('stripLeadingGuide 剥离开头折叠说明，不误伤正文', () => {
  const withGuide = '<details>\n<summary>编辑说明</summary>\n照着写\n</details>\n\n正文第一段。\n\n## 我是谁\n\n内容。';
  const out = stripLeadingGuide(withGuide);
  assert.ok(out.startsWith('正文第一段。'));
  assert.ok(!out.includes('编辑说明'));
  assert.equal(stripLeadingGuide('正文没有说明。'), '正文没有说明。');
});

test('parseAboutMarkdown 保留三级标题为项目子条目标记', () => {
  const md = '开头。\n\n## 我运营的项目 [projects]\n\n先说一句。\n\n### 项目甲\n\n这是 [项目甲](https://a.example.com) 的说明。\n\n### 项目乙\n\n没有链接的说明。';
  const { intro, sections } = parseAboutMarkdown(md);
  assert.deepEqual(intro, ['开头。']);
  assert.equal(sections.length, 1);
  const { cards, rest } = parseProjectEntries(sections[0].paragraphs);
  assert.equal(rest.length, 1);
  assert.equal(cards.length, 2);
  assert.equal(cards[0].name, '项目甲');
  assert.equal(cards[0].url, 'https://a.example.com');
  assert.equal(cards[1].name, '项目乙');
  assert.equal(cards[1].url, null);
});

test('parseProjectEntries 兼容旧式链接行', () => {
  const { cards, rest } = parseProjectEntries(['[工具甲](https://t.example.com)：一个工具。', '普通段落。']);
  assert.equal(cards.length, 1);
  assert.equal(cards[0].name, '工具甲');
  assert.equal(cards[0].desc, '一个工具。');
  assert.deepEqual(rest, ['普通段落。']);
});
