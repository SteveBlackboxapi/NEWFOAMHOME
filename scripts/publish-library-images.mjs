import { writeFile, lstat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";
import { applicationData } from "./application-data.mjs";

const REPOSITORY = "SteveBlackboxapi/NEWFOAMHOME";
const BRANCH = "content/talent-library";
const API = `https://api.github.com/repos/${REPOSITORY}`;
const SHA = /^[a-f0-9]{40}$/;
const IMAGE = /^assets\/[a-zA-Z0-9_./ -]+\.(?:png|jpe?g|webp)$/;
const UPLOAD = /^assets\/talent\/uploads\/[a-z0-9-]+\.(png|jpg|webp)$/;
const root = fileURLToPath(new URL("../", import.meta.url));

export function websiteImageAllowlist(projectRoot = root) {
  const { websiteAssetUsage } = applicationData(projectRoot)("src/data/websiteAssetUsage.ts");
  return new Set(websiteAssetUsage.map(({ src }) => src.replace(/^\//, ""))
    .filter((src) => IMAGE.test(src) && !src.startsWith("assets/talent/uploads/")));
}

/** No profile-diff inference: older saved drafts have no publication instructions. */
export function replacementEntries(manifest, allowlist) {
  if (!manifest || manifest.version !== 1 || !Array.isArray(manifest.profiles) || !Array.isArray(manifest.removedTalentIds))
    throw new Error("Unsupported library manifest.");
  if (manifest.websiteReplacements === undefined) return [];
  const map = manifest.websiteReplacements;
  if (!map || typeof map !== "object" || Array.isArray(map) || Object.keys(map).length > 1000)
    throw new Error("Invalid website replacement map.");
  return Object.entries(map).map(([source, upload]) => {
    if (!IMAGE.test(source) || source.split("/").some((part) => !part || part === "." || part === "..") ||
      !allowlist.has(source) || typeof upload !== "string" || !UPLOAD.test(upload))
      throw new Error(`Unapproved website replacement: ${source}`);
    return { source, upload };
  });
}

async function bytesFrom(response, limit) {
  if (!response.ok) throw new Error(`GitHub library read failed (${response.status}).`);
  if (Number(response.headers.get("Content-Length")) > limit) throw new Error("Library response exceeds its size limit.");
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body || []) {
    size += chunk.length;
    if (size > limit) throw new Error("Library response exceeds its size limit.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function encodeReplacement(input, upload, source) {
  const metadata = await sharp(input, { limitInputPixels: 60_000_000, failOn: "warning" }).metadata();
  const expected = { png: "png", jpg: "jpeg", webp: "webp" }[UPLOAD.exec(upload)?.[1]];
  if (!metadata.width || !metadata.height || metadata.format !== expected || (metadata.pages || 1) !== 1)
    throw new Error(`Invalid replacement image: ${upload}`);
  // Fully decode even when the format already matches: truncated/corrupt pixels
  // must fail the build before any public files are overlaid.
  await sharp(input, { limitInputPixels: 60_000_000, failOn: "warning" }).stats();
  const destination = path.extname(source).toLowerCase();
  const destinationFormat = { ".jpg": "jpeg", ".jpeg": "jpeg", ".png": "png", ".webp": "webp" }[destination];
  if (!destinationFormat) throw new Error("Unsupported website image destination.");
  if (metadata.format === destinationFormat && (!metadata.orientation || metadata.orientation === 1)) return input;
  const image = sharp(input, { limitInputPixels: 60_000_000 }).rotate();
  if (destinationFormat === "webp") return image.webp({ lossless: true, effort: 4 }).toBuffer();
  if (destinationFormat === "png") return image.png().toBuffer();
  return image.flatten({ background: "#ffffff" }).jpeg({ quality: 95, chromaSubsampling: "4:4:4" }).toBuffer();
}

export async function publishLibraryImages({
  projectRoot = root, revision, fetcher = fetch, token = process.env.GITHUB_TOKEN || "", allowlist,
} = {}) {
  if (revision !== undefined && !SHA.test(revision)) throw new Error("LIBRARY_REVISION must be an exact commit SHA.");
  const headers = { Accept: "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2026-03-10",
    ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  if (!revision) {
    const ref = await fetcher(`${API}/git/ref/heads/${BRANCH}`, { headers: { ...headers, Accept: "application/vnd.github+json" }, redirect: "error" });
    // A fresh repository without a Lab branch still builds its static website.
    if (ref.status === 404) {
      const status = { version: 1, libraryRevision: null, replacementCount: 0 };
      await writeFile(path.join(projectRoot, "public/website-publication.json"), JSON.stringify(status) + "\n");
      return status;
    }
    revision = JSON.parse((await bytesFrom(ref, 32_768)).toString()).object?.sha;
    if (!SHA.test(revision || "")) throw new Error("GitHub returned an invalid library revision.");
  }
  const readPinned = async (asset, limit) => bytesFrom(await fetcher(
    `${API}/contents/public/${asset}?ref=${revision}`, { headers, redirect: "error" },
  ), limit);
  const manifest = JSON.parse((await readPinned("assets/talent/library.json", 1_000_000)).toString());
  const entries = replacementEntries(manifest, allowlist || websiteImageAllowlist(projectRoot));
  const prepared = [];
  // Validate every file first: an invalid replacement must not create a partial overlay.
  for (const { source, upload } of entries) {
    const target = path.join(projectRoot, "public", source);
    const existing = await lstat(target);
    if (!existing.isFile() || existing.isSymbolicLink()) throw new Error(`Missing website image: ${source}`);
    const input = await readPinned(upload, 10 * 1024 * 1024);
    prepared.push({ target, bytes: await encodeReplacement(input, upload, source) });
  }
  for (const { target, bytes } of prepared) await writeFile(target, bytes);
  const status = { version: 1, libraryRevision: revision, replacementCount: prepared.length };
  await writeFile(path.join(projectRoot, "public/website-publication.json"), JSON.stringify(status) + "\n");
  return status;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== "--revision")) throw new Error("Usage: publish-library-images.mjs [--revision <commit>]");
  const result = await publishLibraryImages({ revision: args[1] || process.env.LIBRARY_REVISION || undefined });
  console.log(`Applied ${result.replacementCount} explicit website image replacements from ${result.libraryRevision || "the static catalogue"}.`);
}
