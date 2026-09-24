// Run with: node --test scripts/test-talent-search-sequence.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const filename = new URL('../src/hooks/useTalentSearchSequence.ts', import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
function loadHook(react = {}) {
  const module = { exports: {} };
  new Function('require', 'module', 'exports', outputText)(() => react, module, module.exports);
  return module.exports;
}
const { createTalentSearchSequence, advanceTalentSearchSequence, talentSearchSequenceView, TALENT_SEARCH_PHASE_MS } = loadHook();

test('suggestion, typing and count-up stages precede readable results, then cycle', () => {
  let state = createTalentSearchSequence();
  assert.equal(state.phase, 'suggestions');
  for (const [phase, duration, next] of [
    ['suggestions', 1300, 'typing'], ['typing', 900, 'reviewing'], ['reviewing', 1400, 'results'], ['results', 5000, 'suggestions'],
  ]) {
    state = advanceTalentSearchSequence(state, duration - 1, 3);
    assert.equal(state.phase, phase);
    state = advanceTalentSearchSequence(state, 1, 3);
    assert.equal(state.phase, next);
    assert.equal(state.elapsed, 0);
  }
  assert.equal(state.active, 1);
  state = advanceTalentSearchSequence(state, Object.values(TALENT_SEARCH_PHASE_MS).reduce((a, b) => a + b) * 2, 3);
  assert.equal(state.active, 0);
  assert.equal(state.phase, 'suggestions');
});

test('review count rises quickly, stays bounded and reaches the complete total', () => {
  let previous = -1;
  for (let elapsed = 0; elapsed < 1400; elapsed += 20) {
    const view = talentSearchSequenceView({ ...createTalentSearchSequence(), phase: 'reviewing', elapsed }, 195);
    assert.ok(view.reviewed >= previous && view.reviewed <= 195);
    assert.ok(view.progress >= 0 && view.progress < 1);
    previous = view.reviewed;
  }
  assert.ok(talentSearchSequenceView({ ...createTalentSearchSequence(), phase: 'reviewing', elapsed: 700 }, 195).reviewed > 150);
  assert.equal(talentSearchSequenceView({ ...createTalentSearchSequence(), phase: 'reviewing', elapsed: 1300 }, 195).reviewed, 195, 'the total settles on screen before results appear');
  assert.equal(talentSearchSequenceView({ ...createTalentSearchSequence(), phase: 'results' }, 195).reviewed, 195);
});

// Small React lifecycle harness: effects run only when their dependencies change.
// This exercises real hook callbacks and frame cleanup without a DOM dependency.
function harness(t, overrides = {}) {
  const oldWindow = globalThis.window;
  const slots = [];
  const frames = new Map();
  let nextFrame = 0;
  let cursor = 0;
  let pending = [];
  let dirty = false;
  let result;
  let options = { exampleCount: 3, enabled: true, reducedMotion: false, reviewTotal: 195, ...overrides };
  globalThis.window = {
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
  };
  const changed = (a, b) => !a || a.length !== b.length || a.some((value, i) => !Object.is(value, b[i]));
  const { useTalentSearchSequence } = loadHook({
    useState: initial => {
      const i = cursor++;
      if (!slots[i]) slots[i] = { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, next => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; dirty = true; }];
    },
    useRef: initial => {
      const i = cursor++;
      if (!slots[i]) slots[i] = { current: initial };
      return slots[i];
    },
    useCallback: (callback, deps) => {
      const i = cursor++;
      if (!slots[i] || changed(slots[i].deps, deps)) slots[i] = { callback, deps };
      return slots[i].callback;
    },
    useEffect: (effect, deps) => {
      const i = cursor++;
      if (!slots[i] || changed(slots[i].deps, deps)) pending.push(() => {
        slots[i]?.cleanup?.();
        slots[i] = { deps, cleanup: effect() };
      });
    },
  });
  const render = () => {
    do {
      dirty = false;
      cursor = 0;
      result = useTalentSearchSequence(options);
      const effects = pending;
      pending = [];
      effects.forEach(effect => effect());
    } while (dirty);
    return result;
  };
  const unmount = () => slots.forEach(slot => slot?.cleanup?.());
  t.after(() => {
    unmount();
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
  });
  render();
  return {
    frames, unmount, render,
    get value() { return result; },
    options(next) { options = { ...options, ...next }; return render(); },
    frame(time) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(time));
      return render();
    },
    act(callback) { callback(result); return render(); },
  };
}

