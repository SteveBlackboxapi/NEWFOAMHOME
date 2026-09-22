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
  chromeEntryScale,
  chromeSendoffAt,
  chromePlanePose,
} = module.exports;

const targets = {
  reply: { x: 170, y: 400 },
  toolbar: { x: 820, y: 45 },
  talent: { x: 770, y: 190 },
  copy: { x: 740, y: 430 },
  caret: { x: 65, y: 245 },
  send: { x: 150, y: 510 },
};
const flightGeometry = { start: targets.send, width: 1000, height: 700 };
const close = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test("desktop grows from 70% to full size before the pinned workflow starts", () => {
  for (const height of [640, 720, 1080]) {
    close(chromeEntryScale(height, height), 0.7);
    close(chromeEntryScale(height * 0.65, height), 0.7);
    close(chromeEntryScale(height * 0.325, height), 0.85);
    close(chromeEntryScale(0, height), 1);
    close(chromeEntryScale(-height, height), 1);
    const positions = [0.7, 0.5, 0.3, 0.1, 0, -0.1].map(
      (ratio) => ratio * height,
    );
    const forward = positions.map((top) => chromeEntryScale(top, height));
    assert.deepEqual(
      positions
        .toReversed()
        .map((top) => chromeEntryScale(top, height))
        .toReversed(),
      forward,
    );
    assert.ok(
      forward.every((scale, index) => !index || scale >= forward[index - 1]),
    );
  }
  assert.equal(chromeEntryScale(NaN, 720), 1);
  assert.equal(chromeEntryScale(100, 0), 1);
});

test("reply is visibly closed before the toolbar opens the roster", () => {
  assert.equal(chromeStageAt(0.1399), 0);
  assert.equal(chromeStageAt(0.14), 1);
  assert.equal(chromeStageAt(0.25), 1);
  assert.equal(chromeStageAt(0.3199), 1);
  assert.equal(chromeStageAt(0.32), 2);
});

test("every action clicks its measured target before the next UI state appears", () => {
  ["reply", "toolbar", "talent", "copy", "caret", "send"].forEach(
    (target, index) => {
      const stop = CHROME_STAGE_STOPS[index + 1];
      const pose = chromeCursorPose(stop - 0.01, targets);
      assert.ok(pose);
      close(pose.x, targets[target].x);
      close(pose.y, targets[target].y);
      close(pose.press, 1);
      assert.equal(chromeStageAt(stop - 0.01), index);
      assert.equal(chromeStageAt(stop), index + 1);
    },
  );
});

