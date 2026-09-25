// Playback alternates must preserve the MP4 master, obey the app base and never
// invent alternate uploads. Run: node --test scripts/test-talent-video.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
  ["talent/aria-quen-v2/aria-quen-v2-makeup", "aria-makeup"],
  ["talent/lena-croft-v2/lena-croft-grwm", "lena-grwm"],
  ["talent/nia-brooks/nia-brooks-skincare", "nia-skincare"],
  ["talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh", "samantha-curl-refresh"],
];

function mp4Boxes(bytes) {
  const boxes = [];
  for (let offset = 0; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset);
    assert.ok(size >= 8 && offset + size <= bytes.length, "complete MP4 top-level box");
    boxes.push(bytes.toString("ascii", offset + 4, offset + 8));
    offset += size;
  }
  return boxes;
}

for (const base of ["/assets", "/NEWFOAMHOME/assets"]) {
  test(`reviewed previews have playable files and keep MP4 fallback under ${base}`, () => {
    const sourcesFor = loadSources(base);
    for (const [path, name] of clips) {
      const playbackPath = `video-previews-v2/${name}-720`;
      assert.deepEqual(sourcesFor(`${base}/${path}.mp4`), [
        { src: `${base}/${playbackPath}.webm`, type: 'video/webm; codecs="vp9"' },
        { src: `${base}/${playbackPath}.mp4`, type: "video/mp4" },
      ]);
      const preview = readFileSync(new URL(`../public/assets/${playbackPath}.webm`, import.meta.url));
      const fallback = readFileSync(new URL(`../public/assets/${playbackPath}.mp4`, import.meta.url));
      const master = readFileSync(new URL(`../public/assets/${path}.mp4`, import.meta.url));
      assert.deepEqual([...preview.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3], "WebM EBML header");
      assert.ok(preview.length < master.length * .9, "only retain a materially smaller preview");
      assert.ok(fallback.length < master.length * .9, "MP4-only browsers also receive a smaller preview");
      const boxes = mp4Boxes(fallback);
      assert.ok(boxes.includes("moov") && boxes.includes("mdat"));
      assert.ok(boxes.indexOf("moov") < boxes.indexOf("mdat"), "MP4 metadata precedes video for faststart");
    }
  });
}

test("reviewed files match decoding audit and originals retain their previous hashes", () => {
  const audit = JSON.parse(readFileSync(new URL("../docs/talent-video-previews-v2-audit.json", import.meta.url), "utf8"));
  const originals = JSON.parse(readFileSync(new URL("../docs/talent-video-audit-2026-09-24.json", import.meta.url), "utf8"));
  for (const video of audit.videos) {
    const prior = originals.videos.find((item) => item.original === video.original.path);
    assert.ok(prior);
    const master = readFileSync(new URL(`../${video.original.path}`, import.meta.url));
    assert.equal(createHash("sha256").update(master).digest("hex"), prior.originalSHA256);
    for (const preview of Object.values(video.previews)) {
      const bytes = readFileSync(new URL(`../${preview.path}`, import.meta.url));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), preview.sha256);
      assert.equal(preview.width, 720);
      assert.equal(preview.frames, video.original.frames);
      assert.equal(preview.fps, video.original.fps);
      assert.equal(preview.hasAudio, video.original.hasAudio);
      assert.ok(preview.vmafMeanAtDeliverySize >= 90, "reviewed compression quality at delivery size");
    }
  }
});

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
