/*
 * Browser-level smoke suite for Termux.
 *
 * This deliberately uses the checked-in playwright-termux installation rather
 * than Playwright's browser downloader.  It starts the real Koa application
 * against a disposable notes directory and tests both desktop and mobile
 * viewports.
 */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('../playwright-termux/node_modules/playwright-core');

const repoRoot = path.resolve(__dirname, '..');
const chromiumPath = process.env.CHROMIUM_PATH || '/data/data/com.termux/files/usr/bin/chromium-browser';
// A per-process port also gives every run a fresh service-worker/IndexedDB
// origin. Set NOTED_E2E_PORT when a fixed port is useful for local debugging.
const port = Number(process.env.NOTED_E2E_PORT || (4100 + (process.pid % 1000)));
const baseUrl = `http://127.0.0.1:${port}`;
let server;
let workspace;

function waitForServer(url, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(`${url}/api/status`, (response) => {
        response.resume();
        if (response.statusCode === 200) return resolve();
        retry();
      });
      request.on('error', retry);
      request.setTimeout(1_000, () => request.destroy());
    };
    const retry = () => {
      if (Date.now() > deadline) return reject(new Error(`Server did not become ready at ${url}`));
      setTimeout(attempt, 150);
    };
    attempt();
  });
}

async function clickListItem(page, text) {
  await page.locator('mdui-list-item').filter({ hasText: text }).first().click();
}

async function startServer() {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'noted-e2e-'));
  await fs.mkdir(path.join(workspace, 'nested'));
  await fs.writeFile(path.join(workspace, 'Welcome.md'), '# Welcome\nTermux browser smoke test.\n');
  await fs.writeFile(path.join(workspace, 'nested', 'Mobile.md'), '# Mobile note\n');

  server = spawn(
    path.join(repoRoot, 'node_modules', '.bin', 'tsx'),
    [path.join(repoRoot, 'server', 'src', 'index.ts'), workspace, '--port', String(port), '--no-increment-port'],
    { cwd: repoRoot, env: { ...process.env, NODE_ENV: 'development' }, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  server.stderr.on('data', (data) => process.stderr.write(`[noted] ${data}`));
  await Promise.race([
    waitForServer(baseUrl),
    new Promise((_, reject) => server.once('error', reject)),
  ]);
}

async function desktopFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  await assert.doesNotReject(() => page.locator('mdui-list-item').filter({ hasText: 'Welcome.md' }).first().waitFor());
  await clickListItem(page, 'Welcome.md');
  const editor = page.locator('textarea.native-textarea');
  await editor.waitFor();
  await assert.equal(await editor.inputValue(), '# Welcome\nTermux browser smoke test.\n');

  await fs.writeFile(path.join(workspace, 'Welcome.md'), '# Welcome\nUpdated outside noted.\n');
  await page.waitForFunction(
    (expected) => document.querySelector('textarea.native-textarea')?.value === expected,
    '# Welcome\nUpdated outside noted.\n',
  );

  await editor.fill('# Welcome\nSaved from desktop E2E.\n');
  await page.waitForTimeout(1_300); // Editor save debounce is one second.
  await assert.equal(await fs.readFile(path.join(workspace, 'Welcome.md'), 'utf8'), '# Welcome\nSaved from desktop E2E.\n');

  await page.locator('mdui-button-icon[tooltip="Preview"]').click();
  await page.locator('.preview-container').waitFor();
  await assert.match(await page.locator('.preview-container').innerText(), /Saved from desktop E2E/);
  await page.locator('mdui-button-icon[tooltip="Back to editor"]').click();
  await editor.waitFor();

  await page.getByLabel('Back to file list').click();
  await page.locator('.file-browser').waitFor();
  await fs.rename(path.join(workspace, 'Welcome.md'), path.join(workspace, 'nested', 'Moved.md'));
  await page.locator('mdui-list-item').filter({ hasText: 'Welcome.md' }).waitFor({ state: 'detached' });
  await context.close();
}

async function mobileFlow(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  await clickListItem(page, 'nested');
  await page.locator('mdui-list-item').filter({ hasText: 'Moved.md' }).waitFor();
  await clickListItem(page, 'Mobile.md');
  await page.locator('textarea.native-textarea').waitFor();

  // The responsive file sidebar is closed initially, then closes again after
  // choosing a file so it does not cover the editor on a phone.
  await assert.equal(await page.locator('.editor-sidebar.is-open').count(), 0);
  await page.locator('mdui-button-icon[tooltip="Toggle file sidebar"]').click();
  await page.locator('.editor-sidebar.is-open').waitFor();
  await assert.equal(await page.locator('.sidebar-backdrop').count(), 1);
  await page.locator('.sidebar-backdrop').click({ position: { x: 5, y: 5 } });
  await assert.equal(await page.locator('.editor-sidebar.is-open').count(), 0);

  await fs.rm(path.join(workspace, 'nested', 'Mobile.md'));
  await page.locator('.file-browser').waitFor();
  await assert.equal(await page.locator('mdui-list-item').filter({ hasText: 'Mobile.md' }).count(), 0);
  await context.close();
}

async function main() {
  await fs.access(chromiumPath);
  await startServer();
  const browser = await chromium.launch({
    executablePath: chromiumPath,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });
  try {
    await desktopFlow(browser);
    await mobileFlow(browser);
    console.log('PASS noted Termux E2E: desktop and mobile flows');
  } finally {
    await browser.close();
  }
}

main()
  .catch((error) => {
    console.error('FAIL noted Termux E2E:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server && !server.killed) server.kill('SIGTERM');
    if (workspace) await fs.rm(workspace, { recursive: true, force: true });
  });
