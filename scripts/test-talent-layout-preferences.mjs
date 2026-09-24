import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/lib/talentLayoutPreferences.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
);
const module = { exports: {} };
new Function("module", "exports", outputText)(module, module.exports);
const {
  parseTalentLayoutPreferences,
  paramsForTalentView,
  talentLayoutFromParams,
  readTalentLayoutPreferences,
  writeTalentLayoutPreferences,
} = module.exports;

test("switching between content, directory and saved restores independent choices", () => {
  const preferences = { content: "compact", talent: "table", saved: "gallery" };
  const content = new URLSearchParams("view=content&layout=compact&q=fitness&talent=avery&asset=running");
  const directory = paramsForTalentView(content, "talent", preferences);
  assert.equal(directory.toString(), "view=talent&layout=table");
  const restored = paramsForTalentView(directory, "content", preferences);
  assert.equal(restored.toString(), "view=content&layout=compact");
  assert.equal(paramsForTalentView(restored, "saved", preferences).toString(), "view=saved");
  assert.equal(content.get("q"), "fitness");
  assert.deepEqual(preferences, { content: "compact", talent: "table", saved: "gallery" });
});

test("direct links and browser history retain their own layout even with other remembered choices", () => {
  const preferences = { talent: "table", content: "compact" };
  const galleryHistoryEntry = new URLSearchParams("view=talent");
  const compactDirectLink = new URLSearchParams("view=talent&layout=compact");
  assert.equal(talentLayoutFromParams(galleryHistoryEntry), "gallery");
  assert.equal(talentLayoutFromParams(compactDirectLink), "compact");
  assert.equal(talentLayoutFromParams(paramsForTalentView(compactDirectLink, "content", preferences)), "compact");
  assert.equal(talentLayoutFromParams(new URLSearchParams("layout=invalid")), "gallery");
});

test("new views retain the existing gallery default rather than inherit the previous view", () => {
  const params = paramsForTalentView(new URLSearchParams("view=talent&layout=table"), "content", { talent: "table" });
  assert.equal(params.get("layout"), null);
  assert.equal(talentLayoutFromParams(params), "gallery");
});

test("stored choices survive serialization and reject malformed or unsupported settings", () => {
  const original = { talent: "table", content: "compact", saved: "gallery" };
  assert.deepEqual(parseTalentLayoutPreferences(JSON.stringify(original)), original);
  assert.deepEqual(parseTalentLayoutPreferences('{"talent":"grid","content":"compact","saved":false,"other":"table"}'), { content: "compact" });
  for (const value of [null, "not JSON", "[]", "null", "false", '"compact"'])
    assert.deepEqual(parseTalentLayoutPreferences(value), {});
});

test("unavailable browser storage does not interrupt view changes", () => {
  // Node has no browser storage; these calls must gracefully retain the page's in-memory choices.
  assert.deepEqual(readTalentLayoutPreferences(), {});
  assert.doesNotThrow(() => writeTalentLayoutPreferences({ content: "compact" }));
  assert.equal(paramsForTalentView(new URLSearchParams(), "content", { content: "compact" }).get("layout"), "compact");
});
