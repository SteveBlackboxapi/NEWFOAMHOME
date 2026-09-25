import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { applicationData } from "./application-data.mjs";
import { replacementEntries, placementReplacementEntries, publishLibraryImages, websiteImageAllowlist, websitePlacementAllowlist } from "./publish-library-images.mjs";

const REVISION = "a".repeat(40);
const SOURCE = "assets/talent/existing.webp";
const SECOND = "assets/talent/second.jpg";
const UPLOAD = "assets/talent/uploads/replacement.png";
const FIRST_PLACEMENT = JSON.stringify([SOURCE, "/", "Hero"]);
const SECOND_PLACEMENT = JSON.stringify([SOURCE, "/kit-story", "Featured content"]);
const placementMapFile = "src/data/websitePlacementImages.json";
const manifest = (websiteReplacements) => ({ version: 1, profiles: [{
  id: "avery-cole", portrait: "assets/talent/uploads/old-draft.webp", content: [],
}], removedTalentIds: [], ...(websiteReplacements === undefined ? {} : { websiteReplacements }) });
const root = fileURLToPath(new URL("../", import.meta.url));

async function fixture(t) {
  const projectRoot = await mkdtemp(path.join(tmpdir(), "foam-publication-test-"));
  t.after(() => rm(projectRoot, { recursive: true, force: true }));
  await mkdir(path.join(projectRoot, "public/assets/talent"), { recursive: true });
  await writeFile(path.join(projectRoot, "public", SOURCE), "original-one");
  await writeFile(path.join(projectRoot, "public", SECOND), "original-two");
  const png = await sharp({ create: { width: 12, height: 8, channels: 4, background: "#173649" } }).png().toBuffer();
  return { projectRoot, png, allowlist: new Set([SOURCE, SECOND]), placementAllowlist: new Set([FIRST_PLACEMENT, SECOND_PLACEMENT]) };
}

test("old profile drafts and added talent produce no public replacement instructions", () => {
  assert.deepEqual(replacementEntries(manifest(), new Set([SOURCE])), []);
  assert.deepEqual(replacementEntries(manifest({}), new Set([SOURCE])), []);
});

test("the publication allowlist covers current image placements but excludes masters, drafts and videos", () => {
  const allowlist = websiteImageAllowlist();
  assert.ok(allowlist.has("assets/talent/nia-brooks/nia-brooks-skincare.webp"));
  assert.ok(allowlist.has("assets/people-colour/studio-moment.webp"));
  assert.ok(!allowlist.has("assets/io-portrait-web.mp4"));
  assert.ok(![...allowlist].some((source) => source.includes("/masters/") || source.includes("/uploads/")));
  assert.ok(allowlist.size > 40);
});

test("existing identity, duplicate placements and repeated replacements keep the original source", () => {
  const { websiteReplacementSource } = applicationData(root)("src/lib/websiteImageReplacement.ts");
  assert.equal(websiteReplacementSource("nia-brooks:skincare-review"), "assets/talent/nia-brooks/nia-brooks-skincare.webp");
  assert.equal(websiteReplacementSource("nia-brooks:skincare-review"), "assets/talent/nia-brooks/nia-brooks-skincare.webp");
  assert.equal(websiteReplacementSource("studio-collaborators:portrait"), "assets/people-colour/studio-moment.webp");
  assert.equal(websiteReplacementSource("upload-brand-new:portrait"), undefined);
  assert.equal(websiteReplacementSource("privacy-portrait:portrait"), undefined);
});

test("only approved image destinations and same-repository upload paths are accepted", () => {
  const allowlist = new Set([SOURCE]);
  for (const map of [null, [], "bad", { "../index.html": UPLOAD }, { [SECOND]: UPLOAD },
    { [SOURCE]: "https://attacker.example/image.png" }, { [SOURCE]: "assets/talent/uploads/../image.png" },
    { [SOURCE]: "assets/talent/uploads/image.svg" }, { "/assets/talent/existing.webp": UPLOAD }])
    assert.throws(() => replacementEntries(manifest(map), allowlist));
});

