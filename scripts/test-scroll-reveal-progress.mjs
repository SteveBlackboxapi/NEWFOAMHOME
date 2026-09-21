// Run with: node --test scripts/test-scroll-reveal-progress.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/hooks/useScrollRevealProgress.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
function loadHook(react = {}) {
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    () => react, module, module.exports,
  );
  return module.exports;
}
const { scrollRevealProgress } = loadHook();

test("mobile counts begin before first visible pixel across viewport heights", () => {
  for (const viewportHeight of [480, 720, 960, 1400]) {
    const layout = { sectionTop: 2400, viewportHeight, documentHeight: 8000 };
    const start = layout.sectionTop - viewportHeight - 70;
    const entry = layout.sectionTop - viewportHeight;
    const finish = layout.sectionTop - viewportHeight * 0.38;
    assert.equal(scrollRevealProgress({ ...layout, scrollY: start }), 0);
    assert.ok(scrollRevealProgress({ ...layout, scrollY: entry }) > 0);
    assert.equal(scrollRevealProgress({ ...layout, scrollY: finish }), 1);
    let previous = -1;
    for (let i = 0; i <= 100; i++) {
      const current = scrollRevealProgress({ ...layout, scrollY: start + (finish - start) * i / 100 });
      assert.ok(current > previous, "count must keep moving through the entire scroll interval");
      previous = current;
    }
    const checkpoints = [start - 100, start, entry, (entry + finish) / 2, finish, finish + 100];
    const expected = new Map(checkpoints.map((scrollY) => [scrollY, scrollRevealProgress({ ...layout, scrollY })]));
    for (const scrollY of checkpoints.reverse())
      assert.equal(scrollRevealProgress({ ...layout, scrollY }), expected.get(scrollY));
  }
});

test("document-end and initially visible sections have complete or nonzero restored state", () => {
  assert.equal(scrollRevealProgress({ sectionTop: 1100, scrollY: 600, viewportHeight: 800, documentHeight: 1400 }), 1);
  assert.equal(scrollRevealProgress({ sectionTop: 100, scrollY: 0, viewportHeight: 800, documentHeight: 800 }), 1);
  assert.ok(scrollRevealProgress({ sectionTop: 700, scrollY: 0, viewportHeight: 800, documentHeight: 2000 }) > 0);
});

function harness(t, reducedMotion = false) {
  const previous = { window: globalThis.window, document: globalThis.document, ResizeObserver: globalThis.ResizeObserver };
  const listeners = new Map();
  const frames = new Map();
  let frameId = 0;
  let value = 0;
  let layoutEffect;
  let observed = false;
  let disconnected = false;
  const documentElement = { scrollHeight: 5000 };
  globalThis.document = { documentElement };
  globalThis.window = {
    innerHeight: 800, scrollY: 1700,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name, callback) => { if (listeners.get(name) === callback) listeners.delete(name); },
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  globalThis.ResizeObserver = class {
    observe(element) { observed = element === documentElement; }
    disconnect() { disconnected = true; }
  };
  t.after(() => {
    for (const [name, original] of Object.entries(previous)) {
      if (original === undefined) delete globalThis[name];
      else globalThis[name] = original;
    }
  });
  const { useScrollRevealProgress } = loadHook({
    useRef: () => ({ current: null }),
    useState: () => [value, (next) => { value = typeof next === "function" ? next(value) : next; }],
    useLayoutEffect: (effect) => { layoutEffect = effect; },
    useEffect: () => assert.fail("restored scroll must be measured before paint"),
  });
  const result = useScrollRevealProgress(reducedMotion);
  result.ref.current = { getBoundingClientRect: () => ({ top: 2400 - window.scrollY }) };
  const cleanup = layoutEffect();
  return { result, cleanup, listeners, frames, value: () => value, observed: () => observed, disconnected: () => disconnected };
}

test("hook measures restored scroll before paint, coalesces events and rewinds without a timer", (t) => {
  const run = harness(t);
  assert.ok(run.value() > 0, "restored visible section cannot paint at zero");
  assert.ok(run.observed());
  const restored = run.value();
  window.scrollY = 1800;
  run.listeners.get("scroll")();
  run.listeners.get("resize")();
  run.listeners.get("pageshow")();
  assert.equal(run.frames.size, 1);
  assert.equal(run.value(), restored, "no time-based progress between measurements");
  const flush = () => {
    const callbacks = [...run.frames.values()];
    run.frames.clear();
    callbacks.forEach((callback) => callback());
  };
  flush();
  assert.ok(run.value() > restored);
  window.scrollY = 1700;
  run.listeners.get("scroll")();
  flush();
  assert.equal(run.value(), restored);
  run.listeners.get("scroll")();
  run.cleanup();
  assert.equal(run.frames.size, 0);
  assert.equal(run.listeners.size, 0);
  assert.ok(run.disconnected());
});

test("reduced motion returns the full result without scroll observers", (t) => {
  const run = harness(t, true);
  assert.equal(run.result.progress, 1);
  assert.equal(run.cleanup, undefined);
  assert.equal(run.listeners.size, 0);
  assert.equal(run.frames.size, 0);
  assert.equal(run.observed(), false);
});
