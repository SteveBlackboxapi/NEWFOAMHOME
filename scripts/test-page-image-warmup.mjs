// Run with: node --test scripts/test-page-image-warmup.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/pageImageWarmup.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: filename.pathname,
});
const base = "https://foam.test/NEWFOAMHOME/about/";
const assets = "/NEWFOAMHOME/media/release/assets";

function photo(name, options = {}) {
  const attrs = { src: `${assets}/${name}.webp`, ...options.attrs };
  return {
    parentElement: options.parent || null,
    complete: options.complete || false,
    naturalWidth: options.complete ? 400 : 0,
    style: options.style || {},
    matches: () => options.pendingReveal || false,
    getAttribute: (name) => attrs[name] ?? null,
    getClientRects: () => options.noBox ? [] : [{}],
    getBoundingClientRect: () => ({ width: options.width ?? 400, height: options.height ?? 500 }),
    closest: () => options.excluded ? {} : null,
  };
}

function environment(images = [], options = {}) {
  const queued = [];
  const idle = new Map();
  const window = new EventTarget();
  Object.assign(window, {
    getComputedStyle: (element) => element.style,
    setTimeout: (fn) => { idle.set(idle.size + 1, fn); return idle.size; },
    clearTimeout: (id) => idle.delete(id),
  });
  if (!options.noIdle) Object.assign(window, {
    requestIdleCallback: (fn) => { idle.set(idle.size + 1, fn); return idle.size; },
    cancelIdleCallback: (id) => idle.delete(id),
  });
  const main = { querySelectorAll: (selector) => {
    assert.equal(selector, 'img[loading="lazy"]');
    return images;
  } };
  const document = new EventTarget();
  Object.assign(document, {
    visibilityState: options.hidden ? "hidden" : "visible",
    readyState: options.loading ? "loading" : "complete",
    baseURI: base,
    getElementById: (id) => id === "main-content" ? main : null,
  });
  const navigator = { onLine: true, connection: Object.assign(new EventTarget(), { effectiveType: "4g", saveData: false }) };
  const module = { exports: {} };
  new Function("module", "exports", "require", "window", "document", "navigator", outputText)(
    module, module.exports, () => ({ warmImageQueue: async (requests, signal) => { queued.push({ requests, signal }); } }),
    window, document, navigator,
  );
  return {
    ...module.exports, main, queued, idle, window, document, navigator,
    runIdle() { for (const [id, fn] of idle) { idle.delete(id); fn(); } },
  };
}

const flush = async () => { for (let i = 0; i < 4; i++) await Promise.resolve(); };

test("only public marketing routes opt in, including trailing slash URLs", () => {
  const env = environment();
  for (const path of ["/", "/about/", "/managers", "/features", "/updates", "/creators", "/brands", "/demo"]) {
    assert.equal(env.isPublicImageWarmupRoute(path), true, path);
  }
  for (const path of ["/lab/talent", "/lab/inspo", "/kit-story", "/chrome-story", "/home-film-preview", "/unknown"]) {
    assert.equal(env.isPublicImageWarmupRoute(path), false, path);
  }
});

test("bounded selection skips hidden clones, loaded images, pictures, downloads and non-photo sources", () => {
  const env = environment([
    photo("no-box", { noBox: true }), photo("zero-width", { width: 0 }),
    photo("hidden", { style: { visibility: "hidden" } }),
    photo("hidden-parent", { parent: { style: { display: "none" }, parentElement: null } }),
    photo("transparent-parent", { parent: { style: { opacity: "0" }, parentElement: null, matches: () => false } }),
    photo("excluded-picture-or-download", { excluded: true }), photo("already-loaded", { complete: true }),
    photo("remote", { attrs: { src: "https://elsewhere.test/photo.webp" } }),
    photo("private", { attrs: { src: "/lab/media/photo.webp" } }),
    photo("prefix", { attrs: { src: `${assets}-private/photo.webp` } }),
    photo("traversal", { attrs: { src: `${assets}/../private/photo.webp` } }),
    photo("vector", { attrs: { src: `${assets}/icon.svg` } }),
    photo("video", { attrs: { src: `${assets}/movie.mp4` } }),
    photo("blob", { attrs: { src: "blob:https://foam.test/photo" } }),
    photo("one"), photo("one"),
    ...Array.from({ length: 20 }, (_, index) => photo(`lower-${index}`)),
  ]);
  const selected = env.collectPageImageWarmup(env.main, assets, base);
  assert.equal(selected.length, 12);
  assert.deepEqual(selected.map(({ src }) => src.split("/").at(-1)), ["one.webp", ...Array.from({ length: 11 }, (_, i) => `lower-${i}.webp`)]);
});

test("pending marketing image and scroll reveals can warm before their decode fade", () => {
  const env = environment([
    photo("loading-photo", { style: { opacity: "0" }, pendingReveal: true }),
    photo("scroll-reveal", { parent: { style: { opacity: "0" }, parentElement: null, matches: () => true } }),
    photo("hidden-loading-photo", { style: { opacity: "0", display: "none" }, pendingReveal: true }),
  ]);
  assert.deepEqual(env.collectPageImageWarmup(env.main, assets, base).map(({ src }) => src.split("/").at(-1)), ["loading-photo.webp", "scroll-reveal.webp"]);
});

