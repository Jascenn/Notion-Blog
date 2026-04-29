import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'zh-CN' });
const page = await ctx.newPage();

const errors = [];
const warnings = [];

page.on('console', msg => {
  const type = msg.type();
  if (type === 'error') errors.push({ text: msg.text(), location: msg.location() });
  if (type === 'warning') warnings.push({ text: msg.text() });
});

page.on('pageerror', err => {
  errors.push({ text: 'PAGE ERROR: ' + err.message, stack: err.stack });
});

console.log('Navigating to lingyi.bio...');
await page.goto('https://lingyi.bio/?nocache=1', { waitUntil: 'networkidle', timeout: 30000 });

// Give React time to hydrate
await page.waitForTimeout(2000);

console.log('\n=== ERRORS ===');
for (const e of errors) {
  console.log('text:', e.text);
  if (e.stack) console.log('stack:', e.stack.substring(0, 500));
  console.log('---');
}

console.log('\n=== WARNINGS (first 5) ===');
for (const w of warnings.slice(0, 5)) {
  console.log('text:', w.text);
  console.log('---');
}

await browser.close();