test("ring travels continuously through the workflow and from the pasted reply to Send", () => {
  for (const [start, end, from, to] of [
    [0.14, 0.3, "reply", "toolbar"],
    [0.32, 0.47, "toolbar", "talent"],
    [0.49, 0.64, "talent", "copy"],
    [0.66, 0.86, "copy", "caret"],
    [0.88, 1, "caret", "send"],
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
  const points = Array.from({ length: 139 }, (_, index) => index / 100);
  const sample = (p) => [
    chromeStageAt(p),
    chromeCursorPose(p, targets),
    chromeSendoffAt(p),
    chromePlanePose(p, flightGeometry),
  ];
  const forward = points.map(sample);
  const backward = points.toReversed().map(sample).toReversed();
  assert.deepEqual(backward, forward);
  for (const index of [76, 94, 101, 108, 124, 138])
    assert.deepEqual(sample(index / 100), forward[index]);
});

test("resize measurements retarget the motion rather than using fixed pixel coordinates", () => {
  const offset = { x: 25, y: -12 };
  const moved = Object.fromEntries(
    Object.entries(targets).map(([key, point]) => [
      key,
      { x: point.x + offset.x, y: point.y + offset.y },
    ]),
  );
  for (const p of [0.075, 0.23, 0.41, 0.58, 0.77, 0.94, 1.01]) {
    const old = chromeCursorPose(p, targets);
    const next = chromeCursorPose(p, moved);
    close(next.x - old.x, offset.x);
    close(next.y - old.y, offset.y);
  }
});

test("missing measurements never invent a cursor position", () => {
  assert.equal(chromeCursorPose(0.25, {}), null);
  assert.equal(chromeCursorPose(0.25, { reply: targets.reply }), null);
  assert.equal(chromeCursorPose(0.94, { caret: targets.caret }), null);
});

test("the cursor reaches Send, clicks, then fades as the message is sent", () => {
  const paste = chromeCursorPose(0.88, targets);
  close(paste.x, targets.caret.x);
  close(paste.y, targets.caret.y);
  close(paste.opacity, 1);
  for (const p of [1, 1.01, 1.015]) {
    const pose = chromeCursorPose(p, targets);
    close(pose.x, targets.send.x);
    close(pose.y, targets.send.y);
    assert.equal(chromeStageAt(p), 5);
  }
  close(chromeCursorPose(1.01, targets).press, 1);
  close(chromeCursorPose(1.015, targets).opacity, 0.5);
  for (const p of [1.02, CHROME_STORY_END, 5])
    assert.equal(chromeCursorPose(p, targets), null);
  assert.equal(chromeStageAt(1.02), 6);
});

test("Send and its flight add a compact ending without slowing the original paste workflow", () => {
  const paste = CHROME_STAGE_STOPS[5];
  const send = CHROME_STAGE_STOPS[6];
  const travel = CHROME_STORY_HEIGHT_VH - 100;
  const throughPasteVh = (travel * paste) / CHROME_STORY_END;
  const pasteToSendVh = (travel * (send - paste)) / CHROME_STORY_END;
  const flightAndFinaleVh = travel * (1 - send / CHROME_STORY_END);
  assert.ok(throughPasteVh >= 136 && throughPasteVh <= 138);
  assert.ok(pasteToSendVh > 0 && pasteToSendVh < 23);
  assert.ok(flightAndFinaleVh > 0 && flightAndFinaleVh < 57);
  assert.equal(CHROME_STORY_END, 1.38);
  assert.equal(CHROME_STORY_HEIGHT_VH, 315);
  assert.equal(chromeStageAt(CHROME_STORY_END), 6);
});

test("every increment through Send produces visible travel, a click or a fade", () => {
  // A 0.001 increment is about one pixel of scrolling at a 640px viewport.
  // Regressing to the old between-action holds creates dozens of identical poses.
  let previous = chromeCursorPose(0.001, targets);
  for (let step = 2; step < 1020; step++) {
    const current = chromeCursorPose(step / 1000, targets);
    assert.ok(current && previous);
    const change =
      Math.hypot(current.x - previous.x, current.y - previous.y) +
      Math.abs(current.press - previous.press) +
      Math.abs(current.opacity - previous.opacity);
    assert.ok(change > 1e-8, `Idle interval at progress ${step / 1000}`);
    previous = current;
  }
});

test("the next movement begins immediately after each state change", () => {
  for (const stop of CHROME_STAGE_STOPS.slice(1, -1)) {
    const atClick = chromeCursorPose(stop, targets);
    const next = chromeCursorPose(stop + 0.005, targets);
    assert.ok(Math.hypot(next.x - atClick.x, next.y - atClick.y) > 0.01);
  }
});

test("invalid progress is safe and out-of-range scrolling clamps to endpoints", () => {
  assert.equal(chromeStageAt(-1), 0);
  assert.equal(chromeStageAt(2), 6);
  for (const p of [NaN, Infinity, -Infinity]) {
    assert.equal(chromeStageAt(p), 0);
    assert.equal(chromeCursorPose(p, targets), null);
  }
});

test("send-off preserves the desktop until Send and only enables the fully revealed finale", () => {
  const initial = {
    desktopOpacity: 1,
    finaleOpacity: 0,
    finaleOffset: 18,
    finaleInteractive: false,
  };
  for (const p of [-1, 0, 0.88, 1.01, 1.02, 1.045])
    assert.deepEqual(chromeSendoffAt(p), initial);

  const leaving = chromeSendoffAt(1.1);
  assert.ok(leaving.desktopOpacity > 0 && leaving.desktopOpacity < 1);
  assert.equal(leaving.finaleOpacity, 0);
  const arriving = chromeSendoffAt(1.2);
  close(arriving.desktopOpacity, 0);
  close(arriving.finaleOpacity, 0.5);
  close(arriving.finaleOffset, 9);
  assert.equal(arriving.finaleInteractive, false);
  for (const p of [1.3, CHROME_STORY_END, 2]) {
    assert.deepEqual(chromeSendoffAt(p), {
      desktopOpacity: 0,
      finaleOpacity: 1,
      finaleOffset: 0,
      finaleInteractive: true,
    });
  }
  for (const p of [NaN, Infinity, -Infinity])
    assert.deepEqual(chromeSendoffAt(p), initial);
});

test("the plane launches from measured Send geometry only after the message is sent", () => {
  for (const p of [-1, 0, 0.88, 1, 1.01, 1.02])
    assert.equal(chromePlanePose(p, flightGeometry), null);
  for (const geometry of [
    flightGeometry,
    { start: { x: 410, y: 660 }, width: 1440, height: 900 },
  ]) {
    const launch = chromePlanePose(1.02 + 1e-8, geometry);
    assert.ok(launch);
    close(launch.x, geometry.start.x, 0.001);
    close(launch.y, geometry.start.y, 0.001);
    close(launch.scale, 0.22, 0.001);
    assert.ok(launch.opacity >= 0 && launch.opacity < 0.001);
    const flying = chromePlanePose(1.15, geometry);
    assert.ok(flying.x > launch.x);
    assert.ok(flying.y < launch.y);
    assert.ok(flying.scale > launch.scale);
    close(flying.opacity, 1);
  }
});

test("the plane exits the viewport before it fades away and the pin releases", () => {
  for (const [width, height] of [
    [800, 600],
    [1440, 900],
    [2560, 1440],
  ]) {
    const geometry = {
      start: { x: width * 0.25, y: height * 0.7 },
      width,
      height,
    };
    const pose = chromePlanePose(1.34, geometry);
    assert.ok(pose);
    assert.ok(pose.x - pose.width / 2 > width);
    assert.ok(pose.y + pose.width / 2 < 0);
    assert.ok(pose.width >= 128 && pose.width <= 240);
    close(pose.scale, 1);
    close(pose.opacity, 0.5);
    for (const p of [1.36, CHROME_STORY_END, 2])
      assert.equal(chromePlanePose(p, geometry), null);
  }
});

test("invalid plane geometry and progress never produce a guessed flight", () => {
  for (const geometry of [
    null,
    { ...flightGeometry, width: 0 },
    { ...flightGeometry, height: -1 },
    { ...flightGeometry, width: Infinity },
    { ...flightGeometry, height: NaN },
    { ...flightGeometry, start: { x: NaN, y: 100 } },
    { ...flightGeometry, start: { x: 100, y: Infinity } },
  ])
    assert.equal(chromePlanePose(1.15, geometry), null);
  for (const p of [NaN, Infinity, -Infinity])
    assert.equal(chromePlanePose(p, flightGeometry), null);
});
