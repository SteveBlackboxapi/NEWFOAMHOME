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
    assert.equal(f.calls.at(-1).options.headers, undefined);
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