test('offscreen suspension preserves partial progress and discards hidden elapsed time', t => {
  const run = harness(t);
  run.frame(100);
  run.frame(600);
  const before = run.value.progress;
  const stale = [...run.frames.values()][0];
  run.options({ enabled: false });
  assert.equal(run.frames.size, 0);
  stale(10000);
  run.render();
  assert.equal(run.value.progress, before, 'cancelled callback cannot advance state');
  run.options({ enabled: true });
  run.frame(20000);
  assert.equal(run.value.progress, before);
  run.frame(20400);
  assert.equal(run.value.phase, 'suggestions');
  assert.ok(run.value.progress > before);
  assert.equal(run.frames.size, 1);
});

test('manual selection runs once; Pause freezes it and Resume continues the same stage', t => {
  const run = harness(t);
  run.act(value => value.selectExample(1));
  run.frame(0);
  run.frame(450);
  assert.equal(run.value.phase, 'typing');
  assert.equal(run.value.progress, 0.5);
  run.act(value => value.togglePaused());
  assert.equal(run.value.paused, true);
  assert.equal(run.frames.size, 0);
  run.act(value => value.togglePaused());
  run.frame(10000);
  assert.equal(run.value.progress, 0.5);
  run.frame(10450);
  assert.equal(run.value.phase, 'reviewing');
  run.frame(11850);
  assert.equal(run.value.phase, 'results');
  assert.equal(run.value.reviewed, 195);
  assert.equal(run.value.active, 1);
  assert.equal(run.value.paused, true);
  assert.equal(run.frames.size, 0);
  run.act(value => value.togglePaused());
  run.frame(20000);
  run.frame(25000);
  assert.equal(run.value.active, 2);
  assert.equal(run.value.phase, 'suggestions');
});

test('rapid selections restart the current example without duplicate callbacks, and unmount cancels', t => {
  const run = harness(t);
  run.act(value => value.selectExample(0));
  run.frame(0);
  run.frame(500);
  for (const index of [2, 1, 0, 0]) run.act(value => value.selectExample(index));
  assert.equal(run.value.active, 0);
  assert.equal(run.value.phase, 'typing');
  assert.equal(run.value.progress, 0);
  assert.equal(run.frames.size, 1);
  run.frame(5000);
  assert.equal(run.value.progress, 0);
  const stale = [...run.frames.values()][0];
  run.unmount();
  assert.equal(run.frames.size, 0);
  stale(10000);
  assert.equal(run.frames.size, 0);
});

test('reduced motion shows complete results immediately and manual examples stay instant', t => {
  const run = harness(t, { reducedMotion: true });
  assert.equal(run.value.phase, 'results');
  assert.equal(run.value.reviewed, 195);
  assert.equal(run.frames.size, 0);
  run.act(value => value.selectExample(2));
  assert.equal(run.value.active, 2);
  assert.equal(run.value.phase, 'results');
  assert.equal(run.value.paused, true);
  run.act(value => value.togglePaused());
  assert.equal(run.frames.size, 0);
});

test('enabling reduced motion mid-review completes the selected result and cancels its loop', t => {
  const run = harness(t);
  run.act(value => value.selectExample(1));
  run.frame(0);
  run.frame(1100);
  assert.equal(run.value.phase, 'reviewing');
  run.options({ reducedMotion: true });
  assert.equal(run.value.active, 1);
  assert.equal(run.value.phase, 'results');
  assert.equal(run.value.progress, 1);
  assert.equal(run.frames.size, 0);
});
