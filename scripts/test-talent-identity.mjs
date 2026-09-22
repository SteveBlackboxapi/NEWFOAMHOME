// Run with: node --test scripts/test-talent-identity.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { strFromU8, unzipSync } from "fflate";
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

const { stagedTalent, resolveCaptionSettings } = loadApplication(
  "src/data/stagedTalent.ts",
);
const {
  assetsFor,
  readCaption,
  writeCaption,
  readSaved,
  SAVED_KEY,
  profileData,
  downloadPack,
} = loadApplication("src/lib/talentLab.ts");
const samantha = stagedTalent.find((talent) => talent.id === "samantha-pikka");
const suffixes = [
  "dance-solo-v3",
  "dance-duo-v3",
  "0",
  "1",
  "4",
  "5",
  "6",
  "7",
];
const key = (suffix, talent = samantha.id) =>
  `foam-lab-talent-caption:${talent}:${suffix}`;
function storage(t) {
  const values = new Map();
  t.mock.method(globalThis, "fetch", async () => {
    throw new Error("Unexpected network request");
  });
  const old = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (name) => values.get(name) ?? null,
      setItem: (name, value) => values.set(name, value),
    },
  });
  t.after(() =>
    old
      ? Object.defineProperty(globalThis, "localStorage", old)
      : delete globalThis.localStorage,
  );
  return values;
}

test("Samantha's reordered content keeps existing bookmarks and drafts on their original images", (t) => {
  const values = storage(t);
  for (let oldIndex = 0; oldIndex < 8; oldIndex++)
    values.set(
      key(oldIndex),
      JSON.stringify({ text: `Saved draft ${oldIndex}` }),
    );
  const assets = assetsFor(samantha);
  assert.deepEqual(
    assets.slice(1).map((asset) => asset.id),
    suffixes.map((id) => `${samantha.id}:${id}`),
  );
  const expectedSources = {
    0: "v2-c1.webp",
    1: "v2-c2.webp",
    4: "v2-c5.webp",
    5: "v2-c6.webp",
    6: "io-portrait-poster.webp",
  };
  for (const [id, source] of Object.entries(expectedSources)) {
    const asset = assets.find((item) => item.id === `${samantha.id}:${id}`);
    assert.ok(
      asset.src.endsWith(source),
      `${id} still refers to its original source`,
    );
    assert.equal(readCaption(asset).text, `Saved draft ${id}`);
  }
  for (const asset of assets.slice(1, 3))
    assert.equal(
      readCaption(asset).text,
      resolveCaptionSettings(asset.tile).text,
    );
  values.set(
    SAVED_KEY,
    JSON.stringify([
      "samantha-pikka:0",
      "samantha-pikka:1",
      "samantha-pikka:2",
      "samantha-pikka:3",
    ]),
  );
  assert.deepEqual(
    readSaved().filter((id) => assets.some((asset) => asset.id === id)),
    ["samantha-pikka:0", "samantha-pikka:1"],
    "Retired family bookmarks cannot become dancer bookmarks",
  );
});

test("caption writes survive another reorder without overwriting retired or adjacent drafts", (t) => {
  const values = storage(t);
  values.set(key("2"), JSON.stringify({ text: "Archived family caption" }));
  const assets = assetsFor(samantha);
  const curl = assets.find((asset) => asset.id === "samantha-pikka:0");
  const dancer = assets.find(
    (asset) => asset.id === "samantha-pikka:dance-solo-v3",
  );
  assert.notEqual(curl.index, 0);
  assert.equal(
    writeCaption(curl, { ...readCaption(curl), text: "Edited curls" }),
    true,
  );
  assert.equal(
    writeCaption(dancer, { ...readCaption(dancer), text: "Edited dance" }),
    true,
  );
  assert.equal(JSON.parse(values.get(key("0"))).text, "Edited curls");
  assert.equal(
    JSON.parse(values.get(key("dance-solo-v3"))).text,
    "Edited dance",
  );
  assert.equal(
    JSON.parse(values.get(key("2"))).text,
    "Archived family caption",
  );
  const reversed = assetsFor({
    ...samantha,
    content: [...samantha.content].reverse(),
  });
  assert.equal(
    readCaption(reversed.find((asset) => asset.id === curl.id)).text,
    "Edited curls",
  );
  assert.equal(
    readCaption(reversed.find((asset) => asset.id === dancer.id)).text,
    "Edited dance",
  );
});

