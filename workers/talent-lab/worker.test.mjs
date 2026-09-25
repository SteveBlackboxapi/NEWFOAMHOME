import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Test the real handler with an empty generated asset map, without requiring a private build.
const source = (
  await readFile(new URL("./worker.mjs", import.meta.url), "utf8")
).replace(
  /import siteAssets from ['"]\.\/site-assets\.mjs['"];?/,
  "const siteAssets = {};",
);
const { handleRequest, BRANCH, MANIFEST } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const ORIGIN = "https://foam-talent-lab.example";
const PASSWORD = "unit-test-only-password";
const TOKEN = "github_pat_test_secret_never_return_this";
const MAIN = "a".repeat(40),
  BASE_TREE = "b".repeat(40),
  BLOB = "c".repeat(40),
  TREE = "d".repeat(40),
  COMMIT = "e".repeat(40);
const sha256 = async (value) =>
  Buffer.from(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
  ).toString("hex");
async function fixture() {
  const store = new Map();
  const calls = [];
  let head = null;
  let dispatchStatus = 204;
  const env = {
    LAB_PASSWORD_HASH: await sha256(PASSWORD),
    SESSION_SECRET: "test-session-secret-with-at-least-32-characters",
    LIBRARY_SECRETS: {
      async get(key) {
        return store.get(key) ?? null;
      },
      async put(key, value) {
        store.set(key, value);
      },
    },
    LOGIN_RATE_LIMIT: {
      async limit() {
        return { success: true };
      },
    },
  };
  const assets = {
    "/index.html": {
      body: btoa("<html>Private Lab</html>"),
      contentType: "text/html",
    },
    "/assets/private.js": {
      body: btoa("private-code"),
      contentType: "text/javascript",
      encoding: "gzip",
    },
  };
  const fetcher = async (url, options = {}) => {
    // Match workerd: Node also accepts "error", masking a production exception.
    if (options.redirect !== undefined && !["follow", "manual"].includes(options.redirect))
      throw new TypeError("Invalid redirect value: workerd supports follow or manual.");
    calls.push({ url, options });
    const path = new URL(url).pathname.replace(
      "/repos/SteveBlackboxapi/NEWFOAMHOME",
      "",
    );
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : null;
    const reply = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    if (path === "") return reply({ permissions: { push: true } });
    if (path === "/dispatches" && method === "POST")
      return dispatchStatus === 204 ? new Response(null, { status: 204 }) : reply({}, dispatchStatus);
    if (path === `/git/ref/heads/${BRANCH}`)
      return head ? reply({ object: { sha: head } }) : reply({}, 404);
    if (path === "/git/ref/heads/main") return reply({ object: { sha: MAIN } });
    if (path === `/git/commits/${MAIN}`)
      return reply({ tree: { sha: BASE_TREE } });
    if (path === "/git/blobs" && method === "POST")
      return reply({ sha: BLOB }, 201);
    if (path === "/git/trees" && method === "POST")
      return reply({ sha: TREE }, 201);
    if (path === "/git/commits" && method === "POST")
      return reply({ sha: COMMIT }, 201);
    if (
      (path === "/git/refs" && method === "POST") ||
      (path === `/git/refs/heads/${BRANCH}` && method === "PATCH")
    ) {
      head = body.sha;
      return reply({ object: { sha: head } });
    }
    if (path.startsWith("/contents/public/assets/talent/uploads/"))
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { "Content-Type": "application/octet-stream" },
      });
    if (path === `/contents/${MANIFEST}`)
      return reply({
        encoding: "base64",
        content: btoa('{"version":1,"profiles":[],"removedTalentIds":[]}'),
      });
    if (url.startsWith("https://steveblackboxapi.github.io/NEWFOAMHOME/"))
      return new Response("public-asset", {
        headers: { "Content-Type": "image/webp" },
      });
    return reply({}, 404);
  };
  async function send(
    path,
    { method = "GET", cookie, body, origin = ORIGIN, headers = {} } = {},
  ) {
    return handleRequest(
      new Request(`${ORIGIN}${path}`, {
        method,
        headers: {
          ...(cookie ? { Cookie: cookie } : {}),
          ...(method !== "GET" && method !== "HEAD" && origin
            ? { Origin: origin }
            : {}),
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      }),
      env,
      assets,
      fetcher,
    );
  }
  async function login() {
    const result = await send("/api/login", {
      method: "POST",
      body: { password: PASSWORD },
    });
    assert.equal(result.status, 200);
    return result.headers.get("Set-Cookie").split(";")[0];
  }
  async function connect(cookie) {
    const result = await send("/api/connect", {
      method: "POST",
      cookie,
      body: { token: TOKEN },
    });
    assert.equal(result.status, 200);
  }
  return {
    env,
    store,
    calls,
    send,
    login,
    connect,
    setHead(value) {
      head = value;
    },
    setDispatchStatus(value) { dispatchStatus = value; },
  };
}

