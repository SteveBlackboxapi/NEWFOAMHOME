// Run with: node --test scripts/test-website-asset-usage.mjs
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
  const source = readFileSync(filename, "utf8").replaceAll(
    "import.meta.env.BASE_URL",
    JSON.stringify("/"),
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });
  new Function("require", "module", "exports", outputText)(
    (specifier) => {
      if (!specifier.startsWith(".")) return require(specifier);
      const dependency = path.resolve(path.dirname(filename), specifier);
      return dependency === path.join(root, "src/lib/assets")
        ? { A: "/assets" }
        : loadApplication(`${dependency}.ts`);
    },
    module,
    module.exports,
  );
  return module.exports;
}

const usage = loadApplication("src/data/websiteAssetUsage.ts");
const { labTalent } = loadApplication("src/data/labTalentCatalogue.ts");
const { stagedTalent } = loadApplication("src/data/stagedTalent.ts");
const { websitePhotoTalent } = loadApplication(
  "src/data/websitePhotoTalent.ts",
);
const { discoverySearches } = loadApplication("src/data/discoveryContent.ts");
const { FOUND_RESULTS, FOUND_SELECTED, FOUND_SEEN } = loadApplication(
  "src/data/foundWithFoam.ts",
);
const { KIT_FEATURED_CONTENT } = loadApplication(
  "src/data/kitFeaturedContent.ts",
);
const {
  websiteAssetUsage,
  websiteUsageFor,
  websiteUsageForTalent,
  websiteLocationsForTalent,
} = usage;
const hasRoute = (src, route) =>
  websiteUsageFor(src)?.uses.some((location) => location.route === route);

test("every public placement points to a real file and a truthful catalogue owner or artwork record", () => {
  assert.equal(
    new Set(websiteAssetUsage.map((asset) => asset.src)).size,
    websiteAssetUsage.length,
  );
  for (const asset of websiteAssetUsage) {
    assert.ok(existsSync(path.join(root, "public", asset.src)), asset.src);
    assert.ok(asset.uses.length, asset.src);
    assert.equal(
      new Set(
        asset.uses.map((location) => `${location.route}:${location.section}`),
      ).size,
      asset.uses.length,
    );
    for (const location of asset.uses)
      assert.ok(
        usage.publicWebsiteRoutes.includes(location.route),
        location.route,
      );
    if (asset.kind === "artwork") {
      assert.equal(asset.talentId, undefined, asset.src);
    } else {
      const owner = labTalent.find((talent) => talent.id === asset.talentId);
      assert.ok(owner, asset.src);
      assert.ok(asset.assetIds.length, asset.src);
      assert.equal(
        asset.provenance === "supplied-reference",
        owner.provenance === "reference",
      );
      assert.ok(websiteUsageForTalent(owner.id).includes(asset));
      assert.ok(websiteLocationsForTalent(owner.id).length);
    }
  }
});

test("website photo records preserve provenance and masters, including retired photography", () => {
  assert.equal(websitePhotoTalent.length, 7);
  assert.equal(usage.websiteReferencePhotos.length, 5);
  for (const talent of websitePhotoTalent) {
    assert.ok(!stagedTalent.some((original) => original.id === talent.id));
    assert.equal(talent.totalAudience, 0);
    assert.deepEqual(talent.platforms, []);
    assert.ok(
      existsSync(path.join(root, "public", talent.portrait)),
      talent.portrait,
    );
    if (talent.id === "privacy-portrait") {
      assert.equal(websiteUsageFor(talent.portrait), undefined);
    } else {
      assert.ok(websiteUsageFor(talent.portrait), talent.id);
    }
    for (const tile of talent.content) {
      assert.equal(tile.provenance, talent.provenance);
      assert.equal(tile.views, undefined);
      assert.equal(tile.engagements, undefined);
      if (tile.original)
        assert.ok(
          existsSync(path.join(root, "public", tile.original)),
          tile.original,
        );
    }
    assert.ok(
      existsSync(
        path.join(root, "public", talent.creativeDirection.promptFile),
      ),
      talent.id,
    );
    if (talent.provenance === "reference") assert.equal(talent.age, 0);
  }
});

