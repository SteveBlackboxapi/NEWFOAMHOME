// Run with: node --test scripts/test-story-benefits-motion.mjs
// Exercises the geometry of centred recap growth; browser checks verify layout.
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
const { storyBenefitsEntryShift } = module.exports;
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);

// Expanded recap heights, including the gap, at compact and regular breakpoints.
const recapHeights = [6 * 32 + 18, 6 * 38 + 26, 5 * 32 + 8, 5 * 38 + 8];

test("icon and title stay centred while the first 20 percent of the list grows below", () => {
  for (const height of recapHeights) for (const reveal of [0, 0.05, 0.1, 0.2]) {
    const naturalShift = -height * reveal / 2;
    close(naturalShift + height * storyBenefitsEntryShift(reveal), 0);
  }
});

test("the expanded group then recentres smoothly without a downward rebound", () => {
  for (const height of recapHeights) {
    let previous = 0;
    for (let step = 1; step <= 1000; step++) {
      const reveal = step / 1000;
      const titleShift = height * (storyBenefitsEntryShift(reveal) - reveal / 2);
      assert.ok(titleShift <= previous + 1e-9, "the title must stay still, then move upward");
      assert.ok(previous - titleShift < height * 0.002, "no vertical snap during centring");
      previous = titleShift;
    }
    close(previous, -height / 2);
  }
  assert.equal(storyBenefitsEntryShift(1), 0, "full recap uses ordinary group centring");
});

test("reverse scroll and direct jumps recreate exactly the same entry position", () => {
  const reveals = [0, 0.1, 0.2, 0.35, 0.6, 0.85, 1];
  const forward = reveals.map(storyBenefitsEntryShift);
  assert.deepEqual(reveals.toReversed().map(storyBenefitsEntryShift).toReversed(), forward);
  for (const index of [6, 3, 0, 5, 1, 4, 2])
    assert.equal(storyBenefitsEntryShift(reveals[index]), forward[index]);
});

test("invalid and out-of-range reveal values retain finite endpoint geometry", () => {
  for (const reveal of [NaN, Infinity, -Infinity, -1, 0, 1, 2])
    assert.equal(storyBenefitsEntryShift(reveal), 0);
  close(storyBenefitsEntryShift(0.6), 0.15);
});
