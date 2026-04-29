import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'zh-CN' });
const page = await ctx.newPage();

const all = [];
page.on('console', msg => {
  all.push({ type: msg.type(), text: msg.text() });
});
page.on('pageerror', err => {
  all.push({ type: 'pageerror', text: err.message, stack: err.stack });
});

console.log('Loading http://localhost:3033/ ...');
await page.goto('http://localhost:3033/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);

console.log('\n=== ALL CONSOLE / ERRORS (full text) ===');
for (const m of all) {
  if (m.type === 'log' || m.type === 'info' || m.type === 'debug') continue;
  console.log(`[${m.type}]`, m.text.substring(0, 800));
  if (m.stack) console.log('STACK:', m.stack.substring(0, 600));
  console.log('---');
}

await browser.close();