test("the build uses a pinned manifest/upload, preserves baseline filename, and writes only the explicit overlay", async (t) => {
  const f = await fixture(t);
  const calls = [];
  const result = await publishLibraryImages({ ...f, revision: REVISION, token: "", fetcher: async (url, options) => {
    calls.push({ url, options });
    assert.equal(new URL(url).searchParams.get("ref"), REVISION);
    assert.equal(options.redirect, "error");
    return url.includes("/library.json") ? new Response(JSON.stringify(manifest({ [SOURCE]: UPLOAD }))) : new Response(f.png);
  } });
  assert.deepEqual(result, { version: 1, libraryRevision: REVISION, replacementCount: 1 });
  assert.equal(calls.length, 2);
  assert.equal((await sharp(await readFile(path.join(f.projectRoot, "public", SOURCE))).metadata()).format, "webp");
  assert.equal(await readFile(path.join(f.projectRoot, "public", SECOND), "utf8"), "original-two");
  assert.deepEqual(JSON.parse(await readFile(path.join(f.projectRoot, "public/website-publication.json"))), result);
});

test("invalid and missing uploads stop publication before overwriting any original", async (t) => {
  const f = await fixture(t);
  for (const failure of [new Response("missing", { status: 404 }), new Response("not an image"), new Response(f.png, { headers: { "Content-Length": "11000000" } })]) {
    await assert.rejects(publishLibraryImages({ ...f, revision: REVISION, token: "", fetcher: async (url) => {
      if (url.includes("/library.json")) return new Response(JSON.stringify(manifest({ [SOURCE]: UPLOAD, [SECOND]: "assets/talent/uploads/bad.png" })));
      return url.includes("/replacement.png") ? new Response(f.png) : failure;
    } }));
    assert.equal(await readFile(path.join(f.projectRoot, "public", SOURCE), "utf8"), "original-one");
  }
});

test("latest library resolution happens once and all subsequent reads use that immutable revision", async (t) => {
  const f = await fixture(t);
  const calls = [];
  const result = await publishLibraryImages({ ...f, token: "", fetcher: async (url) => {
    calls.push(url);
    return new Response(JSON.stringify(url.includes("/git/ref/") ? { object: { sha: REVISION } } : manifest()));
  } });
  assert.equal(result.replacementCount, 0);
  assert.equal(calls.length, 2);
  assert.ok(calls[1].endsWith(`?ref=${REVISION}`));
  assert.deepEqual(JSON.parse(await readFile(path.join(f.projectRoot, placementMapFile))), { replacements: {} });
  await assert.rejects(publishLibraryImages({ ...f, revision: "main", fetcher: () => assert.fail("Invalid refs must not fetch") }));
});

test("placement allowlists require the actual source, page and exact section combination", () => {
  const actual = websitePlacementAllowlist();
  const images = websiteImageAllowlist();
  assert.ok(actual.size > images.size);
  for (const key of actual) {
    const [source, route, section] = JSON.parse(key);
    assert.ok(images.has(source));
    assert.ok(route.startsWith("/") && section.length > 0);
  }
  const make = (map) => ({ ...manifest(), websitePlacementReplacements: map });
  const allowed = new Set([FIRST_PLACEMENT]);
  assert.equal(placementReplacementEntries(make({ [FIRST_PLACEMENT]: UPLOAD }), allowed)[0].source, SOURCE);
  for (const map of [null, [], "bad", { [SECOND_PLACEMENT]: UPLOAD },
    { [JSON.stringify([SECOND, "/", "Hero"])]: UPLOAD },
    { [JSON.stringify([SOURCE, "/", "hero"])]: UPLOAD },
    { [FIRST_PLACEMENT]: "https://external.example/picture.png" },
    { [FIRST_PLACEMENT]: "assets/talent/uploads/../image.png" },
    { [FIRST_PLACEMENT]: "assets/talent/uploads/image.svg" }])
    assert.throws(() => placementReplacementEntries(make(map), allowed));
});

