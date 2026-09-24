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
const { talentNetworks, matchesTalentPlatforms } = module.exports;

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
