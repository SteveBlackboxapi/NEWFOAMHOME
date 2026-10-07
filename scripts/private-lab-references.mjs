import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

// Kept outside public/ and Git; only the authenticated Lab build consumes these bytes.
export const PRIVATE_REFERENCE_DIRECTORY = new URL("../workers/talent-lab/private-references/", import.meta.url);
export const PRIVATE_REFERENCE_PREFIX = "/assets/private-references/";
const MAX_BYTES = 10 * 1024 * 1024;

export async function privateReferenceAssets(directory = PRIVATE_REFERENCE_DIRECTORY) {
  const root = path.resolve(directory instanceof URL ? fileURLToPath(directory) : directory);
  let info;
  try { info = await lstat(root); }
  catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
  if (!info.isDirectory() || info.isSymbolicLink())
    throw new Error("Private references must be a real local directory, not a symlink.");
  const files = await readdir(root, { withFileTypes: true });
  const assets = {};
  for (const entry of files.sort((a, b) => a.name.localeCompare(b.name))) {
    const match = /^[a-z0-9][a-z0-9-]*\.(png|webp)$/.exec(entry.name);
    if (!entry.isFile() || !match)
      throw new Error(`Private references accept only flat, lowercase PNG/WebP filenames: ${entry.name}`);
    const filename = path.join(root, entry.name);
    const stat = await lstat(filename);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_BYTES)
      throw new Error(`Private reference must be a regular image under 10 MB: ${entry.name}`);
    const data = await readFile(filename);
    const kind = match[1];
    const valid = kind === "png"
      ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : data.length >= 12 && data.subarray(0, 4).equals(Buffer.from("RIFF")) && data.subarray(8, 12).equals(Buffer.from("WEBP"));
    if (!valid || data.length > MAX_BYTES)
      throw new Error(`Private reference bytes do not match its image type: ${entry.name}`);
    assets[`${PRIVATE_REFERENCE_PREFIX}${entry.name}`] = {
      body: gzipSync(data).toString("base64"),
      contentType: `image/${kind}`,
      encoding: "gzip",
    };
  }
  return assets;
}
