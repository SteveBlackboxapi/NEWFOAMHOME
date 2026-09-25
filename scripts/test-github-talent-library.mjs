// Run with: node --test scripts/test-github-talent-library.mjs
// All GitHub requests and bitmap decoding are mocked. No live writes or credentials.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const filename = new URL("../src/lib/githubTalentLibrary.ts", import.meta.url);
function loadLibrary(privateMode = false) {
  const { outputText } = ts.transpileModule(
    readFileSync(filename, "utf8").replaceAll("import.meta.env.BASE_URL", JSON.stringify("/NEWFOAMHOME/")).replaceAll(
      "import.meta.env.VITE_PRIVATE_LAB",
      JSON.stringify(privateMode ? "true" : "false"),
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: filename.pathname,
    },
  );
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (name) => {
      assert.equal(name, "./assets");
      return { A: "/NEWFOAMHOME/assets" };
    },
    module,
    module.exports,
  );
  return module.exports;
}
const {
  LIBRARY_BRANCH,
  LIBRARY_PATH,
  LIBRARY_REPO,
  LibraryError,
  assetPath,
  canonicalProfile,
  emptyLibrary,
  materializeLibrary,
  parseLibrary,
  readGithubLibrary,
  saveGithubLibrary,
  prepareLibraryImage,
  verifyGithubAccess,
} = loadLibrary();
const catalogueModules = new Map();
function loadCatalogueModule(filename) {
  if (filename.pathname.endsWith("/src/lib/assets.ts"))
    return { A: "/NEWFOAMHOME/assets" };
  if (catalogueModules.has(filename.href))
    return catalogueModules.get(filename.href).exports;
  const module = { exports: {} };
  catalogueModules.set(filename.href, module);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8").replaceAll("import.meta.env.BASE_URL", JSON.stringify("/NEWFOAMHOME/")), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename.pathname,
  });
  new Function("require", "module", "exports", outputText)(
    (specifier) => loadCatalogueModule(new URL(`${specifier}.ts`, filename)),
    module,
    module.exports,
  );
  return module.exports;
}
const API = `https://api.github.com/repos/${LIBRARY_REPO}`;
const REF = `/git/ref/heads/${LIBRARY_BRANCH}`;
const WRITE_REF = `/git/refs/heads/${LIBRARY_BRANCH}`;
const UPLOAD = "public/assets/talent/uploads/";
const BEFORE = "a".repeat(40);
const AFTER = "b".repeat(40);
const MAIN = "c".repeat(40);
const KEY = "test-only-not-a-real-access-key";
const PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=";
const image = (name) => ({ path: `${UPLOAD}${name}.png`, base64: PNG });
const src = (name) => `assets/talent/uploads/${name}.png`;
const profile = (overrides = {}) => ({
  id: "june-demo",
  displayName: "June Example",
  age: 26,
  gender: "Female",
  location: "London",
  bio: "A fictional profile for this test.",
  verticals: ["Lifestyle"],
  platforms: [
    { network: "instagram", handle: "@june-example", followers: 100 },
  ],
  totalAudience: 100,
  portrait: "/NEWFOAMHOME/assets/talent/june-portrait.webp",
  motion: null,
  motionStatus: "placeholder",
  content: [
    {
      id: "first",
      type: "still",
      thumb: "/assets/talent/june-c1.webp",
      aspectRatio: "9/16",
      platform: "instagram",
      strongKind: "photo",
      caption: "A day out.",
    },
  ],
  ...overrides,
});
const manifest = (profiles) => ({ version: 1, profiles, removedTalentIds: [] });
const file = (value) => ({
  encoding: "base64",
  content: Buffer.from(JSON.stringify(value)).toString("base64"),
});
const readSteps = (revision = BEFORE, value = emptyLibrary()) => [
  { path: REF, value: { object: { sha: revision } } },
  { path: `/contents/${LIBRARY_PATH}?ref=${revision}`, value: file(value) },
];
function mockGithub(t, expected, privateMode = false) {
  const calls = [];
  let at = 0;
  const origin = privateMode ? "/api/github" : API;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const call = {
      url,
      path: url.slice(origin.length),
      method: options.method,
      headers: options.headers,
      body: options.body ? JSON.parse(options.body) : undefined,
    };
    calls.push(call);
    const step = expected[at++];
    assert.ok(step, `Unexpected network request: ${call.method} ${call.path}`);
    assert.ok(
      url.startsWith(origin + "/") || url === origin,
      "All requests stay on the fixed repository API",
    );
    assert.equal(call.path, step.path);
    assert.equal(call.method, step.method ?? "GET");
    assert.equal(options.cache, "no-store");
    if (privateMode) {
      assert.equal(options.credentials, "same-origin");
      assert.equal(options.headers.Authorization, undefined);
    }
    if (step.check) step.check(call);
    return new Response(JSON.stringify(step.value ?? {}), {
      status: step.status ?? 200,
    });
  });
  return {
    calls,
    done: () =>
      assert.equal(at, expected.length, "All expected requests consumed"),
  };
}
const rejected = (promise) =>
  assert.rejects(promise, (error) => error instanceof LibraryError);
