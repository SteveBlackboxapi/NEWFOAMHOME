import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";

const require = createRequire(import.meta.url);
const root = path.resolve(new URL("../", import.meta.url).pathname);
const key = (source, route, section) => JSON.stringify([source, route, section]);
const ZANE = "assets/talent/zane-holt-portrait.jpg";
const NIA = "assets/talent/nia-brooks/nia-brooks-skincare.webp";
const replacements = {
  [key(ZANE, "/kit-story", "Foam for Chrome · Extension roster")]: "assets/website-placements/zane-kit.webp",
  [key(NIA, "/", "A world of talent · Creator wall")]: "assets/website-placements/nia-wall.webp",
  [key(NIA, "/", "Content discovery · Skincare product reviews")]: "assets/website-placements/nia-discovery.webp",
  [key(NIA, "/", "Product family · Content search miniature")]: "assets/website-placements/nia-miniature.webp",
};

function fixture(base, privateLab = false) {
  const modules = new Map();
  function load(filename) {
    if (modules.has(filename)) return modules.get(filename).exports;
    const module = { exports: {} };
    modules.set(filename, module);
    const source = readFileSync(filename, "utf8")
      .replaceAll("import.meta.env.VITE_PRIVATE_LAB", JSON.stringify(String(privateLab)));
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      fileName: filename,
    });
    new Function("require", "module", "exports", outputText)((specifier) => {
      if (specifier.endsWith(".css")) return {};
      if (!specifier.startsWith(".")) return require(specifier);
      const dependency = path.resolve(path.dirname(filename), specifier);
      if (dependency.endsWith("/lib/assets")) return { A: base, img: { foamSymbol: `${base}/d6571.svg` } };
      if (dependency.endsWith("/data/websitePlacementImages.json")) return { default: { replacements } };
      if (dependency.endsWith("/lib/imageAssets")) return { imageSources: (src) => `${src}?small 256w, ${src} 1024w` };
      return load(dependency + (dependency.includes("/components/") ? ".tsx" : ".ts"));
    }, module, module.exports);
    return module.exports;
  }
  return {
    component: (name) => load(path.join(root, `src/components/${name}.tsx`)),
    ...load(path.join(root, "src/components/OptimizedImage.tsx")),
    ...load(path.join(root, "src/components/WebsiteImageScope.tsx")),
    ...load(path.join(root, "src/lib/websitePlacementImages.ts")),
  };
}
function render(route, children) {
  return renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [route] }, children));
}

for (const base of ["/assets", "/NEWFOAMHOME/media/revision/assets"]) {
  test(`a Zane roster replacement changes Kit Story but leaves Chrome Story intact (${base})`, () => {
    const { OptimizedImage } = fixture(base);
    const src = `${base}/${ZANE.slice(7)}`;
    const image = React.createElement(OptimizedImage, { src, section: "Foam for Chrome · Extension roster", alt: "Zane", loading: "lazy" });
    const kit = render("/kit-story/", image);
    const chrome = render("/chrome-story", image);
    assert.ok(kit.includes(`src="${base}/website-placements/zane-kit.webp"`));
    assert.ok(kit.includes(`srcSet="${base}/website-placements/zane-kit.webp?small 256w`), "responsive candidates use the replacement, not the shared source");
    assert.ok(chrome.includes(`src="${src}"`));
    assert.ok(!chrome.includes("zane-kit.webp"));
  });

  test(`the same source on one page resolves each section independently (${base})`, () => {
    const { OptimizedImage, WebsiteImageScope } = fixture(base);
    const source = `${base}/${NIA.slice(7)}`;
    const img = (id, section) => React.createElement(OptimizedImage, { id, src: source, section, alt: "Nia", loading: "lazy" });
    const markup = render("/", React.createElement(WebsiteImageScope, { section: "A world of talent · Creator wall" },
      React.createElement("div", null,
        img("wall"),
        img("discovery", "Content discovery · Skincare product reviews"),
        img("other", "Unrelated section"),
      ),
    ));
    assert.match(markup, /id="wall"[^>]+src="[^\"]*\/website-placements\/nia-wall.webp"/);
    assert.match(markup, /id="discovery"[^>]+src="[^\"]*\/website-placements\/nia-discovery.webp"/);
    assert.ok(markup.includes(`id="other" alt="Nia" loading="lazy" src="${source}"`));
    assert.ok(!markup.includes(" section="), "scope metadata never leaks into HTML attributes");
    assert.equal((markup.match(/<div/g) || []).length, 1, "section scopes do not create layout wrappers");
  });
}

test("the private Lab never applies public placement substitutions to catalogue thumbnails", () => {
  const { OptimizedImage } = fixture("/assets", true);
  const source = `/${ZANE}`;
  const markup = render("/kit-story", React.createElement(OptimizedImage, { src: source, section: "Foam for Chrome · Extension roster", loading: "lazy" }));
  assert.ok(markup.includes(`src="${source}"`));
  assert.ok(!markup.includes("website-placements"));
});

test("missing or untrusted placement paths keep the original image without guessing another section", () => {
  const base = "/NEWFOAMHOME/media/revision/assets";
  const { resolveWebsitePlacementImage: resolve } = fixture(base);
  const src = `${base}/${ZANE.slice(7)}`;
  assert.equal(resolve(src, "/kit-story", undefined), src);
  assert.equal(resolve(src, "/kit-story", "Another section"), src);
  for (const input of ["blob:https://example.test/image", "https://other.example/image.jpg", "/api/asset?path=image", "/assets/talent/zane-holt-portrait.jpg"])
    assert.equal(resolve(input, "/kit-story", "Foam for Chrome · Extension roster"), input);
  for (const replacement of ["https://other.example/track", "assets/website-placements/../../bad.webp", "assets/website-placements/evil.svg"])
    assert.equal(resolve(src, "/kit-story", "Foam for Chrome · Extension roster", { [key(ZANE, "/kit-story", "Foam for Chrome · Extension roster")]: replacement }), src);
});


test("the real shared Chrome roster wires Zane to the correct section on both story routes", () => {
  const base = "/NEWFOAMHOME/media/revision/assets";
  const { component } = fixture(base);
  const { ChromeExtensionPanel } = component("ChromeDemoScene");
  const roster = React.createElement(ChromeExtensionPanel, { stage: 2 });
  const kit = render("/kit-story/", roster);
  const chrome = render("/chrome-story/", roster);
  assert.ok(kit.includes(`src="${base}/website-placements/zane-kit.webp"`));
  assert.ok(!kit.includes(`src="${base}/${ZANE.slice(7)}"`));
  assert.ok(chrome.includes(`src="${base}/${ZANE.slice(7)}"`));
  assert.ok(!chrome.includes("zane-kit.webp"));
});


test("the real Home wall and shared content miniature keep different replacements of Nia", () => {
  const base = "/NEWFOAMHOME/media/revision/assets";
  const { component } = fixture(base);
  const { CreatorWall } = component("PeopleColour");
  const { MiniIllustration } = component("mini-ui/MiniIllustration");
  const markup = render("/", React.createElement(React.Fragment, null,
    React.createElement(CreatorWall),
    React.createElement(MiniIllustration, { kind: "search", section: "Product family · Content search miniature" }),
  ));
  assert.ok(markup.includes(`src="${base}/website-placements/nia-wall.webp"`));
  assert.ok(markup.includes(`src="${base}/website-placements/nia-miniature.webp"`));
  assert.ok(!markup.includes(`src="${base}/${NIA.slice(7)}"`));
});