test("creators without explicit tile IDs retain all numeric IDs and caption keys", (t) => {
  const values = storage(t);
  for (const talent of stagedTalent.filter((item) =>
    item.content.every((tile) => tile.id === undefined),
  )) {
    const assets = assetsFor(talent);
    assert.equal(assets[0].id, `${talent.id}:portrait`);
    for (const asset of assets.slice(1)) {
      assert.equal(asset.id, `${talent.id}:${asset.index}`);
      values.set(
        key(asset.index, talent.id),
        JSON.stringify({ text: "Legacy draft" }),
      );
      assert.equal(readCaption(asset).text, "Legacy draft");
      writeCaption(asset, {
        ...readCaption(asset),
        text: "Updated legacy draft",
      });
      assert.equal(
        JSON.parse(values.get(key(asset.index, talent.id))).text,
        "Updated legacy draft",
      );
    }
  }
});

test("profile JSON and ZIP metadata export stable identities with their matching saved drafts", async (t) => {
  const values = storage(t);
  values.set(key("0"), JSON.stringify({ text: "Export these curls" }));
  values.set(
    key("dance-solo-v3"),
    JSON.stringify({ text: "Export this dance" }),
  );
  let downloaded;
  const previous = { window: globalThis.window, document: globalThis.document };
  globalThis.window = {
    location: { href: "https://example.test/lab/talent" },
    setTimeout() {},
  };
  globalThis.document = {
    body: { appendChild() {} },
    createElement: () => ({ click() {}, remove() {} }),
  };
  t.after(() => {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
  });
  t.mock.method(URL, "createObjectURL", (blob) => {
    downloaded = blob;
    return "blob:test";
  });
  // Distinct mock bytes let this test exercise the real ZIP path without loading media.
  t.mock.method(
    globalThis,
    "fetch",
    async (src) =>
      new Response(String(src), {
        headers: {
          "content-type": src.endsWith(".md")
            ? "text/markdown"
            : src.endsWith(".mp4")
              ? "video/mp4"
              : "image/jpeg",
        },
      }),
  );
  const assets = assetsFor(samantha).filter((asset) =>
    ["samantha-pikka:0", "samantha-pikka:dance-solo-v3"].includes(asset.id),
  );
  const profile = profileData(samantha);
  assert.equal(
    profile.content.find((tile) => tile.id === "samantha-pikka:0")
      .captionSettings.text,
    "Export these curls",
  );
  assert.equal(
    profile.content.find((tile) => tile.id === "samantha-pikka:dance-solo-v3")
      .captionSettings.text,
    "Export this dance",
  );
  await downloadPack(assets, "identity-check.zip", () => {});
  const files = unzipSync(new Uint8Array(await downloaded.arrayBuffer()));
  const exported = JSON.parse(strFromU8(files["talent-data.json"]));
  assert.deepEqual(
    exported.includedAssetIds,
    assets.map((asset) => asset.id),
  );
  assert.deepEqual(exported.talent[0], JSON.parse(JSON.stringify(profile)));
  assert.ok(
    !exported.talent[0].content.some((tile) =>
      ["samantha-pikka:2", "samantha-pikka:3"].includes(tile.id),
    ),
  );
});

test("Nia's optimized image keeps the same saved post and caption draft as its PNG master", (t) => {
  const values = storage(t);
  const nia = stagedTalent.find((talent) => talent.id === "nia-brooks");
  const prior = {
    ...nia,
    portrait: nia.originalPortrait,
    content: nia.content.map((tile) => ({ ...tile, thumb: tile.original })),
  };
  const currentAssets = assetsFor(nia);
  assert.deepEqual(
    currentAssets.map((asset) => asset.id),
    assetsFor(prior).map((asset) => asset.id),
  );
  const currentPost = currentAssets.find(
    (asset) => asset.id === "nia-brooks:skincare-review",
  );
  assert.ok(currentPost);
  values.set(SAVED_KEY, JSON.stringify([currentPost.id]));
  values.set(
    key("skincare-review", nia.id),
    JSON.stringify({ text: "My saved skincare caption" }),
  );
  assert.deepEqual(readSaved(), [currentPost.id]);
  assert.equal(readCaption(currentPost).text, "My saved skincare caption");
  assert.equal(currentPost.original, prior.content[0].thumb);
  assert.equal(currentAssets[0].original, prior.portrait);
});