const noWrites = (calls) =>
  assert.ok(calls.every((call) => call.method === "GET"));
const parentStep = (sha = BEFORE) => ({
  path: `/git/commits/${sha}`,
  value: { tree: { sha: "parent-tree" } },
});
const saveSteps = (
  input,
  extraTree = [],
  revision = BEFORE,
  current = emptyLibrary(),
) => [
  ...readSteps(revision, current),
  parentStep(revision),
  {
    path: "/git/trees",
    method: "POST",
    value: { sha: "new-tree" },
    check: ({ body }) => {
      assert.equal(body.base_tree, "parent-tree");
      const catalogue = body.tree.find((entry) => entry.path === LIBRARY_PATH);
      assert.deepEqual(
        JSON.parse(catalogue.content),
        JSON.parse(JSON.stringify(parseLibrary(input))),
      );
      assert.deepEqual(
        body.tree.filter((entry) => entry.path !== LIBRARY_PATH),
        extraTree,
      );
    },
  },
  {
    path: "/git/commits",
    method: "POST",
    value: { sha: AFTER },
    check: ({ body }) => {
      assert.deepEqual(body.parents, [revision]);
      assert.equal(body.tree, "new-tree");
    },
  },
  {
    path: WRITE_REF,
    method: "PATCH",
    check: ({ body }) => assert.deepEqual(body, { sha: AFTER, force: false }),
  },
];

test("public read of a missing dedicated branch is read-only and empty", async (t) => {
  const api = mockGithub(t, [{ path: REF, status: 404 }]);
  assert.deepEqual(await readGithubLibrary(), {
    manifest: emptyLibrary(),
    revision: null,
  });
  assert.ok(!("Authorization" in api.calls[0].headers));
  noWrites(api.calls);
  api.done();
});

test("reads a pinned manifest with Unicode; missing file retains branch revision", async (t) => {
  const input = manifest([profile({ displayName: "Joë Example 🌿" })]);
  const api = mockGithub(t, [
    ...readSteps(BEFORE, input),
    { path: REF, value: { object: { sha: AFTER } } },
    { path: `/contents/${LIBRARY_PATH}?ref=${AFTER}`, status: 404 },
  ]);
  assert.equal(
    (await readGithubLibrary()).manifest.profiles[0].displayName,
    "Joë Example 🌿",
  );
  assert.deepEqual(await readGithubLibrary(), {
    revision: AFTER,
    manifest: emptyLibrary(),
  });
  noWrites(api.calls);
  api.done();
});

