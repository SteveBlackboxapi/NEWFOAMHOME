// Run: node --test scripts/test-website-image-settings.mjs
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { applicationData } from "./application-data.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const load = applicationData(root);
const { websiteSettingsPages, enterLabSettings, exitLabSettings } = load("src/lib/websiteImageSettings.ts");
const { websiteAssetUsage, publicWebsiteRoutes, normalizeWebsiteAssetSrc } = load("src/data/websiteAssetUsage.ts");

test("Settings keeps every public page in catalogue order with readable labels", () => {
  const pages = websiteSettingsPages();
  assert.deepEqual(pages.map(({ route }) => route), publicWebsiteRoutes);
  assert.deepEqual(pages.map(({ label }) => label), [
    "Home", "Managers", "Brands", "Creators", "Features", "About", "Data & trust",
    "Updates", "Demo", "Media Kit story", "Chrome story",
  ]);
  for (const page of pages) {
    const assets = page.sections.flatMap((section) => section.assets);
    assert.equal(page.imageCount, new Set(assets.map(({ src }) => normalizeWebsiteAssetSrc(src))).size);
    assert.equal(new Set(page.sections.map(({ name }) => name)).size, page.sections.length);
    for (const section of page.sections) {
      assert.ok(section.assets.length);
      assert.equal(new Set(section.assets.map(({ src }) => normalizeWebsiteAssetSrc(src))).size, section.assets.length);
      for (const asset of section.assets) {
        assert.ok(asset.uses.some((use) => use.route === page.route && use.section === section.name));
        assert.ok(websiteAssetUsage.includes(asset), "placements retain catalogue identity");
      }
    }
  }
});

test("raster artwork and all current raster placements are editable, while icons, videos and masters are excluded", () => {
  const pages = websiteSettingsPages();
  const displayed = pages.flatMap((page) => page.sections.flatMap((section) => section.assets));
  assert.ok(displayed.some((asset) => asset.kind === "artwork" && asset.src.endsWith("/campaigns/found-with-foam-skincare-v4.webp")));
  assert.ok(displayed.some((asset) => asset.kind === "artwork" && asset.src.endsWith("/music/feed-the-feed-v1/cover.webp")));
  for (const asset of displayed) {
    assert.match(normalizeWebsiteAssetSrc(asset.src), /\.(?:png|jpe?g|webp)$/i);
    assert.ok(!asset.src.includes("/masters/"));
  }
  for (const asset of websiteAssetUsage) {
    if (!/\.(?:png|jpe?g|webp)$/i.test(normalizeWebsiteAssetSrc(asset.src)) || asset.src.includes("/masters/")) continue;
    for (const placement of asset.uses) {
      const page = pages.find(({ route }) => route === placement.route);
      assert.ok(page.sections.find(({ name }) => name === placement.section)?.assets.includes(asset), asset.src);
    }
  }
});

test("shared images retain one source identity across sections and pages", () => {
  const pages = websiteSettingsPages();
  const source = websiteAssetUsage.find((asset) => asset.src.endsWith("/talent/samantha-pikka-v2/samantha-pikka-v2-portrait.webp"));
  assert.ok(source);
  const appearances = pages.flatMap((page) => page.sections.flatMap((section) =>
    section.assets.filter((asset) => asset.src === source.src).map((asset) => ({ route: page.route, asset })),
  ));
  assert.ok(new Set(appearances.map(({ route }) => route)).size > 1);
  assert.ok(appearances.every(({ asset }) => asset === source));
});

test("Settings navigation round-trips each library view without mutating filters or its input", () => {
  for (const view of ["talent", "content", "saved"]) {
    const original = new URLSearchParams({ view, q: "skin care", layout: "table", talent: "nia-brooks", custom: "keep" });
    const before = original.toString();
    const settings = enterLabSettings(original);
    assert.equal(original.toString(), before);
    assert.equal(settings.get("view"), "settings");
    assert.equal(settings.get("from"), view);
    settings.set("settingsPage", "/about");
    settings.set("settingsTab", "images");
    const settingsBefore = settings.toString();
    assert.equal(enterLabSettings(settings).toString(), settingsBefore, "reentering Settings preserves the remembered view");
    const back = exitLabSettings(settings);
    assert.equal(settings.toString(), settingsBefore);
    assert.equal(back.toString(), before);
  }
});

test("missing or invalid previous views return to Content and clear only Settings state", () => {
  for (const view of [undefined, "unknown", "settings"]) {
    const params = new URLSearchParams("q=beauty&layout=grid&talent=aria-quen&custom=one&custom=two");
    if (view) params.set("view", view);
    const entered = enterLabSettings(params);
    if (view !== "settings") assert.equal(entered.get("from"), "content");
    for (const from of [undefined, "settings", "invalid"]) {
      const current = new URLSearchParams(entered);
      current.delete("from");
      if (from) current.set("from", from);
      current.set("settingsPage", "/");
      current.set("settingsTab", "account");
      const back = exitLabSettings(current);
      assert.equal(back.get("view"), "content");
      assert.equal(back.get("q"), "beauty");
      assert.equal(back.get("layout"), "grid");
      assert.equal(back.get("talent"), "aria-quen");
      assert.deepEqual(back.getAll("custom"), ["one", "two"]);
      for (const key of ["from", "settingsPage", "settingsTab"]) assert.equal(back.has(key), false);
    }
  }
});
