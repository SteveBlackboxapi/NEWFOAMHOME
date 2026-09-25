// Run with: node --test scripts/test-kit-asset-warmup.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/hooks/useKitAssetWarmup.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  fileName: filename.pathname,
});

function environment() {
  const images = [];
  const events = [];
  const browser = { setTimeout, clearTimeout, innerWidth: 1280, devicePixelRatio: 2 };
  class Image {
    naturalWidth = 768;
    async decode() {}
    set sizes(value) { this.sizeHint = value; events.push(["sizes", value]); }
    set srcset(value) { this.candidates = value; events.push(["srcset", value]); }
    set src(value) { this.url = value; images.push(this); events.push(["src", value]); }
    removeAttribute(name) {
      if (name === "src") this.cancelled = true;
      if (name === "srcset") this.candidates = undefined;
    }
    async load() { await this.onload?.(); }
    fail() { this.onerror?.(); }
  }
  const module = { exports: {} };
  new Function("module", "exports", "require", "window", "Image", outputText)(
    module, module.exports, () => ({}), browser, Image,
  );
  return { ...module.exports, images, events, browser };
}

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

test("queue deduplicates requests, uses low priority and starts only two concurrently", async () => {
  const env = environment();
  const controller = new AbortController();
  const done = env.warmImageQueue(["a.webp", "b.webp", "a.webp", "c.webp"], controller.signal);
  assert.deepEqual(env.images.map((image) => image.url), ["a.webp", "b.webp"]);
  assert.equal(env.images[0].fetchPriority, "low");
  assert.equal(env.images[0].decoding, "async");
  await env.images[0].load();
  await flush();
  assert.deepEqual(env.images.map((image) => image.url), ["a.webp", "b.webp", "c.webp"]);
  await env.images[1].load();
  await env.images[2].load();
  await done;
  await env.warmImageQueue(["a.webp", "c.webp"], controller.signal);
  assert.equal(env.images.length, 3, "completed URLs remain deduplicated across route visits");
});

test("a failed asset does not stall the remaining images and can be retried", async () => {
  const env = environment();
  const controller = new AbortController();
  const done = env.warmImageQueue(["bad.webp", "b.webp", "c.webp"], controller.signal);
  env.images[0].fail();
  await flush();
  assert.equal(env.images.length, 3);
  await env.images[1].load();
  await env.images[2].load();
  await done;
  const retry = env.warmImageQueue(["bad.webp"], controller.signal);
  assert.equal(env.images.length, 4);
  await env.images[3].load();
  await retry;
});

test("unmount aborts in-flight warm-ups and never starts queued images", async () => {
  const env = environment();
  const controller = new AbortController();
  const done = env.warmImageQueue(["a.webp", "b.webp", "c.webp"], controller.signal);
  controller.abort();
  await done;
  assert.equal(env.images.length, 2);
  assert.ok(env.images.every((image) => image.cancelled && !image.onload && !image.onerror));
});

test("load and decode must settle before the next request uses that slot", async () => {
  const env = environment();
  const controller = new AbortController();
  const done = env.warmImageQueue(["a.webp", "b.webp", "c.webp"], controller.signal);
  let decoded;
  env.images[0].decode = () => new Promise((resolve) => { decoded = resolve; });
  const first = env.images[0].load();
  await flush();
  assert.equal(env.images.length, 2);
  decoded();
  await first;
  await flush();
  assert.equal(env.images.length, 3);
  await env.images[1].load();
  await env.images[2].load();
  await done;
});

test("responsive sizes and candidates are set before fallback src without a separate original request", async () => {
  const env = environment();
  const controller = new AbortController();
  const request = { src: "original.webp", srcSet: "small.webp 256w, medium.webp 480w, original.webp 1000w", sizes: "130px" };
  const done = env.warmImageQueue([request, { ...request }], controller.signal);
  assert.equal(env.images.length, 1);
  assert.deepEqual(env.events, [["sizes", "130px"], ["srcset", request.srcSet], ["src", "original.webp"]]);
  await env.images[0].load();
  await done;
});

test("the same image with another size or viewport gets its own responsive selection", async () => {
  const env = environment();
  const controller = new AbortController();
  const request = { src: "original.webp", srcSet: "small.webp 256w, original.webp 1000w", sizes: "48px" };
  let done = env.warmImageQueue([request, { ...request, sizes: "130px" }], controller.signal);
  assert.equal(env.images.length, 2);
  await env.images[0].load();
  await env.images[1].load();
  await done;
  env.browser.innerWidth = 390;
  done = env.warmImageQueue([request], controller.signal);
  assert.equal(env.images.length, 3);
  await env.images[2].load();
  await done;
});

test("aborting a responsive warm-up clears both candidate and fallback sources", async () => {
  const env = environment();
  const controller = new AbortController();
  const done = env.warmImageQueue([{ src: "original.webp", srcSet: "small.webp 256w, original.webp 1000w", sizes: "130px" }], controller.signal);
  controller.abort();
  await done;
  assert.equal(env.images[0].cancelled, true);
  assert.equal(env.images[0].candidates, undefined);
});
