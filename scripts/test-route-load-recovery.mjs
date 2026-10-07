import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/routeLoadRecovery.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, fileName: filename.pathname,
});
const CURRENT = "a".repeat(64);
const NEXT = "b".repeat(64);
const IMPORT_ERROR = new TypeError("Failed to fetch dynamically imported module: https://foam.test/NEWFOAMHOME/assets/DataTrust-old.js");
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

function environment({ href = "https://foam.test/NEWFOAMHOME/data-trust?view=detail#permissions", latest = NEXT, storage = new Map(), storageBlocked = false } = {}) {
  const calls = [], replacements = [], timers = new Map();
  let serial = 0;
  const navigator = { onLine: true };
  const window = {
    location: { href, origin: new URL(href).origin, replace: url => replacements.push(url) },
    setTimeout: (callback, delay) => { timers.set(++serial, { callback, delay }); return serial; },
    clearTimeout: id => timers.delete(id),
  };
  Object.defineProperty(window, "sessionStorage", { get() {
    if (storageBlocked) throw new Error("Storage unavailable");
    return { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  } });
  let reply = async () => ({ ok: true, redirected: false, json: async () => ({ version: latest }) });
  const fetch = async (url, options) => { calls.push({ url, options }); return reply(url, options); };
  const module = { exports: {} };
  new Function("module", "exports", "window", "navigator", "fetch", outputText)(module, module.exports, window, navigator, fetch);
  const controller = new AbortController();
  const options = { error: IMPORT_ERROR, target: new URL(href), currentVersion: CURRENT,
    baseUrl: "/NEWFOAMHOME/", enabled: true, signal: controller.signal };
  return { ...module.exports, window, navigator, calls, replacements, timers, storage, controller, options,
    setReply(next) { reply = next; },
    recover(overrides = {}) { return module.exports.recoverRouteLoad({ ...options, ...overrides }); },
  };
}

test("browser JS and Vite CSS load failures are recognized without swallowing unrelated errors", () => {
  const env = environment();
  for (const message of [IMPORT_ERROR.message, "error loading dynamically imported module: /assets/page.js", "Importing a module script failed.", "Unable to preload CSS for /assets/page.css"])
    assert.equal(env.isRouteLoadError(new Error(message)), true, message);
  for (const error of [new Error("Failed to fetch"), new Error("Cannot read properties of undefined"), { status: 404 }, null])
    assert.equal(env.isRouteLoadError(error), false);
});

test("router-relative destination restores the basename once and retains query/hash, independent of the old browser page", () => {
  const env = environment();
  const route = { pathname: "/data-trust", search: "?view=detail&tag=one&tag=two", hash: "#permissions" };
  assert.equal(env.routeRecoveryURL(route, "/NEWFOAMHOME/", "https://foam.test/NEWFOAMHOME/about").href,
    "https://foam.test/NEWFOAMHOME/data-trust?view=detail&tag=one&tag=two#permissions");
  assert.equal(env.routeRecoveryURL(route, "/", "https://foam.test/about").href,
    "https://foam.test/data-trust?view=detail&tag=one&tag=two#permissions");
  assert.equal(env.routeRecoveryURL({ pathname: "/lab/data-trust/source/", search: "?q=%E2%9C%93", hash: "#details" }, "/NEWFOAMHOME/", env.window.location.href).href,
    "https://foam.test/NEWFOAMHOME/lab/data-trust/source/?q=%E2%9C%93#details");
  assert.equal(env.routeRecoveryURL(route, "https://other.test/", env.window.location.href), null);
  assert.equal(env.routeRecoveryURL({ ...route, pathname: "/../outside" }, "/NEWFOAMHOME/", env.window.location.href), null);
  assert.equal(env.routeRecoveryURL({ ...route, pathname: "//other.test/path" }, "/", env.window.location.href), null);
});

test("a newer public release refreshes the requested route once with no-store, preserving existing parameters/hash", async () => {
  const env = environment();
  const target = env.routeRecoveryURL({ pathname: "/data-trust", search: "?view=detail", hash: "#permissions" }, "/NEWFOAMHOME/", env.window.location.href);
  assert.equal(await env.recover({ target }), "reloading");
  const request = env.calls[0];
  assert.equal(new URL(request.url).pathname, "/NEWFOAMHOME/website-version.json");
  assert.ok(new URL(request.url).searchParams.has("t"));
  assert.equal(request.options.cache, "no-store");
  assert.equal(request.options.redirect, "error");
  assert.equal(request.options.credentials, "same-origin");
  assert.equal(env.replacements[0], `https://foam.test/NEWFOAMHOME/data-trust?view=detail&foam-update=${NEXT}#permissions`);
  assert.equal(env.timers.size, 0);
  assert.equal(await env.recover(), "already-tried");
  assert.equal(env.replacements.length, 1);
});

test("concurrent failures can trigger only one navigation", async () => {
  const env = environment();
  await Promise.all([env.recover(), env.recover()]);
  assert.equal(env.replacements.length, 1);
});

test("CSS and direct-load failures use the same recovery as other lazy routes", async () => {
  for (const pathname of ["data-trust/", "live-study", "home-film-preview"]) {
    const env = environment({ href: `https://foam.test/NEWFOAMHOME/${pathname}?keep=1#anchor` });
    assert.equal(await env.recover({ error: new Error("Unable to preload CSS for /assets/stale.css") }), "reloading");
    const destination = new URL(env.replacements[0]);
    assert.equal(destination.pathname, `/NEWFOAMHOME/${pathname}`);
    assert.equal(destination.searchParams.get("keep"), "1");
    assert.equal(destination.hash, "#anchor");
  }
});

test("same or invalid releases and failed/redirected probes never reload", async () => {
  for (const reply of [
    async () => ({ ok: true, json: async () => ({ version: CURRENT }) }),
    async () => ({ ok: true, json: async () => ({ version: "invalid" }) }),
    async () => ({ ok: true, json: async () => null }),
    async () => ({ ok: false, status: 404 }),
    async () => ({ ok: true, redirected: true }),
    async () => { throw new TypeError("Failed to fetch"); },
    async () => ({ ok: true, json: async () => { throw new SyntaxError("HTML instead of JSON"); } }),
  ]) {
    const env = environment(); env.setReply(reply);
    assert.ok(["unchanged", "unavailable"].includes(await env.recover()));
    assert.equal(env.replacements.length, 0);
    assert.equal(env.timers.size, 0);
  }
});

test("offline, private/development, runtime errors and invalid versions make no probe", async () => {
  const offline = environment(); offline.navigator.onLine = false;
  assert.equal(await offline.recover(), "offline");
  assert.equal(offline.calls.length, 0);
  for (const options of [{ enabled: false }, { error: new Error("Render failed") }, { currentVersion: undefined }, { currentVersion: "bad" }, { target: null }, { target: new URL("https://other.test/page") }]) {
    const env = environment();
    assert.equal(await env.recover(options), "not-applicable");
    assert.equal(env.calls.length, 0);
    assert.equal(env.replacements.length, 0);
  }
});

test("the attempted version token prevents propagation loops even with blocked storage", async () => {
  const env = environment({ href: `https://foam.test/NEWFOAMHOME/data-trust?foam-update=${NEXT}#detail`, storageBlocked: true });
  assert.equal(await env.recover(), "already-tried");
  assert.equal(env.replacements.length, 0);
  const first = environment({ storageBlocked: true });
  assert.equal(await first.recover(), "reloading");
  const reloaded = environment({ href: first.replacements[0], storageBlocked: true });
  assert.equal(await reloaded.recover(), "already-tried");
  assert.equal(reloaded.replacements.length, 0);
});

test("session guard also stops the same release after a different route drops the query token", async () => {
  const storage = new Map();
  const first = environment({ storage });
  assert.equal(await first.recover(), "reloading");
  const later = environment({ storage, href: "https://foam.test/NEWFOAMHOME/live-study" });
  assert.equal(await later.recover(), "already-tried");
  assert.equal(later.replacements.length, 0);
});

test("aborted checks never consume the attempt or navigate, including StrictMode remount", async () => {
  const env = environment();
  let resolve;
  env.setReply(() => new Promise(done => { resolve = done; }));
  const checking = env.recover(); await flush();
  env.controller.abort();
  resolve({ ok: true, json: async () => ({ version: NEXT }) });
  assert.equal(await checking, "cancelled");
  assert.equal(env.storage.size, 0);
  assert.equal(env.replacements.length, 0);
  env.setReply(async () => ({ ok: true, json: async () => ({ version: NEXT }) }));
  assert.equal(await env.recover({ signal: new AbortController().signal }), "reloading");
});

test("navigating away or going offline during the probe cannot redirect the new page", async () => {
  for (const change of [env => { env.window.location.href = "https://foam.test/NEWFOAMHOME/about"; }, env => { env.navigator.onLine = false; }]) {
    const env = environment(); let resolve;
    env.setReply(() => new Promise(done => { resolve = done; }));
    const checking = env.recover(); await flush(); change(env);
    resolve({ ok: true, json: async () => ({ version: NEXT }) });
    assert.ok(["cancelled", "offline"].includes(await checking));
    assert.equal(env.replacements.length, 0);
    assert.equal(env.storage.size, 0);
  }
});

test("a hanging probe is aborted after five seconds and leaves manual retry available", async () => {
  const env = environment();
  env.setReply((_, options) => new Promise((_, reject) => options.signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true })));
  const checking = env.recover(); await flush();
  const timer = [...env.timers.values()][0]; assert.equal(timer.delay, 5000); timer.callback();
  assert.equal(await checking, "unavailable");
  assert.equal(env.replacements.length, 0);
  assert.equal(env.timers.size, 0);
});
