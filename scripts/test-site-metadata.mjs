// Run with: node --test scripts/test-site-metadata.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/siteMetadata.ts", import.meta.url);
const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  fileName: filename.pathname,
});
const module = { exports: {} };
new Function("module", "exports", outputText)(module, module.exports);
const {
  DEFAULT_SITE_URL, PREVIEW_IMAGE, PUBLIC_PAGE_PATHS, STATIC_PAGE_PATHS,
  normalizeSiteUrl, getPageMetadata, metadataTags, renderMetadata,
  replaceMetadata, renderSitemap,
} = module.exports;

const START = "<!-- foam:metadata:start -->";
const END = "<!-- foam:metadata:end -->";
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const urlKey = (value) => {
  const url = new URL(value);
  return `${url.origin}${url.pathname.replace(/\/+$/, "") || "/"}${url.search}${url.hash}`;
};
const values = (tags, kind, key, expected, value = "content") => tags
  .filter(({ tag, attrs }) => tag === kind && attrs[key] === expected)
  .map(({ attrs }) => attrs[value]);
const one = (tags, kind, key, expected, value = "content") => {
  const matches = values(tags, kind, key, expected, value);
  assert.equal(matches.length, 1, `exactly one ${expected}`);
  return matches[0];
};
const sitemapUrls = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1]));

test("deployment roots normalize with a trailing slash and reject non-web URLs", () => {
  assert.equal(normalizeSiteUrl("https://steveblackboxapi.github.io/NEWFOAMHOME"), "https://steveblackboxapi.github.io/NEWFOAMHOME/");
  assert.equal(normalizeSiteUrl("https://www.foam.io"), "https://www.foam.io/");
  assert.equal(normalizeSiteUrl("https://example.test/launch/site/"), "https://example.test/launch/site/");
  assert.equal(normalizeSiteUrl(DEFAULT_SITE_URL), DEFAULT_SITE_URL);
  for (const invalid of ["", "/NEWFOAMHOME/", "javascript:alert(1)", "data:text/html,hello", "ftp://example.test/"]) {
    assert.throws(() => normalizeSiteUrl(invalid), `reject ${invalid || "empty URL"}`);
  }
});

for (const siteUrl of [
  "https://steveblackboxapi.github.io/NEWFOAMHOME/",
  "https://www.foam.io/",
  "https://example.test/launch/site/",
]) {
  test(`canonical and social URLs stay inside the deployment root: ${siteUrl}`, () => {
    const tags = metadataTags("/kit-story", siteUrl);
    const canonical = one(tags, "link", "rel", "canonical", "href");
    assert.equal(urlKey(canonical), urlKey(new URL("kit-story/", siteUrl).href));
    assert.equal(one(tags, "meta", "property", "og:url"), canonical);
    const expectedImage = new URL("social/foam-preview-2026-09-30.webp", siteUrl).href;
    assert.equal(one(tags, "meta", "property", "og:image"), expectedImage);
    assert.equal(one(tags, "meta", "name", "twitter:image"), expectedImage);
    assert.equal(one(tags, "meta", "property", "og:image:width"), "1800");
    assert.equal(one(tags, "meta", "property", "og:image:height"), "973");
    assert.equal(one(tags, "meta", "property", "og:image:type"), "image/webp");
    const canonicalUrl = new URL(canonical);
    assert.equal(canonicalUrl.search, "");
    assert.equal(canonicalUrl.hash, "");
  });
}

test("public pages expose route-specific descriptions and a complete share preview", () => {
  const descriptions = new Set();
  for (const path of PUBLIC_PAGE_PATHS) {
    const page = getPageMetadata(path);
    assert.equal(page.indexable, true, path);
    assert.ok(page.title.trim(), path);
    assert.ok(page.description.trim(), path);
    descriptions.add(page.description);
    const tags = metadataTags(path, DEFAULT_SITE_URL);
    assert.equal(one(tags, "meta", "name", "description"), page.description);
    assert.equal(one(tags, "meta", "property", "og:title"), page.title);
    assert.equal(one(tags, "meta", "property", "og:description"), page.description);
    assert.equal(one(tags, "meta", "name", "twitter:title"), page.title);
    assert.equal(one(tags, "meta", "name", "twitter:description"), page.description);
    assert.equal(one(tags, "meta", "name", "twitter:card"), "summary_large_image");
    assert.equal(one(tags, "meta", "property", "og:image:alt"), PREVIEW_IMAGE.alt);
    assert.equal(one(tags, "meta", "name", "twitter:image:alt"), PREVIEW_IMAGE.alt);
    const robots = one(tags, "meta", "name", "robots").split(",").map((part) => part.trim());
    assert.deepEqual(new Set(robots), new Set(["index", "follow", "max-image-preview:large"]));
  }
  assert.ok(descriptions.size >= PUBLIC_PAGE_PATHS.length - 1, "only the Home/Managers alias may share its description");
  assert.ok(PREVIEW_IMAGE.alt.trim(), "the supplied preview image has meaningful alternate text");
});

test("route lookup ignores query strings, anchors and a trailing slash", () => {
  for (const path of ["/", "/managers", "/kit-story", "/data-trust"]) {
    const route = path.replace(/\/$/, "");
    for (const suffix of ["/", "?utm_source=preview", "/?utm_source=preview#scene", "#scene"]) {
      assert.deepEqual(getPageMetadata(`${route}${suffix}`), getPageMetadata(path));
      assert.deepEqual(metadataTags(`${route}${suffix}`, DEFAULT_SITE_URL), metadataTags(path, DEFAULT_SITE_URL));
    }
  }
});

