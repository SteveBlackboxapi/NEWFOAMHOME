import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repo = fileURLToPath(new URL('../', import.meta.url));
const root = path.join(repo, 'public/archive-sept-2026');
const protectedOrigin = 'https://foam-archive.stevendavidlewis80.workers.dev';
const archiveScope = '/NEWFOAMHOME/archive-sept-2026/pages/';
const redirects = {
  'index.html': `${protectedOrigin}/`,
  'pages/index.html': `${protectedOrigin}${archiveScope}`,
  'pages/managers/index.html': `${protectedOrigin}${archiveScope}managers/`,
};

function files(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(prefix, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Public archive must not link to private content: ${relative}`);
    return entry.isDirectory() ? files(path.join(directory, entry.name), relative) : [relative];
  }).sort();
}

test('the public archive contains only redirects and a scoped service-worker retirement script', () => {
  assert.deepEqual(files(root), [...Object.keys(redirects), 'pages/foam-media-sw.js'].sort());
  for (const name of files(path.join(repo, 'public'))) {
    assert.doesNotMatch(name, /(?:^|\/)(?:online-snapshot-source|snapshot-manifest\.json|asset-audit\.json|hash-files\.json|published-site\.zip|editable-source\.zip|\.assets|\.deploy)(?:\/|$)/, name);
  }
});

test('legacy archive addresses redirect to corresponding protected pages with a clickable fallback', () => {
  for (const [name, destination] of Object.entries(redirects)) {
    const html = readFileSync(path.join(root, name), 'utf8');
    assert.ok(html.includes(`<meta http-equiv="refresh" content="2;url=${destination}">`), name);
    assert.ok(html.includes(`href="${destination}"`), name);
    assert.ok(html.includes(`location.replace('${destination}')`), name);
    assert.match(html, /<meta[^>]*name="robots"[^>]*noindex, nofollow, noarchive/, name);
    assert.doesNotMatch(html, /<img\b|<video\b|<iframe\b|<script[^>]+src=/i, name);
  }
});

async function runRetirement(scopePath, names) {
  const handlers = new Map();
  const deleted = [];
  let unregistered = 0;
  let pending;
  const context = {
    URL,
    self: {
      registration: { scope: `https://steveblackboxapi.github.io${scopePath}`, async unregister() { unregistered++; } },
      async skipWaiting() {},
      addEventListener(name, fn) { handlers.set(name, fn); },
    },
    caches: { async keys() { return names; }, async delete(name) { deleted.push(name); } },
  };
  vm.runInNewContext(readFileSync(path.join(root, 'pages/foam-media-sw.js'), 'utf8'), context);
  assert.ok(!handlers.has('fetch'), 'Retired worker must not intercept requests');
  handlers.get('activate')({ waitUntil(promise) { pending = promise; } });
  await pending;
  return { deleted, unregistered };
}

test('archive worker retirement never clears the live site cache or other scopes', async () => {
  const archive = `foam-media-v1:${archiveScope}:frozen`;
  const live = 'foam-media-v1:/NEWFOAMHOME/:current';
  const other = 'foam-media-v1:/another-archive/:old';
  const names = [archive, live, other, 'unrelated-cache'];
  assert.deepEqual(await runRetirement(archiveScope, names), { deleted: [archive], unregistered: 1 });
  assert.deepEqual(await runRetirement('/NEWFOAMHOME/', names), { deleted: [], unregistered: 0 });
});

test('redirect cleanup unregisters only the former public archive and preserves live caches', async () => {
  const removed = [];
  const deleted = [];
  let redirected;
  const scopes = [archiveScope, '/NEWFOAMHOME/', '/another-archive/'];
  const cacheNames = [`foam-media-v1:${archiveScope}:frozen`, 'foam-media-v1:/NEWFOAMHOME/:current', 'unrelated-cache'];
  const html = readFileSync(path.join(root, 'index.html'), 'utf8');
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
  await vm.runInNewContext(script, {
    URL,
    setTimeout,
    window: { caches: {} },
    location: { origin: 'https://steveblackboxapi.github.io', replace(url) { redirected = url; } },
    navigator: { serviceWorker: { async getRegistrations() { return scopes.map(scope => ({ scope: `https://steveblackboxapi.github.io${scope}`, async unregister() { removed.push(scope); } })); } } },
    caches: { async keys() { return cacheNames; }, async delete(name) { deleted.push(name); } },
  });
  assert.deepEqual(removed, [archiveScope]);
  assert.deepEqual(deleted, [cacheNames[0]]);
  assert.equal(redirected, `${protectedOrigin}/`);
});

test('private assets require Worker authorization and are excluded from the public build tree', () => {
  const config = JSON.parse(readFileSync(path.join(repo, 'workers/archive/wrangler.jsonc'), 'utf8'));
  assert.equal(config.assets.directory, '.assets');
  assert.equal(config.assets.binding, 'ASSETS');
  assert.equal(config.assets.run_worker_first, true);
  assert.equal(config.preview_urls, false);
  const ignores = readFileSync(path.join(repo, '.gitignore'), 'utf8');
  assert.match(ignores, /^workers\/archive\/\.assets\/$/m);
  assert.match(ignores, /^workers\/archive\/\.deploy\/$/m);
  const packageScript = readFileSync(path.join(repo, 'workers/archive/prepare-assets.mjs'), 'utf8');
  assert.match(packageScript, /output\/private-page-archive\//);
  assert.doesNotMatch(packageScript, /writeFile\([^\n]*public\//);
});
