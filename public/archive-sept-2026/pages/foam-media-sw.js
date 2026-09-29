/* Only immutable, revision-addressed image/font assets belong in this cache. */
const workerURL = new URL(self.location.href);
const scopeURL = new URL(self.registration.scope);
const revision = workerURL.searchParams.get("v") || "";
const revisionPattern = /^[a-zA-Z0-9_-]{1,80}$/;
const validRevision = revisionPattern.test(revision);
const cachePrefix = `foam-media-v1:${scopeURL.pathname}:`;
const cacheName = `${cachePrefix}${revision}`;
const mediaPath = `${scopeURL.pathname}media/`;
const maxEntries = 180;
let pendingWrites = Promise.resolve();

function scopedAssetRequest(request) {
  if (!validRevision || request.method !== "GET") return null;
  const url = new URL(request.url);
  if (url.origin !== scopeURL.origin || !url.pathname.startsWith(mediaPath)) return null;
  const parts = url.pathname.slice(mediaPath.length).split("/");
  const requestedRevision = parts.shift();
  if (!revisionPattern.test(requestedRevision || "") || parts.shift() !== "assets") return null;
  let path;
  try { path = decodeURIComponent(parts.join("/")); } catch { return null; }
  // Refuse traversal, encoded separators and control characters before building a fallback URL.
  if (/%(?:2f|5c)/i.test(parts.join("/")) || !path || /[\\\u0000-\u001f\u007f]/.test(path) || path.split("/").some((part) => !part || part === "." || part === "..")) return null;
  return { revision: requestedRevision, path, cache: `${cachePrefix}${requestedRevision}` };
}

function cacheEligible(request, media) {
  if (request.headers.has("range")) return false;
  if (request.destination === "image") return /\.(?:avif|webp|png|jpe?g|svg|ico)$/i.test(media.path);
  if (request.destination === "font") return /\.(?:woff2?|ttf|otf)$/i.test(media.path);
  return false;
}

function oldPlaybackRequest(request, media) {
  return media.revision !== revision &&
    (request.destination === "audio" || request.destination === "video") &&
    /\.(?:mp4|webm|m4a|mp3|ogg|wav)$/i.test(media.path);
}

async function pruneRevisionCaches() {
  const names = (await caches.keys()).filter((name) => name.startsWith(cachePrefix) && revisionPattern.test(name.slice(cachePrefix.length)));
  // CacheStorage lists caches in creation order. Keep the current version and
  // one previous cache for pages that were already open during publication.
  const older = names.filter((name) => name !== cacheName);
  const previous = older[older.length - 1];
  await Promise.all(names.filter((name) => name !== cacheName && name !== previous).map((name) => caches.delete(name)));
}

function currentAssetURL(path) {
  const url = new URL(`${mediaPath}${revision}/assets/${path.split("/").map(encodeURIComponent).join("/")}`, scopeURL.origin);
  return url.origin === scopeURL.origin ? url.href : null;
}

function currentOriginalURL(media) {
  let path = media.path;
  if (path.startsWith("responsive/")) {
    const variant = /^responsive\/[a-f0-9]{8,64}\/[1-9][0-9]{0,4}\/(.+)\.webp$/i.exec(path);
    if (!variant) return null;
    path = variant[1];
  }
  if (!/\.(?:avif|webp|png|jpe?g|svg|ico)$/i.test(path)) return null;
  return currentAssetURL(path);
}

async function recoverOldPlayback(request, media) {
  const response = await fetch(request);
  if (response.status !== 404) return response;
  const fallback = currentAssetURL(media.path);
  if (fallback) {
    try {
      // Request cloning retains Range/credentials, including an in-progress seek.
      const replacement = await fetch(new Request(fallback, request));
      const type = replacement.headers.get("content-type") || "";
      const playable = (replacement.status === 200 || replacement.status === 206) && /^(?:audio\/|video\/|application\/octet-stream)/i.test(type);
      const outsideRange = replacement.status === 416 && /^bytes \*\/[0-9]+$/i.test(replacement.headers.get("content-range") || "");
      if (!replacement.redirected && (playable || outsideRange)) return replacement;
    } catch { /* Leave the original missing response intact if recovery fails. */ }
  }
  return response;
}

function cacheable(request, response) {
  if (!response.ok || response.status !== 200 || response.type === "opaque" || response.redirected) return false;
  const type = response.headers.get("content-type") || "";
  return request.destination === "image"
    ? /^image\//i.test(type)
    : /^(?:font\/|application\/(?:font-woff|x-font-|vnd\.ms-fontobject|octet-stream))/i.test(type);
}

function remember(request, response, targetCache) {
  // Serialize writes so simultaneous warm-up requests cannot exceed the limit.
  pendingWrites = pendingWrites.catch(() => undefined).then(async () => {
    await caches.open(cacheName);
    const cache = await caches.open(targetCache);
    await cache.put(request, response);
    const keys = await cache.keys();
    for (const key of keys.slice(0, Math.max(0, keys.length - maxEntries))) await cache.delete(key);
    await pruneRevisionCaches();
  }).catch(() => undefined); // Storage denial/quota must never break an image.
  return pendingWrites;
}

self.addEventListener("install", (event) => {
  // This worker never caches app code or HTML, so activation cannot mix app versions.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    if (validRevision) {
      try {
        await caches.open(cacheName);
        await pruneRevisionCaches();
      } catch { /* Browsers may disable persistent storage. HTTP cache still works. */ }
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const media = scopedAssetRequest(event.request);
  if (!media) return;
  if (oldPlaybackRequest(event.request, media)) {
    // Playback always stays network-only. No CacheStorage reads/writes or queueing.
    event.respondWith(recoverOldPlayback(event.request, media));
    return;
  }
  if (!cacheEligible(event.request, media)) return;
  // Register waitUntil synchronously; keep the worker alive for the cache write.
  let finish;
  event.waitUntil(new Promise((resolve) => { finish = resolve; }));
  event.respondWith((async () => {
    try {
      try {
        if ((await caches.keys()).includes(media.cache)) {
          const cache = await caches.open(media.cache);
          const cached = await cache.match(event.request);
          if (cached) return cached;
        }
      } catch { /* Fall back to the network if cache storage is unavailable. */ }
      const response = await fetch(event.request);
      if (response.status === 404 && media.revision !== revision && event.request.destination === "image") {
        const fallback = currentOriginalURL(media);
        if (fallback) {
          try {
            const replacement = await fetch(new Request(fallback, event.request));
            // Never save new artwork under an older supposedly immutable URL.
            if (cacheable(event.request, replacement)) return replacement;
          } catch { /* Preserve the original response if recovery is unavailable. */ }
        }
      }
      if (cacheable(event.request, response)) {
        const write = remember(event.request, response.clone(), media.cache);
        void write.finally(finish);
        finish = () => undefined;
      }
      return response;
    } finally {
      finish();
    }
  })());
});
