import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'zh-CN' });
const page = await ctx.newPage();

const result = await page.evaluate(() => {
  const date = new Date('2026-01-06T00:00:00');
  const fmt = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return { fmt, chars: [...fmt].map(c => c.charCodeAt(0).toString(16)).join(' ') };
});

console.log('Browser zh-CN output:', JSON.stringify(result.fmt));
console.log('chars:', result.chars);

const ctx2 = await browser.newContext({ locale: 'en-US' });
const page2 = await ctx2.newPage();
const result2 = await page2.evaluate(() => {
  const date = new Date('2026-01-06T00:00:00');
  const fmt = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return { fmt, chars: [...fmt].map(c => c.charCodeAt(0).toString(16)).join(' ') };
});
console.log('Browser zh-CN format (en-US locale ctx) output:', JSON.stringify(result2.fmt));
console.log('chars:', result2.chars);

await browser.close();