test("parses/canonicalises valid profiles and rejects unsafe asset paths at every nested source", () => {
  const p = profile({
    originalPortrait: "/assets/talent/original.webp",
    motion: "assets/talent/motion.mp4",
    motionStatus: "ready",
    referenceImages: [
      { label: "Reference", src: "public/assets/talent/reference.png" },
    ],
    creativeDirection: {
      summary: "Example",
      identityNotes: [],
      promptFile: "/assets/talent/prompt.md",
    },
  });
  p.content[0].video = `https://raw.githubusercontent.com/${LIBRARY_REPO}/${BEFORE}/public/assets/talent/clip.mp4`;
  const parsed = parseLibrary({
    ...manifest([p]),
    removedTalentIds: ["gone", "gone"],
  });
  assert.equal(parsed.profiles[0].portrait, "assets/talent/june-portrait.webp");
  assert.equal(parsed.profiles[0].content[0].video, "assets/talent/clip.mp4");
  assert.deepEqual(parsed.removedTalentIds, ["gone"]);
  for (const invalid of [
    null,
    42,
    "//attacker.test/assets/file.png",
    "https://attacker.test/assets/file.png",
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "assets/../file.png",
    "assets/a/./file.png",
    "assets/a//file.png",
    "assets/%2e%2e/file.png",
    `https://raw.githubusercontent.com/other/repo/${BEFORE}/public/assets/file.png`,
  ]) {
    assert.throws(() => assetPath(invalid), LibraryError, String(invalid));
  }
  for (const mutate of [
    (p) => {
      p.portrait = "https://attacker.test/image.png";
    },
    (p) => {
      p.originalPortrait = "assets/../image.png";
    },
    (p) => {
      p.motion = "data:bad";
    },
    (p) => {
      p.referenceImages[0].src = "//attacker.test/x";
    },
    (p) => {
      p.creativeDirection.promptFile = "assets/%2e%2e/key";
    },
    (p) => {
      p.content[0].thumb = "https://attacker.test/x";
    },
    (p) => {
      p.content[0].video = "assets/../x";
    },
    (p) => {
      p.content[0].generation = {
        version: "one",
        approach: "example",
        prompt: "https://attacker.test/x",
      };
    },
  ]) {
    const changed = structuredClone(p);
    mutate(changed);
    assert.throws(() => parseLibrary(manifest([changed])), LibraryError);
  }
});

test("the complete website catalogue round-trips, including preserved ideas-two masters and prompts", () => {
  const { labTalent } = loadCatalogueModule(
    new URL("../src/data/labTalentCatalogue.ts", import.meta.url),
  );
  const parsed = parseLibrary(manifest(labTalent));
  assert.equal(parsed.profiles.length, labTalent.length);
  const restored = materializeLibrary([], parsed, BEFORE);
  assert.deepEqual(
    restored.map((p) => p.id),
    labTalent.map((p) => p.id),
  );
  const studio = restored.find((p) => p.id === "studio-collaborators");
  assert.equal(
    studio.originalPortrait,
    "/NEWFOAMHOME/ideas-two/assets/masters/studio-moment.png",
  );
  assert.equal(
    studio.creativeDirection.promptFile,
    "/NEWFOAMHOME/ideas-two/README.md",
  );
  for (const path of [
    "/NEWFOAMHOME/ideas-two/../secret",
    "ideas-two/index.html",
    "/unrelated/assets/portrait.png",
  ])
    assert.throws(() => assetPath(path), LibraryError);
});

test("rejects malformed identities, platforms and tile records instead of accepting corrupt data", () => {
  for (const mutate of [
    (p) => {
      p.id = 12;
    },
    (p) => {
      p.platforms = [{ network: "instagram", handle: "x", followers: -1 }];
    },
    (p) => {
      p.platforms = [null];
    },
    (p) => {
      p.portrait = 42;
    },
    (p) => {
      p.content[0].id = 0;
    },
    (p) => {
      p.content.push(p.content[0]);
    },
    (p) => {
      p.content[0].views = NaN;
    },
    (p) => {
      p.content[0].aspectRatio = "bad";
    },
    (p) => {
      p.gender = { token: KEY };
    },
    (p) => {
      p.provenance = { token: KEY };
    },
    (p) => {
      p.content[0].captionSettings = { text: { token: KEY } };
    },
    (p) => {
      p.content[0].captionSettings = {
        fill: "url(https://attacker.test/pixel)",
      };
    },
    (p) => {
      p.content[0].captionSettings = { size: Infinity };
    },
    (p) => {
      p.content[0].captionSettings = { visible: "yes" };
    },
    (p) => {
      delete p.content[0].id;
      p.content.push({ ...p.content[0], id: "0" });
    },
  ]) {
    const p = profile();
    mutate(p);
    assert.throws(() => parseLibrary(manifest([p])), LibraryError);
  }
  assert.throws(
    () => parseLibrary(manifest([profile(), profile()])),
    LibraryError,
  );
});

