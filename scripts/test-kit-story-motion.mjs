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
  KIT_STORY_HEIGHT_VH,
  kitShareCursor,
  KIT_COUNT_SCROLL_VH,
  kitMobileCountProgress,
  kitPlanePose,
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
    [0.475, 0.495, targets.metrics],
    [0.54, 0.565, targets.growth],
    [0.61, 1, targets.audience],
  ];
  for (const [start, end, position] of holds) {
    for (const p of samples(start, end)) {
      nearly(kitPan(p, targets), position, `hold ${start}…${end} at ${p}`);
    }
  }
});

test("every count reaches its final result within 24vh of scroll rather than the reading hold", () => {
  const starts = {
    platforms: 0.08,
    metrics: 0.34,
    growth: 0.43,
    audience: 0.5,
  };
  assert.equal(KIT_COUNT_SCROLL_VH, 24);
  const span = 24 / (KIT_STORY_HEIGHT_VH - 100);
  for (const [field, start] of Object.entries(starts)) {
    assert.equal(kitStoryTimeline(start)[field], 0);
    nearly(kitStoryTimeline(start + span / 2)[field], 0.5, `${field} halfway`);
    nearly(kitStoryTimeline(start + span)[field], 1, `${field} complete`);
    assert.equal(kitStoryTimeline(start + span + 0.1)[field], 1);
    assert.equal(kitStoryTimeline(start - 0.01)[field], 0);
  }
});

// Layout offsets point at the first number, including header/padding above it.
const measuredLayouts = [
  {
    name: "720px screen: burgundy strip visible, actual platform number still below panel",
    targets: {
      platforms: 420,
      content: 970,
      metrics: 1630,
      growth: 1980,
      audience: 2390,
    },
    layout: {
      viewportHeight: 576,
      platforms: 635,
      metrics: 1700,
      growth: 2060,
      audience: 2470,
    },
  },
  {
    name: "compact viewport",
    targets,
    layout: {
      viewportHeight: 500,
      platforms: 510,
      metrics: 1390,
      growth: 1770,
      audience: 2240,
    },
  },
  {
    name: "tall viewport showing growth below metrics",
    targets: {
      platforms: 120,
      content: 590,
      metrics: 980,
      growth: 1310,
      audience: 1740,
    },
    layout: {
      viewportHeight: 960,
      platforms: 470,
      metrics: 1300,
      growth: 1650,
      audience: 2080,
    },
  },
  {
    name: "very tall viewport showing multiple sections before pan",
    targets: {
      platforms: 0,
      content: 180,
      metrics: 430,
      growth: 800,
      audience: 1100,
    },
    layout: {
      viewportHeight: 1400,
      platforms: 420,
      metrics: 1080,
      growth: 1470,
      audience: 1820,
    },
  },
  {
    name: "all sections initially visible",
    targets: { platforms: 0, content: 0, metrics: 0, growth: 0, audience: 0 },
    layout: {
      viewportHeight: 2400,
      platforms: 400,
      metrics: 1100,
      growth: 1500,
      audience: 1900,
    },
  },
];

test("measured reveal starts eliminate visible zero exposure across viewport geometries", () => {
  const ends = { platforms: 0.31, metrics: 0.49, growth: 0.56, audience: 0.65 };
  for (const fixture of measuredLayouts) {
    const starts = kitRevealStarts(fixture.targets, fixture.layout);
    for (const field of Object.keys(ends)) {
      const entryDistance = Math.max(
        0,
        fixture.layout[field] - fixture.layout.viewportHeight,
      );
      // The kit begins showing through during the portrait shrink, before it
      // lands at .14. Other sections enter when their first pixel crosses the panel.
      const entry =
        entryDistance === 0
          ? 0.1
          : samples(0, ends[field], 10000).find(
              (p) => kitPan(p, fixture.targets) >= entryDistance,
            );
      assert.notEqual(entry, undefined, `${fixture.name}: ${field} must enter`);
      assert.ok(
        starts[field] < entry,
        `${fixture.name}: ${field} starts before entry`,
      );
      const atEntry = kitStoryTimeline(entry, starts)[field];
      assert.ok(
        atEntry > 0 && atEntry < 1,
        `${fixture.name}: ${field} must enter still counting, not zero or already complete (${atEntry})`,
      );
      assert.equal(kitStoryTimeline(starts[field], starts)[field], 0);
      assert.equal(kitStoryTimeline(ends[field], starts)[field], 1);
      // Counts rise continuously through one short interval and then settle.
      const finish = Math.min(
        ends[field],
        starts[field] + 24 / (KIT_STORY_HEIGHT_VH - 100),
      );
      assert.ok(
        (finish - starts[field]) * (KIT_STORY_HEIGHT_VH - 100) <= 24.000001,
      );
      assert.equal(kitStoryTimeline(finish + 0.000001, starts)[field], 1);
      let previous = -1;
      for (const p of samples(starts[field], finish, 100)) {
        const current = kitStoryTimeline(p, starts)[field];
        assert.ok(
          current > previous,
          `${fixture.name}: ${field} stalled at ${p}`,
        );
        previous = current;
      }
    }
  }
});

