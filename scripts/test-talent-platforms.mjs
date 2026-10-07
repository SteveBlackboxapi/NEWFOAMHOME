import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/lib/talentPlatforms.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
);
const module = { exports: {} };
new Function("module", "exports", outputText)(module, module.exports);
const { talentNetworks, matchesTalentPlatforms, mixFeaturedPlatforms } = module.exports;

test("imported demo posts are filterable without inventing accounts or followers", () => {
  const talent = { platforms: [], content: [{ platform: "youtube" }, { platform: "instagram" }] };
  const before = JSON.stringify(talent);
  assert.deepEqual(talentNetworks(talent), ["youtube", "instagram"]);
  assert.equal(matchesTalentPlatforms(talent, ["youtube"]), true);
  assert.equal(matchesTalentPlatforms(talent, ["tiktok"]), false);
  assert.equal(matchesTalentPlatforms(talent, ["tiktok", "instagram"]), true);
  assert.equal(matchesTalentPlatforms(talent, []), true);
  assert.equal(JSON.stringify(talent), before);
});

test("account and post platforms are combined once, including accounts without posts", () => {
  const talent = {
    platforms: [{ network: "instagram" }, { network: "twitch" }],
    content: [{ platform: "instagram" }, { platform: "tiktok" }, { platform: "tiktok" }],
  };
  assert.deepEqual(talentNetworks(talent), ["instagram", "twitch", "tiktok"]);
  assert.equal(matchesTalentPlatforms(talent, ["twitch"]), true);
  assert.equal(matchesTalentPlatforms({ platforms: [], content: [] }, ["instagram"]), false);
  assert.equal(matchesTalentPlatforms({ platforms: [], content: [] }, []), true);
});

test("opening cards show all three existing platforms without changing or losing posts", () => {
  const assets = ["instagram", "tiktok", "youtube"].flatMap((platform) =>
    Array.from({ length: 5 }, (_, index) => ({ id: `${platform}-${index}`, tile: { platform } })),
  );
  const original = JSON.stringify(assets);
  const mixed = mixFeaturedPlatforms(assets);
  assert.deepEqual(mixed.slice(0, 3).map((asset) => asset.tile.platform), ["instagram", "tiktok", "youtube"]);
  for (const column of [0, 1, 2]) {
    assert.equal(new Set([mixed[column], mixed[column + 3], mixed[column + 6]].map((a) => a.tile.platform)).size, 3);
  }
  assert.equal(mixed.length, assets.length);
  assert.equal(new Set(mixed).size, assets.length);
  assert.deepEqual(mixed.slice(9), assets.filter((asset) => Number(asset.id.at(-1)) >= 3));
  assert.equal(JSON.stringify(assets), original);
  for (const asset of mixed) assert.ok(assets.includes(asset));
});

test("platform-filtered and small libraries retain every matching result", () => {
  const instagram = Array.from({ length: 6 }, (_, index) => ({ id: String(index), tile: { platform: "instagram" } }));
  assert.deepEqual(mixFeaturedPlatforms(instagram), instagram);
  assert.deepEqual(mixFeaturedPlatforms([]), []);
  const other = { id: "portrait" };
  assert.deepEqual(mixFeaturedPlatforms([other]), [other]);
  const youtube = { id: "video", tile: { platform: "youtube" } };
  assert.deepEqual(mixFeaturedPlatforms([instagram[0], youtube]), [instagram[0], youtube]);
});