test("dynamic discovery, product content, videos and extension roster states are not falsely unused", () => {
  for (const search of discoverySearches)
    for (const asset of search.assets)
      assert.ok(hasRoute(asset.src, "/"), asset.src);
  for (const talent of stagedTalent)
    for (const route of ["/kit-story", "/chrome-story"])
      assert.ok(hasRoute(talent.portrait, route), talent.id);
  for (const { talent, tile } of FOUND_RESULTS) {
    assert.ok(hasRoute(tile.thumb, "/kit-story"), tile.thumb);
    assert.ok(hasRoute(talent.portrait, "/kit-story"), talent.portrait);
  }
  for (const { image } of FOUND_SEEN)
    assert.ok(hasRoute(image, "/kit-story"), image);
  assert.ok(hasRoute(FOUND_SELECTED.tile.video, "/kit-story"));
  for (const tile of KIT_FEATURED_CONTENT) {
    assert.ok(hasRoute(tile.thumb, "/kit-story"));
    if (tile.video) assert.ok(hasRoute(tile.video, "/kit-story"));
  }
  const mira = websiteUsageFor(
    "/assets/talent/mira-vale-v2/mira-vale-paused-makeup.webp",
  );
  assert.deepEqual(
    [...new Set(mira.uses.map(({ route }) => route))],
    ["/kit-story"],
  );
  assert.equal(
    websiteUsageFor("/assets/people-colour/studio-creator.webp"),
    undefined,
    "saved concept is not a public placement",
  );
  assert.equal(websiteUsageFor("/assets/talent/nonexistent.webp"), undefined);
});

test("lookup supports the GitHub Pages base, absolute URLs and query strings without basename collisions", () => {
  const src =
    "/assets/people-colour/original-portraits-v1/blue-portrait-original-v1.webp";
  assert.ok(websiteUsageFor(src));
  for (const alternative of [
    src,
    `assets${src.slice(7)}`,
    `/NEWFOAMHOME${src}`,
    `https://steveblackboxapi.github.io/NEWFOAMHOME${src}?v=2#preview`,
  ]) {
    assert.equal(
      websiteUsageFor(alternative),
      websiteUsageFor(src),
      alternative,
    );
  }
  assert.equal(
    websiteUsageFor("/assets/unrelated/blue-portrait-original-v1.webp"),
    undefined,
  );
});

test("literal images in reachable public page/component sources remain covered", () => {
  const seeds = [
    "Home",
    "Managers",
    "Brands",
    "Creators",
    "Features",
    "About",
    "DataTrust",
    "Updates",
    "Demo",
    "KitStory",
    "ChromeStory",
  ].map((page) => `src/pages/${page}.tsx`);
  seeds.push(
    "src/components/Nav.tsx",
    "src/components/Footer.tsx",
    "src/components/people-colour-theme.css",
  );
  const visited = new Set();
  function inspect(relative) {
    const file = path.resolve(root, relative);
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, "utf8");
    // Only actual public UI sources: data/library modules often retain unused original assets.
    if (!/\/src\/(pages|components)\//.test(file)) return;
    const literals = [
      ...[
        ...source.matchAll(
          /\$\{(A|PC)\}\/([^`]+\.(?:webp|png|jpe?g|svg|mp4))/g,
        ),
      ]
        .filter((match) => !match[2].includes("${"))
        .map(
          (match) =>
            `/assets/${match[1] === "PC" ? "people-colour/" : ""}${match[2]}`,
        ),
      ...[
        ...source.matchAll(
          /["'(](\/assets\/[^"')]+\.(?:webp|png|jpe?g|svg|mp4))/g,
        ),
      ].map((match) => match[1]),
    ];
    for (const src of literals)
      assert.ok(websiteUsageFor(src), `${path.relative(root, file)}: ${src}`);
    for (const match of source.matchAll(
      /(?:from\s*|import\s*)["'](\.[^"']+)["']/g,
    )) {
      const base = path.resolve(path.dirname(file), match[1]);
      const next = [base, `${base}.tsx`, `${base}.ts`, `${base}.css`].find(
        existsSync,
      );
      if (next) inspect(next);
    }
  }
  seeds.forEach(inspect);
  assert.ok(visited.size > 35, "public shared component graph was traversed");
});