test("native responsive candidates and sizes stay together with no additional original-only request", () => {
  const srcset = `${assets}/small.webp 256w, ${assets}/medium.webp 768w, ${assets}/original.webp 1600w`;
  const sizes = "(max-width: 700px) 45vw, 280px";
  const env = environment([photo("original", { attrs: { srcset, sizes } }), photo("original", { attrs: { srcset, sizes } })]);
  assert.deepEqual(env.collectPageImageWarmup(env.main, assets, base), [{
    src: `https://foam.test${assets}/original.webp`, srcSet: srcset, sizes,
  }]);
});

test("a small avatar does not suppress the same photo's larger native card candidate", () => {
  const srcset = `${assets}/small.webp 96w, ${assets}/large.webp 768w`;
  const env = environment([
    photo("portrait", { attrs: { srcset, sizes: "48px" } }),
    photo("portrait", { attrs: { srcset, sizes: "400px" } }),
    photo("portrait", { attrs: { srcset, sizes: "400px" } }),
  ]);
  assert.deepEqual(env.collectPageImageWarmup(env.main, assets, base).map(({ sizes }) => sizes), ["48px", "400px"]);
});

test("unsafe or unsupported responsive selection is skipped instead of warming its fallback", () => {
  const env = environment([
    photo("external-candidate", { attrs: { srcset: `${assets}/small.webp 1x, https://remote.test/photo.webp 2x` } }),
    photo("private-candidate", { attrs: { srcset: "/lab/media/photo.webp 1x" } }),
    photo("data-candidate", { attrs: { srcset: "data:image/png;base64,abcd 1x" } }),
    photo("invalid-descriptor", { attrs: { srcset: `${assets}/small.webp invalid` } }),
    photo("auto-layout", { attrs: { sizes: "auto, 100vw", srcset: `${assets}/small.webp 400w` } }),
    photo("safe"),
  ]);
  assert.deepEqual(env.collectPageImageWarmup(env.main, assets, base), [{ src: `https://foam.test${assets}/safe.webp` }]);
  assert.deepEqual(env.collectPageImageWarmup(env.main, "https://other.test/assets", base), []);
});

test("data saving, slow connections, offline and hidden pages never warm", () => {
  const env = environment();
  assert.equal(env.canWarmPageImages(true, "visible", undefined), true);
  assert.equal(env.canWarmPageImages(true, "visible", { effectiveType: "3g" }), true);
  for (const [online, visibility, connection] of [
    [false, "visible", {}], [true, "hidden", {}], [true, "visible", { saveData: true }],
    [true, "visible", { effectiveType: "2g" }], [true, "visible", { effectiveType: "slow-2g" }],
  ]) assert.equal(env.canWarmPageImages(online, visibility, connection), false);
  const hidden = environment([photo("one")], { hidden: true });
  let waited = false;
  hidden.startPageImageWarmup(assets, async () => { waited = true; });
  assert.equal(waited, false);
  assert.equal(hidden.idle.size, 0);
});

test("starts only after page load, media-cache readiness and idle", async () => {
  const env = environment([photo("lower")], { loading: true });
  let ready;
  let waits = 0;
  const stop = env.startPageImageWarmup(assets, () => { waits++; return new Promise((resolve) => { ready = resolve; }); });
  assert.equal(waits, 0);
  assert.equal(env.queued.length, 0);
  env.window.dispatchEvent(new Event("load"));
  assert.equal(waits, 1);
  assert.equal(env.idle.size, 0);
  ready();
  await flush();
  assert.equal(env.queued.length, 0);
  env.runIdle();
  assert.equal(env.queued.length, 1);
  assert.equal(env.queued[0].requests[0].src, `https://foam.test${assets}/lower.webp`);
  stop();
});

test("route cleanup cancels waiting cache work and scheduled idle work", async () => {
  for (const stage of ["load", "cache", "idle"]) {
    const env = environment([photo("previous-route")], { loading: stage === "load" });
    let ready;
    const stop = env.startPageImageWarmup(assets, () => new Promise((resolve) => { ready = resolve; }));
    if (stage === "idle") { ready(); await flush(); assert.equal(env.idle.size, 1); }
    stop();
    env.window.dispatchEvent(new Event("load"));
    ready?.();
    await flush();
    env.runIdle();
    assert.equal(env.queued.length, 0, stage);
  }
});

test("route changes, hidden tabs, offline, and data-saving changes abort active queue", async () => {
  for (const event of ["route", "hidden", "offline", "save-data"]) {
    const env = environment([photo("in-flight")]);
    const stop = env.startPageImageWarmup(assets, async () => {});
    await flush();
    env.runIdle();
    assert.equal(env.queued[0].signal.aborted, false);
    if (event === "route") stop();
    if (event === "hidden") { env.document.visibilityState = "hidden"; env.document.dispatchEvent(new Event("visibilitychange")); }
    if (event === "offline") env.window.dispatchEvent(new Event("offline"));
    if (event === "save-data") { env.navigator.connection.saveData = true; env.navigator.connection.dispatchEvent(new Event("change")); }
    assert.equal(env.queued[0].signal.aborted, true, event);
    stop();
  }
});

test("browsers without idle callbacks still defer and can cancel the fallback", async () => {
  const env = environment([photo("lower")], { noIdle: true });
  const stop = env.startPageImageWarmup(assets, async () => {});
  await flush();
  assert.equal(env.idle.size, 1);
  assert.equal(env.queued.length, 0);
  stop();
  env.runIdle();
  assert.equal(env.queued.length, 0);
});
