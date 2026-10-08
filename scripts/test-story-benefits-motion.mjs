// Run with: node --test scripts/test-story-benefits-motion.mjs
// Exercises scroll sequencing and centred recap growth; browser checks verify layout.
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
const { storyBenefitsEntryShift, storyBenefitsSequenceAt } = module.exports;
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≠ ${expected}`);

// Opening benefits only: the final confirmation occupies no height until closing.
const recaps = [
  { name: "Kit compact", count: 5, rowHeight: 32, gap: 18, finalRowHeight: 20.8, finalGap: 16 },
  { name: "Kit regular", count: 5, rowHeight: 38, gap: 26, finalRowHeight: 23.4, finalGap: 16 },
  { name: "Chrome compact", count: 4, rowHeight: 32, gap: 8, finalRowHeight: 20.8, finalGap: 8 },
  { name: "Chrome regular", count: 4, rowHeight: 38, gap: 8, finalRowHeight: 23.4, finalGap: 8 },
];
const recapHeights = recaps.map(({ count, rowHeight, gap }) => count * rowHeight + gap);

test("each benefit opens its height, writes left to right, then draws its tick", () => {
  const phases = [
    [0, { space: 0, text: 0, tick: 0 }],
    [0.1, { space: 0.5, text: 0, tick: 0 }],
    [0.2, { space: 1, text: 0, tick: 0 }],
    [0.46, { space: 1, text: 0.5, tick: 0 }],
    [0.72, { space: 1, text: 1, tick: 0 }],
    [0.86, { space: 1, text: 1, tick: 0.5 }],
    [1, { space: 1, text: 1, tick: 1 }],
  ];
  for (const count of [4, 5]) for (let index = 0; index < count; index++) {
    for (const [phase, expected] of phases) {
      const sequence = storyBenefitsSequenceAt((index + phase) / count, count);
      for (const field of ["space", "text", "tick"])
        close(sequence.rows[index][field], expected[field]);
      close(sequence.space, sequence.rows.reduce((sum, row) => sum + row.space, 0) / count);
    }
  }
});

test("every previous tick finishes before another row can open or write", () => {
  for (const count of [4, 5]) for (let step = 0; step <= 5000; step++) {
    const { rows } = storyBenefitsSequenceAt(step / 5000, count);
    for (const [index, row] of rows.entries()) {
      if (row.text > 0) assert.equal(row.space, 1, "text needs its full row clearance");
      if (row.tick > 0) assert.equal(row.text, 1, "the whole label appears before its tick");
      if (index > 0 && row.space > 0)
        assert.equal(rows[index - 1].tick, 1, "finish the previous tick before opening another row");
      if (index > 0 && row.text > 0)
        assert.equal(rows[index - 1].tick, 1, "never write two benefits at once");
    }
  }
});

test("all opening benefits settle fully, without reserving an extra confirmation row", () => {
  for (const count of [4, 5]) {
    assert.deepEqual(storyBenefitsSequenceAt(0, count), {
      space: 0, rows: Array.from({ length: count }, () => ({ space: 0, text: 0, tick: 0 })),
    });
    assert.deepEqual(storyBenefitsSequenceAt(1, count), {
      space: 1, rows: Array.from({ length: count }, () => ({ space: 1, text: 1, tick: 1 })),
    });
  }
});

test("centring follows the actual opened row heights and remains still while labels and ticks draw", () => {
  for (const { count, rowHeight, gap } of recaps) {
    const fullHeight = count * rowHeight + gap;
    let previous = 0;
    for (let step = 0; step <= 10000; step++) {
      const { space, rows } = storyBenefitsSequenceAt(step / 10000, count);
      const actualHeight = rows.reduce((sum, row) => sum + row.space * rowHeight, 0) + gap * space;
      close(actualHeight, fullHeight * space);
      const titleShift = -actualHeight / 2 + fullHeight * storyBenefitsEntryShift(space);
      if (space <= 0.2) close(titleShift, 0);
      assert.ok(titleShift <= previous + 1e-9, "the title stays still, then moves upward");
      assert.ok(previous - titleShift < fullHeight * 0.002, "no centring snap between rows");
      previous = titleShift;
    }
    close(previous, -fullHeight / 2);
    for (let index = 0; index < count; index++) {
      const positions = [0.2, 0.46, 0.72, 0.86, 1].map((phase) => {
        const { space } = storyBenefitsSequenceAt((index + phase) / count, count);
        return fullHeight * (storyBenefitsEntryShift(space) - space / 2);
      });
      for (const position of positions) close(position, positions[0]);
    }
  }
});

test("reverse scroll and arbitrary jumps reproduce the same row sequence and centring", () => {
  for (const count of [4, 5]) {
    const reveals = [0, 0.03, 0.17, 0.23, 0.46, 0.72, 0.93, 1];
    const at = (reveal) => {
      const sequence = storyBenefitsSequenceAt(reveal, count);
      return { ...sequence, shift: storyBenefitsEntryShift(sequence.space) };
    };
    const forward = reveals.map(at);
    assert.deepEqual(reveals.toReversed().map(at).toReversed(), forward);
    for (const index of [7, 2, 5, 0, 6, 4, 1, 3]) assert.deepEqual(at(reveals[index]), forward[index]);
  }
});

test("invalid inputs and out-of-range scroll values have safe finite sequence endpoints", () => {
  for (const count of [4, 5]) {
    for (const reveal of [NaN, Infinity, -Infinity, -1])
      assert.deepEqual(storyBenefitsSequenceAt(reveal, count), storyBenefitsSequenceAt(0, count));
    assert.deepEqual(storyBenefitsSequenceAt(2, count), storyBenefitsSequenceAt(1, count));
  }
  for (const count of [0, -1, 0.5, NaN, Infinity, -Infinity])
    assert.deepEqual(storyBenefitsSequenceAt(0.5, count), { space: 0, rows: [] });
});

test("icon and title stay centred while the first 20 percent of the list grows below", () => {
  for (const height of recapHeights) for (const reveal of [0, 0.05, 0.1, 0.2]) {
    const naturalShift = -height * reveal / 2;
    close(naturalShift + height * storyBenefitsEntryShift(reveal), 0);
  }
});

test("the expanded group reaches its approved centred composition without a downward rebound", () => {
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
  assert.equal(storyBenefitsEntryShift(1), 0, "the full recap retains ordinary group centring");
});

// Model the parent flex layout and its explicit compensation for removed height.
// Closing starts only once all opening rows have finished, as enforced by each timeline.
const coreTopAt = (recap, reveal, collapse) => {
  const { count, rowHeight, gap, finalRowHeight, finalGap } = recap;
  const sequence = storyBenefitsSequenceAt(reveal, count);
  const fullHeight = count * rowHeight + gap;
  const finalHeight = finalRowHeight + finalGap;
  const rowHeightNow = sequence.rows.reduce((sum, row) => sum + row.space * rowHeight, 0) * (1 - collapse)
    + finalRowHeight * collapse;
  const gapNow = sequence.space * (gap * (1 - collapse) + finalGap * collapse);
  const flexShift = -(rowHeightNow + gapNow) / 2;
  const removedHeight = (fullHeight - finalHeight) * collapse;
  return flexShift + fullHeight * storyBenefitsEntryShift(sequence.space) - removedHeight / 2;
};

test("logo and title never descend across opening, expanded hold, collapse and final hold", () => {
  const phases = [
    ...Array.from({ length: 1001 }, (_, index) => [index / 1000, 0]),
    ...Array.from({ length: 20 }, () => [1, 0]),
    ...Array.from({ length: 1000 }, (_, index) => [1, (index + 1) / 1000]),
    ...Array.from({ length: 20 }, () => [1, 1]),
  ];
  for (const recap of recaps) {
    const fullHeight = recap.count * recap.rowHeight + recap.gap;
    let previous = 0;
    for (const [reveal, collapse] of phases) {
      const top = coreTopAt(recap, reveal, collapse);
      assert.ok(top <= previous + 1e-9, `${recap.name}: core descended at reveal=${reveal}, collapse=${collapse}`);
      if (collapse > 0) close(top, -fullHeight / 2);
      previous = top;
    }
    close(previous, -fullHeight / 2);
    const finalHeight = recap.finalRowHeight + recap.finalGap;
    assert.ok((fullHeight - finalHeight) / 2 > 50, "fixture exposes the substantial flex rebound being cancelled");
  }
});

test("reversing or jumping between opening and closing restores the same core position", () => {
  const phases = [[0, 0], [0.04, 0], [0.2, 0], [0.55, 0], [0.9, 0], [1, 0], [1, 0.3], [1, 0.8], [1, 1]];
  for (const recap of recaps) {
    const at = ([reveal, collapse]) => coreTopAt(recap, reveal, collapse);
    const forward = phases.map(at);
    assert.deepEqual(phases.toReversed().map(at).toReversed(), forward);
    for (const index of [8, 2, 6, 0, 5, 3, 7, 1, 4]) assert.equal(at(phases[index]), forward[index]);
  }
});

test("reverse scroll and direct jumps recreate exactly the same entry position", () => {
  const reveals = [0, 0.1, 0.2, 0.35, 0.6, 0.85, 1];
  const forward = reveals.map(storyBenefitsEntryShift);
  assert.deepEqual(reveals.toReversed().map(storyBenefitsEntryShift).toReversed(), forward);
  for (const index of [6, 3, 0, 5, 1, 4, 2])
    assert.equal(storyBenefitsEntryShift(reveals[index]), forward[index]);
});

test("invalid and out-of-range reveal values retain finite endpoint geometry", () => {
  for (const reveal of [NaN, Infinity, -Infinity, -1, 0])
    assert.equal(storyBenefitsEntryShift(reveal), 0);
  for (const reveal of [1, 2]) assert.equal(storyBenefitsEntryShift(reveal), 0);
  close(storyBenefitsEntryShift(0.6), 0.15);
});
