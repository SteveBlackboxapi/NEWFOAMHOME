// Run with: node --test scripts/test-media-cache.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../public/foam-media-sw.js", import.meta.url), "utf8");
const scope = "https://example.test/NEWFOAMHOME/";

function environment({ revision = "abc123", network, denyStorage = false } = {}) {
  const handlers = new Map();
  const stores = new Map();
  const requests = [];
  let claimed = false;
  const caches = {
    async open(name) {
      if (denyStorage) throw new Error("Storage disabled");
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async match(request) { return store.get(request.url)?.clone(); },
        async put(request, response) { store.set(request.url, response.clone()); },
        async keys() { return [...store.keys()].map((url) => ({ url })); },
        async delete(request) { return store.delete(request.url); },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
  vm.runInNewContext(source, {
    URL,
    Request,
    Promise,
    caches,
    fetch: async (request) => {
      requests.push(request);
      return network ? network(request) : new Response("image bytes", { headers: { "content-type": "image/webp" } });
    },
    self: {
      location: { href: `${scope}foam-media-sw.js?v=${revision}` },
      registration: { scope },
      clients: { async claim() { claimed = true; } },
      async skipWaiting() {},
      addEventListener(name, handler) { handlers.set(name, handler); },
    },
  });
  return {
    stores,
    requests,
    get claimed() { return claimed; },
    async activate() {
      const jobs = [];
      handlers.get("activate")({ waitUntil: (job) => jobs.push(job) });
      await Promise.all(jobs);
    },
    async request(path = "photo.webp", options = {}) {
      const jobs = [];
      let response;
      const request = {
        url: options.url || `${scope}media/${revision}/assets/${path}`,
        method: options.method || "GET",
        destination: options.destination || "image",
        headers: new Headers(options.headers),
      };
      handlers.get("fetch")({ request, waitUntil: (job) => jobs.push(job), respondWith: (result) => { response = result; } });
      const result = await response;
      await Promise.all(jobs);
      return result;
    },
  };
}

test("current revision images are cached once and served without another fetch", async () => {
  const env = environment();
  assert.equal(await (await env.request()).text(), "image bytes");
  assert.equal(await (await env.request()).text(), "image bytes");
  assert.equal(env.requests.length, 1);
});

test("HTML, app code, API, media, ranges, cross-origin and malformed paths bypass worker", async () => {
  const env = environment();
  const cases = [
    ["index.html", { destination: "document" }],
    ["app.js", { destination: "script" }],
    ["movie.mp4", { destination: "video" }],
    ["song.m4a", { destination: "audio" }],
    ["animation.gif", { destination: "image" }],
    ["photo.webp", { headers: { range: "bytes=0-100" } }],
    ["photo.webp", { method: "POST" }],
    ["photo.webp", { destination: "empty" }],
    ["photo.webp", { url: "https://other.test/NEWFOAMHOME/media/abc123/assets/photo.webp" }],
    ["photo.webp", { url: `${scope}media/old%20123/assets/photo.webp` }],
    ["photo.webp", { url: `${scope}media/old123/assets/a%2fb.webp` }],
    ["photo.webp", { url: `${scope}media/old123/assets/a%5cb.webp` }],
    ["photo.webp", { url: `${scope}media/old123/assets/a%00.webp` }],
    ["photo.webp", { url: `${scope}media/old123/assets//b.webp` }],
    ["photo.webp", { url: `${scope}media/old123/assets/../b.webp` }],
    ["photo.webp", { url: `${scope}assets/photo.webp` }],
    ["photo.webp", { url: `${scope}api/photo.webp` }],
  ];
  for (const [path, options] of cases) assert.equal(await env.request(path, options), undefined);
  assert.equal(env.requests.length, 0);
  assert.equal(env.stores.size, 0);
});

test("versioned fonts are cacheable but HTML returned for an image is never stored", async () => {
  const font = environment({ network: () => new Response("font bytes", { headers: { "content-type": "font/woff2" } }) });
  await font.request("founders.woff2", { destination: "font" });
  await font.request("founders.woff2", { destination: "font" });
  assert.equal(font.requests.length, 1);

  const html = environment({ network: () => new Response("not an image", { headers: { "content-type": "text/html" } }) });
  await html.request();
  await html.request();
  assert.equal(html.requests.length, 2);
  assert.equal(html.stores.size, 0);
});

test("cache storage failure still returns the network image", async () => {
  const env = environment({ denyStorage: true });
  assert.equal(await (await env.request()).text(), "image bytes");
  await env.activate();
  assert.equal(env.claimed, true);
});

test("activation keeps current plus most recent previous cache without deleting another site's data", async () => {
  const env = environment();
  const oldest = "foam-media-v1:/NEWFOAMHOME/:oldest123";
  const previous = "foam-media-v1:/NEWFOAMHOME/:old123";
  const current = "foam-media-v1:/NEWFOAMHOME/:abc123";
  const unrelated = "foam-media-v1:/OTHER/:old123";
  [oldest, previous, current, unrelated, "user-data"].forEach((name) => env.stores.set(name, new Map()));
  await env.activate();
  assert.equal(env.stores.has(oldest), false);
  assert.equal(env.stores.has(previous), true);
  assert.equal(env.stores.has(current), true);
  assert.equal(env.stores.has(unrelated), true);
  assert.equal(env.stores.has("user-data"), true);
  assert.equal(env.claimed, true);
});

test("an already open page keeps using its previous revision's cached image", async () => {
  const env = environment();
  const url = `${scope}media/old123/assets/photo.webp`;
  env.stores.set("foam-media-v1:/NEWFOAMHOME/:old123", new Map([[url, new Response("previous image", { headers: { "content-type": "image/webp" } })]]));
  await env.activate();
  assert.equal(await (await env.request("photo.webp", { url })).text(), "previous image");
  assert.equal(env.requests.length, 0);
});

test("a missing older image recovers from the current original without poisoning its old cache key", async () => {
  const env = environment({ network: (request) => request.url.includes("/old123/")
    ? new Response("not found", { status: 404 })
    : new Response("updated image", { headers: { "content-type": "image/webp" } }) });
  const url = `${scope}media/old123/assets/talent/nia/portrait.webp`;
  assert.equal(await (await env.request("", { url })).text(), "updated image");
  assert.deepEqual(env.requests.map((request) => request.url), [url, `${scope}media/abc123/assets/talent/nia/portrait.webp`]);
  assert.equal(env.stores.size, 0);
});

test("a missing older responsive variant resolves to the original's current revision path", async () => {
  const env = environment({ network: (request) => request.url.includes("/old123/")
    ? new Response("not found", { status: 404 })
    : new Response("current original", { headers: { "content-type": "image/webp" } }) });
  const url = `${scope}media/old123/assets/responsive/aabbccdd0123/256/talent/nia/portrait.webp.webp`;
  assert.equal(await (await env.request("", { url })).text(), "current original");
  assert.equal(env.requests[1].url, `${scope}media/abc123/assets/talent/nia/portrait.webp`);
  assert.equal(env.stores.size, 0);
});

test("only older 404s recover; errors, current 404s and invalid variants never redirect", async () => {
  for (const status of [403, 500]) {
    const env = environment({ network: () => new Response("unavailable", { status }) });
    assert.equal((await env.request("photo.webp", { url: `${scope}media/old123/assets/photo.webp` })).status, status);
    assert.equal(env.requests.length, 1);
  }
  for (const url of [
    `${scope}media/abc123/assets/photo.webp`,
    `${scope}media/old123/assets/responsive/badhash/256/portrait.webp.webp`,
    `${scope}media/old123/assets/responsive/aabbccdd/0/portrait.webp.webp`,
    `${scope}media/old123/assets/responsive/aabbccdd/256/file.html.webp`,
  ]) {
    const env = environment({ network: () => new Response("missing", { status: 404 }) });
    assert.equal((await env.request("", { url })).status, 404);
    assert.equal(env.requests.length, 1);
  }
});

test("failed recovery returns the older response and is never cached", async () => {
  for (const replacement of [
    () => new Response("not an image", { headers: { "content-type": "text/html" } }),
    () => new Response("unavailable", { status: 500 }),
    () => { throw new Error("offline"); },
  ]) {
    const env = environment({ network: (request) => request.url.includes("/old123/") ? new Response("original missing", { status: 404 }) : replacement() });
    const response = await env.request("", { url: `${scope}media/old123/assets/photo.webp` });
    assert.equal(response.status, 404);
    assert.equal(await response.text(), "original missing");
    assert.equal(env.stores.size, 0);
  }
});

test("successful older requests remain cacheable without creating more than two revision caches", async () => {
  const env = environment();
  await env.activate();
  for (const old of ["old111", "old222", "old333"]) await env.request("", { url: `${scope}media/${old}/assets/photo.webp` });
  assert.equal(env.stores.size, 2);
  assert.equal(env.stores.has("foam-media-v1:/NEWFOAMHOME/:abc123"), true);
  assert.equal(env.stores.has("foam-media-v1:/NEWFOAMHOME/:old333"), true);
});

test("parallel requests cannot grow the cache beyond 180 entries", async () => {
  const env = environment();
  await Promise.all(Array.from({ length: 184 }, (_, i) => env.request(`${i}.webp`)));
  const store = [...env.stores.values()][0];
  assert.equal(store.size, 180);
  assert.equal(store.has(`${scope}media/abc123/assets/0.webp`), false);
  assert.equal(store.has(`${scope}media/abc123/assets/183.webp`), true);
});

test("old video and song404s recover from the current file without using CacheStorage", async () => {
  for (const [path, destination, type] of [
    ["video-previews-v2/review.mp4", "video", "video/mp4"],
    ["music/feed-the-feed.m4a", "audio", "audio/mp4"],
  ]) {
    const env = environment({ network: (request) => request.url.includes("/old123/")
      ? new Response("missing", { status: 404 })
      : new Response("playback bytes", { headers: { "content-type": type } }) });
    const url = `${scope}media/old123/assets/${path}`;
    const result = await env.request("", { url, destination });
    assert.equal(await result.text(), "playback bytes");
    assert.deepEqual(env.requests.map((request) => request.url), [url, `${scope}media/abc123/assets/${path}`]);
    assert.equal(env.stores.size, 0);
  }
});

test("old video range recovery preserves Range and returns the current206 uncached", async () => {
  const env = environment({ network: (request) => request.url.includes("/old123/")
    ? new Response("missing", { status: 404 })
    : new Response("partial video", { status: 206, headers: { "content-type": "video/webm", "content-range": "bytes 100-199/1000" } }) });
  const result = await env.request("", { url: `${scope}media/old123/assets/review.webm`, destination: "video", headers: { range: "bytes=100-199" } });
  assert.equal(result.status, 206);
  assert.equal(env.requests[0].headers.get("range"), "bytes=100-199");
  assert.equal(env.requests[1].headers.get("range"), "bytes=100-199");
  assert.equal(result.headers.get("content-range"), "bytes 100-199/1000");
  assert.equal(env.stores.size, 0);
});

test("a seek outside the replacement's length preserves a valid416 response", async () => {
  const env = environment({ network: (request) => request.url.includes("/old123/")
    ? new Response("missing", { status: 404 })
    : new Response("outside range", { status: 416, headers: { "content-range": "bytes */80" } }) });
  const result = await env.request("", { url: `${scope}media/old123/assets/song.mp3`, destination: "audio", headers: { range: "bytes=100-199" } });
  assert.equal(result.status, 416);
  assert.equal(env.stores.size, 0);
});

test("old playback is not retried for successful or non404 responses", async () => {
  for (const status of [200, 206, 403, 500]) {
    const env = environment({ network: () => new Response("original playback response", { status, headers: { "content-type": "audio/ogg" } }) });
    const result = await env.request("", { url: `${scope}media/old123/assets/song.ogg`, destination: "audio" });
    assert.equal(result.status, status);
    assert.equal(env.requests.length, 1);
    assert.equal(env.stores.size, 0);
  }
});

test("current playback and invalid or out-of-scope old playback bypass the worker", async () => {
  const env = environment();
  for (const options of [
    { url: `${scope}media/abc123/assets/video.mp4`, destination: "video", headers: { range: "bytes=0-99" } },
    { url: `${scope}media/old123/assets/file.json`, destination: "video" },
    { url: `${scope}media/old123/assets/song.m4a`, destination: "empty" },
    { url: `${scope}media/old123/assets/../song.m4a`, destination: "audio" },
    { url: `${scope}media/old123/assets/a%2fb.mp4`, destination: "video" },
    { url: "https://other.test/NEWFOAMHOME/media/old123/assets/video.mp4", destination: "video" },
  ]) assert.equal(await env.request("", options), undefined);
  assert.equal(env.requests.length, 0);
  assert.equal(env.stores.size, 0);
});

test("invalid playback recovery never replaces the original404 or writes a cache", async () => {
  for (const replacement of [
    () => new Response("HTML fallback", { headers: { "content-type": "text/html" } }),
    () => new Response("unavailable", { status: 500, headers: { "content-type": "video/mp4" } }),
    () => { throw new Error("offline"); },
  ]) {
    const env = environment({ network: (request) => request.url.includes("/old123/") ? new Response("original404", { status: 404 }) : replacement() });
    const result = await env.request("", { url: `${scope}media/old123/assets/video.mp4`, destination: "video" });
    assert.equal(result.status, 404);
    assert.equal(await result.text(), "original404");
    assert.equal(env.stores.size, 0);
  }
});
