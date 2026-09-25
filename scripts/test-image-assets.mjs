// Run: node --test scripts/test-image-assets.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/imageAssets.ts", import.meta.url);
const fixture = {
  revision: "reviewed123",
  images: {
    "assets/talent/portrait.webp": {
      src: "assets/talent/portrait.webp", width: 1086, height: 1448,
      variants: [96, 256, 480, 768].map((width) => ({
        src: `assets/responsive/fingerprint/${width}/talent/portrait.webp.webp`, width,
      })),
    },
    "assets/small-logo.png": {
      src: "assets/small-logo.png", width: 48, height: 48, variants: [],
    },
  },
};

function loadImages(base, privateLab = false) {
  const source = readFileSync(filename, "utf8").replaceAll(
    "import.meta.env.VITE_PRIVATE_LAB", JSON.stringify(String(privateLab)),
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename.pathname,
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => {
    if (name === "./assets") return { A: base };
    assert.equal(name, "../data/imageVariants.json");
    return { default: fixture };
  }, module, module.exports);
  return module.exports;
}

for (const base of ["/assets", "/media/reviewed123/assets", "/NEWFOAMHOME/media/reviewed123/assets"]) {
  test(`best-fit selection preserves the deployment root: ${base}`, () => {
    const { imageSource } = loadImages(base);
    const source = `${base}/talent/portrait.webp`;
    const variant = (width) => `${base}/responsive/fingerprint/${width}/talent/portrait.webp.webp`;
    for (const [requested, expected] of [[38, 96], [96, 96], [97, 256], [256, 256], [257, 480], [480, 480], [481, 768], [768, 768]]) {
      assert.equal(imageSource(source, requested), variant(expected), `requested ${requested}px`);
    }
    for (const width of [undefined, 0, 769, 1086, 2048])
      assert.equal(imageSource(source, width), source, `original fallback for ${width}px`);
  });

  test(`responsive candidates include the full original at its true width: ${base}`, () => {
    const { imageSources, imageSource } = loadImages(base);
    const source = `${base}/talent/portrait.webp`;
    assert.deepEqual(imageSources(source).split(", "), [
      ...[96, 256, 480, 768].map((width) => `${base}/responsive/fingerprint/${width}/talent/portrait.webp.webp ${width}w`),
      `${source} 1086w`,
    ]);
    const small = `${base}/small-logo.png`;
    assert.equal(imageSources(small), undefined);
    assert.equal(imageSource(small, 96), small, "no invented resize for an efficient small asset");
  });
}

test("unregistered, foreign, uploaded and explicitly versioned URLs remain intact", () => {
  const base = "/NEWFOAMHOME/media/reviewed123/assets";
  const { imageSource, imageSources } = loadImages(base);
  for (const source of [
    `${base}/unregistered.webp`,
    `${base}/talent/uploads/custom.webp`,
    `${base}/talent/portrait.webp?revision=other`,
    `${base}/talent/portrait.webp#crop`,
    `${base}-other/talent/portrait.webp`,
    "/NEWFOAMHOME/media/older/assets/talent/portrait.webp",
    "/assets/talent/portrait.webp",
    `https://foreign.example${base}/talent/portrait.webp`,
    `//foreign.example${base}/talent/portrait.webp`,
    "blob:https://example.test/portrait",
    "data:image/webp;base64,unchanged",
  ]) {
    assert.equal(imageSource(source, 96), source);
    assert.equal(imageSources(source), undefined);
  }
});

test("the private Lab keeps its protected source URLs even for known public images", () => {
  const { imageSource, imageSources } = loadImages("/assets", true);
  for (const source of ["/assets/talent/portrait.webp", "/assets/small-logo.png", "/api/asset?path=assets%2Ftalent%2Fuploads%2Fphoto.webp&ref=saved"]) {
    assert.equal(imageSource(source, 96), source);
    assert.equal(imageSources(source), undefined);
  }
});