test("legacy tile IDs survive deletion and reordering without changing existing bookmark keys", () => {
  const p = profile();
  const tile = { ...p.content[0] };
  delete tile.id;
  p.content = [
    tile,
    { ...tile, thumb: "assets/talent/second.png" },
    { ...tile, thumb: "assets/talent/third.png" },
  ];
  const canonical = canonicalProfile(p);
  assert.deepEqual(
    canonical.content.map((t) => t.id),
    ["0", "1", "2"],
  );
  const materialized = materializeLibrary([p], emptyLibrary(), null)[0];
  assert.deepEqual(
    materialized.content.map((t) => t.id),
    ["0", "1", "2"],
  );
  const changed = {
    ...canonical,
    content: canonical.content.slice(1).reverse(),
  };
  assert.deepEqual(
    parseLibrary(manifest([changed])).profiles[0].content.map(
      (t) => `${p.id}:${t.id}`,
    ),
    [`${p.id}:2`, `${p.id}:1`],
  );
  assert.equal(
    p.content[0].id,
    undefined,
    "The original catalogue remains untouched",
  );
});

test("oversized catalogues fail before any writes so a saved library always remains readable", async (t) => {
  const api = mockGithub(t, []);
  await rejected(
    saveGithubLibrary(
      KEY,
      { revision: BEFORE, manifest: emptyLibrary() },
      manifest([profile({ bio: "x".repeat(1_000_000) })]),
      [],
    ),
  );
  api.done();
});

test("materialises pinned uploaded assets, pending previews and removals without mutating base data", () => {
  const base = [profile(), profile({ id: "hidden", displayName: "Hidden" })];
  const before = JSON.stringify(base);
  const input = {
    ...manifest([
      profile({ portrait: src("one") }),
      profile({ id: "new-person", displayName: "New" }),
    ]),
    removedTalentIds: ["hidden"],
  };
  const saved = materializeLibrary(base, input, BEFORE);
  assert.deepEqual(
    saved.map((p) => p.id),
    ["june-demo", "new-person"],
  );
  assert.equal(
    saved[0].portrait,
    `https://raw.githubusercontent.com/${LIBRARY_REPO}/${BEFORE}/public/${src("one")}`,
  );
  const pending = materializeLibrary(base, input, BEFORE, {
    [src("one")]: "data:image/png;base64,preview",
  });
  assert.equal(pending[0].portrait, "data:image/png;base64,preview");
  assert.equal(JSON.stringify(base), before);
});

test("atomically commits image, catalogue and retired-upload deletion before advancing only the library ref", async (t) => {
  const old = manifest([profile({ portrait: src("old") })]);
  const input = manifest([profile({ portrait: src("new") })]);
  const steps = saveSteps(
    input,
    [
      {
        path: image("new").path,
        mode: "100644",
        type: "blob",
        sha: "new-image",
      },
      { path: image("old").path, mode: "100644", type: "blob", sha: null },
    ],
    BEFORE,
    old,
  );
  steps.splice(3, 0, {
    path: "/git/blobs",
    method: "POST",
    value: { sha: "new-image" },
    check: ({ body }) =>
      assert.deepEqual(body, { content: PNG, encoding: "base64" }),
  });
  const api = mockGithub(t, steps);
  const saved = await saveGithubLibrary(
    KEY,
    { revision: BEFORE, manifest: old },
    input,
    [image("new")],
  );
  assert.equal(saved.revision, AFTER);
  assert.deepEqual(saved.manifest, parseLibrary(input));
  assert.equal(api.calls.filter((c) => c.path.includes("/git/refs")).length, 1);
  assert.equal(api.calls.at(-1).path, WRITE_REF);
  api.done();
});

test("retains shared uploads when a profile is deleted but another still references the file", async (t) => {
  const shared = src("shared");
  const second = profile({ id: "second", portrait: shared });
  const old = manifest([profile({ portrait: shared }), second]);
  const input = { ...manifest([second]), removedTalentIds: ["june-demo"] };
  const api = mockGithub(t, saveSteps(input, [], BEFORE, old));
  await saveGithubLibrary(KEY, { revision: BEFORE, manifest: old }, input, []);
  api.done();
});

