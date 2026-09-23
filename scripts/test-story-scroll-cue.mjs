import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function fixture() {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const listeners = new Map();
  const changes = [];
  const effects = [];
  const window = {
    scrollY: 0,
    setTimeout(callback, delay) {
      const id = ++nextId;
      timers.set(id, { at: now + delay, callback });
      return id;
    },
    addEventListener(name, callback) {
      listeners.set(name, callback);
    },
    removeEventListener(name) {
      listeners.delete(name);
    },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(
      new URL("../src/components/StoryScrollControls.tsx", import.meta.url),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2020,
      },
    },
  );
  const module = { exports: {} };
  const require = (name) => {
    if (name === "react")
      return {
        useState: (value) => [value, (next) => changes.push([now, next])],
        useEffect: (effect) => effects.push(effect),
      };
    if (name === "react/jsx-runtime")
      return { jsx: () => null, jsxs: () => null };
    return {};
  };
  new Function(
    "require",
    "module",
    "exports",
    "window",
    "clearTimeout",
    outputText,
  )(require, module, module.exports, window, (id) => timers.delete(id));
  module.exports.StoryScrollCue();
  const cleanup = effects[0]();
  return {
    changes,
    timers,
    cleanup,
    scroll(y) {
      window.scrollY = y;
      listeners.get("scroll")?.();
    },
    advance(until) {
      while (true) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
        if (!next || next[1].at > until) break;
        timers.delete(next[0]);
        now = next[1].at;
        next[1].callback();
      }
      now = until;
    },
  };
}

test("the original invitation returns after 6.5 seconds, then repeats 3 on / 7 off", () => {
  const f = fixture();
  f.advance(31100);
  assert.deepEqual(f.changes, [
    [0, true],
    [4600, false],
    [11100, true],
    [14100, false],
    [21100, true],
    [24100, false],
    [31100, true],
  ]);
  f.cleanup();
});

test("scrolling cancels every future invitation, including after returning to the top", () => {
  const f = fixture();
  f.advance(12000);
  f.scroll(30);
  f.scroll(0);
  f.advance(60000);
  assert.deepEqual(f.changes.at(-1), [12000, false]);
  assert.equal(f.timers.size, 0);
  f.cleanup();
});

test("leaving the page cancels the pending timer", () => {
  const f = fixture();
  f.advance(5000);
  f.cleanup();
  f.advance(60000);
  assert.deepEqual(f.changes, [
    [0, true],
    [4600, false],
  ]);
  assert.equal(f.timers.size, 0);
});