test("independent placements produce content-addressed WebP files without changing baseline or other placements", async (t) => {
  const f = await fixture(t);
  const other = await sharp({ create: { width: 9, height: 13, channels: 4, background: "#b6ed5b" } }).png().toBuffer();
  const data = { ...manifest(), websitePlacementReplacements: {
    [FIRST_PLACEMENT]: UPLOAD, [SECOND_PLACEMENT]: "assets/talent/uploads/second.png",
  } };
  const fetcher = async (url) => {
    assert.equal(new URL(url).searchParams.get("ref"), REVISION);
    return url.includes("/library.json") ? new Response(JSON.stringify(data)) : new Response(url.includes("/second.png") ? other : f.png);
  };
  const result = await publishLibraryImages({ ...f, revision: REVISION, token: "", fetcher });
  assert.equal(result.replacementCount, 2);
  const output = JSON.parse(await readFile(path.join(f.projectRoot, placementMapFile))).replacements;
  assert.notEqual(output[FIRST_PLACEMENT], output[SECOND_PLACEMENT]);
  for (const value of Object.values(output)) {
    assert.match(value, /^assets\/website-placements\/[a-f0-9]{64}\.webp$/);
    assert.equal((await sharp(await readFile(path.join(f.projectRoot, "public", value))).metadata()).format, "webp");
  }
  assert.equal(await readFile(path.join(f.projectRoot, "public", SOURCE), "utf8"), "original-one");
  await publishLibraryImages({ ...f, revision: REVISION, token: "", fetcher });
  assert.deepEqual(JSON.parse(await readFile(path.join(f.projectRoot, placementMapFile))).replacements, output);
});

test("global and scoped replacements coexist while invalid scope files stop every overlay", async (t) => {
  const f = await fixture(t);
  const data = { ...manifest({ [SOURCE]: UPLOAD }), websitePlacementReplacements: {
    [SECOND_PLACEMENT]: "assets/talent/uploads/scoped.png",
  } };
  await assert.rejects(publishLibraryImages({ ...f, revision: REVISION, token: "", fetcher: async (url) =>
    url.includes("/library.json") ? new Response(JSON.stringify(data)) : new Response(url.includes("/scoped.png") ? "invalid" : f.png),
  }));
  assert.equal(await readFile(path.join(f.projectRoot, "public", SOURCE), "utf8"), "original-one");
  const result = await publishLibraryImages({ ...f, revision: REVISION, token: "", fetcher: async (url) =>
    url.includes("/library.json") ? new Response(JSON.stringify(data)) : new Response(f.png),
  });
  assert.equal(result.replacementCount, 2);
  assert.equal((await sharp(await readFile(path.join(f.projectRoot, "public", SOURCE))).metadata()).format, "webp");
  assert.deepEqual(Object.keys(JSON.parse(await readFile(path.join(f.projectRoot, placementMapFile))).replacements), [SECOND_PLACEMENT]);
});

test("a missing library branch clears any stale placement mapping without publishing old drafts", async (t) => {
  const f = await fixture(t);
  await mkdir(path.join(f.projectRoot, "src/data"), { recursive: true });
  await writeFile(path.join(f.projectRoot, placementMapFile), JSON.stringify({ replacements: { [FIRST_PLACEMENT]: "stale.webp" } }));
  const result = await publishLibraryImages({ ...f, token: "", fetcher: async () => new Response("missing", { status: 404 }) });
  assert.equal(result.replacementCount, 0);
  assert.deepEqual(JSON.parse(await readFile(path.join(f.projectRoot, placementMapFile))), { replacements: {} });
  assert.equal(await readFile(path.join(f.projectRoot, "public", SOURCE), "utf8"), "original-one");
});