test("stale editors are rejected with no writes and their input draft is untouched", async (t) => {
  const input = manifest([profile()]);
  const draft = JSON.stringify(input);
  const api = mockGithub(t, readSteps(AFTER));
  await assert.rejects(
    saveGithubLibrary(
      KEY,
      { revision: BEFORE, manifest: emptyLibrary() },
      input,
      [],
    ),
    (e) => e instanceof LibraryError && e.status === 409,
  );
  assert.equal(JSON.stringify(input), draft);
  noWrites(api.calls);
  api.done();
});

test("a save racing another commit uses a non-forced update and does not retry/overwrite on rejection", async (t) => {
  const input = manifest([profile()]);
  const steps = saveSteps(input);
  steps.at(-1).status = 422;
  const api = mockGithub(t, steps);
  await assert.rejects(
    saveGithubLibrary(
      KEY,
      { revision: BEFORE, manifest: emptyLibrary() },
      input,
      [],
    ),
    (e) => e instanceof LibraryError && e.status === 422,
  );
  assert.deepEqual(api.calls.at(-1).body, { sha: AFTER, force: false });
  assert.ok(api.calls.every((c) => !c.path.includes("/refs/heads/main")));
  api.done();
});

test("creates the dedicated library branch from main without writing the main ref", async (t) => {
  const input = manifest([profile()]);
  const steps = [
    { path: REF, status: 404 },
    { path: "/git/ref/heads/main", value: { object: { sha: MAIN } } },
    parentStep(MAIN),
    { path: "/git/trees", method: "POST", value: { sha: "new-tree" } },
    {
      path: "/git/commits",
      method: "POST",
      value: { sha: AFTER },
      check: ({ body }) => assert.deepEqual(body.parents, [MAIN]),
    },
    {
      path: "/git/refs",
      method: "POST",
      check: ({ body }) =>
        assert.deepEqual(body, {
          ref: `refs/heads/${LIBRARY_BRANCH}`,
          sha: AFTER,
        }),
    },
  ];
  const api = mockGithub(t, steps);
  assert.equal(
    (
      await saveGithubLibrary(
        KEY,
        { revision: null, manifest: emptyLibrary() },
        input,
        [],
      )
    ).revision,
    AFTER,
  );
  assert.equal(api.calls.filter((c) => c.path.endsWith("/main")).length, 1);
  assert.equal(api.calls.find((c) => c.path.endsWith("/main")).method, "GET");
  api.done();
});

test("branch-creation races fail safely without updating the winner’s branch", async (t) => {
  const steps = [
    { path: REF, status: 404 },
    { path: "/git/ref/heads/main", value: { object: { sha: MAIN } } },
    parentStep(MAIN),
    { path: "/git/trees", method: "POST", value: { sha: "new-tree" } },
    { path: "/git/commits", method: "POST", value: { sha: AFTER } },
    { path: "/git/refs", method: "POST", status: 422 },
  ];
  const api = mockGithub(t, steps);
  await rejected(
    saveGithubLibrary(
      KEY,
      { revision: null, manifest: emptyLibrary() },
      manifest([profile()]),
      [],
    ),
  );
  assert.ok(api.calls.every((c) => c.method !== "PATCH"));
  api.done();
});

test("preflights every upload before any request and rejects malformed, duplicate and oversized payloads", async (t) => {
  const api = mockGithub(t, []);
  const input = manifest([profile({ portrait: src("new") })]);
  for (const uploads of [
    [{ path: "public/index.html", base64: PNG }],
    [{ ...image("new"), base64: "not base64!" }],
    [{ ...image("new"), base64: "====" }],
    [{ ...image("new"), base64: "" }],
    [
      {
        ...image("new"),
        base64: Buffer.from('<svg onload="bad"/>').toString("base64"),
      },
    ],
    [{ ...image("new"), base64: "A".repeat(14_000_000) }],
    [image("new"), image("new")],
    [image("valid"), { ...image("new"), base64: "bad" }],
    [{ path: `${UPLOAD}new.jpg`, base64: PNG }],
  ])
    await rejected(
      saveGithubLibrary(
        KEY,
        { revision: BEFORE, manifest: emptyLibrary() },
        input,
        uploads,
      ),
    );
  api.done();
});

