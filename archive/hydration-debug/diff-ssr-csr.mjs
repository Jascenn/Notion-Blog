import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'zh-CN' });
const page = await ctx.newPage();

// Disable JS so we get pure SSR HTML
const ctxNoJS = await browser.newContext({ locale: 'zh-CN', javaScriptEnabled: false });
const pageNoJS = await ctxNoJS.newPage();

const url = 'https://lingyi.bio/?nocache=1';

console.log('Fetching SSR (no JS)...');
await pageNoJS.goto(url, { waitUntil: 'domcontentloaded' });
const ssrBody = await pageNoJS.locator('body').innerHTML();

console.log('Fetching CSR (after hydration)...');
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const csrBody = await page.locator('body').innerHTML();

import fs from 'node:fs';
fs.writeFileSync('/tmp/ssr-body.html', ssrBody);
fs.writeFileSync('/tmp/csr-body.html', csrBody);

console.log('SSR length:', ssrBody.length);
console.log('CSR length:', csrBody.length);
console.log('Files saved to /tmp/ssr-body.html and /tmp/csr-body.html');

await browser.close();
