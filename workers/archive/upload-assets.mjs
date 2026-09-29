// Uses only a short-lived, asset-upload-scoped token; never prints it.
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('./.deploy/', import.meta.url);
const session = JSON.parse(await readFile(new URL('upload-session.json', root), 'utf8'));
const files = JSON.parse(await readFile(new URL('hash-files.json', root), 'utf8'));
const account = '97692086694e547d77e989d9ea676987';
const mime = {html:'text/html',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',mp4:'video/mp4',webm:'video/webm',m4a:'audio/mp4',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',md:'text/markdown',txt:'text/plain'};
let completion = session.buckets.length ? null : session.jwt;
// Smaller batches avoid gateway timeouts on slow local upstream connections.
const batches = [];
for (const bucket of session.buckets) {
  let batch = [], size = 0;
  for (const hash of bucket) {
    if (!files[hash]) throw new Error('Incomplete upload session: a requested hash is not in the manifest.');
    if (size && size + files[hash].size > 8_000_000) { batches.push(batch); batch = []; size = 0; }
    batch.push(hash); size += files[hash].size;
  }
  if (batch.length) batches.push(batch);
}
let next = 0, finished = 0;
async function upload(hashes) {
  const body = new FormData();
  for (const hash of hashes) {
    const item = files[hash];
    const bytes = await readFile(item.file);
    body.append(hash, new Blob([bytes.toString('base64')], {type:mime[item.extension] || 'application/octet-stream'}), hash);
  }
  for (let attempt = 1; attempt <= 4; attempt++) {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/workers/assets/upload?base64=true`, {
      method:'POST', headers:{Authorization:`Bearer ${session.jwt}`}, body,
    });
    const text = await response.text();
    let result; try { result = JSON.parse(text); } catch { result = {success:false}; }
    if (response.ok && result.success) {
      if (result.result?.jwt) completion = result.result.jwt;
      console.log(`Uploaded batch ${++finished}/${batches.length} (${hashes.length} assets)`);
      return;
    }
    if (attempt === 4 || (response.status < 500 && response.status !== 429)) throw new Error(`Asset upload failed (${response.status}): ${JSON.stringify(result.errors || [])}`);
    console.log(`Retrying an upload after gateway status ${response.status}`);
    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
  }
}
await Promise.all(Array.from({length:3}, async () => { while (next < batches.length) await upload(batches[next++]); }));
if (!completion) throw new Error('Cloudflare did not return an asset completion token.');
await writeFile(new URL('asset-completion.json', root), JSON.stringify({jwt:completion}), {mode:0o600});
console.log('Private assets ready for deployment.');
