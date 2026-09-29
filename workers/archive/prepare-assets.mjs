import { createHash } from 'node:crypto';
import { chmod, cp, lstat, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultSource = path.resolve(here, '../../../output/private-page-archive/2026-09-29-home-and-managers/online-snapshot-source');
const args = process.argv.slice(2);
const options = {};
while (args.length) {
  const flag = args.shift();
  if (!['--source', '--preserve-source'].includes(flag) || !args[0] || args[0].startsWith('--')) throw new Error(`Unexpected argument: ${flag}`);
  options[flag.slice(2)] = path.resolve(args.shift());
}
const source = options.source || defaultSource;
const assets = path.join(here, '.assets');
const staging = path.join(here, '.assets-preparing');
const deploy = path.join(here, '.deploy');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const archiveBase = '/NEWFOAMHOME/archive-sept-2026/pages/';
const oldOrigin = 'https://steveblackboxapi.github.io';

async function listFiles(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link ${path.join(directory, entry.name)}`);
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) result.push(relative);
    else throw new Error(`Unsupported file ${relative}`);
  }
  return result.sort();
}

async function verifySource(directory, manifest) {
  const files = (await listFiles(path.join(directory, 'pages'))).map((name) => `pages/${name}`);
  if (JSON.stringify(files) !== JSON.stringify(Object.keys(manifest.files).sort())) throw new Error('Frozen file inventory does not match snapshot manifest');
  for (const name of files) {
    if (sha256(await readFile(path.join(directory, name))) !== manifest.files[name]) throw new Error(`Frozen checksum mismatch: ${name}`);
  }
}

const manifestBytes = await readFile(path.join(source, 'snapshot-manifest.json'));
const snapshot = JSON.parse(manifestBytes);
if (snapshot.archiveBase !== archiveBase || Object.keys(snapshot.files).length !== 953) throw new Error('Unexpected archive snapshot');
await verifySource(source, snapshot);

// Preserve a private rebuild input before removing the public deployment copy.
if (options['preserve-source']) {
  const target = options['preserve-source'];
  let exists = false;
  try { await lstat(target); exists = true; } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (exists) {
    if (!manifestBytes.equals(await readFile(path.join(target, 'snapshot-manifest.json')))) throw new Error('Existing private source belongs to a different snapshot');
    await verifySource(target, snapshot);
  } else {
    await mkdir(target, { recursive: true, mode: 0o700 });
    await cp(path.join(source, 'pages'), path.join(target, 'pages'), { recursive: true, errorOnExist: true, force: false });
    await writeFile(path.join(target, 'snapshot-manifest.json'), manifestBytes, { mode: 0o600 });
    await verifySource(target, snapshot);
  }
  await chmod(target, 0o700);
}

await mkdir(deploy, { recursive: true, mode: 0o700 });
await chmod(deploy, 0o700);
// Only generated staging/output directories are replaced. Frozen inputs stay untouched.
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { mode: 0o700 });
const uploadManifest = {};
const hashFiles = {};
const changed = [];
const digests = {};
const registration = 'function Ui(){if(typeof window>`u`||!window.isSecureContext||!(`serviceWorker`in navigator))return Promise.resolve(null);if(!Hi){let e=new URL(`/NEWFOAMHOME/archive-sept-2026/pages/`,window.location.origin),t=new URL(`foam-media-sw.js`,e);t.searchParams.set(`v`,l.revision),Hi=navigator.serviceWorker.register(t.href,{scope:e.pathname,updateViaCache:`none`}).catch(()=>null)}return Hi}';
const inertWorker = `/* Private archive: no offline copies of authenticated media. */\nself.addEventListener('install', event => event.waitUntil(self.skipWaiting()));\nself.addEventListener('activate', event => event.waitUntil((async () => {\n  const prefix = 'foam-media-v1:' + new URL(self.registration.scope).pathname + ':';\n  await Promise.all((await caches.keys()).filter(name => name.startsWith(prefix)).map(name => caches.delete(name)));\n  await self.registration.unregister();\n})()));\n`;
let registrationRemoved = false;
let totalBytes = 0;
for (const name of Object.keys(snapshot.files).sort()) {
  const original = await readFile(path.join(source, name));
  let bytes = original;
  const reasons = [];
  if (/\.(html|js|css|json)$/.test(name)) {
    let text = bytes.toString('utf8');
    if (text.includes(`${oldOrigin}${archiveBase}`)) {
      text = text.replaceAll(`${oldOrigin}${archiveBase}`, archiveBase);
      reasons.push('Keep absolute archive navigation on the authenticated origin');
    }
    if (name === 'pages/assets/index-C3yzrMFk.js') {
      if (text.split(registration).length !== 2) throw new Error('Expected one frozen service-worker registration function');
      text = text.replace(registration, 'function Ui(){return Promise.resolve(null)}');
      registrationRemoved = true;
      reasons.push('Disable media service-worker registration and offline caching');
    }
    if (name === 'pages/foam-media-sw.js') {
      text = inertWorker;
      reasons.push('Retire any earlier scoped media cache; never intercept or cache requests');
    }
    if (/serviceWorker\s*\.\s*register\s*\(/.test(text)) throw new Error(`Unexpected remaining service-worker registration in ${name}`);
    if (text.includes(`${oldOrigin}${archiveBase}`)) throw new Error(`Public archive fallback remains in ${name}`);
    bytes = Buffer.from(text);
  }
  const urlPath = archiveBase + name.slice('pages/'.length);
  const outputRelative = urlPath.slice(1);
  const output = path.join(staging, outputRelative);
  await mkdir(path.dirname(output), { recursive: true, mode: 0o700 });
  await writeFile(output, bytes, { mode: 0o600 });
  const servedSha256 = sha256(bytes);
  if (servedSha256 !== snapshot.files[name]) changed.push({ file: name, originalSha256: snapshot.files[name], servedSha256, reasons });
  else if (reasons.length) throw new Error(`Change did not affect ${name}`);
  // Cloudflare direct upload's extension excludes the leading dot.
  const hash = sha256(bytes.toString('base64') + path.extname(name).slice(1)).slice(0, 32);
  uploadManifest[urlPath] = { hash, size: bytes.length };
  if (hashFiles[hash] && hashFiles[hash].sha256 !== servedSha256) throw new Error('Truncated upload hash collision');
  hashFiles[hash] ||= { file: path.join(assets, outputRelative), size: bytes.length, sha256: servedSha256, extension: path.extname(name).slice(1), urls: [] };
  hashFiles[hash].urls.push(urlPath);
  digests[urlPath] = servedSha256;
  totalBytes += bytes.length;
}
if (!registrationRemoved) throw new Error('Service-worker registration was not disabled');
await rm(assets, { recursive: true, force: true });
await rename(staging, assets);
const audit = {
  sourceCommit: snapshot.sourceCommit,
  originalArtifactSha256: snapshot.artifactSha256,
  snapshotManifestSha256: sha256(manifestBytes),
  archiveBase,
  files: Object.keys(uploadManifest).length,
  uniqueUploadHashes: Object.keys(hashFiles).length,
  totalBytes,
  originalChecksums: snapshot.files,
  servedChecksums: digests,
  securityModifiedFiles: changed,
};
for (const [name, data] of Object.entries({ 'asset-manifest.json': uploadManifest, 'hash-files.json': hashFiles, 'asset-audit.json': audit })) {
  await writeFile(path.join(deploy, name), `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
}
console.log(JSON.stringify({ files: audit.files, uniqueUploadHashes: audit.uniqueUploadHashes, totalBytes, securityModifiedFiles: changed.map(({ file }) => file), manifest: path.join(deploy, 'asset-manifest.json'), hashFiles: path.join(deploy, 'hash-files.json') }, null, 2));
