// Run with: node --test scripts/test-chrome-story-motion.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/chromeStoryMotion.ts", import.meta.url);
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
  CHROME_STAGE_STOPS,
  CHROME_STORY_END,
  CHROME_STORY_HEIGHT_VH,
  chromeStageAt,
  chromeCursorPose,
} = module.exports;

const targets = {
  reply: { x: 170, y: 400 },
  toolbar: { x: 820, y: 45 },
  talent: { x: 770, y: 190 },
  copy: { x: 740, y: 430 },
  caret: { x: 65, y: 245 },
};
const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test("reply is visibly closed before the toolbar opens the roster", () => {
  assert.equal(chromeStageAt(0.1399), 0);
  assert.equal(chromeStageAt(0.14), 1);
  assert.equal(chromeStageAt(0.25), 1);
  assert.equal(chromeStageAt(0.3199), 1);
  assert.equal(chromeStageAt(0.32), 2);
});

test("every action clicks its measured target before the next UI state appears", () => {
  ["reply", "toolbar", "talent", "copy", "caret"].forEach((target, index) => {
    const stop = CHROME_STAGE_STOPS[index + 1];
    const pose = chromeCursorPose(stop - 0.01, targets);
    assert.ok(pose);
    close(pose.x, targets[target].x);
    close(pose.y, targets[target].y);
    close(pose.press, 1);
    assert.equal(chromeStageAt(stop - 0.01), index);
    assert.equal(chromeStageAt(stop), index + 1);
  });
});

test("ring travels continuously from the toolbar to Samantha, then to Detail and the caret", () => {
  for (const [start, end, from, to] of [
    [0.18, 0.28, "reply", "toolbar"],
    [0.355, 0.465, "toolbar", "talent"],
    [0.53, 0.635, "talent", "copy"],
    [0.7, 0.855, "copy", "caret"],
  ]) {
    const pose = chromeCursorPose((start + end) / 2, targets);
    close(pose.x, (targets[from].x + targets[to].x) / 2);
    close(pose.y, (targets[from].y + targets[to].y) / 2);
    const before = chromeCursorPose(start - 0.000001, targets);
    const after = chromeCursorPose(start + 0.000001, targets);
    assert.ok(Math.hypot(before.x - after.x, before.y - after.y) < 0.01);
  }
});

test("reverse scrolling and direct jumps reproduce identical states and positions", () => {
  const points = Array.from({ length: 101 }, (_, index) => index / 100);
  const sample = (p) => [chromeStageAt(p), chromeCursorPose(p, targets)];
  const forward = points.map(sample);
  const backward = points.toReversed().map(sample).toReversed();
  assert.deepEqual(backward, forward);
  assert.deepEqual(sample(0.76), forward[76]);
});

test("resize measurements retarget the motion rather than using fixed pixel coordinates", () => {
  const offset = { x: 25, y: -12 };
  const moved = Object.fromEntries(
    Object.entries(targets).map(([key, point]) => [
      key,
      { x: point.x + offset.x, y: point.y + offset.y },
    ]),
  );
  for (const p of [0.075, 0.23, 0.41, 0.58, 0.77]) {
    const old = chromeCursorPose(p, targets);
    const next = chromeCursorPose(p, moved);
    close(next.x - old.x, offset.x);
    close(next.y - old.y, offset.y);
  }
});

test("missing measurements never invent a cursor position", () => {
  assert.equal(chromeCursorPose(0.25, {}), null);
  assert.equal(chromeCursorPose(0.25, { reply: targets.reply }), null);
});

test("ring fades before paste, with no stationary cursor over the final embed", () => {
  assert.ok(chromeCursorPose(0.875, targets).opacity < 1);
  for (const p of [0.88, 0.95, 1, 5])
    assert.equal(chromeCursorPose(p, targets), null);
  assert.equal(chromeStageAt(0.88), 5);
  assert.equal(chromeStageAt(1), 5);
});

test("the scene releases within five viewport-percent of scroll after paste", () => {
  const paste = CHROME_STAGE_STOPS.at(-1);
  const travel = CHROME_STORY_HEIGHT_VH - 100;
  const remainingVh = travel * (1 - paste / CHROME_STORY_END);
  assert.ok(remainingVh > 0 && remainingVh <= 5);
  assert.equal(chromeStageAt(CHROME_STORY_END), 5);
  // Earlier action spacing is unchanged by trimming only the final hold.
  close(
    (travel * CHROME_STAGE_STOPS[2]) / CHROME_STORY_END,
    240 * CHROME_STAGE_STOPS[2],
  );
});

test("invalid progress is safe and out-of-range scrolling clamps to endpoints", () => {
  assert.equal(chromeStageAt(-1), 0);
  assert.equal(chromeStageAt(2), 5);
  for (const p of [NaN, Infinity, -Infinity]) {
    assert.equal(chromeStageAt(p), 0);
    assert.equal(chromeCursorPose(p, targets), null);
  }
});
