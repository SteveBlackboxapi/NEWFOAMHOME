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
  kitRevealStarts,
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

test("counts are underway during the pan and finish while their panel is stationary", () => {
  const sections = [
    { field: "platforms", panStart: 0.19, start: 0.255, end: 0.31, holdEnd: 0.315 },
    { field: "metrics", panStart: 0.415, start: 0.475, end: 0.535, holdEnd: 0.54 },
    { field: "growth", panStart: 0.54, start: 0.585, end: 0.66, holdEnd: 0.665 },
    { field: "audience", panStart: 0.665, start: 0.71, end: 0.78, holdEnd: 0.795 },
  ];
  for (const { field, panStart, start, end, holdEnd } of sections) {
    const duringPan = kitStoryTimeline((panStart + start) / 2)[field];
    const settled = kitStoryTimeline(start)[field];
    assert.ok(duringPan > 0 && duringPan < settled);
    assert.ok(settled > 0 && settled < 1);
    assert.ok(kitStoryTimeline((start + end) / 2)[field] > settled);
    assert.equal(kitStoryTimeline(end)[field], 1);
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

test("later charts can begin before their dedicated pan while completed charts retain their result", () => {
  const metrics = kitStoryTimeline(0.5);
  assert.equal(metrics.platforms, 1);
  assert.ok(metrics.metrics > 0 && metrics.metrics < 1);
  assert.ok(metrics.growth > 0 && metrics.growth < 1);
  assert.equal(metrics.audience, 0);

  const growth = kitStoryTimeline(0.62);
  assert.equal(growth.metrics, 1);
  assert.ok(growth.growth > 0 && growth.growth < 1);
  assert.ok(growth.audience > 0 && growth.audience < 1);

  const audience = kitStoryTimeline(0.75);
  assert.equal(audience.metrics, 1);
  assert.equal(audience.growth, 1);
  assert.ok(audience.audience > 0 && audience.audience < 1);
  assert.equal(audience.aimShare, 0);
  assert.equal(audience.shareOpen, 0);
});

const measuredLayouts = [
  {
    name: "compact viewport",
    targets,
    layout: { viewportHeight: 500, platforms: 510, metrics: 1390, growth: 1770, audience: 2240 },
  },
  {
    name: "tall viewport showing growth below metrics",
    targets: { platforms: 120, content: 590, metrics: 980, growth: 1310, audience: 1740 },
    layout: { viewportHeight: 960, platforms: 470, metrics: 1300, growth: 1650, audience: 2080 },
  },
  {
    name: "very tall viewport showing multiple sections before pan",
    targets: { platforms: 0, content: 180, metrics: 430, growth: 800, audience: 1100 },
    layout: { viewportHeight: 1400, platforms: 420, metrics: 1080, growth: 1470, audience: 1820 },
  },
  {
    name: "all sections initially visible",
    targets: { platforms: 0, content: 0, metrics: 0, growth: 0, audience: 0 },
    layout: { viewportHeight: 2400, platforms: 400, metrics: 1100, growth: 1500, audience: 1900 },
  },
];

test("measured reveal starts eliminate visible zero exposure across viewport geometries", () => {
  const ends = { platforms: 0.31, metrics: 0.535, growth: 0.66, audience: 0.78 };
  for (const fixture of measuredLayouts) {
    const starts = kitRevealStarts(fixture.targets, fixture.layout);
    for (const field of Object.keys(ends)) {
      const entryDistance = Math.max(0, fixture.layout[field] - fixture.layout.viewportHeight);
      // Independently scan the pan to find the first visible pixel; the hero
      // covers initially visible sections until its packing has completed.
      const entry = entryDistance === 0 ? 0.14 : samples(0, ends[field], 10000)
        .find((p) => kitPan(p, fixture.targets) >= entryDistance);
      assert.notEqual(entry, undefined, `${fixture.name}: ${field} must enter`);
      assert.ok(starts[field] < entry, `${fixture.name}: ${field} starts before entry`);
      assert.ok(kitStoryTimeline(entry, starts)[field] > 0, `${fixture.name}: ${field} cannot enter at zero`);
      assert.equal(kitStoryTimeline(starts[field], starts)[field], 0);
      assert.equal(kitStoryTimeline(ends[field], starts)[field], 1);
      // A single scroll interval has no geometry/timeline handoff plateau.
      let previous = -1;
      for (const p of samples(starts[field], ends[field], 100)) {
        const current = kitStoryTimeline(p, starts)[field];
        assert.ok(current > previous, `${fixture.name}: ${field} stalled at ${p}`);
        previous = current;
      }
    }
  }
});

test("growth already counts while visible below metrics before the growth pan begins", () => {
  const { targets: measured, layout } = measuredLayouts[1];
  const starts = kitRevealStarts(measured, layout);
  const duringMetrics = 0.49;
  assert.ok(layout.growth - kitPan(duringMetrics, measured) < layout.viewportHeight);
  assert.ok(duringMetrics < 0.54, "growth pan has not started");
  assert.ok(kitStoryTimeline(duringMetrics, starts).growth > 0);
  assert.ok(kitStoryTimeline(0.52, starts).growth > kitStoryTimeline(duringMetrics, starts).growth);
  assert.ok(kitStoryTimeline(0.56, starts).growth > kitStoryTimeline(0.52, starts).growth);
  assert.ok(kitStoryTimeline(0.62, starts).growth > kitStoryTimeline(0.56, starts).growth);
});

test("measured reveal counts are identical on reverse scroll and arbitrary jumps", () => {
  for (const { targets: measured, layout } of measuredLayouts) {
    const starts = kitRevealStarts(measured, layout);
    const checkpoints = [0, 0.08, 0.14, 0.22, 0.42, 0.49, 0.535, 0.6, 0.78, 1];
    const expected = new Map(checkpoints.map((p) => [p, kitStoryTimeline(p, starts)]));
    for (const p of [...checkpoints].reverse().concat([0.42, 0.78, 0.14, 1, 0])) {
      assert.deepEqual(kitStoryTimeline(p, starts), expected.get(p));
      const baseline = kitStoryTimeline(p);
      for (const field of Object.keys(baseline).filter((key) => !(key in starts)))
        assert.equal(kitStoryTimeline(p, starts)[field], baseline[field], `${field} choreography changed`);
    }
  }
});

test("unmeasured or incomplete layouts retain safe earlier defaults", () => {
  const starts = kitRevealStarts(targets, {
    viewportHeight: 0, platforms: 0, metrics: 0, growth: 0, audience: 0,
  });
  for (const p of samples(0, 1))
    assert.deepEqual(kitStoryTimeline(p, starts), kitStoryTimeline(p));
  for (const invalid of [NaN, Infinity, -1, 1]) {
    const timeline = kitStoryTimeline(0.5, { metrics: invalid });
    assert.ok(Number.isFinite(timeline.metrics) && timeline.metrics >= 0 && timeline.metrics <= 1);
  }
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