test("growth starts and completes quickly when visible below metrics, before its own pan", () => {
  const { targets: measured, layout } = measuredLayouts.find(
    ({ name }) => name === "tall viewport showing growth below metrics",
  );
  const starts = kitRevealStarts(measured, layout);
  const duringMetrics = 0.48;
  assert.ok(
    layout.growth - kitPan(duringMetrics, measured) < layout.viewportHeight,
  );
  assert.ok(duringMetrics < 0.495, "growth pan has not started");
  assert.ok(starts.growth < duringMetrics);
  assert.equal(kitStoryTimeline(duringMetrics, starts).growth, 1);
  nearly(
    kitStoryTimeline(starts.growth + 0.02, starts).growth,
    0.5,
    "visible growth halfway",
  );
});

test("measured reveal counts are identical on reverse scroll and arbitrary jumps", () => {
  for (const { targets: measured, layout } of measuredLayouts) {
    const starts = kitRevealStarts(measured, layout);
    const checkpoints = [0, 0.08, 0.14, 0.22, 0.42, 0.49, 0.535, 0.6, 0.78, 1];
    const expected = new Map(
      checkpoints.map((p) => [p, kitStoryTimeline(p, starts)]),
    );
    for (const p of [...checkpoints]
      .reverse()
      .concat([0.42, 0.78, 0.14, 1, 0])) {
      assert.deepEqual(kitStoryTimeline(p, starts), expected.get(p));
      const baseline = kitStoryTimeline(p);
      for (const field of Object.keys(baseline).filter(
        (key) => !(key in starts),
      ))
        assert.equal(
          kitStoryTimeline(p, starts)[field],
          baseline[field],
          `${field} choreography changed`,
        );
    }
  }
});

test("unmeasured or incomplete layouts retain safe earlier defaults", () => {
  const starts = kitRevealStarts(targets, {
    viewportHeight: 0,
    platforms: 0,
    metrics: 0,
    growth: 0,
    audience: 0,
  });
  for (const p of samples(0, 1))
    assert.deepEqual(kitStoryTimeline(p, starts), kitStoryTimeline(p));
  for (const invalid of [NaN, Infinity, -1, 1]) {
    const timeline = kitStoryTimeline(0.5, { metrics: invalid });
    assert.ok(
      Number.isFinite(timeline.metrics) &&
        timeline.metrics >= 0 &&
        timeline.metrics <= 1,
    );
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
      kitPan(0.48, measured),
      measured.metrics,
      "new metrics position takes effect immediately",
    );
    nearly(kitPan(1, measured), measured.audience, "final measured position");
  }
  nearly(
    kitPan(0.48, targets),
    targets.metrics,
    "original targets remain reusable",
  );
});