test("Home and Managers share the homepage canonical while the kit remains distinct", () => {
  assert.equal(getPageMetadata("/managers").canonicalPath, "/");
  assert.equal(getPageMetadata("/kit-story").canonicalPath.replace(/\/$/, ""), "/kit-story");
  for (const siteUrl of [DEFAULT_SITE_URL, "https://www.foam.io/"]) {
    const canonical = (path) => one(metadataTags(path, siteUrl), "link", "rel", "canonical", "href");
    assert.equal(canonical("/managers"), canonical("/"));
    assert.notEqual(canonical("/kit-story"), canonical("/"));
  }
});

test("previews, private routes, archives and unknown addresses cannot advertise themselves for indexing", () => {
  for (const path of [
    "/home-film-preview", "/inside-foam-preview", "/managers-home-preview",
    "/kit-transition-preview", "/live-study", "/lab/inspo", "/lab/mini-ui",
    "/lab/talent", "/lab/data-trust/creator-first", "/archive-sept-2026/",
    "/not-a-real-page", "/kit-storyboard", "/brands/not-a-real-page",
  ]) {
    assert.equal(getPageMetadata(path).indexable, false, path);
    const tags = metadataTags(path, DEFAULT_SITE_URL);
    assert.match(one(tags, "meta", "name", "robots"), /(?:^|,)\s*noindex(?:\s*,|$)/, path);
    assert.equal(values(tags, "link", "rel", "canonical", "href").length, 0, path);
    assert.ok(!tags.some(({ attrs }) => attrs.property?.startsWith("og:") || attrs.name?.startsWith("twitter:")), path);
  }
});

test("sitemaps contain each public canonical once and omit aliases and private/preview routes", () => {
  for (const siteUrl of [DEFAULT_SITE_URL, "https://www.foam.io/", "https://example.test/launch/site/"]) {
    const xml = renderSitemap(siteUrl);
    assert.match(xml, /<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
    const urls = sitemapUrls(xml);
    const expected = new Set(PUBLIC_PAGE_PATHS.map((path) => urlKey(one(metadataTags(path, siteUrl), "link", "rel", "canonical", "href"))));
    assert.equal(urls.length, new Set(urls.map(urlKey)).size, "canonical URLs cannot be duplicated");
    assert.deepEqual(new Set(urls.map(urlKey)), expected);
    assert.ok(urls.every((url) => url.startsWith(siteUrl)), "migration preserves the configured deployment root");
    assert.ok(urls.every((url) => !/\/managers\/?$|preview|\/lab\/|archive|live-study/.test(url)));
  }
});

test("every public route has a static HTML destination and destinations are unique", () => {
  assert.equal(STATIC_PAGE_PATHS.length, new Set(STATIC_PAGE_PATHS).size);
  for (const path of PUBLIC_PAGE_PATHS) assert.ok(STATIC_PAGE_PATHS.includes(path), path);
  for (const path of ["/home-film-preview", "/inside-foam-preview", "/kit-transition-preview", "/live-study", "/lab/inspo"]) {
    assert.ok(STATIC_PAGE_PATHS.includes(path), `${path} needs its noindex metadata before JavaScript runs`);
  }
});

test("HTML and sitemap output escape reserved characters instead of reflecting raw markup", () => {
  const siteUrl = "https://example.test/launch&learn/";
  const html = renderMetadata("/data-trust", siteUrl);
  assert.match(html, /Data &amp; trust/);
  assert.ok(html.includes("launch&amp;learn/"));
  assert.ok(!html.includes("launch&learn/"));
  assert.ok(renderSitemap(siteUrl).includes("launch&amp;learn/"));
  assert.ok(!renderMetadata('/<script>alert("preview")</script>', siteUrl).includes("<script>"));
  assert.equal((html.match(/<title\b/g) || []).length, 1);
  for (const tag of html.match(/<(?:title|meta|link)\b[^>]*>/g) || []) {
    assert.match(tag, /\bdata-foam-seo(?:\s|=|>)/, "rendered metadata is identifiable for safe client updates");
  }
});

test("metadata replacement is repeatable and preserves unrelated head and body content", () => {
  const before = '<!doctype html><html><head><meta charset="UTF-8"><script>window.keep = true;</script>';
  const after = '</head><body><main data-test="preserved">Original content</main></body></html>';
  const template = `${before}${START}<title>Old title</title><meta name="description" content="Old description">${END}${after}`;
  const first = replaceMetadata(template, "/kit-story", DEFAULT_SITE_URL);
  assert.ok(first.startsWith(before + START));
  assert.ok(first.endsWith(END + after));
  assert.ok(!first.includes("Old title") && !first.includes("Old description"));
  assert.equal(replaceMetadata(first, "/kit-story", DEFAULT_SITE_URL), first);
  const moved = replaceMetadata(first, "/data-trust", "https://www.foam.io/");
  assert.equal((moved.match(/<title\b/g) || []).length, 1);
  assert.equal((moved.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(!moved.includes(DEFAULT_SITE_URL), "repeated generation cannot retain the previous deployment URL");
  assert.match(moved, /Data &amp; trust/);
});

test("missing or reversed metadata boundaries fail closed instead of modifying unrelated documents", () => {
  for (const html of [
    "<html><head><title>Archive</title></head></html>",
    `${START}<title>Incomplete</title>`,
    `<title>Incomplete</title>${END}`,
    `${END}<title>Reversed</title>${START}`,
  ]) assert.throws(() => replaceMetadata(html, "/", DEFAULT_SITE_URL));
});
