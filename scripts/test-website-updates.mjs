// Run with: node --test scripts/test-website-updates.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const CURRENT = "1111111111111111";
const NEXT = "2222222222222222";
const filename = new URL("../src/lib/websiteUpdates.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8").replaceAll("import.meta.env", "__ENV__"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename.pathname,
});
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

class Events {
  listeners = new Map();
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  emit(type, target = this) { for (const callback of this.listeners.get(type) || []) callback({ type, target }); }
  count() { return [...this.listeners.values()].reduce((total, group) => total + group.size, 0); }
}

class Element {
  isConnected = true;
  hidden = false;
  shown = true;
  attributes = {};
  style = { display: "block", visibility: "visible", opacity: "1" };
  constructor(kind, parent = null) { this.kind = kind; this.parent = parent; }
  closest(selector) {
    for (let node = this; node; node = node.parent) {
      if (selector === "form" && node.kind === "form") return node;
      if (selector.includes(node.kind) && ["input", "textarea", "select"].includes(node.kind)) return node;
      if (selector.includes("contenteditable") && node.kind === "editable") return node;
    }
    return null;
  }
  contains(target) { for (let node = target; node; node = node.parent) if (node === this) return true; return false; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  getClientRects() { return this.shown ? [{}] : []; }
}

function environment({ production = true, privateLab = false, current = CURRENT, latest = NEXT, href = "https://example.test/NEWFOAMHOME/kit-story/?view=preview#chapter", storage = new Map(), storageBlocked = false, initialNow = 0, readyState = "complete" } = {}) {
  let now = initialNow;
  let serial = 0;
  const timers = new Map();
  const calls = [];
  const replacements = [];
  const scrolls = [];
  const navigator = { onLine: true };
  const document = new Events();
  document.visibilityState = "visible";
  document.hidden = false;
  document.readyState = readyState;
  document.activeElement = new Element("body");
  const media = [];
  const dialogs = [];
  document.querySelectorAll = (selector) => selector === "audio, video" ? media : dialogs;
  const window = new Events();
  window.location = { href, replace: (url) => replacements.push(url) };
  window.scrollX = 0;
  window.scrollY = 0;
  window.scrollTo = (position) => { scrolls.push(position); window.scrollX = position.left; window.scrollY = position.top; };
  Object.defineProperty(window, "sessionStorage", { get: () => {
    if (storageBlocked) throw new Error("Storage blocked");
    return { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
  } });
  window.getComputedStyle = (element) => element.style;
  window.setTimeout = (callback, delay = 0) => { const id = ++serial; timers.set(id, { callback, at: now + delay }); return id; };
  window.clearTimeout = (id) => timers.delete(id);
  window.setInterval = (callback, every) => { const id = ++serial; timers.set(id, { callback, at: now + every, every }); return id; };
  window.clearInterval = window.clearTimeout;
  window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(now), 16);
  window.cancelAnimationFrame = window.clearTimeout;
  let reply = async () => ({ ok: true, json: async () => ({ version: latest }) });
  const fetch = async (url, options) => { calls.push({ url, options }); return reply(url, options); };
  const module = { exports: {} };
  new Function("module", "exports", "window", "document", "navigator", "fetch", "Date", "Element", "__ENV__", outputText)(
    module, module.exports, window, document, navigator, fetch, { now: () => now }, Element,
    { PROD: production, VITE_PRIVATE_LAB: privateLab ? "true" : "false", VITE_WEBSITE_VERSION: current, BASE_URL: "/NEWFOAMHOME/" },
  );
  return {
    ...module.exports, window, document, navigator, calls, replacements, timers, media, dialogs, storage, scrolls,
    setReply(next) { reply = next; },
    async advance(milliseconds) {
      await flush();
      const target = now + milliseconds;
      let steps = 0;
      while (true) {
        const next = [...timers.entries()].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        assert.ok(++steps < 1000, "timer loop must stay bounded");
        const [id, timer] = next;
        now = timer.at;
        if (timer.every) timer.at += timer.every;
        else timers.delete(id);
        timer.callback();
        await flush();
      }
      now = target;
      await flush();
    },
  };
}

test("unchanged versions poll every minute with no-store and a fresh timestamp", async () => {
  const env = environment({ latest: CURRENT });
  const stop = env.registerWebsiteUpdates();
  await env.advance(120000);
  assert.equal(env.calls.length, 3);
  assert.equal(env.calls[0].options.cache, "no-store");
  assert.equal(new URL(env.calls[0].url).pathname, "/NEWFOAMHOME/website-version.json");
  assert.deepEqual(env.calls.map(({ url }) => new URL(url).searchParams.get("t")), ["0", "60000", "120000"]);
  assert.equal(env.replacements.length, 0);
  stop();
});

test("a changed version refreshes after15 idle seconds preserving route, parameters and hash", async () => {
  const env = environment();
  const stop = env.registerWebsiteUpdates();
  await env.advance(14999);
  assert.equal(env.replacements.length, 0);
  await env.advance(1);
  assert.equal(env.replacements.length, 1);
  const url = new URL(env.replacements[0]);
  assert.equal(url.pathname, "/NEWFOAMHOME/kit-story/");
  assert.equal(url.searchParams.get("view"), "preview");
  assert.equal(url.searchParams.get("foam-update"), NEXT);
  assert.equal(url.hash, "#chapter");
  stop();
});

test("user activity restarts the quiet period", async () => {
  const env = environment();
  const stop = env.registerWebsiteUpdates();
  await env.advance(14000);
  env.window.emit("pointerdown");
  await env.advance(14999);
  assert.equal(env.replacements.length, 0);
  await env.advance(1);
  assert.equal(env.replacements.length, 1);
  stop();
});

test("malformed, unavailable and offline version responses never refresh", async () => {
  for (const reply of [
    async () => ({ ok: true, json: async () => ({ version: "not-a-version" }) }),
    async () => ({ ok: true, json: async () => ({ version: "a".repeat(15) }) }),
    async () => ({ ok: true, json: async () => ({ version: "a".repeat(65) }) }),
    async () => ({ ok: true, json: async () => null }),
    async () => ({ ok: false }),
    async () => { throw new Error("offline"); },
  ]) {
    const env = environment();
    env.setReply(reply);
    const stop = env.registerWebsiteUpdates();
    await env.advance(120000);
    assert.equal(env.replacements.length, 0);
    stop();
  }
});

test("playing media defers refresh until it stops", async () => {
  const env = environment();
  const video = { paused: false, ended: false };
  env.media.push(video);
  const stop = env.registerWebsiteUpdates();
  await env.advance(90000);
  assert.equal(env.replacements.length, 0);
  video.paused = true;
  await env.advance(5000);
  assert.equal(env.replacements.length, 1);
  stop();
});

test("a decorative muted looping video without controls does not block updates forever", async () => {
  const env = environment();
  env.media.push({ tagName: "VIDEO", paused: false, ended: false, muted: true, loop: true, controls: false, hasAttribute: () => false });
  const stop = env.registerWebsiteUpdates();
  await env.advance(15000);
  assert.equal(env.replacements.length, 1);
  stop();
});

test("audio and meaningful video playback still defer updates, including opted-in custom players", async () => {
  for (const override of [
    { tagName: "AUDIO" },
    { controls: true },
    { muted: false },
    { loop: false },
    { hasAttribute: (name) => name === "data-block-site-update" },
  ]) {
    const env = environment();
    const media = { tagName: "VIDEO", paused: false, ended: false, muted: true, loop: true, controls: false, hasAttribute: () => false, ...override };
    env.media.push(media);
    const stop = env.registerWebsiteUpdates();
    await env.advance(20000);
    assert.equal(env.replacements.length, 0);
    media.paused = true;
    await env.advance(5000);
    assert.equal(env.replacements.length, 1);
    stop();
  }
});

test("form and editable focus block refresh even without dirty input", async () => {
  for (const control of [new Element("input", new Element("form")), new Element("textarea"), new Element("editable")]) {
    const env = environment();
    env.document.activeElement = control;
    const stop = env.registerWebsiteUpdates();
    await env.advance(20000);
    assert.equal(env.replacements.length, 0);
    env.document.activeElement = new Element("body");
    await env.advance(5000);
    assert.equal(env.replacements.length, 1);
    stop();
  }
});

test("dirty form data remains protected after blur until submit or reset", async () => {
  for (const completed of ["submit", "reset"]) {
    const env = environment();
    const form = new Element("form");
    const control = new Element("input", form);
    const stop = env.registerWebsiteUpdates();
    env.document.emit("input", control);
    await env.advance(20000);
    assert.equal(env.replacements.length, 0);
    env.document.emit(completed, form);
    await env.advance(14999);
    assert.equal(env.replacements.length, 0);
    await env.advance(1);
    assert.equal(env.replacements.length, 1);
    stop();
  }
});

test("dirty controls removed during navigation stop blocking the update", async () => {
  const env = environment();
  const control = new Element("editable");
  const stop = env.registerWebsiteUpdates();
  env.document.emit("change", control);
  await env.advance(20000);
  assert.equal(env.replacements.length, 0);
  control.isConnected = false;
  await env.advance(5000);
  assert.equal(env.replacements.length, 1);
  stop();
});

test("open dialogs defer refreshing until closed or hidden", async () => {
  const env = environment();
  const dialog = new Element("dialog");
  env.dialogs.push(dialog);
  const stop = env.registerWebsiteUpdates();
  await env.advance(20000);
  assert.equal(env.replacements.length, 0);
  dialog.attributes["aria-hidden"] = "true";
  await env.advance(5000);
  assert.equal(env.replacements.length, 1);
  stop();
});

test("hidden tabs neither check nor refresh and get an idle grace period when revisited", async () => {
  const env = environment();
  env.document.hidden = true;
  env.document.visibilityState = "hidden";
  const stop = env.registerWebsiteUpdates();
  await env.advance(120000);
  assert.equal(env.calls.length, 0);
  env.document.hidden = false;
  env.document.visibilityState = "visible";
  env.document.emit("visibilitychange");
  await env.advance(14999);
  assert.equal(env.calls.length, 1);
  assert.equal(env.replacements.length, 0);
  await env.advance(1);
  assert.equal(env.replacements.length, 1);
  stop();
});

test("focus and visibility checks are throttled and cannot duplicate an in-flight request", async () => {
  const env = environment({ latest: CURRENT });
  let resolve;
  env.setReply(() => new Promise((done) => { resolve = done; }));
  const stop = env.registerWebsiteUpdates();
  env.window.emit("focus");
  env.document.emit("visibilitychange");
  await env.advance(11000);
  env.window.emit("focus");
  assert.equal(env.calls.length, 1);
  resolve({ ok: true, json: async () => ({ version: CURRENT }) });
  await flush();
  env.setReply(async () => ({ ok: true, json: async () => ({ version: CURRENT }) }));
  env.window.emit("focus");
  await flush();
  assert.equal(env.calls.length, 2);
  env.document.emit("visibilitychange");
  env.window.emit("focus");
  assert.equal(env.calls.length, 2);
  stop();
});

test("losing connectivity after discovery defers a refresh until online and idle", async () => {
  const env = environment();
  const stop = env.registerWebsiteUpdates();
  await env.advance(5000);
  env.navigator.onLine = false;
  await env.advance(30000);
  assert.equal(env.replacements.length, 0);
  env.navigator.onLine = true;
  env.window.emit("focus");
  await env.advance(15000);
  assert.equal(env.replacements.length, 1);
  stop();
});

test("development, private Lab and missing build versions do not register checks", async () => {
  for (const options of [{ production: false }, { privateLab: true }, { current: undefined }, { current: "invalid" }]) {
    const env = environment(options.current === undefined && "current" in options ? { current: "" } : options);
    const stop = env.registerWebsiteUpdates();
    await env.advance(120000);
    assert.equal(env.calls.length, 0);
    assert.equal(env.timers.size, 0);
    stop();
  }
});

test("repeated registration deduplicates and cleanup aborts requests, timers and listeners", async () => {
  const env = environment();
  let resolve;
  env.setReply(() => new Promise((done) => { resolve = done; }));
  const stop = env.registerWebsiteUpdates();
  assert.equal(env.registerWebsiteUpdates(), stop);
  assert.equal(env.calls.length, 1);
  stop();
  assert.equal(env.calls[0].options.signal.aborted, true);
  assert.equal(env.window.count(), 0);
  assert.equal(env.document.count(), 0);
  assert.equal(env.timers.size, 0);
  resolve({ ok: true, json: async () => ({ version: NEXT }) });
  await env.advance(120000);
  assert.equal(env.replacements.length, 0);
  assert.equal(env.timers.size, 0);
});

test("a previously attempted token cannot cause a refresh loop", async () => {
  const env = environment({ href: `https://example.test/NEWFOAMHOME/?foam-update=${NEXT}#chapter` });
  const stop = env.registerWebsiteUpdates();
  await env.advance(120000);
  assert.equal(env.replacements.length, 0);
  stop();
});

test("a stalled version request times out and later polling can recover", async () => {
  const env = environment({ latest: CURRENT });
  env.setReply((url, options) => new Promise((resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("timeout")), { once: true })));
  const stop = env.registerWebsiteUpdates();
  await env.advance(10000);
  assert.equal(env.calls[0].options.signal.aborted, true);
  env.setReply(async () => ({ ok: true, json: async () => ({ version: CURRENT }) }));
  await env.advance(50000);
  assert.equal(env.calls.length, 2);
  assert.equal(env.replacements.length, 0);
  stop();
});