test("all private pages, bundles, APIs and image routes require authentication", async () => {
  const f = await fixture();
  for (const path of ["/", "/lab/talent/?view=content"]) {
    const r = await f.send(path);
    assert.equal(r.status, 200);
    assert.match(await r.text(), /type="password"/);
  }
  for (const path of [
    "/assets/private.js",
    "/assets/talent/photo.webp",
    "/ideas-two/source.png",
    "/fonts/founders.woff2",
    "/api/status",
    "/api/github/git/ref/heads/main",
    `/api/asset?path=assets/talent/uploads/test.png&ref=${MAIN}`,
  ])
    assert.equal((await f.send(path)).status, 401);
  assert.equal(f.calls.length, 0);
});
test("missing configuration fails closed", async () => {
  const f = await fixture();
  delete f.env.SESSION_SECRET;
  assert.equal((await f.send("/lab/talent/")).status, 503);
});
test("video byte ranges stay authenticated and preserve playback and seeking responses", async () => {
  const f = await fixture();
  const cookie = await f.login();
  const upstreamCalls = [];
  const sendVideo = (headers, authenticated = true, method = "GET") =>
    handleRequest(
      new Request(`${ORIGIN}/assets/talent/clip.webm`, {
        method,
        headers: { ...headers, ...(authenticated ? { Cookie: cookie } : {}) },
      }),
      f.env,
      {},
      async (url, options) => {
        upstreamCalls.push({ url, options });
        const range = options.headers.Range;
        if (range === "bytes=9000-")
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": "bytes */1000", "Accept-Ranges": "bytes" },
          });
        const partial = range === "bytes=200-203";
        return new Response(method === "HEAD" ? null : partial ? "part" : "whole", {
          status: partial ? 206 : 200,
          headers: {
            "Content-Type": "video/webm",
            "Content-Length": partial ? "4" : "5",
            "Accept-Ranges": "bytes",
            ETag: '"video-v1"',
            ...(partial ? { "Content-Range": "bytes 200-203/1000" } : {}),
          },
        });
      },
    );
  assert.equal((await sendVideo({ Range: "bytes=0-" }, false)).status, 401);
  assert.equal(upstreamCalls.length, 0, "unauthenticated requests never reach the source");

  const partial = await sendVideo({ Range: "bytes=200-203", "If-Range": '"video-v1"' });
  assert.equal(partial.status, 206);
  assert.equal(partial.headers.get("Content-Type"), "video/webm");
  assert.equal(partial.headers.get("Content-Range"), "bytes 200-203/1000");
  assert.equal(partial.headers.get("Content-Length"), "4");
  assert.equal(partial.headers.get("Accept-Ranges"), "bytes");
  assert.equal(partial.headers.get("ETag"), '"video-v1"');
  assert.match(partial.headers.get("Cache-Control"), /no-store, private/);
  assert.equal(await partial.text(), "part");
  assert.equal(upstreamCalls[0].url, "https://steveblackboxapi.github.io/NEWFOAMHOME/assets/talent/clip.webm");
  assert.deepEqual(upstreamCalls[0].options.headers, {
    Range: "bytes=200-203",
    "If-Range": '"video-v1"',
  }, "only byte-range headers are forwarded, never the private session");

  const unsatisfiable = await sendVideo({ Range: "bytes=9000-" });
  assert.equal(unsatisfiable.status, 416);
  assert.equal(unsatisfiable.headers.get("Content-Range"), "bytes */1000");
  assert.equal(unsatisfiable.headers.get("Accept-Ranges"), "bytes");

  const whole = await sendVideo({});
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get("Content-Range"), null);
  assert.equal(await whole.text(), "whole");
  const ignoredRange = await sendVideo({ Range: "bytes=0-" });
  assert.equal(ignoredRange.status, 200, "an origin that ignores Range still returns a full response");
  assert.equal(await ignoredRange.text(), "whole");
  const head = await sendVideo({ Range: "bytes=200-203" }, true, "HEAD");
  assert.equal(head.status, 200);
  assert.equal(head.body, null);
  assert.equal(head.headers.get("Content-Length"), "5");
  assert.deepEqual(upstreamCalls.at(-1).options.headers, {}, "Range is a GET-only header");
});
test("reviewed WebM media can use a fixed repository revision only after authentication", async () => {
  const f = await fixture();
  f.env.LAB_MEDIA_REF = MAIN;
  const cookie = await f.login();
  const calls = [];
  const mediaPaths = [
    "/assets/talent/aria-quen-v2/aria-quen-v2-makeup.webm",
    "/assets/talent/lena-croft-v2/lena-croft-grwm.webm",
    "/assets/talent/nia-brooks/nia-brooks-skincare.webm",
    "/assets/talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh.webm",
  ];
  const sendMedia = (path, authenticated = true) => handleRequest(
    new Request(`${ORIGIN}${path}`, {
      headers: {
        Range: "bytes=0-3",
        "If-Range": '"reviewed-video"',
        ...(authenticated ? { Cookie: cookie } : {}),
      },
    }),
    f.env,
    {},
    async (url, options) => {
      calls.push({ url, options });
      return new Response("clip", {
        status: 206,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Range": "bytes 0-3/100",
          "Accept-Ranges": "bytes",
          "Content-Length": "4",
        },
      });
    },
  );
  for (const path of mediaPaths)
    assert.equal((await sendMedia(path, false)).status, 401);
  assert.equal(calls.length, 0);
  for (const path of mediaPaths) {
    const response = await sendMedia(path);
    assert.equal(calls.at(-1).url, `https://raw.githubusercontent.com/SteveBlackboxapi/NEWFOAMHOME/${MAIN}/public${path}`);
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("Content-Type"), "video/webm");
    assert.equal(response.headers.get("Content-Range"), "bytes 0-3/100");
    assert.match(response.headers.get("Cache-Control"), /no-store, private/);
    assert.deepEqual(calls.at(-1).options.headers, {
      Range: "bytes=0-3",
      "If-Range": '"reviewed-video"',
    });
    assert.equal(calls.at(-1).options.redirect, "manual");
  }
  for (const path of [
    "/assets/talent/unreviewed.webm",
    "/assets/talent/aria-quen-v2/aria-quen-v2-makeup.mp4",
    "/assets/talent/uploads/custom.webm",
    "/assets/talent/portrait.webp",
  ]) {
    await sendMedia(`${path}?ref=${COMMIT}&repo=other/repository`);
    assert.equal(calls.at(-1).url, `https://steveblackboxapi.github.io/NEWFOAMHOME${path}`);
  }
  await sendMedia(`${mediaPaths[0]}?ref=${COMMIT}&repo=other/repository`);
  assert.equal(calls.at(-1).url, `https://raw.githubusercontent.com/SteveBlackboxapi/NEWFOAMHOME/${MAIN}/public${mediaPaths[0]}`, "query parameters cannot change repository or revision");
  for (const ref of [undefined, "main", "../other/repository", "A".repeat(40), `${MAIN}/extra`]) {
    f.env.LAB_MEDIA_REF = ref;
    await sendMedia(mediaPaths[0]);
    assert.equal(calls.at(-1).url, `https://steveblackboxapi.github.io/NEWFOAMHOME${mediaPaths[0]}`, "missing or invalid revision keeps the existing origin");
  }
});
test("login rejects wrong password and sets a twelve-hour secure HttpOnly host cookie", async () => {
  const f = await fixture();
  assert.equal(
    (
      await f.send("/api/login", {
        method: "POST",
        body: { password: "wrong" },
      })
    ).status,
    401,
  );
  const r = await f.send("/api/login", {
    method: "POST",
    body: { password: PASSWORD },
  });
  const cookie = r.headers.get("Set-Cookie");
  assert.match(cookie, /^__Host-foam_lab=/);
  assert.match(cookie, /Secure; HttpOnly; SameSite=Strict; Max-Age=43200/);
  const status = await f.send("/api/status", { cookie: cookie.split(";")[0] });
  assert.deepEqual(await status.json(), { connected: false });
});
test("forged, expired, and password-rotation sessions cannot read private assets", async () => {
  const f = await fixture();
  const cookie = await f.login();
  assert.equal(
    (await f.send("/assets/private.js", { cookie: `${cookie}bad` })).status,
    401,
  );
  const payload = Buffer.from(
    JSON.stringify({ v: 1, exp: 1, nonce: "expired" }),
  ).toString("base64url");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(f.env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = Buffer.from(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${payload}.${f.env.LAB_PASSWORD_HASH}`),
    ),
  ).toString("base64url");
  assert.equal(
    (
      await f.send("/assets/private.js", {
        cookie: `__Host-foam_lab=${payload}.${signature}`,
      })
    ).status,
    401,
  );
  f.env.LAB_PASSWORD_HASH = await sha256("rotated");
  assert.equal((await f.send("/assets/private.js", { cookie })).status, 401);
});
test("login rate limiting and Origin checks cover mutations including login/logout", async () => {
  const f = await fixture();
  const cookie = await f.login();
  for (const origin of [null, "https://attacker.example"])
    for (const path of [
      "/api/login",
      "/api/connect",
      "/api/logout",
      "/api/github/git/blobs",
    ])
      assert.equal(
        (await f.send(path, { method: "POST", cookie, origin, body: {} }))
          .status,
        403,
      );
  f.env.LOGIN_RATE_LIMIT.limit = async () => ({ success: false });
  assert.equal(
    (
      await f.send("/api/login", {
        method: "POST",
        body: { password: PASSWORD },
      })
    ).status,
    429,
  );
});
test("authenticated assets use no-store, preserve gzip, root redirects, logout only clears cookie", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  const r = await f.send("/assets/private.js", { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Content-Encoding"), "gzip");
  assert.match(r.headers.get("Cache-Control"), /no-store/);
  assert.equal(r.headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.match(
    await (await f.send("/lab/talent/?view=content", { cookie })).text(),
    /Private Lab/,
  );
  assert.equal(
    (await f.send("/assets/private.js", { method: "HEAD", cookie })).body,
    null,
  );
  const root = await f.send("/", { cookie });
  assert.equal(root.status, 303);
  assert.equal(root.headers.get("Location"), "/lab/talent/?view=content");
  const logout = await f.send("/api/logout", { method: "POST", cookie });
  assert.match(logout.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.ok(f.store.has("github-token-v1"));
});
test("ordinary login form redirects after sign-in and public source assets need no GitHub token", async () => {
  const f = await fixture();
  const request = new Request(`${ORIGIN}/api/login`, {
    method: "POST",
    headers: {
      Origin: ORIGIN,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ password: PASSWORD }),
  });
  const login = await handleRequest(request, f.env);
  assert.equal(login.status, 303);
  assert.equal(login.headers.get("Location"), "/lab/talent/?view=content");
  const cookie = login.headers.get("Set-Cookie").split(";")[0];
  for (const path of [
    "/assets/talent/portrait.webp",
    "/ideas-two/talent/prompts/source.md",
    "/fonts/founders.woff2",
  ]) {
    const result = await f.send(path, { cookie });
    assert.equal(result.status, 200);
    assert.equal(
      f.calls.at(-1).url,
      `https://steveblackboxapi.github.io/NEWFOAMHOME${path}`,
    );
    assert.deepEqual(f.calls.at(-1).options.headers, {});
  }
});
test("GitHub token is verified, encrypted in KV, never echoed, and never needed for public reads", async () => {
  const f = await fixture();
  const cookie = await f.login();
  assert.equal(
    (await f.send("/api/github/git/ref/heads/main", { cookie })).status,
    200,
  );
  assert.equal(f.calls[0].options.headers.Authorization, undefined);
  const connect = await f.send("/api/connect", {
    method: "POST",
    cookie,
    body: { token: TOKEN },
  });
  assert.deepEqual(await connect.json(), { connected: true });
  assert.ok(!f.store.get("github-token-v1").includes(TOKEN));
  assert.deepEqual(await (await f.send("/api/status", { cookie })).json(), {
    connected: true,
  });
  await f.send("/api/github/git/ref/heads/main", {
    cookie,
    headers: { Authorization: "Bearer attacker-token" },
  });
  assert.equal(f.calls.at(-1).options.headers.Authorization, `Bearer ${TOKEN}`);
});
test("GitHub proxy rejects other repositories, branches, contents and deletion endpoints", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  for (const path of [
    "/api/github/../../user",
    "/api/github/repos/other/private",
    "/api/github/git/ref/heads/secret",
    "/api/github/contents/package.json",
    "/api/github/git/ref/heads/main?anything=yes",
  ])
    assert.ok([403, 404].includes((await f.send(path, { cookie })).status));
  assert.equal(
    (
      await f.send("/api/github/git/refs/heads/main", {
        method: "PATCH",
        cookie,
        body: { sha: COMMIT, force: false },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await f.send(`/api/github/git/refs/heads/${BRANCH}`, {
        method: "DELETE",
        cookie,
      })
    ).status,
    415,
  );
});
test("arbitrary tree paths, base trees, executable entries and unapproved commits are rejected", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  const manifest = {
    path: MANIFEST,
    mode: "100644",
    type: "blob",
    content: '{"version":1,"profiles":[],"removedTalentIds":[]}',
  };
  for (const entry of [
    { ...manifest, path: ".github/workflows/pwn.yml" },
    { ...manifest, path: "public/assets/talent/uploads/../evil.png" },
    { ...manifest, mode: "120000" },
    { ...manifest, path: "public/assets/talent/uploads/evil.svg" },
  ])
    assert.equal(
      (
        await f.send("/api/github/git/trees", {
          method: "POST",
          cookie,
          body: { base_tree: BASE_TREE, tree: [entry] },
        })
      ).status,
      403,
    );
  assert.equal(
    (
      await f.send("/api/github/git/trees", {
        method: "POST",
        cookie,
        body: { base_tree: "f".repeat(40), tree: [manifest] },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await f.send(`/api/github/git/refs/heads/${BRANCH}`, {
        method: "PATCH",
        cookie,
        body: { sha: COMMIT, force: true },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await f.send(`/api/github/git/refs/heads/${BRANCH}`, {
        method: "PATCH",
        cookie,
        body: { sha: COMMIT, force: false },
      })
    ).status,
    409,
  );
});
test("approved image/catalogue/tree/commit flow can create only the library branch", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  const blob = await f.send("/api/github/git/blobs", {
    method: "POST",
    cookie,
    body: {
      content: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString(
        "base64",
      ),
      encoding: "base64",
    },
  });
  assert.equal(blob.status, 201);
  const tree = await f.send("/api/github/git/trees", {
    method: "POST",
    cookie,
    body: {
      base_tree: BASE_TREE,
      tree: [
        {
          path: "public/assets/talent/uploads/test.png",
          mode: "100644",
          type: "blob",
          sha: BLOB,
        },
        {
          path: MANIFEST,
          mode: "100644",
          type: "blob",
          content: '{"version":1,"profiles":[],"removedTalentIds":[]}',
        },
      ],
    },
  });
  assert.equal(tree.status, 201);
  const wrongParent = await f.send("/api/github/git/commits", {
    method: "POST",
    cookie,
    body: { message: "Save", tree: TREE, parents: ["f".repeat(40)] },
  });
  assert.equal(wrongParent.status, 403);
  assert.equal(
    (
      await f.send("/api/github/git/commits", {
        method: "POST",
        cookie,
        body: { message: "Save", tree: TREE, parents: [MAIN] },
      })
    ).status,
    201,
  );
  f.setHead("f".repeat(40));
  assert.equal(
    (
      await f.send("/api/github/git/refs", {
        method: "POST",
        cookie,
        body: { ref: `refs/heads/${BRANCH}`, sha: COMMIT },
      })
    ).status,
    409,
  );
  f.setHead(null);
  assert.equal(
    (
      await f.send("/api/github/git/refs", {
        method: "POST",
        cookie,
        body: { ref: `refs/heads/${BRANCH}`, sha: COMMIT },
      })
    ).status,
    201,
  );
  assert.ok(
    f.calls.every((call) =>
      call.url.startsWith(
        "https://api.github.com/repos/SteveBlackboxapi/NEWFOAMHOME",
      ),
    ),
  );
});
test("upload image proxy scopes filenames and immutable revisions and authenticates before fetching", async () => {
  const f = await fixture();
  const cookie = await f.login();
  const good = `/api/asset?path=assets/talent/uploads/test.png&ref=${MAIN}`;
  const r = await f.send(good, { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("Content-Type"), "image/png");
  assert.equal(
    (
      await f.send(
        `/api/asset?path=assets/talent/uploads/test.svg&ref=${MAIN}`,
        { cookie },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await f.send("/api/asset?path=assets/talent/uploads/test.png&ref=main", {
        cookie,
      })
    ).status,
    403,
  );
  assert.equal(
    (await f.send(`/api/asset?path=package.json&ref=${MAIN}`, { cookie }))
      .status,
    403,
  );
});

async function approveLibraryCommit(f, cookie) {
  await f.send("/api/github/git/trees", {
    method: "POST", cookie, body: { base_tree: BASE_TREE, tree: [{
      path: MANIFEST, mode: "100644", type: "blob",
      content: JSON.stringify({ version: 1, profiles: [], removedTalentIds: [], websiteReplacements: {
        "assets/talent/demo.webp": "assets/talent/uploads/new.webp",
      } }),
    }] },
  });
  await f.send("/api/github/git/commits", {
    method: "POST", cookie, body: { message: "Save", tree: TREE, parents: [MAIN] },
  });
}

test("successful library save queues only the fixed website event with the committed SHA", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  await approveLibraryCommit(f, cookie);
  const result = await f.send("/api/github/git/refs", {
    method: "POST", cookie, body: { ref: `refs/heads/${BRANCH}`, sha: COMMIT },
  });
  assert.equal(result.status, 201);
  assert.deepEqual((await result.json()).publication, { revision: COMMIT, queued: true });
  const dispatch = f.calls.at(-1);
  assert.equal(dispatch.url, "https://api.github.com/repos/SteveBlackboxapi/NEWFOAMHOME/dispatches");
  assert.deepEqual(JSON.parse(dispatch.options.body), {
    event_type: "talent-library-saved", client_payload: { libraryRevision: COMMIT },
  });
  assert.equal(dispatch.options.headers.Authorization, `Bearer ${TOKEN}`);
});

test("a failed publication trigger preserves save success and supports a scoped retry", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  await approveLibraryCommit(f, cookie);
  f.setDispatchStatus(503);
  const result = await f.send("/api/github/git/refs", {
    method: "POST", cookie, body: { ref: `refs/heads/${BRANCH}`, sha: COMMIT },
  });
  assert.equal(result.status, 201);
  const saved = await result.json();
  assert.equal(saved.object.sha, COMMIT);
  assert.equal(saved.publication.queued, false);
  assert.match(saved.publication.error, /Library saved/);
  assert.ok(!JSON.stringify(saved).includes(TOKEN));
  f.setDispatchStatus(204);
  const retry = await f.send("/api/publish", { method: "POST", cookie, body: { revision: COMMIT } });
  assert.deepEqual(await retry.json(), { revision: COMMIT, queued: true });
});

test("publication retries require auth, origin, exact current revision and fixed payload", async () => {
  const f = await fixture();
  const cookie = await f.login();
  assert.equal((await f.send("/api/publish", { method: "POST", body: { revision: COMMIT } })).status, 401);
  assert.equal((await f.send("/api/publish", { method: "POST", cookie, origin: "https://elsewhere.example", body: { revision: COMMIT } })).status, 403);
  assert.equal((await f.send("/api/publish", { method: "POST", cookie, body: { revision: COMMIT } })).status, 409);
  await f.connect(cookie);
  f.setHead(COMMIT);
  for (const body of [{ revision: "main" }, { revision: COMMIT, event_type: "other" }, { revision: COMMIT, repository: "other/repo" }])
    assert.equal((await f.send("/api/publish", { method: "POST", cookie, body })).status, 400);
  assert.equal((await f.send("/api/publish", { method: "POST", cookie, body: { revision: MAIN } })).status, 409);
  assert.equal((await f.send("/api/github/dispatches", { method: "POST", cookie, body: { event_type: "anything" } })).status, 403);
  assert.ok(f.calls.every((call) => !call.url.endsWith("/dispatches")));
});

test("the library tree rejects malformed publication maps before saving Git objects", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  for (const websiteReplacements of [null, [], { "assets/talent/demo.webp": "https://attacker.example/a.png" },
    { "assets/talent/demo.mp4": "assets/talent/uploads/new.png" },
    { "assets/../demo.webp": "assets/talent/uploads/new.png" }]) {
    const result = await f.send("/api/github/git/trees", { method: "POST", cookie, body: {
      base_tree: BASE_TREE, tree: [{ path: MANIFEST, type: "blob", mode: "100644", content: JSON.stringify({
        version: 1, profiles: [], removedTalentIds: [], websiteReplacements,
      }) }],
    } });
    assert.equal(result.status, 400);
  }
  assert.ok(f.calls.every((call) => !call.url.endsWith("/git/trees")));
});

test("a scoped image save preserves independent page and section replacements and publishes its commit", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  const websitePlacementReplacements = {
    [JSON.stringify(["assets/talent/demo.webp", "/", "Featured creators"])]: "assets/talent/uploads/home.webp",
    [JSON.stringify(["assets/talent/demo.webp", "/content-creation", "Featured creators"])]: "assets/talent/uploads/content.webp",
    [JSON.stringify(["assets/talent/demo.webp", "/content-creation", "Campaigns & collaborations"])]: "assets/talent/uploads/campaign.png",
  };
  const catalogue = { version: 1, profiles: [], removedTalentIds: [], websitePlacementReplacements };
  const tree = await f.send("/api/github/git/trees", { method: "POST", cookie, body: {
    base_tree: BASE_TREE,
    tree: [{ path: MANIFEST, type: "blob", mode: "100644", content: JSON.stringify(catalogue) }],
  } });
  assert.equal(tree.status, 201);
  const upstreamTree = f.calls.find((call) => call.url.endsWith("/git/trees"));
  assert.deepEqual(JSON.parse(JSON.parse(upstreamTree.options.body).tree[0].content), catalogue);
  assert.equal((await f.send("/api/github/git/commits", {
    method: "POST", cookie, body: { message: "Save page images", tree: TREE, parents: [MAIN] },
  })).status, 201);
  const saved = await f.send("/api/github/git/refs", {
    method: "POST", cookie, body: { ref: `refs/heads/${BRANCH}`, sha: COMMIT },
  });
  assert.equal(saved.status, 201);
  assert.deepEqual((await saved.json()).publication, { revision: COMMIT, queued: true });
});

test("the library tree rejects malformed scoped image maps before saving Git objects", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  const source = "assets/talent/demo.webp";
  const upload = "assets/talent/uploads/new.webp";
  const key = JSON.stringify([source, "/", "Featured creators"]);
  const invalidKeys = [
    "not JSON", JSON.stringify({ source, route: "/", section: "Featured creators" }),
    JSON.stringify([source, "/"]), JSON.stringify([source, "/", "Featured creators", "extra"]),
    JSON.stringify([source, "/", "Featured creators"], null, 2),
    key.replace("assets", "\\u0061ssets"),
    ...[
      null, "/assets/talent/demo.webp", "public/assets/talent/demo.webp", "https://example.com/demo.webp",
      "assets/talent/uploads/demo.webp", "assets/../demo.webp", "assets/./demo.webp", "assets//demo.webp",
      "assets/demo.svg", "assets/demo.mp4", "assets/demo.webp\n", "assets/demo.webp\u2028",
    ].map((badSource) => JSON.stringify([badSource, "/", "Featured creators"])),
    ...[
      null, "", "content", "//content", "/content//work", "/content/../work", "/content/./work",
      "/content?tab=work", "/content#work", "/content%2fwork", "/content work", "/content\n", "/content\u2028", `/${"x".repeat(200)}`,
    ].map((route) => JSON.stringify([source, route, "Featured creators"])),
    ...[null, "", "   ", "\t", "Featured\ncreators", "Featured\u0000creators", "Featured\u007fcreators", "x".repeat(201)]
      .map((section) => JSON.stringify([source, "/", section])),
  ];
  const invalidMaps = [
    null, [], "invalid", ...invalidKeys.map((badKey) => ({ [badKey]: upload })),
    ...[null, 12, "https://example.com/new.webp", "public/assets/talent/uploads/new.webp",
      "assets/talent/uploads/../new.webp", "assets/talent/uploads/new.svg", "assets/talent/uploads/new.jpeg",
      "assets/talent/uploads/new.webp\n", "assets/talent/uploads/new.webp\u2028"]
      .map((badUpload) => ({ [key]: badUpload })),
    Object.fromEntries(Array.from({ length: 3001 }, (_, index) => [JSON.stringify([source, "/", `Section ${index}`]), upload])),
  ];
  for (const [index, websitePlacementReplacements] of invalidMaps.entries()) {
    const result = await f.send("/api/github/git/trees", { method: "POST", cookie, body: {
      base_tree: BASE_TREE, tree: [{ path: MANIFEST, type: "blob", mode: "100644", content: JSON.stringify({
        version: 1, profiles: [], removedTalentIds: [], websitePlacementReplacements,
      }) }],
    } });
    assert.equal(result.status, 400, `Malformed placement map ${index}`);
  }
  assert.ok(f.calls.every((call) => !call.url.endsWith("/git/trees")));
});

