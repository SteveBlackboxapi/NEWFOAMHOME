// Run with: node --test scripts/test-caption-layout.mjs
// Uses the project's TypeScript compiler; no browser or additional dependencies.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const moduleCache = new Map();

// Load the real application functions, stubbing only Vite's public asset base.
// This keeps tests independent of browser globals and Node's TS import resolver.
function loadApplication(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (moduleCache.has(filename)) return moduleCache.get(filename).exports;
  const module = { exports: {} };
  moduleCache.set(filename, module);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });
  const importDependency = (specifier) => {
    if (!specifier.startsWith(".")) return require(specifier);
    const dependency = path.resolve(path.dirname(filename), specifier);
    if (dependency === path.join(root, "src/lib/assets"))
      return { A: "/assets" };
    return loadApplication(`${dependency}.ts`);
  };
  new Function("require", "module", "exports", outputText)(
    importDependency,
    module,
    module.exports,
  );
  return module.exports;
}

const { DEFAULT_CAPTION_SETTINGS, CAPTION_FONT_OPTIONS, CAPTION_PRESETS } =
  loadApplication("src/data/stagedTalent.ts");
const { captionLayout, captionBackgrounds, captionPosition, captionFont } =
  loadApplication("src/lib/captionLayout.ts");
const { cleanCaption, downloadCaptioned } = loadApplication(
  "src/lib/talentLab.ts",
);
const settings = (overrides = {}) => ({
  ...DEFAULT_CAPTION_SETTINGS,
  visible: true,
  text: "A little everyday",
  ...overrides,
});
const measure = (text) => Array.from(text).length * 10;
const metrics = { ascent: 40, descent: 10 };

test("legacy drafts keep their words and typography while gaining safe style defaults", () => {
  const legacy = {
    visible: false,
    text: "keep these words",
    x: 23,
    y: 71,
    size: 18,
    font: "georgia",
    fill: "#f1f2f3",
    stroke: "#010203",
    strokeWidth: 1.5,
  };
  const cleaned = cleanCaption(legacy, settings());
  for (const [key, value] of Object.entries(legacy))
    assert.equal(cleaned[key], value);
  for (const key of [
    "weight",
    "italic",
    "uppercase",
    "align",
    "background",
    "backgroundColor",
    "backgroundOpacity",
    "padding",
    "radius",
  ])
    assert.equal(cleaned[key], DEFAULT_CAPTION_SETTINGS[key]);
});

test("malformed browser data cannot inject invalid style values or unbounded dimensions", () => {
  const fallback = settings();
  const cleaned = cleanCaption(
    {
      size: Infinity,
      x: -20,
      y: 120,
      weight: "800",
      italic: "true",
      uppercase: 1,
      align: "diagonal",
      background: "url(example)",
      backgroundColor: "red",
      backgroundOpacity: 200,
      padding: -1,
      radius: 500,
      font: "missing-font",
      text: "x".repeat(1200),
    },
    fallback,
  );
  assert.equal(cleaned.size, fallback.size);
  assert.equal(cleaned.x, 10);
  assert.equal(cleaned.y, 90);
  assert.equal(cleaned.weight, fallback.weight);
  assert.equal(cleaned.italic, false);
  assert.equal(cleaned.uppercase, false);
  assert.equal(cleaned.align, "center");
  assert.equal(cleaned.background, "none");
  assert.equal(cleaned.backgroundColor, fallback.backgroundColor);
  assert.equal(cleaned.backgroundOpacity, 100);
  assert.equal(cleaned.padding, 0);
  assert.equal(cleaned.radius, 24);
  assert.equal(cleaned.font, fallback.font);
  assert.equal(cleaned.text.length, 1000);
});

test("every offered font and preset survives draft validation", () => {
  for (const font of CAPTION_FONT_OPTIONS) {
    const cleaned = cleanCaption(settings({ font: font.id }), settings());
    assert.equal(cleaned.font, font.id);
    assert.ok(captionFont(cleaned).includes(font.css));
  }
  for (const preset of CAPTION_PRESETS) {
    const value = settings(preset.settings);
    assert.deepEqual(cleanCaption(value, settings()), value, preset.id);
    assert.equal("text" in preset.settings, false);
    assert.equal("x" in preset.settings, false);
    assert.equal("y" in preset.settings, false);
  }
});

test("layout retains intentional blank lines, normalises newlines and applies uppercase", () => {
  const layout = captionLayout(
    settings({ text: "first\r\n\r\nthird", uppercase: true }),
    measure,
    metrics,
  );
  assert.deepEqual(
    layout.lines.map((line) => line.text),
    ["FIRST", "", "THIRD"],
  );
  assert.equal(layout.lines[2].y - layout.lines[0].y, layout.lineHeight * 2);
});

