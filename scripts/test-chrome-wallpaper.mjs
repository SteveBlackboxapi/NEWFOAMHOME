// Run with: node --test scripts/test-chrome-wallpaper.mjs
// Exercises the real preference and upload helpers. Image decode/canvas APIs
// are isolated browser boundaries; this does not replace visual browser QA.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/chromeDemo.ts", import.meta.url);
const require = createRequire(import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
  fileName: filename.pathname,
});
const module = { exports: {} };
new Function("require", "module", "exports", outputText)(
  (specifier) =>
    specifier === "./assets"
      ? { A: "/NEWFOAMHOME/assets" }
      : require(specifier),
  module,
  module.exports,
);
const {
  CHROME_WALLPAPERS,
  isChromeWallpaperImage,
  parseChromeWallpaper,
  readChromeWallpaperStorage,
  saveChromeWallpaper,
  chromeWallpaperBackground,
  chromeWallpaperFailureMessage,
  prepareChromeWallpaper,
} = module.exports;
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const webp = `data:image/webp;base64,${Buffer.from("RIFF0000WEBPVP8 test bytes").toString("base64")}`;

function stubGlobal(t, name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value,
  });
  t.after(() =>
    previous
      ? Object.defineProperty(globalThis, name, previous)
      : delete globalThis[name],
  );
}
function storageFixture(t) {
  const values = new Map();
  const events = [];
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  stubGlobal(t, "localStorage", storage);
  stubGlobal(t, "window", {
    dispatchEvent: (event) => events.push(event.type),
  });
  return { storage, values, events };
}

test("a missing preference uses the base-aware photographic landscape", () => {
  assert.deepEqual(parseChromeWallpaper(null), {
    wallpaper: { preset: "original" },
  });
  assert.equal(
    CHROME_WALLPAPERS.original,
    'url("/NEWFOAMHOME/assets/chrome-desktop-landscape.png")',
  );
  assert.match(CHROME_WALLPAPERS.sage, /gradient/);
  assert.match(CHROME_WALLPAPERS.blue, /gradient/);
});

test("valid raster data URLs and named presets restore cleanly", () => {
  for (const image of [png, webp]) {
    assert.equal(isChromeWallpaperImage(image), true);
    const parsed = parseChromeWallpaper(
      JSON.stringify({ preset: "blue", image, name: "My landscape.png" }),
    );
    assert.equal(parsed.issue, undefined);
    assert.deepEqual(parsed.wallpaper, {
      preset: "blue",
      image,
      name: "My landscape.png",
    });
    assert.equal(
      chromeWallpaperBackground(parsed.wallpaper),
      `url("${image}")`,
    );
  }
  assert.deepEqual(
    parseChromeWallpaper('{"preset":"sage","name":"stale file.jpg"}').wallpaper,
    { preset: "sage" },
  );
});

test("remote URLs, active formats, CSS escapes, mismatched signatures and oversized payloads are rejected", () => {
  const invalid = [
    "https://example.com/wallpaper.jpg",
    "javascript:alert(1)",
    "file:///photo.jpg",
    "blob:local-file",
    "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
    "data:image/png;base64,AAAA",
    png.replace("image/png", "image/jpeg"),
    png + '\"); url("https://example.com/track")',
    "data:image/png;base64,not base64",
    "data:image/png;base64,",
    `${png}${"A".repeat(2_000_001)}`,
    null,
    {},
    4,
  ];
  for (const image of invalid) {
    assert.equal(isChromeWallpaperImage(image), false);
    const { wallpaper, issue } = parseChromeWallpaper(
      JSON.stringify({ preset: "sage", image, name: "bad" }),
    );
    assert.deepEqual(wallpaper, { preset: "sage" });
    assert.match(issue, /could not be restored/);
    assert.equal(
      chromeWallpaperBackground({ preset: "sage", image }),
      CHROME_WALLPAPERS.sage,
    );
  }
});

test("damaged JSON and invalid preference shapes fall back without crashing", () => {
  for (const raw of [
    "{broken",
    "null",
    "[]",
    "4",
    '"original"',
    '{"preset":"__proto__"}',
    '{"preset":"unknown"}',
    '{"preset":{}}',
  ]) {
    const { wallpaper, issue } = parseChromeWallpaper(raw);
    assert.deepEqual(wallpaper, { preset: "original" });
    assert.match(issue, /could not be restored/);
  }
});

test("save, restore and reset notify same-page previews after a successful write", (t) => {
  const { values, events } = storageFixture(t);
  saveChromeWallpaper({ preset: "blue", image: png, name: "sky.png" });
  assert.equal(values.size, 1);
  assert.equal(
    parseChromeWallpaper(readChromeWallpaperStorage()).wallpaper.image,
    png,
  );
  assert.equal(events.length, 1);
  saveChromeWallpaper(null);
  assert.equal(values.size, 0);
  assert.equal(events.length, 2);
  assert.deepEqual(
    parseChromeWallpaper(readChromeWallpaperStorage()).wallpaper,
    { preset: "original" },
  );
});