test("scoped image maps accept empty maps and the documented size and label boundaries", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  for (const websitePlacementReplacements of [
    {},
    Object.fromEntries(Array.from({ length: 3000 }, (_, index) => [
      JSON.stringify(["assets/artwork/Campaign cover.jpeg", `/${"x".repeat(199)}`, `Section ${index}`.padEnd(200, " ")]),
      "assets/talent/uploads/new.jpg",
    ])),
  ]) {
    const result = await f.send("/api/github/git/trees", { method: "POST", cookie, body: {
      base_tree: BASE_TREE, tree: [{ path: MANIFEST, type: "blob", mode: "100644", content: JSON.stringify({
        version: 1, profiles: [], removedTalentIds: [], websitePlacementReplacements,
      }) }],
    } });
    assert.equal(result.status, 201);
  }
});

test("publication status reads only the public marker after authentication without forwarding credentials", async () => {
  const f = await fixture();
  assert.equal((await f.send("/api/publication")).status, 401);
  const cookie = await f.login();
  const upstreamCalls = [];
  const result = await handleRequest(new Request(`${ORIGIN}/api/publication`, { headers: { Cookie: cookie } }), f.env, {}, async (url, options) => {
    upstreamCalls.push({ url, options });
    return new Response(JSON.stringify({ libraryRevision: COMMIT, replacementCount: 1 }));
  });
  assert.deepEqual(await result.json(), { revision: COMMIT });
  assert.match(upstreamCalls[0].url, /^https:\/\/steveblackboxapi.github.io\/NEWFOAMHOME\/website-publication.json\?check=\d+$/);
  assert.deepEqual(upstreamCalls[0].options.headers, { "Cache-Control": "no-cache" });
  assert.equal(upstreamCalls[0].options.redirect, "manual");
});
test("upstream redirects are rejected without forwarding locations or access keys", async () => {
  const f = await fixture();
  const cookie = await f.login();
  await f.connect(cookie);
  for (const [path, expected] of [
    ["/api/github/git/ref/heads/main", 502],
    [`/api/asset?path=assets/talent/uploads/example.webp&ref=${COMMIT}`, 502],
    ["/assets/talent/example.webp", 404],
    ["/api/publication", 200],
  ]) {
    const calls = [];
    const result = await handleRequest(new Request(`${ORIGIN}${path}`, { headers: { Cookie: cookie } }), f.env, {}, async (url, options) => {
      calls.push({ url, options });
      assert.equal(options.redirect, "manual");
      return new Response("untrusted-upstream-body", { status: 302, headers: { Location: "https://attacker.example/capture" } });
    });
    assert.equal(result.status, expected, path);
    assert.equal(calls.length, 1, path);
    assert.equal(result.headers.get("Location"), null);
    const body = await result.text();
    assert.ok(!body.includes("attacker.example") && !body.includes("untrusted-upstream-body") && !body.includes(TOKEN));
    if (path === "/api/publication") assert.deepEqual(JSON.parse(body), { revision: null });
  }
});
test("streaming body limit applies even without a Content-Length header", async () => {
  const f = await fixture();
  assert.equal(
    (
      await f.send("/api/login", {
        method: "POST",
        body: { password: "x".repeat(3000) },
      })
    ).status,
    413,
  );
});
