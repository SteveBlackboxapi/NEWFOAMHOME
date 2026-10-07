import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";
import test from "node:test";
import sharp from "sharp";
import { PRIVATE_REFERENCE_DIRECTORY, privateReferenceAssets } from "./private-lab-references.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const png = await sharp({ create: { width: 3, height: 2, channels: 3, background: "#123456" } }).png().toBuffer();
const webp = await sharp(png).webp({ lossless: true }).toBuffer();
async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "foam-private-references-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("optional private inputs are outside public and ignored alongside the generated module", async (t) => {
  const directory = await fixture(t);
  assert.deepEqual(await privateReferenceAssets(path.join(directory, "missing")), {});
  const inputPath = path.relative(root, fileURLToPath(PRIVATE_REFERENCE_DIRECTORY));
  assert.equal(inputPath, "workers/talent-lab/private-references");
  const privatePaths = [`${inputPath}/character.webp`, "workers/talent-lab/site-assets.mjs"];
  assert.deepEqual(execFileSync("git", ["check-ignore", "--stdin"], {
    cwd: root, input: privatePaths.join("\n"), encoding: "utf8",
  }).trim().split("\n"), privatePaths);
});

test("bundling preserves exact PNG/WebP bytes without copying any file to public", async (t) => {
  const directory = await fixture(t);
  const input = path.join(directory, "private-references");
  const publicDir = path.join(directory, "public");
  await mkdir(input);
  await mkdir(publicDir);
  await writeFile(path.join(publicDir, "keep.txt"), "unchanged public file");
  const images = { "june-character.png": png, "samantha-character.webp": webp };
  for (const [name, bytes] of Object.entries(images)) await writeFile(path.join(input, name), bytes);
  const assets = await privateReferenceAssets(pathToFileURL(`${input}/`));
  assert.deepEqual(Object.keys(assets), Object.keys(images).map((name) => `/assets/private-references/${name}`));
  for (const [name, bytes] of Object.entries(images)) {
    const asset = assets[`/assets/private-references/${name}`];
    assert.equal(asset.contentType, `image/${path.extname(name).slice(1)}`);
    assert.equal(asset.encoding, "gzip");
    assert.deepEqual(gunzipSync(Buffer.from(asset.body, "base64")), bytes);
    assert.deepEqual(await readFile(path.join(input, name)), bytes);
  }
  assert.deepEqual(await readdir(publicDir), ["keep.txt"]);
  assert.equal(await readFile(path.join(publicDir, "keep.txt"), "utf8"), "unchanged public file");
});

test("symlinked input directories and image files are rejected", async (t) => {
  const directory = await fixture(t);
  const real = path.join(directory, "real");
  await mkdir(real);
  await writeFile(path.join(real, "sheet.webp"), webp);
  const link = path.join(directory, "linked");
  await symlink(real, link, "dir");
  assert.ok((await lstat(link)).isSymbolicLink());
  await assert.rejects(privateReferenceAssets(pathToFileURL(`${link}/`)), /symlink/);
  await symlink(path.join(real, "sheet.webp"), path.join(real, "other.webp"));
  await assert.rejects(privateReferenceAssets(real), /flat, lowercase/);
});

test("subdirectories and unsupported or unsafe filenames are rejected", async (t) => {
  for (const name of ["nested", "sheet.svg", "Sheet.webp", "sheet preview.webp", ".sheet.webp"]) {
    const directory = await fixture(t);
    if (name === "nested") await mkdir(path.join(directory, name));
    else await writeFile(path.join(directory, name), webp);
    await assert.rejects(privateReferenceAssets(directory), /flat, lowercase/, name);
  }
});

test("incorrect image signatures, empty files and oversized references fail the build", async (t) => {
  const directory = await fixture(t);
  const filename = path.join(directory, "sheet.webp");
  for (const bytes of [Buffer.alloc(0), png, Buffer.from("<script>private content</script>"), Buffer.alloc(10 * 1024 * 1024 + 1)]) {
    await writeFile(filename, bytes);
    await assert.rejects(privateReferenceAssets(directory), /image (type|under 10 MB)/);
  }
});
