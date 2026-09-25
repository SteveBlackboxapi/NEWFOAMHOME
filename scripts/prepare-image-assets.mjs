import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { applicationData } from './application-data.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicDir = path.join(root, 'public');
const load = applicationData(root);
const { websiteAssetUsage } = load('src/data/websiteAssetUsage.ts');
const sources = new Set(websiteAssetUsage.map(({ src }) => src.replace(/^\//, '')));
const placements = JSON.parse(await readFile(path.join(root, 'src/data/websitePlacementImages.json'), 'utf8'));
for (const source of Object.values(placements.replacements || {})) {
  if (!/^assets\/website-placements\/[a-z0-9-]+\.webp$/.test(source)) throw new Error('Invalid published placement image path.');
  sources.add(source);
}
// Public video players choose these smaller alternates; masters remain available.
for (const file of await readdir(path.join(publicDir, 'assets/video-previews-v2')).catch(() => []))
  if (/\.(mp4|webm)$/.test(file)) sources.add(`assets/video-previews-v2/${file}`);
const files = new Map();
const hash = createHash('sha256').update('foam-responsive-images-v2-q82');
for (const source of [...sources].sort()) {
  const bytes = await readFile(path.join(publicDir, source));
  files.set(source, bytes);
  hash.update(source).update(bytes);
}
const revision = hash.digest('hex').slice(0, 16);
const directory = path.join(publicDir, 'media', revision);
await rm(path.join(publicDir, 'media'), { recursive: true, force: true });
const images = {};
let originalBytes = 0, thumbnailBytes = 0;
for (const [source, bytes] of files) {
  const target = path.join(directory, source);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(publicDir, source), target);
  if (!/\.(webp|jpe?g|png)$/i.test(source)) continue;
  const metadata = await sharp(bytes, { limitInputPixels: 60_000_000 }).metadata();
  if (!metadata.width || !metadata.height || (metadata.pages || 1) > 1) continue;
  const variants = [];
  const fingerprint = createHash('sha256').update(bytes).digest('hex').slice(0, 20);
  for (const width of [96, 256, 480, 768, 1280]) {
    if (width >= metadata.width || bytes.length < 12000) continue;
    const output = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 }).toBuffer();
    if (output.length >= bytes.length) continue;
    const src = `assets/responsive/${fingerprint}/${width}/${source.slice('assets/'.length)}.webp`;
    await mkdir(path.dirname(path.join(directory, src)), { recursive: true });
    await writeFile(path.join(directory, src), output);
    variants.push({ src, width });
    if (width === 96) { originalBytes += bytes.length; thumbnailBytes += output.length; }
  }
  images[source] = { src: source, width: metadata.width, height: metadata.height, variants };
}
await writeFile(path.join(root, 'src/data/imageVariants.json'), JSON.stringify({ revision, images }, null, 2) + '\n');
console.log(`Prepared ${Object.keys(images).length} responsive images; 96px previews ${(thumbnailBytes / 1000000).toFixed(2)} MB vs ${(originalBytes / 1000000).toFixed(2)} MB originals. Media revision ${revision}.`);
