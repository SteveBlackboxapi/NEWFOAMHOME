// Run with: node --test scripts/test-discovery-content.mjs
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const modules = new Map();
function loadApplication(filename) {
  filename = path.resolve(root, filename);
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} };
  modules.set(filename, module);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  new Function("require", "module", "exports", outputText)(
    (specifier) => {
      if (!specifier.startsWith(".")) return require(specifier);
      const dependency = path.resolve(path.dirname(filename), specifier);
      return dependency === path.join(root, "src/lib/assets")
        ? { A: "/assets" }
        : loadApplication(`${dependency}.ts`);
    }, module, module.exports,
  );
  return module.exports;
}

const { stagedTalent } = loadApplication("src/data/stagedTalent.ts");
const originalData = JSON.stringify(stagedTalent);
const { labTalent, discoveryAdditions, discoveryFeedOrder } = loadApplication("src/data/labTalentCatalogue.ts");
const { discoverySearches } = loadApplication("src/data/discoveryContent.ts");
const { assetsFor, hasAssignedAudience } = loadApplication("src/lib/talentLab.ts");
const { creatorWorkTalent, creatorWorkPosts } = loadApplication("src/data/creatorWorkTalent.ts");
const { matchesDiscoveryQuery, readDiscoveryQuery, discoveryRank } = loadApplication("src/lib/discoverySearch.ts");
const { talentContentColumns, distributeTalentContent } = loadApplication("src/lib/talentLabLayout.ts");
const assets = labTalent.flatMap(assetsFor).filter((asset) => asset.tile);
const results = (query) => assets.filter((asset) => matchesDiscoveryQuery(asset, query)).sort((a,b) => discoveryRank(a, query) - discoveryRank(b, query));

test("internal Lab queries return the same three curated discovery images", () => {
  assert.deepEqual(discoverySearches.map((item) => item.id), ["outfits", "skincare", "nike", "cats"]);
  for (const example of discoverySearches) {
    const url = new URL(`https://example.test/lab/talent/?view=content&q=${encodeURIComponent(example.query)}`);
    const initialQuery = readDiscoveryQuery(url.searchParams);
    assert.equal(initialQuery, example.query);
    assert.deepEqual(
      results(initialQuery).map(({id, src}) => ({id, src})),
      example.assets.map(({id, src}) => ({id, src})),
      example.query,
    );
    for (const asset of example.assets)
      assert.ok(existsSync(path.join(root, "public", asset.src)), asset.src);
  }
  assert.equal(readDiscoveryQuery(new URLSearchParams("view=content")), "");
});

test("search recognises useful wording without matching unrelated posts", () => {
  assert.equal(results("skin care product reviews").length, 3);
  assert.equal(results("posts about CATS").length, 3);
  assert.equal(results("cat").length, 3);
  assert.equal(results("Nike").length, 3);
  assert.equal(results("Nike running shoes").length, 3);
  assert.equal(results("posts about giraffes").length, 0);
  assert.equal(results("Nike cats").length, 0);
  assert.equal(results("posts talking about").length, 0);
  assert.ok(results("music performance").some((asset) => asset.id === "jax-orin:discovery-jax-live-set"));
});

test("new Lab content preserves Kit data and has no fabricated post metrics", () => {
  assert.equal(JSON.stringify(stagedTalent), originalData);
  assert.equal(discoveryAdditions.length, 8);
  for (const original of stagedTalent) {
    const extended = labTalent.find((talent) => talent.id === original.id);
    assert.deepEqual(extended.content.slice(0, original.content.length), original.content);
    assert.deepEqual(extended.platforms, original.platforms);
    assert.equal(extended.totalAudience, original.totalAudience);
    assert.deepEqual(
      assetsFor(extended).slice(0, original.content.length + 1).map((asset) => asset.id),
      assetsFor(original).map((asset) => asset.id),
    );
    for (const tile of extended.content.slice(original.content.length)) {
      assert.equal(tile.views, undefined);
      assert.equal(tile.engagements, undefined);
      assert.equal(tile.type, "still");
      assert.equal(tile.video, undefined);
      assert.ok(existsSync(path.join(root, "public", tile.original)));
    }
  }
});

test("the unfiltered opening feed contains varied new content from different creators", () => {
  const first = results("").slice(0, 6);
  assert.deepEqual(first.map((asset) => asset.id), discoveryFeedOrder.slice(0, 6));
  assert.equal(new Set(first.map((asset) => asset.talent.id)).size, 6);
  for (const subject of ["jax-live-set", "zane-shoe-chat", "cats-sleeping"])
    assert.ok(first.some((asset) => asset.id.endsWith(subject)));
});

test("Creators images have their own metric-free Lab identities and lead the feed", () => {
  assert.equal(creatorWorkTalent.length, 2);
  assert.deepEqual(results("").slice(0, 2).map((asset) => asset.id), creatorWorkPosts.map((post) => post.assetId));
  for (const [index, talent] of creatorWorkTalent.entries()) {
    assert.ok(!stagedTalent.some((original) => original.id === talent.id));
    assert.equal(hasAssignedAudience(talent), false);
    assert.deepEqual(talent.platforms, []);
    assert.equal(talent.content.length, 1);
    const asset = assets.find((candidate) => candidate.id === creatorWorkPosts[index].assetId);
    assert.equal(asset.talent.id, talent.id);
    assert.equal(asset.src, creatorWorkPosts[index].src);
    assert.equal(asset.tile.aspectRatio, "9/16");
    assert.equal(asset.tile.views, undefined);
    assert.equal(asset.tile.engagements, undefined);
    assert.equal(asset.tile.type, "still");
    assert.equal(asset.tile.video, undefined);
    assert.ok(existsSync(path.join(root, "public", asset.src)));
    assert.ok(existsSync(path.join(root, "public", asset.original)));
  }
  assert.ok(results("pink workout").some((asset) => asset.talent.id === "tessa-quinn"));
  assert.ok(results("purple beach").some((asset) => asset.talent.id === "luca-marin"));
});

test("responsive masonry exposes the leading curated cards across its top row", () => {
  const sorted = results("");
  const sizes = [
    [390, 2, 2], [560, 2, 2], [561, 2, 3], [1100, 2, 3],
    [1101, 3, 4], [1499, 3, 4], [1500, 4, 5], [1899, 4, 5], [1900, 5, 6],
  ];
  for (const [width, normal, compact] of sizes) {
    for (const [isCompact, expected] of [[false, normal], [true, compact]]) {
      const count = talentContentColumns(width, isCompact);
      assert.equal(count, expected);
      const columns = distributeTalentContent(sorted, count);
      assert.deepEqual(
        columns.map((column) => column[0].item.id),
        discoveryFeedOrder.slice(0, count),
        `top row at ${width}px, compact=${isCompact}`,
      );
      const restored = columns.flat().sort((a, b) => a.position - b.position);
      assert.deepEqual(restored.map(({item}) => item.id), sorted.map((asset) => asset.id));
      assert.deepEqual(restored.map(({position}) => position), sorted.map((_, index) => index));
    }
  }
});
