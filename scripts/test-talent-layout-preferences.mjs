import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";
import { applicationData } from "./application-data.mjs";

const { enterLabSettings, exitLabSettings } = applicationData(
  fileURLToPath(new URL("../", import.meta.url)),
)("src/lib/websiteImageSettings.ts");

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
  assert.equal(paramsForTalentView(restored, "saved", preferences).toString(), "view=saved&layout=gallery");
  assert.equal(content.get("q"), "fitness");
  assert.deepEqual(preferences, { content: "compact", talent: "table", saved: "gallery" });
});

test("direct links and browser history retain their own layout even with other remembered choices", () => {
  const preferences = { talent: "table", content: "compact" };
  const galleryHistoryEntry = new URLSearchParams("view=talent&layout=gallery");
  const compactDirectLink = new URLSearchParams("view=talent&layout=compact");
  assert.equal(talentLayoutFromParams(galleryHistoryEntry, preferences), "gallery");
  assert.equal(talentLayoutFromParams(compactDirectLink, preferences), "compact");
  assert.equal(talentLayoutFromParams(paramsForTalentView(compactDirectLink, "content", preferences)), "compact");
  assert.equal(talentLayoutFromParams(new URLSearchParams("layout=invalid"), preferences), "table");
});

test("new sections default to Talent table, Content compact and Saved gallery", () => {
  for (const [view, expected] of Object.entries({ talent: "table", content: "compact", saved: "gallery" })) {
    const plainEntry = new URLSearchParams({ view });
    assert.equal(talentLayoutFromParams(plainEntry), expected);
    plainEntry.set("layout", "invalid");
    assert.equal(talentLayoutFromParams(plainEntry), expected);
    const switched = paramsForTalentView(new URLSearchParams("view=content&layout=gallery"), view, {});
    assert.equal(switched.get("layout"), expected);
    assert.equal(talentLayoutFromParams(switched), expected);
  }
  assert.equal(talentLayoutFromParams(new URLSearchParams()), "table");
});

test("reopening and login without a layout restore each browser choice before defaults", () => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const storage = new Map();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  } });
  try {
    const choices = { talent: "compact", content: "table", saved: "compact" };
    writeTalentLayoutPreferences(choices);
    const reopened = readTalentLayoutPreferences();
    for (const [view, layout] of Object.entries(choices)) {
      assert.equal(talentLayoutFromParams(new URLSearchParams({ view }), reopened), layout);
      assert.equal(talentLayoutFromParams(new URLSearchParams({ view, layout: "invalid" }), reopened), layout);
    }
    // The Worker sign-in redirect is /lab/talent/?view=content, with no layout.
    assert.equal(talentLayoutFromParams(new URLSearchParams("view=content"), reopened), "table");
    assert.deepEqual(reopened, choices);
    assert.deepEqual(readTalentLayoutPreferences(), choices);
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage);
    else delete globalThis.localStorage;
  }
});

test("gallery remains an explicit remembered choice and history entry", () => {
  const preferences = { talent: "gallery", content: "gallery" };
  for (const view of ["talent", "content"]) {
    const entry = new URLSearchParams({ view });
    assert.equal(talentLayoutFromParams(entry, preferences), "gallery");
    const historyEntry = paramsForTalentView(entry, view, preferences);
    assert.equal(historyEntry.get("layout"), "gallery");
    assert.equal(talentLayoutFromParams(historyEntry, { talent: "table", content: "compact" }), "gallery");
  }
});

test("stored choices survive serialization and reject malformed or unsupported settings", () => {
  const original = { talent: "table", content: "compact", saved: "gallery" };
  assert.deepEqual(parseTalentLayoutPreferences(JSON.stringify(original)), original);
  assert.deepEqual(parseTalentLayoutPreferences('{"talent":"grid","content":"compact","saved":false,"settings":"table","other":"table"}'), { content: "compact" });
  for (const value of [null, "not JSON", "[]", "null", "false", '"compact"'])
    assert.deepEqual(parseTalentLayoutPreferences(value), {});
});

test("unavailable browser storage does not interrupt view changes", () => {
  // Node has no browser storage; these calls must gracefully retain the page's in-memory choices.
  assert.deepEqual(readTalentLayoutPreferences(), {});
  assert.doesNotThrow(() => writeTalentLayoutPreferences({ content: "compact" }));
  assert.equal(paramsForTalentView(new URLSearchParams(), "content", { content: "compact" }).get("layout"), "compact");
});

test("Settings Back preserves the current URL layout and selection", () => {
  for (const view of ["talent", "content", "saved"]) {
    for (const layout of ["gallery", "compact", "table"]) {
      const original = new URLSearchParams(`view=${view}&q=skin+care&talent=nia-brooks&asset=skincare&custom=one&custom=two`);
      original.set("layout", layout);
      const before = original.toString();
      const settings = enterLabSettings(original);
      settings.set("settingsPage", "/about");
      settings.set("settingsTab", "images");
      const back = exitLabSettings(settings);
      assert.equal(back.toString(), before);
      assert.equal(talentLayoutFromParams(back), layout);
      assert.equal(original.toString(), before);
    }
  }
});

test("Settings without a layout resolves its return section without inventing a Settings preference", () => {
  const preferences = { talent: "compact", content: "table", saved: "compact" };
  for (const view of ["talent", "content", "saved"]) {
    const settings = enterLabSettings(new URLSearchParams({ view }));
    assert.equal(talentLayoutFromParams(settings, preferences), preferences[view]);
    assert.equal(talentLayoutFromParams(exitLabSettings(settings), preferences), preferences[view]);
  }
  for (const from of ["", "invalid", "settings"]) {
    const directSettings = new URLSearchParams({ view: "settings", from });
    assert.equal(talentLayoutFromParams(directSettings, preferences), "table");
    assert.equal(talentLayoutFromParams(directSettings), "compact");
  }
  assert.deepEqual(preferences, { talent: "compact", content: "table", saved: "compact" });
});

test("leaving Settings for a library section restores that section and clears Settings navigation", () => {
  const preferences = { content: "compact", talent: "table", saved: "gallery" };
  const settings = new URLSearchParams("view=settings&from=content&layout=compact&q=skin+care&talent=nia&asset=skin&settingsPage=%2Fabout&settingsTab=images&custom=one&custom=two");
  const before = settings.toString();
  for (const view of ["talent", "content", "saved"]) {
    const target = paramsForTalentView(settings, view, preferences);
    assert.equal(target.get("view"), view);
    assert.equal(talentLayoutFromParams(target), preferences[view]);
    assert.deepEqual(target.getAll("custom"), ["one", "two"]);
    for (const key of ["from", "settingsPage", "settingsTab", "q", "talent", "asset"])
      assert.equal(target.has(key), false, key);
  }
  const directSettings = new URLSearchParams("view=settings");
  assert.equal(talentLayoutFromParams(paramsForTalentView(directSettings, "talent", preferences)), "table");
  assert.equal(settings.toString(), before);
  assert.deepEqual(preferences, { content: "compact", talent: "table", saved: "gallery" });
});