test("blocked reads use the default, and failed writes preserve the previous saved image", (t) => {
  const { storage, values, events } = storageFixture(t);
  saveChromeWallpaper({ preset: "sage" });
  const previous = [...values.entries()];
  storage.setItem = () => {
    throw new DOMException("technical quota detail", "QuotaExceededError");
  };
  assert.throws(() => saveChromeWallpaper({ preset: "blue" }), {
    name: "QuotaExceededError",
  });
  assert.deepEqual([...values.entries()], previous);
  assert.equal(
    events.length,
    1,
    "failed saves must not claim a preference changed",
  );
  storage.getItem = () => {
    throw new DOMException("technical storage detail", "SecurityError");
  };
  assert.equal(readChromeWallpaperStorage(), null);
  assert.deepEqual(
    parseChromeWallpaper(readChromeWallpaperStorage()).wallpaper,
    { preset: "original" },
  );
});

test("invalid saves fail before storage or event mutation", (t) => {
  const { values, events } = storageFixture(t);
  saveChromeWallpaper({ preset: "sage" });
  const previous = [...values.entries()];
  assert.throws(
    () =>
      saveChromeWallpaper({
        preset: "blue",
        image: "https://example.com/a.png",
      }),
    /valid background/,
  );
  assert.deepEqual([...values.entries()], previous);
  assert.equal(events.length, 1);
});

test("unsupported, empty and over-limit uploads fail before any image decoder runs", async (t) => {
  stubGlobal(
    t,
    "Image",
    class {
      constructor() {
        throw new Error("decoder should not run");
      }
    },
  );
  await assert.rejects(
    prepareChromeWallpaper({ type: "image/svg+xml", size: 200 }),
    /JPG, PNG or WebP/,
  );
  await assert.rejects(
    prepareChromeWallpaper({ type: "image/jpeg", size: 0 }),
    /empty/,
  );
  await assert.rejects(
    prepareChromeWallpaper({ type: "image/png", size: 20 * 1024 * 1024 + 1 }),
    /20 MB/,
  );
});

function mockImagePipeline(
  t,
  { width = 4000, height = 2000, result = webp, decodeError = false } = {},
) {
  const revoked = [];
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ fillRect() {}, drawImage() {} }),
    toDataURL: () => result,
  };
  stubGlobal(
    t,
    "Image",
    class {
      width = width;
      height = height;
      async decode() {
        if (decodeError) throw new Error("technical codec failure");
      }
    },
  );
  stubGlobal(t, "document", { createElement: () => canvas });
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = () => "blob:test-wallpaper";
  URL.revokeObjectURL = (url) => revoked.push(url);
  t.after(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });
  return { canvas, revoked };
}

test("large images are proportionally capped at 1600px and object URLs are released", async (t) => {
  const { canvas, revoked } = mockImagePipeline(t);
  assert.equal(
    await prepareChromeWallpaper({ type: "image/png", size: 3000 }),
    webp,
  );
  assert.equal(canvas.width, 1600);
  assert.equal(canvas.height, 800);
  assert.deepEqual(revoked, ["blob:test-wallpaper"]);
});

test("small images are not enlarged", async (t) => {
  const { canvas } = mockImagePipeline(t, { width: 400, height: 600 });
  await prepareChromeWallpaper({ type: "image/png", size: 3000 });
  assert.equal(canvas.width, 400);
  assert.equal(canvas.height, 600);
});

test("corrupt files report a human-readable error and release their object URL", async (t) => {
  const { revoked } = mockImagePipeline(t, { decodeError: true });
  await assert.rejects(
    prepareChromeWallpaper({ type: "image/jpeg", size: 3000 }),
    /could not be opened/,
  );
  assert.deepEqual(revoked, ["blob:test-wallpaper"]);
});

test("an unusable canvas output cannot overwrite a valid preference", async (t) => {
  const { revoked } = mockImagePipeline(t, { result: "data:," });
  await assert.rejects(
    prepareChromeWallpaper({ type: "image/png", size: 3000 }),
    /Try a smaller image/,
  );
  assert.deepEqual(revoked, ["blob:test-wallpaper"]);
});

test("failure feedback distinguishes storage limits and hides technical browser errors", () => {
  assert.match(
    chromeWallpaperFailureMessage(
      new DOMException("SQL quota detail", "QuotaExceededError"),
    ),
    /not enough browser storage/,
  );
  assert.match(
    chromeWallpaperFailureMessage(
      new DOMException("blocked-origin stack", "SecurityError"),
    ),
    /storage is blocked/,
  );
  assert.equal(
    chromeWallpaperFailureMessage(new Error("private browser details")),
    "The background could not be saved. Try another image or allow local storage.",
  );
});