test("rejects a missing new image and attempts to overwrite an existing image before any writes", async (t) => {
  const current = manifest([profile({ portrait: src("old") })]);
  const api = mockGithub(t, [
    ...readSteps(BEFORE, current),
    ...readSteps(BEFORE, current),
  ]);
  await rejected(
    saveGithubLibrary(
      KEY,
      { revision: BEFORE, manifest: current },
      manifest([profile({ portrait: src("missing") })]),
      [],
    ),
  );
  await rejected(
    saveGithubLibrary(KEY, { revision: BEFORE, manifest: current }, current, [
      image("old"),
    ]),
  );
  noWrites(api.calls);
  api.done();
});

test("prepares real PNG bytes with independent names, decoded aspect ratio and closed bitmaps", async (t) => {
  let closes = 0;
  t.mock.method(globalThis, "createImageBitmap", async () => ({
    width: 900,
    height: 1600,
    close: () => closes++,
  }));
  const file = new File([Buffer.from(PNG, "base64")], "My portrait.png", {
    type: "image/png",
  });
  const first = await prepareLibraryImage(file);
  const second = await prepareLibraryImage(file);
  assert.equal(first.ratio, "9/16");
  assert.equal(first.name, "My portrait");
  assert.equal(first.upload.base64, PNG);
  assert.equal(first.preview, `data:image/png;base64,${PNG}`);
  assert.notEqual(first.src, second.src);
  assert.match(first.src, /^assets\/talent\/uploads\/[a-z0-9-]+\.png$/);
  assert.equal(closes, 2);
});

test("rejects unsupported/empty/too-large images and oversized decoded dimensions", async (t) => {
  let closes = 0;
  let decodes = 0;
  t.mock.method(globalThis, "createImageBitmap", async () => {
    decodes++;
    return { width: 10000, height: 10000, close: () => closes++ };
  });
  for (const file of [
    new File(["x"], "test.svg", { type: "image/svg+xml" }),
    new File([], "empty.png", { type: "image/png" }),
    { type: "image/png", size: 10 * 1024 * 1024 + 1 },
  ])
    await rejected(prepareLibraryImage(file));
  assert.equal(decodes, 0);
  await rejected(
    prepareLibraryImage(
      new File([Buffer.from(PNG, "base64")], "big.png", { type: "image/png" }),
    ),
  );
  assert.equal(closes, 1);
});

test("credentials stay in request headers and unknown metadata cannot enter exports or committed data", async (t) => {
  const p = profile();
  p.token = KEY;
  p.accessKey = KEY;
  p.platforms[0].token = KEY;
  p.content[0].accessKey = KEY;
  p.content[0].captionSettings = { visible: false, token: KEY };
  p.referenceImages = [
    { label: "Example", src: "assets/talent/ref.png", token: KEY },
  ];
  p.creativeDirection = {
    summary: "Example",
    identityNotes: [],
    accessKey: KEY,
  };
  p.content[0].generation = { version: "one", approach: "example", token: KEY };
  const input = { ...manifest([p]), token: KEY };
  assert.ok(!JSON.stringify(canonicalProfile(p)).includes(KEY));
  assert.ok(!JSON.stringify(parseLibrary(input)).includes(KEY));
  const api = mockGithub(t, [
    { path: "", value: { permissions: { push: true } } },
    ...saveSteps(input),
  ]);
  await verifyGithubAccess(KEY);
  const saved = await saveGithubLibrary(
    KEY,
    { revision: BEFORE, manifest: emptyLibrary() },
    input,
    [],
  );
  assert.ok(!JSON.stringify(saved).includes(KEY));
  assert.ok(
    !JSON.stringify(
      materializeLibrary([], saved.manifest, saved.revision),
    ).includes(KEY),
  );
  for (const call of api.calls) {
    assert.equal(call.headers.Authorization, `Bearer ${KEY}`);
    assert.ok(!call.url.includes(KEY));
    assert.ok(!JSON.stringify(call.body ?? {}).includes(KEY));
  }
  const source = readFileSync(filename, "utf8");
  assert.doesNotMatch(source, /localStorage|sessionStorage|document\.cookie/);
  const hook = readFileSync(
    new URL("../src/hooks/useTalentLibrary.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(hook, /localStorage|sessionStorage|document\.cookie/);
  api.done();
});

test("private mode uses the same-origin cookie proxy and sends keys only to the connection endpoint", async (t) => {
  const privateApi = loadLibrary(true);
  assert.equal(privateApi.PRIVATE_LIBRARY, true);
  const calls = [];
  const expected = [
    { url: "/api/status", value: { connected: true } },
    {
      url: "/api/connect",
      method: "POST",
      value: { connected: true },
      body: { token: KEY },
    },
    { url: `/api/github${REF}`, status: 404 },
    { url: "/api/status", status: 401 },
  ];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const step = expected[calls.length];
    assert.ok(step, "Unexpected request");
    calls.push({ url, options });
    assert.equal(url, step.url);
    assert.equal(options.method, step.method ?? "GET");
    assert.equal(options.credentials, "same-origin");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers?.Authorization, undefined);
    assert.deepEqual(
      options.body ? JSON.parse(options.body) : undefined,
      step.body,
    );
    assert.ok(!url.includes(KEY));
    return new Response(JSON.stringify(step.value ?? {}), {
      status: step.status ?? 200,
    });
  });
  assert.equal(await privateApi.githubLibraryConnection(), true);
  await privateApi.verifyGithubAccess(KEY);
  assert.deepEqual(await privateApi.readGithubLibrary("private-session-only"), {
    manifest: emptyLibrary(),
    revision: null,
  });
  assert.equal(await privateApi.githubLibraryConnection(), false);
  assert.equal(calls.length, expected.length);
});

