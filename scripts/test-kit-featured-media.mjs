// Run with: node --test scripts/test-kit-featured-media.mjs
// Image event/decoding lifecycle only; visual fades still need browser checks.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/kitFeaturedMedia.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: filename.pathname,
});
const module = { exports: {} };
new Function("module", "exports", outputText)(module, module.exports);
const { observeKitImage } = module.exports;

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function imageStub({ complete = false, naturalWidth = 0, decode } = {}) {
  const events = new Map();
  return {
    complete,
    naturalWidth,
    decode,
    addEventListener(type, listener) {
      if (!events.has(type)) events.set(type, new Set());
      events.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      events.get(type)?.delete(listener);
    },
    emit(type) {
      for (const listener of events.get(type) ?? []) listener();
    },
    listenerCount() {
      return [...events.values()].reduce((sum, set) => sum + set.size, 0);
    },
  };
}

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

test("photo and overlay wait for both the load event and decode", async () => {
  const decoded = deferred();
  let decodeCalls = 0;
  const image = imageStub({
    decode: () => {
      decodeCalls++;
      return decoded.promise;
    },
  });
  const statuses = [];
  observeKitImage(image, (status) => statuses.push(status));
  assert.deepEqual(statuses, ["loading"]);
  assert.equal(decodeCalls, 0);
  image.naturalWidth = 1080;
  image.emit("load");
  image.emit("load");
  assert.equal(
    decodeCalls,
    1,
    "duplicate load events must not restart decoding",
  );
  assert.deepEqual(statuses, ["loading"]);
  decoded.resolve();
  await flush();
  assert.deepEqual(statuses, ["loading", "ready"]);
});

test("cached complete images resolve without another load event", async () => {
  const image = imageStub({
    complete: true,
    naturalWidth: 1080,
    decode: () => Promise.resolve(),
  });
  const statuses = [];
  observeKitImage(image, (status) => statuses.push(status));
  await flush();
  assert.deepEqual(statuses, ["loading", "ready"]);
});

test("browsers without decode still show successfully loaded photos", () => {
  const image = imageStub();
  const statuses = [];
  observeKitImage(image, (status) => statuses.push(status));
  image.naturalWidth = 1080;
  image.emit("load");
  assert.deepEqual(statuses, ["loading", "ready"]);
});

test("decode rejection preserves drawable photos and rejects broken ones", async () => {
  const drawable = imageStub({
    complete: true,
    naturalWidth: 1080,
    decode: () => Promise.reject(new Error("decode not supported")),
  });
  const drawableStatuses = [];
  observeKitImage(drawable, (status) => drawableStatuses.push(status));
  await flush();
  assert.deepEqual(drawableStatuses, ["loading", "ready"]);

  const broken = imageStub({ complete: true, naturalWidth: 0 });
  const brokenStatuses = [];
  observeKitImage(broken, (status) => brokenStatuses.push(status));
  assert.deepEqual(brokenStatuses, ["loading", "error"]);
});

test("network errors finish loading and late decode cannot reveal an errored image", async () => {
  const decoded = deferred();
  const image = imageStub({
    naturalWidth: 1080,
    decode: () => decoded.promise,
  });
  const statuses = [];
  observeKitImage(image, (status) => statuses.push(status));
  image.emit("load");
  image.emit("error");
  decoded.resolve();
  await flush();
  assert.deepEqual(statuses, ["loading", "error"]);
});

test("cleanup removes event handlers and ignores stale decode after source change or unmount", async () => {
  const decoded = deferred();
  const image = imageStub({
    complete: true,
    naturalWidth: 1080,
    decode: () => decoded.promise,
  });
  const statuses = [];
  const cleanup = observeKitImage(image, (status) => statuses.push(status));
  assert.equal(image.listenerCount(), 2);
  cleanup();
  assert.equal(image.listenerCount(), 0);
  image.emit("error");
  decoded.resolve();
  await flush();
  assert.deepEqual(statuses, ["loading"]);
});