test("an automatic refresh hands off reading position and restores it once after rendering", async () => {
  const original = environment();
  original.window.scrollX = 24;
  original.window.scrollY = 8320;
  const stopOriginal = original.registerWebsiteUpdates();
  await original.advance(15000);
  const destination = original.replacements[0];
  assert.equal(original.storage.size, 1);
  stopOriginal();

  const refreshed = environment({ href: destination, current: NEXT, latest: NEXT, storage: original.storage, initialNow: 15000, readyState: "loading" });
  const stop = refreshed.registerWebsiteUpdates();
  await refreshed.advance(32);
  assert.equal(refreshed.scrolls.length, 0);
  refreshed.document.readyState = "interactive";
  refreshed.document.emit("DOMContentLoaded");
  await refreshed.advance(31);
  assert.equal(refreshed.scrolls.length, 0);
  await refreshed.advance(1);
  assert.deepEqual(refreshed.scrolls, [{ left: 24, top: 8320, behavior: "instant" }]);
  assert.equal(refreshed.storage.size, 0);
  refreshed.window.emit("load");
  refreshed.restoreWebsiteUpdateScroll();
  await refreshed.advance(32);
  assert.equal(refreshed.scrolls.length, 1);
  stop();
});

test("a saved position is discarded for a different URL, version token or expired handoff", async () => {
  const url = `https://example.test/NEWFOAMHOME/?foam-update=${NEXT}#chapter`;
  for (const override of [
    { url: url.replace("#chapter", "#different") },
    { version: CURRENT },
    { at: -400000 },
    { x: -1 },
    { y: 10000001 },
  ]) {
    const storage = new Map([["foam:website-update-scroll:v1", JSON.stringify({ url, version: NEXT, at: 0, x: 0, y: 2000, ...override })]]);
    const env = environment({ href: url, current: NEXT, latest: NEXT, storage });
    const stop = env.registerWebsiteUpdates();
    await env.advance(32);
    assert.equal(env.scrolls.length, 0);
    assert.equal(storage.size, 0);
    stop();
  }
});

test("manual interaction or anchor navigation cancels a pending position restoration", async () => {
  const url = `https://example.test/NEWFOAMHOME/?foam-update=${NEXT}#chapter`;
  for (const event of ["pointerdown", "hashchange"]) {
    const storage = new Map([["foam:website-update-scroll:v1", JSON.stringify({ url, version: NEXT, at: 0, x: 0, y: 2000 })]]);
    const env = environment({ href: url, current: NEXT, latest: NEXT, storage });
    const stop = env.registerWebsiteUpdates();
    if (event === "hashchange") env.window.location.href = url.replace("#chapter", "#different");
    env.window.emit(event);
    await env.advance(32);
    assert.equal(env.scrolls.length, 0);
    assert.equal(storage.size, 0);
    stop();
  }
});

test("blocked session storage cannot break update checks or refreshing", async () => {
  const env = environment({ storageBlocked: true });
  const stop = env.registerWebsiteUpdates();
  await env.advance(15000);
  assert.equal(env.replacements.length, 1);
  assert.equal(env.scrolls.length, 0);
  stop();
});