test("private saving needs no browser key and private uploads use the authenticated image route", async (t) => {
  const privateApi = loadLibrary(true);
  const input = manifest([profile()]);
  const api = mockGithub(t, saveSteps(input), true);
  assert.equal(
    (
      await privateApi.saveGithubLibrary(
        "",
        { revision: BEFORE, manifest: emptyLibrary() },
        input,
        [],
      )
    ).revision,
    AFTER,
  );
  api.done();
  const privateProfile = profile({
    portrait: src("new"),
    originalPortrait: "/NEWFOAMHOME/ideas-two/assets/masters/studio-moment.png",
  });
  const rendered = privateApi.materializeLibrary(
    [],
    manifest([privateProfile]),
    BEFORE,
  )[0];
  assert.equal(
    rendered.portrait,
    `/api/asset?path=${encodeURIComponent(src("new"))}&ref=${BEFORE}`,
  );
  assert.equal(
    rendered.originalPortrait,
    "/NEWFOAMHOME/ideas-two/assets/masters/studio-moment.png",
  );
  assert.equal(privateApi.canonicalProfile(rendered).portrait, src("new"));
  assert.equal(
    privateApi.canonicalProfile(rendered).originalPortrait,
    "ideas-two/assets/masters/studio-moment.png",
  );
  for (const invalid of [
    "/api/asset?path=assets/talent/uploads/x.png&ref=main",
    `/api/asset?path=assets/talent/uploads/../x.png&ref=${BEFORE}`,
    `/api/asset?path=assets/talent/uploads/x.png&ref=${BEFORE}&token=bad`,
  ])
    assert.throws(() => privateApi.assetPath(invalid), privateApi.LibraryError);
});

test("publication is explicit: legacy drafts stay unpublished and valid replacement maps survive round trips", () => {
  const legacy = manifest([profile({ portrait: src("draft") })]);
  assert.equal(parseLibrary(legacy).websiteReplacements, undefined);
  const map = { "assets/talent/june-c1.webp": src("new") };
  assert.deepEqual(parseLibrary({ ...legacy, websiteReplacements: map }).websiteReplacements, map);
  for (const websiteReplacements of [null, [], "bad",
    { "assets/talent/june-c1.mp4": src("new") },
    { "assets/talent/../index.webp": src("new") },
    { "assets/talent/june-c1.webp": "https://external.example/image.png" },
    { "assets/talent/june-c1.webp": "assets/talent/uploads/a.svg" },
    { "/assets/talent/june-c1.webp": src("new") },
    { [src("old")]: src("new") },
  ]) assert.throws(() => parseLibrary({ ...legacy, websiteReplacements }), LibraryError);
});

