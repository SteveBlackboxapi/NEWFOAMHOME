// Run with: node --test scripts/test-found-story-motion.mjs
// Checks timed example text and pure scroll state. Timer lifecycle and visual
// composition remain integration/browser checks.
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
const {
  foundStoryTimeline,
  foundSearchExample,
  FOUND_SEARCH_QUERY,
  FOUND_SEARCH_LOCK_PROGRESS,
  FOUND_SEARCH_EXAMPLES,
  FOUND_SEARCH_CYCLE_MS,
} = module.exports;
const exampleQueries = ["Morning runs outdoors", "Everyday makeup and haircare"];
const typeMs = 65;
const holdMs = 1500;
const eraseMs = 30;
const gapMs = 400;
const phases = {
  zoom: [0.05, 0.38],
  results: [0.22, 0.5],
  highlight: [0.52, 0.62],
  detail: [0.66, 0.85],
  finish: [0.88, 0.98],
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

test("each timed example types one character at a time, holds, then erases into a blank gap", () => {
  assert.deepEqual(FOUND_SEARCH_EXAMPLES, exampleQueries);
  let start = 0;
  for (const text of exampleQueries) {
    for (let characters = 0; characters < text.length; characters++) {
      const time = start + characters * typeMs;
      assert.equal(foundSearchExample(time), text.slice(0, characters));
      assert.equal(foundSearchExample(time + typeMs - 0.25), text.slice(0, characters));
      assert.equal(foundSearchExample(time + typeMs), text.slice(0, characters + 1));
    }
    const holdStart = start + text.length * typeMs;
    for (const offset of [0, holdMs / 2, holdMs - 0.25])
      assert.equal(foundSearchExample(holdStart + offset), text);
    const eraseStart = holdStart + holdMs;
    for (let removed = 0; removed < text.length; removed++) {
      const time = eraseStart + removed * eraseMs;
      assert.equal(foundSearchExample(time), text.slice(0, text.length - removed));
      assert.equal(foundSearchExample(time + eraseMs - 0.25), text.slice(0, text.length - removed));
      assert.equal(foundSearchExample(time + eraseMs), text.slice(0, text.length - removed - 1));
    }
    const gapStart = eraseStart + text.length * eraseMs;
    for (const offset of [0, gapMs / 2, gapMs - 0.25])
      assert.equal(foundSearchExample(gapStart + offset), "");
    start = gapStart + gapMs;
  }
  assert.equal(FOUND_SEARCH_CYCLE_MS, start);
});

test("timed examples wrap exactly and give the same text after skipped or reversed clock samples", () => {
  const checkpoints = [...samples(0, FOUND_SEARCH_CYCLE_MS, 1000), 65, 130, 1365, 2865, 3895];
  const baseline = new Map(checkpoints.map((time) => [time, foundSearchExample(time)]));
  for (const time of [...checkpoints].reverse().concat([3895, 65, 2865, 0, 1365]))
    assert.equal(foundSearchExample(time), baseline.get(time));
  for (const cycles of [1, 2, 1000]) {
    for (const offset of [0, 64.75, 65, 130, 1365, 2865, 3895, FOUND_SEARCH_CYCLE_MS - 0.25])
      assert.equal(foundSearchExample(cycles * FOUND_SEARCH_CYCLE_MS + offset), foundSearchExample(offset));
  }
  assert.equal(foundSearchExample(FOUND_SEARCH_CYCLE_MS - 0.25), "");
  assert.equal(foundSearchExample(FOUND_SEARCH_CYCLE_MS), "");
  assert.equal(foundSearchExample(FOUND_SEARCH_CYCLE_MS + typeMs), "M");
});

test("examples can change while scroll is paused without advancing any visual phase", () => {
  for (const progress of [0, 0.01, 0.02499]) {
    const paused = foundStoryTimeline(progress);
    const texts = new Set();
    for (const elapsed of samples(0, FOUND_SEARCH_CYCLE_MS, 200)) {
      texts.add(foundSearchExample(elapsed));
      assert.deepEqual(foundStoryTimeline(progress), paused);
      for (const field of Object.keys(phases)) assert.equal(paused[field], 0);
    }
    assert.ok(texts.size > 20, "search examples must keep typing at the same scroll position");
  }
});

test("scroll locks the final query at .025 before zoom, and reversing releases the lock", () => {
  assert.equal(FOUND_SEARCH_LOCK_PROGRESS, 0.025);
  assert.equal(FOUND_SEARCH_QUERY, "Everyday makeup and haircare");
  assert.equal(foundStoryTimeline(0.025 - 1e-7).query, "");
  for (const p of [0.025, 0.025 + 1e-7, 0.04, 0.05]) {
    const state = foundStoryTimeline(p);
    assert.equal(state.query, FOUND_SEARCH_QUERY);
    for (const field of Object.keys(phases)) assert.equal(state[field], 0);
  }
  for (const p of samples(0.025, 1))
    assert.equal(foundStoryTimeline(p).query, FOUND_SEARCH_QUERY);
  // Calling the clock helper mid-type or mid-erase cannot alter the scroll lock.
  for (const elapsed of [typeMs, 20 * typeMs, 21 * typeMs + holdMs + eraseMs, 3895]) {
    foundSearchExample(elapsed);
    assert.equal(foundStoryTimeline(0.025).query, FOUND_SEARCH_QUERY);
  }
  foundStoryTimeline(1);
  assert.equal(foundStoryTimeline(0.02499).query, "");
  assert.equal(foundSearchExample(typeMs), "M");
  assert.equal(foundStoryTimeline(0.025).query, FOUND_SEARCH_QUERY);
});

test("invalid example times reset safely and very large finite times still return a valid prefix", () => {
  for (const time of [-1000, -1, NaN, Infinity, -Infinity])
    assert.equal(foundSearchExample(time), foundSearchExample(0));
  for (const time of [Number.MAX_SAFE_INTEGER, Number.MAX_VALUE]) {
    const text = foundSearchExample(time);
    assert.equal(typeof text, "string");
    assert.ok(exampleQueries.some((query) => query.startsWith(text)));
  }
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
  const overlap = foundStoryTimeline(0.3);
  assert.ok(overlap.zoom > 0 && overlap.zoom < 1);
  assert.ok(overlap.results > 0 && overlap.results < 1);
  assert.equal(overlap.highlight, 0);
  assert.equal(overlap.detail, 0);
  assert.equal(overlap.finish, 0);
  const ready = foundStoryTimeline(0.51);
  assert.equal(ready.zoom, 1);
  assert.equal(ready.results, 1);
  assert.equal(ready.highlight, 0);
  assert.deepEqual(foundStoryTimeline(0.62), foundStoryTimeline(0.66));
  assert.deepEqual(foundStoryTimeline(0.85), foundStoryTimeline(0.88));
  assert.deepEqual(foundStoryTimeline(0.98), foundStoryTimeline(1));
});

test("numeric animation values stay continuous across all phase boundaries", () => {
  for (const boundary of [
    0.025,
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
    0.02499,
    0.025,
    0.4,
    ...Object.values(phases).flat(),
  ];
  const baseline = new Map(checkpoints.map((p) => [p, foundStoryTimeline(p)]));
  for (const p of [...checkpoints]
    .reverse()
    .concat([0.85, 0.025, 1, 0, 0.62, 0.02499, 0.98]))
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
