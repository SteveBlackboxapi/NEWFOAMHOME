// Run: node --test scripts/test-overview-playback.mjs
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { applicationData } from "./application-data.mjs";

const film = "public/assets/films/foam-overview-v1/";
const original = readFileSync(new URL(`../${film}overview.mp4`, import.meta.url));
const playback = readFileSync(new URL(`../${film}overview-playback.mp4`, import.meta.url));

function boxes(bytes) {
  const result = [];
  let offset = 0;
  while (offset < bytes.length) {
    assert.ok(offset + 8 <= bytes.length, "complete box header");
    let size = bytes.readUInt32BE(offset);
    let header = 8;
    if (size === 1) { size = Number(bytes.readBigUInt64BE(offset + 8)); header = 16; }
    if (size === 0) size = bytes.length - offset;
    assert.ok(size >= header && offset + size <= bytes.length, "complete box payload");
    result.push({ type: bytes.toString("ascii", offset + 4, offset + 8), offset,
      payload: bytes.subarray(offset + header, offset + size) });
    offset += size;
  }
  return result;
}

test("overview playback preserves the original master and every encoded media byte", () => {
  assert.equal(createHash("sha256").update(original).digest("hex"),
    "59a972252fd7858d660b6837a38fdd4c488f40bd171335461618a8f0c10e7102");
  const sourceMedia = boxes(original).filter(({ type }) => type === "mdat");
  const playbackMedia = boxes(playback).filter(({ type }) => type === "mdat");
  assert.equal(sourceMedia.length, 1);
  assert.equal(playbackMedia.length, 1);
  assert.ok(sourceMedia[0].payload.equals(playbackMedia[0].payload), "all video/audio packets remain byte-identical");
});

test("playback metadata is before the media while the original remains untouched", () => {
  for (const [bytes, faststart] of [[original, false], [playback, true]]) {
    const top = boxes(bytes);
    const movie = top.find(({ type }) => type === "moov");
    const media = top.find(({ type }) => type === "mdat");
    assert.ok(movie && media);
    assert.equal(movie.offset < media.offset, faststart);
  }
});

test("both public film placements use the centrally catalogued faststart derivative", () => {
  const root = fileURLToPath(new URL("../", import.meta.url));
  const load = applicationData(root);
  const { overviewFilm } = load("src/data/overviewFilm.ts");
  const { websiteAssetUsage } = load("src/data/websiteAssetUsage.ts");
  assert.equal(overviewFilm.src, "/assets/films/foam-overview-v1/overview-playback.mp4");
  assert.ok(websiteAssetUsage.some(({ src }) => src === overviewFilm.src), "versioned-media generator includes the playback file");
});