test("pan and timeline remain continuous at every chapter and sharing boundary", () => {
  const boundaries = [
    0.015, 0.105, 0.14, 0.19, 0.255, 0.31, 0.315, 0.39, 0.415, 0.475, 0.49,
    0.495, 0.54, 0.56, 0.565, 0.61, 0.65, 0.655, 0.69, 0.72, 0.755, 0.795, 0.82,
    0.84, 0.85, 0.86, 0.865, 0.88, 0.89, 0.895, 0.91, 0.902, 0.914, 0.915, 0.94,
    0.95, 0.985, 1,
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

test("analytics stops need less than half their previous scroll while keeping a reading moment", () => {
  const oldTravel = 820 - 100;
  const newTravel = KIT_STORY_HEIGHT_VH - 100;
  assert.ok(newTravel < oldTravel);
  const holds = [
    { old: 0.54 - 0.475, now: 0.495 - 0.475 },
    { old: 0.665 - 0.585, now: 0.565 - 0.54 },
    { old: 0.795 - 0.71, now: 0.655 - 0.61 },
  ];
  for (const hold of holds) {
    assert.ok(hold.now * newTravel > 10, "a reading moment remains");
    assert.ok(hold.now * newTravel < (hold.old * oldTravel) / 2);
  }
});

test("logo and title stay fully readable while the plane emerges, before its flight", () => {
  for (const progress of samples(0.895, 0.95)) {
    const state = kitStoryTimeline(progress);
    assert.equal(state.sharedIn, 1);
    assert.equal(state.sharedOut, 0);
    assert.equal(state.fly, 0);
    assert.equal(state.kitOut, 1);
  }
  assert.equal(kitStoryTimeline(0.902).planeIn, 0);
  assert.equal(kitStoryTimeline(0.914).planeIn, 1);
  assert.equal(kitStoryTimeline(0.915).planeEmerge, 0);
  assert.ok(kitStoryTimeline(0.935).planeEmerge > 0.5);
  assert.equal(kitStoryTimeline(0.95).planeEmerge, 1);
  assert.ok(kitStoryTimeline(0.96).fly > 0);
  assert.equal(kitStoryTimeline(1).fly, 1);
  assert.equal(kitStoryTimeline(1).sharedOut, 1);
});

test("share cursor centres itself on measured controls at compact, wide and offset stages", () => {
  const fixtures = [
    {
      stage: { left: 0, top: 0, width: 1024, height: 600 },
      share: { left: 910, top: 42, width: 86, height: 32 },
      copy: { left: 610, top: 325, width: 80, height: 28 },
    },
    {
      stage: { left: 0, top: 0, width: 1920, height: 1080 },
      share: { left: 1803, top: 68, width: 88, height: 32 },
      copy: { left: 1060, top: 565, width: 80, height: 28 },
    },
    {
      stage: { left: 135, top: -17, width: 1440, height: 900 },
      share: { left: 1450, top: 54, width: 91, height: 32 },
      copy: { left: 964, top: 477, width: 80, height: 28 },
    },
  ];
  for (const { stage, share, copy } of fixtures) {
    const sharePoint = {
      x: share.left - stage.left + share.width / 2,
      y: share.top - stage.top + share.height / 2,
    };
    const copyPoint = {
      x: copy.left - stage.left + copy.width / 2,
      y: copy.top - stage.top + copy.height / 2,
    };
    assert.deepEqual(kitShareCursor(stage, share, null, 1, 0), sharePoint);
    assert.deepEqual(kitShareCursor(stage, share, copy, 1, 1), copyPoint);
    const middle = kitShareCursor(stage, share, copy, 1, 0.5);
    nearly(middle.x, (sharePoint.x + copyPoint.x) / 2, "copy approach x");
    nearly(middle.y, (sharePoint.y + copyPoint.y) / 2, "copy approach y");
    const relabelled = { ...copy, left: copy.left + 8, width: copy.width - 16 };
    assert.deepEqual(kitShareCursor(stage, share, relabelled, 1, 1), copyPoint);
    const checkpoints = [0, 0.2, 0.5, 0.8, 1];
    const recorded = new Map(
      checkpoints.map((progress) => [
        progress,
        kitShareCursor(stage, share, copy, 1, progress),
      ]),
    );
    for (const progress of [1, 0.2, 0.8, 0, 0.5, 1]) {
      assert.deepEqual(
        kitShareCursor(stage, share, copy, 1, progress),
        recorded.get(progress),
        "reverse and jumps are pure",
      );
    }
  }
});

test("plane begins within the actual logo and emerges upward away from the title on any screen", () => {
  for (const [width, height, offsetX, offsetY, logoSize] of [
    [1024, 600, 0, 0, 168],
    [1440, 900, 37, -20, 220],
    [1920, 1080, 0, 80, 220],
  ]) {
    const stage = { left: offsetX, top: offsetY, width, height };
    const logo = {
      left: offsetX + width / 2 - logoSize / 2,
      top: offsetY + height / 2 - 150,
      width: logoSize,
      height: logoSize,
    };
    const start = kitPlanePose(stage, logo, 0, 0);
    nearly(
      start.x,
      logo.left - stage.left + logoSize / 2,
      "starts behind logo centre x",
    );
    nearly(
      start.y,
      logo.top - stage.top + logoSize / 2,
      "starts behind logo centre y",
    );
    assert.ok(
      start.width < logo.width * 0.6,
      "initial plane fits under opaque logo content",
    );
    const emerged = kitPlanePose(stage, logo, 1, 0);
    assert.ok(
      emerged.x > logo.left - stage.left + logo.width,
      "nose emerges to the right",
    );
    assert.ok(
      emerged.y < logo.top - stage.top,
      "plane clears above logo, not across title",
    );
    const gone = kitPlanePose(stage, logo, 1, 1);
    assert.ok(gone.x - gone.width / 2 > stage.width, "plane exits entirely");
    let previousY = start.y;
    for (const p of samples(0.915, 1, 100)) {
      const state = kitStoryTimeline(p);
      const pose = kitPlanePose(stage, logo, state.planeEmerge, state.fly);
      assert.ok(
        pose.y <= previousY + 1e-9,
        "never drops across the readable title",
      );
      previousY = pose.y;
    }
    assert.deepEqual(
      kitPlanePose(stage, logo, 0, 0),
      start,
      "reversing returns behind logo",
    );
    assert.deepEqual(
      kitPlanePose(stage, logo, 1, 0),
      emerged,
      "jumping recreates launch",
    );
  }
});

test("mobile numbers finish in a fraction of the original natural-scroll span and rewind", () => {
  assert.equal(kitMobileCountProgress(0), 0);
  assert.equal(kitMobileCountProgress(0.1), 0.26);
  assert.equal(kitMobileCountProgress(0.4), 1);
  assert.equal(kitMobileCountProgress(1), 1);
  assert.equal(kitMobileCountProgress(0.1), 0.26);
  assert.equal(kitMobileCountProgress(0), 0);
  for (const invalid of [NaN, Infinity, -Infinity, -1])
    assert.equal(kitMobileCountProgress(invalid), 0);
});

test("a visible panel edge or header cannot spend the count before the numbers arrive", () => {
  const { targets: measured, layout } = measuredLayouts[0];
  const starts = kitRevealStarts(measured, layout);
  // This is the reported 1280×720 case: only 18px of the burgundy section
  // is visible, with the first number another 77px below that section edge.
  const sectionTop = 558;
  assert.equal(layout.viewportHeight - sectionTop, 18);
  assert.ok(layout.platforms > layout.viewportHeight);
  assert.equal(kitStoryTimeline(461 / 4320, starts).platforms, 0);
  assert.ok(
    starts.platforms > 0.19,
    "wait until the first-number approach, not the intro",
  );
  for (const field of ["platforms", "metrics", "growth", "audience"]) {
    const firstNumberPan = layout[field] - layout.viewportHeight;
    const entry = samples(0, 0.65, 20000).find(
      (p) => kitPan(p, measured) >= firstNumberPan,
    );
    assert.notEqual(entry, undefined);
    const count = kitStoryTimeline(entry, starts)[field];
    assert.ok(
      count > 0 && count < 0.5,
      `${field} enters with most of its count still visible`,
    );
    assert.equal(kitStoryTimeline(starts[field] + 0.040001, starts)[field], 1);
  }
  // The old section-edge anchor reproduces premature completion, making this
  // fixture sensitive to accidentally measuring the section again.
  const wrongStarts = kitRevealStarts(measured, {
    ...layout,
    platforms: sectionTop,
  });
  assert.equal(kitStoryTimeline(0.14, wrongStarts).platforms, 1);
  assert.equal(kitStoryTimeline(0.14, starts).platforms, 0);
});
