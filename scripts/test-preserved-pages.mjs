import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/archive-sept-2026/', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'snapshot-manifest.json'), 'utf8'));

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? files(name) : [name];
  });
}

test('the September archive retains every frozen deployment file unchanged', () => {
  const actual = files(path.join(root, 'pages')).map(name => path.relative(root, name)).sort();
  assert.deepEqual(actual, Object.keys(manifest.files).sort());
  for (const [name, digest] of Object.entries(manifest.files)) {
    assert.equal(createHash('sha256').update(readFileSync(path.join(root, name))).digest('hex'), digest, name);
  }
});

test('every archived document requests exclusion from search indexes', () => {
  for (const name of files(root).filter(name => name.endsWith('.html'))) {
    assert.match(readFileSync(name, 'utf8'), /<meta[^>]*name=["']robots["'][^>]*noindex/, name);
  }
});

test('compiled archive URLs stay within the frozen deployment', () => {
  for (const name of files(path.join(root, 'pages')).filter(name => /\.(html|js|css)$/.test(name))) {
    assert.doesNotMatch(readFileSync(name, 'utf8'), /\/NEWFOAMHOME\/(?!archive-sept-2026\/pages\/)/, name);
  }
  const menu = readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(menu, /href="\.\/pages\/"/);
  assert.match(menu, /href="\.\/pages\/managers\/"/);
});