test("long URLs and emoji wrap without overflow or broken surrogate pairs", () => {
  const input = settings({
    text: `https://example.com/${"unbroken".repeat(40)} ${"🙂".repeat(120)}`,
    background: "box",
    padding: 18,
  });
  const layout = captionLayout(input, measure, metrics);
  assert.ok(layout.lines.length > 3);
  assert.ok(layout.width <= 1080 * 0.88);
  for (const line of layout.lines) {
    assert.ok(line.width <= 1080 * 0.88 - layout.padding * 2);
    assert.equal(line.text.isWellFormed(), true);
  }
});

test("left, centre and right alignment keep short lines within the same text box", () => {
  for (const align of ["left", "center", "right"]) {
    const layout = captionLayout(
      settings({ text: "longer line\nshort", background: "box", align }),
      measure,
      metrics,
    );
    const [wide, narrow] = layout.lines;
    assert.equal(wide.x, layout.padding);
    if (align === "left") assert.equal(narrow.x, layout.padding);
    if (align === "center")
      assert.equal(narrow.x + narrow.width / 2, layout.width / 2);
    if (align === "right")
      assert.equal(narrow.x + narrow.width, layout.width - layout.padding);
  }
});

test("backgrounds cover the intended lines and skip empty highlighted lines", () => {
  const value = settings({ text: "first\n\nthird", background: "highlight" });
  const layout = captionLayout(value, measure, metrics);
  const highlights = captionBackgrounds(layout, value);
  assert.equal(highlights.length, 2);
  assert.deepEqual(
    captionBackgrounds(layout, { ...value, background: "none" }),
    [],
  );
  assert.deepEqual(
    captionBackgrounds(layout, { ...value, background: "box" }),
    [{ x: 0, y: 0, width: layout.width, height: layout.height }],
  );
  for (const rect of highlights) {
    assert.ok(rect.x >= 0 && rect.x + rect.width <= layout.width);
    assert.ok(rect.y >= 0 && rect.y + rect.height <= layout.height);
  }
});

test("caption positioning keeps ordinary boxes within both image axes", () => {
  for (const available of [608, 1080, 1350, 1920])
    for (const extent of [50, 200, 500])
      for (const center of [10, 50, 90]) {
        const position = captionPosition(center, extent, available);
        assert.ok(position - extent / 2 >= 0);
        assert.ok(position + extent / 2 <= available);
      }
});

async function simulateCaptionExport(value, rejectFont = false) {
  const layout = captionLayout(value, measure, metrics);
  const point = {
    x: layout.width / 2,
    y: layout.lines[1].top + layout.padding / 2,
  };
  let paintedAlpha = 0;
  let rectangles = [];
  const context = {
    globalAlpha: 1,
    measureText: (text) => ({
      width: measure(text),
      fontBoundingBoxAscent: metrics.ascent,
      fontBoundingBoxDescent: metrics.descent,
    }),
    drawImage() {},
    translate() {},
    strokeText() {},
    fillText() {},
    beginPath() {
      rectangles = [];
    },
    roundRect(x, y, width, height) {
      rectangles.push({ x, y, width, height });
    },
    fill() {
      if (
        rectangles.some(
          (rect) =>
            point.x > rect.x &&
            point.x < rect.x + rect.width &&
            point.y > rect.y &&
            point.y < rect.y + rect.height,
        )
      )
        paintedAlpha = this.globalAlpha + paintedAlpha * (1 - this.globalAlpha);
    },
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
    toBlob: (done) => done(new Blob(["test"], { type: "image/png" })),
  };
  const originals = Object.fromEntries(
    ["document", "window", "Image"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  globalThis.document = {
    fonts: {
      ready: Promise.resolve(),
      load: () =>
        rejectFont
          ? Promise.reject(new Error("font unavailable"))
          : Promise.resolve(),
    },
    createElement: (tag) =>
      tag === "canvas" ? canvas : { click() {}, remove() {} },
    body: { appendChild() {} },
  };
  globalThis.window = {
    location: { href: "https://foam.example/lab/talent" },
    setTimeout: () => 0,
  };
  globalThis.Image = class {
    width = 1080;
    height = 1920;
    async decode() {}
  };
  try {
    await downloadCaptioned(
      {
        src: "/asset.jpg",
        talent: { id: "test" },
        index: 0,
        tile: { aspectRatio: "9/16" },
      },
      value,
    );
    return { paintedAlpha, width: canvas.width, height: canvas.height };
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
}

test("overlapping multiline highlights preserve opacity in PNG export", async () => {
  const result = await simulateCaptionExport(
    settings({
      text: "first line\nsecond line",
      background: "highlight",
      backgroundOpacity: 50,
    }),
  );
  assert.equal(
    result.paintedAlpha,
    0.5,
    "Overlapping highlight rectangles must composite as one background layer, like the SVG preview.",
  );
  assert.equal(result.width, 1080);
  assert.equal(result.height, 1920);
});

test("PNG export retains the preview's fallback when a webfont cannot load", async () => {
  await assert.doesNotReject(
    simulateCaptionExport(settings({ text: "first line\nsecond line" }), true),
  );
});
