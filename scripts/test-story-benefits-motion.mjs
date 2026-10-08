// Run with: node --test scripts/test-story-benefits-motion.mjs
// Exercises exit geometry; browser checks still verify actual sticky layout.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/storyBenefitsMotion.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: filename.pathname,
});
const module = { exports: {} };
new Function("module", "exports", outputText)(module, module.exports);
const { storyBenefitsCollapseAt } = module.exports;
const heights = [600, 640, 700, 701, 720, 900, 1080];
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);

test("both recaps stay fully open while pinned and through the first 2vh of upward page travel", () => {
  for (const height of heights)
    for (const top of [height, 50, 0, -height * 0.01, -height * 0.02])
      assert.equal(storyBenefitsCollapseAt(top, height), 0);
});

test("continued upward travel smoothly collapses the recap by 25vh, at every desktop height", () => {
  for (const height of heights) {
    close(storyBenefitsCollapseAt(-height * 0.135, height), 0.5);
    for (const travel of [0.25, 0.7, 1.5])
      assert.equal(storyBenefitsCollapseAt(-height * travel, height), 1);
    let previous = 0;
    for (let step = 1; step <= 100; step++) {
      const collapse = storyBenefitsCollapseAt(-height * (0.02 + 0.23 * step / 100), height);
      assert.ok(collapse >= previous && collapse - previous < 0.016, "no snap or backward collapse");
      previous = collapse;
    }
  }
});

test("reverse scrolling and direct entry restore the same list without playback state", () => {
  const positions = [0.2, 0, -0.01, -0.02, -0.08, -0.135, -0.2, -0.25, -0.6];
  for (const height of heights) {
    const forward = positions.map(top => storyBenefitsCollapseAt(top * height, height));
    assert.deepEqual(positions.toReversed().map(top => storyBenefitsCollapseAt(top * height, height)).toReversed(), forward);
    for (const index of [8, 4, 6, 1, 7, 0, 3])
      assert.equal(storyBenefitsCollapseAt(positions[index] * height, height), forward[index]);
  }
});

test("natural upward travel remains stronger than the centred recap's downward recentring", () => {
  for (const height of heights) {
    // Match the 700px breakpoint, including final-row padding and the kit's margin change.
    const rowHeight = height <= 700 ? 32 : 38;
    const finalRowHeight = height <= 700 ? 20.8 : 23.4;
    const kitGapRemoved = height <= 700 ? 2 : 10;
    const removedHeights = [
      5 * rowHeight + rowHeight - finalRowHeight + kitGapRemoved,
      4 * rowHeight + rowHeight - finalRowHeight,
    ];
    for (const removedHeight of removedHeights) {
      let previous = 0;
      for (let step = 1; step <= 1000; step++) {
        const stageTop = -height * step / 2000;
        const logoShift = stageTop + removedHeight / 2 * storyBenefitsCollapseAt(stageTop, height);
        assert.ok(logoShift < previous, `the lockup must keep moving upward at ${height}px height`);
        previous = logoShift;
      }
    }
  }
});

test("missing or invalid geometry leaves the full benefits readable", () => {
  for (const top of [NaN, Infinity, -Infinity]) assert.equal(storyBenefitsCollapseAt(top, 900), 0);
  for (const height of [0, -1, NaN, Infinity, -Infinity]) assert.equal(storyBenefitsCollapseAt(-300, height), 0);
});
