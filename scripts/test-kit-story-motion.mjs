// Run with: node --test scripts/test-kit-story-motion.mjs
// Exercises the real pure timeline. DOM measurement, focus and responsive
// rendering still require browser checks; these tests make no claims about them.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/kitStoryMotion.ts", import.meta.url);
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
  clampProgress,
  progressBetween,
  smoothProgress,
  kitStoryTimeline,
  kitPan,
  KIT_CHAPTERS,
} = module.exports;

const targets = {
  platforms: 360,
  content: 820,
  metrics: 1340,
  growth: 1680,
  audience: 2160,
};
const nearly = (actual, expected, message, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${message}: ${actual} ≠ ${expected}`,
  );
const samples = (start, end, steps = 20) =>
  Array.from(
    { length: steps + 1 },
    (_, i) => start + ((end - start) * i) / steps,
  );

test("out-of-range and invalid scroll values resolve to finite, bounded states", () => {
  for (const input of [
    -100,
    -0.2,
    0,
    0.47,
    1,
    2,
    100,
    NaN,
    Infinity,
    -Infinity,
  ]) {
    const state = kitStoryTimeline(input);
    for (const [key, value] of Object.entries(state)) {
      assert.ok(Number.isFinite(value), `${key} must be finite at ${input}`);
      assert.ok(value >= 0 && value <= 1, `${key} must stay within 0…1`);
    }
    assert.ok(Number.isFinite(kitPan(input, targets)));
  }
  assert.deepEqual(kitStoryTimeline(-1), kitStoryTimeline(0));
  assert.deepEqual(kitStoryTimeline(2), kitStoryTimeline(1));
  for (const input of [NaN, Infinity, -Infinity]) {
    assert.equal(clampProgress(input), 0);
    assert.deepEqual(kitStoryTimeline(input), kitStoryTimeline(0));
  }
});

test("intro ends before the stationary profile chapter and does not linger over the kit", () => {
  const chapter = KIT_CHAPTERS.find(({ label }) => label === "Profile");
  assert.ok(chapter);
  const state = kitStoryTimeline(chapter.progress);
  assert.equal(state.pack, 1);
  assert.equal(state.headlineOpacity, 0);
  assert.equal(state.shareOpen, 0);
  assert.equal(kitPan(chapter.progress, targets), 0);
});

test("each content chapter has a real stationary reading interval", () => {
  const holds = [
    [0.14, 0.19, 0],
    [0.255, 0.315, targets.platforms],
    [0.39, 0.415, targets.content],
    [0.475, 0.54, targets.metrics],
    [0.585, 0.665, targets.growth],
    [0.71, 1, targets.audience],
  ];
  for (const [start, end, position] of holds) {
    for (const p of samples(start, end)) {
      nearly(kitPan(p, targets), position, `hold ${start}…${end} at ${p}`);
    }
  }
});

test("metrics, growth and audience finish animating while their panel is stationary", () => {
  const sections = [
    { field: "metrics", start: 0.475, end: 0.535, holdEnd: 0.54 },
    { field: "growth", start: 0.585, end: 0.66, holdEnd: 0.665 },
    { field: "audience", start: 0.71, end: 0.78, holdEnd: 0.795 },
  ];
  for (const { field, start, end, holdEnd } of sections) {
    assert.equal(kitStoryTimeline(start)[field], 0);
    assert.equal(kitStoryTimeline(end)[field], 1);
    nearly(
      kitStoryTimeline((start + end) / 2)[field],
      0.5,
      `${field} midpoint`,
    );
    for (const p of samples(start, holdEnd)) {
      nearly(
        kitPan(p, targets),
        targets[field],
        `${field} panel must not pan while reading`,
      );
    }
    assert.equal(kitStoryTimeline((end + holdEnd) / 2)[field], 1);
  }
});

test("later charts wait their turn while completed charts retain their result", () => {
  const metrics = kitStoryTimeline(0.5);
  assert.equal(metrics.platforms, 1);
  assert.ok(metrics.metrics > 0 && metrics.metrics < 1);
  assert.equal(metrics.growth, 0);
  assert.equal(metrics.audience, 0);

  const growth = kitStoryTimeline(0.62);
  assert.equal(growth.metrics, 1);
  assert.ok(growth.growth > 0 && growth.growth < 1);
  assert.equal(growth.audience, 0);

  const audience = kitStoryTimeline(0.75);
  assert.equal(audience.metrics, 1);
  assert.equal(audience.growth, 1);
  assert.ok(audience.audience > 0 && audience.audience < 1);
  assert.equal(audience.aimShare, 0);
  assert.equal(audience.shareOpen, 0);
});

test("chapter shortcuts land on the intended complete section instead of its transition", () => {
  const positions = {
    Platforms: "platforms",
    Content: "content",
    Performance: "metrics",
    Growth: "growth",
    Audience: "audience",
  };
  let previous = -1;
  for (const chapter of KIT_CHAPTERS) {
    assert.ok(chapter.progress > previous && chapter.progress <= 1);
    previous = chapter.progress;
    const field = positions[chapter.label];
    if (field) {
      nearly(
        kitPan(chapter.progress, targets),
        targets[field],
        `${chapter.label} position`,
      );
      if (field !== "content")
        assert.equal(kitStoryTimeline(chapter.progress)[field], 1);
    }
  }
  const share = KIT_CHAPTERS.find(({ label }) => label === "Share");
  const state = kitStoryTimeline(share.progress);
  assert.equal(state.shareOpen, 1);
  assert.equal(state.generated, 1);
  assert.equal(state.shareFade, 0);
  assert.equal(state.kitOut, 0);
});

test("forward, backward and direct jumps produce the same state without one-shot flags", () => {
  const checkpoints = samples(0, 1, 100);
  const baseline = new Map(
    checkpoints.map((p) => [
      p,
      {
        timeline: kitStoryTimeline(p),
        position: kitPan(p, targets),
      },
    ]),
  );
  for (const p of [...checkpoints]
    .reverse()
    .concat([0.66, 0, 1, 0.16, 0.5, 0.4])) {
    const expected = baseline.get(p);
    assert.ok(expected, `missing pre-recorded checkpoint ${p}`);
    assert.deepEqual(kitStoryTimeline(p), expected.timeline);
    nearly(kitPan(p, targets), expected.position, `revisited ${p}`);
  }
});

test("measured targets can change between calls without stale positions or overshoot", () => {
  const alternatives = [
    targets,
    {
      platforms: 140,
      content: 510,
      metrics: 810,
      growth: 1030,
      audience: 1290,
    },
    { platforms: 0, content: 200, metrics: 500, growth: 500, audience: 500 },
    { platforms: 0, content: 0, metrics: 0, growth: 0, audience: 0 },
  ];
  for (const measured of alternatives) {
    let previous = 0;
    for (const p of samples(0, 1, 1000)) {
      const current = kitPan(p, measured);
      assert.ok(current >= previous - 1e-9, `pan moved backward at ${p}`);
      assert.ok(
        current >= 0 && current <= measured.audience,
        `pan exceeded supplied targets at ${p}`,
      );
      previous = current;
    }
    nearly(
      kitPan(0.5, measured),
      measured.metrics,
      "new metrics position takes effect immediately",
    );
    nearly(kitPan(1, measured), measured.audience, "final measured position");
  }
  nearly(
    kitPan(0.5, targets),
    targets.metrics,
    "original targets remain reusable",
  );
});

test("pan and timeline remain continuous at every chapter and sharing boundary", () => {
  const boundaries = [
    0.015, 0.105, 0.14, 0.19, 0.255, 0.31, 0.315, 0.39, 0.415, 0.475, 0.535,
    0.54, 0.585, 0.66, 0.665, 0.71, 0.78, 0.795, 0.825, 0.85, 0.87, 0.895,
    0.915, 0.925, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 1,
  ];
  const epsilon = 1e-7;
  for (const boundary of boundaries) {
    nearly(
      kitPan(boundary - epsilon, targets),
      kitPan(boundary + epsilon, targets),
      `pan continuity at ${boundary}`,
      0.01,
    );
    const before = kitStoryTimeline(boundary - epsilon);
    const after = kitStoryTimeline(boundary + epsilon);
    for (const field of Object.keys(before)) {
      nearly(
        before[field],
        after[field],
        `${field} continuity at ${boundary}`,
        0.0001,
      );
    }
  }
});

test("normalised easing settles at endpoints and preserves the middle position", () => {
  assert.equal(progressBetween(0.2, 0.4, 0.6), 0);
  nearly(progressBetween(0.5, 0.4, 0.6), 0.5, "normalised midpoint");
  assert.equal(progressBetween(0.8, 0.4, 0.6), 1);
  assert.equal(smoothProgress(-1), 0);
  assert.equal(smoothProgress(0.5), 0.5);
  assert.equal(smoothProgress(2), 1);
  assert.ok(smoothProgress(0.01) < 0.001);
  assert.ok(smoothProgress(0.99) > 0.999);
});
