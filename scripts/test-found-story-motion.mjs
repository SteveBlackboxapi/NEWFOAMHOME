// Run with: node --test scripts/test-found-story-motion.mjs
// Checks pure scroll state; visual composition remains a browser check.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/foundStoryMotion.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: filename.pathname,
});
const module = { exports: {} };
new Function("module", "exports", outputText)(module, module.exports);
const { foundStoryTimeline, FOUND_SEARCH_QUERY } = module.exports;
const initialQuery = "Morning runs outdoors";
const phases = {
  zoom: [0.43, 0.62],
  results: [0.53, 0.69],
  highlight: [0.7, 0.76],
  detail: [0.78, 0.89],
  finish: [0.9, 0.97],
};
const samples = (start, end, steps = 100) =>
  Array.from(
    { length: steps + 1 },
    (_, i) => start + ((end - start) * i) / steps,
  );
const nearly = (actual, expected, message, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: ${actual} ≠ ${expected}`,
  );

test("search types both complete queries as prefixes and erases the first one", () => {
  for (const [text, start, end] of [
    [initialQuery, 0.025, 0.14],
    [FOUND_SEARCH_QUERY, 0.28, 0.4],
  ]) {
    const lengths = new Set();
    let previous = "";
    for (const p of samples(start, end, 200)) {
      const { query } = foundStoryTimeline(p);
      assert.ok(text.startsWith(query), `unexpected query text at ${p}`);
      assert.ok(query.startsWith(previous), `typing went backward at ${p}`);
      lengths.add(query.length);
      previous = query;
    }
    assert.equal(previous, text);
    assert.equal(
      lengths.size,
      text.length + 1,
      "every character is reachable by scrolling",
    );
  }
  let previous = initialQuery;
  const lengths = new Set();
  for (const p of samples(0.21, 0.27, 200)) {
    const { query } = foundStoryTimeline(p);
    assert.ok(previous.startsWith(query), `erasing added text at ${p}`);
    lengths.add(query.length);
    previous = query;
  }
  assert.equal(previous, "");
  assert.equal(lengths.size, initialQuery.length + 1);
});

test("typing holds are exact and the final query remains throughout results and detail", () => {
  for (const p of samples(0, 0.025))
    assert.equal(foundStoryTimeline(p).query, "");
  for (const p of samples(0.14, 0.21))
    assert.equal(foundStoryTimeline(p).query, initialQuery);
  for (const p of samples(0.27, 0.28))
    assert.equal(foundStoryTimeline(p).query, "");
  for (const p of samples(0.4, 1))
    assert.equal(foundStoryTimeline(p).query, FOUND_SEARCH_QUERY);
  assert.equal(FOUND_SEARCH_QUERY, "Everyday makeup and haircare");
  assert.deepEqual(foundStoryTimeline(0.14), foundStoryTimeline(0.21));
  assert.deepEqual(foundStoryTimeline(0.4), foundStoryTimeline(0.43));
});

test("each visual phase eases only within its interval and holds exact endpoints", () => {
  for (const [field, [start, end]] of Object.entries(phases)) {
    for (const p of samples(0, start))
      assert.equal(foundStoryTimeline(p)[field], 0);
    for (const p of samples(end, 1))
      assert.equal(foundStoryTimeline(p)[field], 1);
    nearly(
      foundStoryTimeline((start + end) / 2)[field],
      0.5,
      `${field} midpoint`,
    );
    const early = foundStoryTimeline(start + (end - start) * 0.1)[field];
    const late = foundStoryTimeline(start + (end - start) * 0.9)[field];
    assert.ok(early > 0 && early < 0.1, `${field} must ease in`);
    assert.ok(late > 0.9 && late < 1, `${field} must ease out`);
    let previous = -1;
    for (const p of samples(start, end)) {
      const current = foundStoryTimeline(p)[field];
      assert.ok(current > previous, `${field} stalled during its phase`);
      previous = current;
    }
  }
});

test("results overlap zoom and later beats retain their intended gaps", () => {
  const overlap = foundStoryTimeline(0.57);
  assert.ok(overlap.zoom > 0 && overlap.zoom < 1);
  assert.ok(overlap.results > 0 && overlap.results < 1);
  assert.equal(overlap.highlight, 0);
  assert.equal(overlap.detail, 0);
  assert.equal(overlap.finish, 0);
  const ready = foundStoryTimeline(0.695);
  assert.equal(ready.zoom, 1);
  assert.equal(ready.results, 1);
  assert.equal(ready.highlight, 0);
  assert.deepEqual(foundStoryTimeline(0.76), foundStoryTimeline(0.78));
  assert.deepEqual(foundStoryTimeline(0.89), foundStoryTimeline(0.9));
  assert.deepEqual(foundStoryTimeline(0.97), foundStoryTimeline(1));
});

test("numeric animation values stay continuous across all phase boundaries", () => {
  for (const boundary of [
    0.025,
    0.14,
    0.21,
    0.27,
    0.28,
    0.4,
    ...Object.values(phases).flat(),
  ]) {
    const before = foundStoryTimeline(boundary - 1e-7);
    const after = foundStoryTimeline(boundary + 1e-7);
    for (const field of Object.keys(phases))
      nearly(before[field], after[field], `${field} at ${boundary}`, 0.0001);
  }
});

test("reverse scroll and arbitrary jumps reproduce the same query and visual state", () => {
  const checkpoints = [
    ...samples(0, 1, 1000),
    0.025,
    0.14,
    0.21,
    0.27,
    0.28,
    0.4,
    0.43,
    0.62,
    0.69,
    0.76,
    0.78,
    0.89,
    0.9,
    0.97,
  ];
  const baseline = new Map(checkpoints.map((p) => [p, foundStoryTimeline(p)]));
  for (const p of [...checkpoints]
    .reverse()
    .concat([0.89, 0.21, 1, 0, 0.62, 0.14, 0.97]))
    assert.deepEqual(foundStoryTimeline(p), baseline.get(p));
  const edited = foundStoryTimeline(0.4);
  edited.query = "unrelated edit";
  edited.zoom = 1;
  assert.deepEqual(
    foundStoryTimeline(0.4),
    baseline.get(0.4),
    "returned state is not shared across calls",
  );
});

test("invalid and out-of-range progress always produces bounded finite state", () => {
  for (const p of [-100, -1, 0, 0.5, 1, 2, 100, NaN, Infinity, -Infinity]) {
    const state = foundStoryTimeline(p);
    assert.equal(typeof state.query, "string");
    for (const field of Object.keys(phases)) {
      assert.ok(Number.isFinite(state[field]));
      assert.ok(state[field] >= 0 && state[field] <= 1);
    }
  }
  assert.deepEqual(foundStoryTimeline(-1), foundStoryTimeline(0));
  assert.deepEqual(foundStoryTimeline(2), foundStoryTimeline(1));
  for (const p of [NaN, Infinity, -Infinity])
    assert.deepEqual(foundStoryTimeline(p), foundStoryTimeline(0));
});
