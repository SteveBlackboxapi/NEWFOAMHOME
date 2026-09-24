// Playback alternates must keep the MP4 master, obey the app base and never
// invent alternate uploads. Run: node --test scripts/test-talent-video.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function loadSources(base) {
  const filename = new URL("../src/lib/talentVideo.ts", import.meta.url);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename.pathname,
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => { assert.equal(name, "./assets"); return { A: base }; },
    module,
    module.exports,
  );
  return module.exports.talentVideoSources;
}

const clips = [
  "talent/aria-quen-v2/aria-quen-v2-makeup",
  "talent/lena-croft-v2/lena-croft-grwm",
  "talent/nia-brooks/nia-brooks-skincare",
  "talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh",
];

for (const base of ["/assets", "/NEWFOAMHOME/assets"]) {
  test(`reviewed previews have playable files and keep MP4 fallback under ${base}`, () => {
    const sourcesFor = loadSources(base);
    for (const path of clips) {
      assert.deepEqual(sourcesFor(`${base}/${path}.mp4`), [
        { src: `${base}/${path}.webm`, type: 'video/webm; codecs="vp9"' },
        { src: `${base}/${path}.mp4`, type: "video/mp4" },
      ]);
      const preview = readFileSync(new URL(`../public/assets/${path}.webm`, import.meta.url));
      const master = readFileSync(new URL(`../public/assets/${path}.mp4`, import.meta.url));
      assert.deepEqual([...preview.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3], "WebM EBML header");
      assert.ok(preview.length < master.length * .9, "only retain a materially smaller preview");
    }
  });
}

test("already efficient portrait keeps its MP4; no unreviewed alternate is invented", () => {
  const sourcesFor = loadSources("/assets");
  for (const src of [
    "/assets/io-portrait-web.mp4",
    "/assets/talent/uploads/custom.mp4",
    "https://outside.example/assets/talent/aria-quen-v2/aria-quen-v2-makeup.mp4",
  ]) {
    assert.deepEqual(sourcesFor(src), [{ src, type: "video/mp4" }]);
  }
});

test("source URLs and their query strings remain intact", () => {
  const sourcesFor = loadSources("/assets");
  assert.deepEqual(sourcesFor("/private/clip.webm?version=2"), [{ src: "/private/clip.webm?version=2", type: "video/webm" }]);
  assert.deepEqual(sourcesFor("/api/asset?id=video"), [{ src: "/api/asset?id=video" }]);
});