test("published uploads survive removal from draft profiles", async (t) => {
  const retained = { ...manifest([]), websiteReplacements: { "assets/talent/june-c1.webp": src("old") } };
  const current = { ...manifest([profile({ portrait: src("old") })]), websiteReplacements: retained.websiteReplacements };
  const api = mockGithub(t, saveSteps(retained, [], BEFORE, current));
  const saved = await saveGithubLibrary(KEY, { revision: BEFORE, manifest: current }, retained, []);
  assert.deepEqual(saved.manifest.websiteReplacements, retained.websiteReplacements);
  api.done();
});

test("a map-only replacement commits its new upload and retires the previous unreferenced upload", async (t) => {
  const current = { ...manifest([]), websiteReplacements: { "assets/talent/june-c1.webp": src("old") } };
  const input = { ...current, websiteReplacements: { "assets/talent/june-c1.webp": src("new") } };
  const steps = saveSteps(input, [
    { path: image("new").path, mode: "100644", type: "blob", sha: "new-image" },
    { path: image("old").path, mode: "100644", type: "blob", sha: null },
  ], BEFORE, current);
  steps.splice(3, 0, { path: "/git/blobs", method: "POST", value: { sha: "new-image" } });
  const api = mockGithub(t, steps);
  const saved = await saveGithubLibrary(KEY, { revision: BEFORE, manifest: current }, input, [image("new")]);
  assert.deepEqual(saved.manifest.websiteReplacements, input.websiteReplacements);
  api.done();
});

test("new website-map uploads cannot be missing and replacement revisions keep the canonical source", async (t) => {
  const current = { ...manifest([]), websiteReplacements: { "assets/talent/june-c1.webp": src("old") } };
  const input = { ...current, websiteReplacements: { "assets/talent/june-c1.webp": src("new") } };
  const api = mockGithub(t, readSteps(BEFORE, current));
  await rejected(saveGithubLibrary(KEY, { revision: BEFORE, manifest: current }, input, []));
  api.done();
});

test("a private save exposes a publication failure without failing the saved catalogue", async (t) => {
  const privateApi = loadLibrary(true);
  const input = manifest([profile()]);
  const steps = saveSteps(input);
  const publication = { revision: AFTER, queued: false, error: "Library saved. Retry website update." };
  steps.at(-1).value = { object: { sha: AFTER }, publication };
  const api = mockGithub(t, steps, true);
  const saved = await privateApi.saveGithubLibrary("", { revision: BEFORE, manifest: emptyLibrary() }, input, []);
  assert.equal(saved.revision, AFTER);
  assert.deepEqual(saved.publication, publication);
  api.done();
});

test("private publication retries send only the pinned revision, and status returns only a validated SHA", async (t) => {
  const privateApi = loadLibrary(true);
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify(url === "/api/publish" ? { revision: AFTER, queued: true } : { revision: AFTER }));
  });
  assert.deepEqual(await privateApi.retryWebsitePublication(AFTER), { revision: AFTER, queued: true });
  assert.equal(calls[0].url, "/api/publish");
  assert.deepEqual(JSON.parse(calls[0].options.body), { revision: AFTER });
  assert.equal(calls[0].options.credentials, "same-origin");
  assert.equal(await privateApi.readWebsitePublication(), AFTER);
  await assert.rejects(privateApi.retryWebsitePublication("main"));
  assert.equal(calls.length, 2);
});

test("website settings previews prefer unsaved image bytes and retain saved revision URLs for artwork and photos", () => {
  const api = loadLibrary(true);
  const uploaded = src("website-artwork");
  assert.equal(api.materializeLibraryImage(uploaded, BEFORE, { [uploaded]: "data:image/png;base64,local-draft" }), "data:image/png;base64,local-draft");
  assert.equal(api.materializeLibraryImage(uploaded, AFTER), `/api/asset?path=${encodeURIComponent(uploaded)}&ref=${AFTER}`);
  assert.equal(api.materializeLibraryImage("assets/campaigns/billboard.webp", AFTER), "/NEWFOAMHOME/assets/campaigns/billboard.webp");
  assert.throws(() => api.materializeLibraryImage("https://other.example/artwork.png", AFTER), api.LibraryError);
});

// Node has no browser decoder; create a replaceable stub, always mocked per test.
if (!("createImageBitmap" in globalThis))
  globalThis.createImageBitmap = async () => {
    throw new Error("Unmocked bitmap decoding");
  };
