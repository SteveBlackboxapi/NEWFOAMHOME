import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import defaultWorker, { createWorker, normalizeEmail, verifyAccessIdentity } from "./worker.mjs";

const ORIGIN = "https://archive.example.workers.dev";
const OWNER = "owner@example.com";
const VIEWER = "viewer@example.com";
const NOW = () => Math.floor(Date.now() / 1000);

function fixture() {
  const sql = new DatabaseSync(":memory:");
  sql.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  const assetRequests = [];
  let reads = 0;
  const DB = {
    prepare(query) {
      const statement = {
        query, values: [],
        bind(...values) { return { ...statement, values }; },
        async first() { reads++; return sql.prepare(this.query).get(...this.values) ?? null; },
        async all() { return { results: sql.prepare(this.query).all(...this.values) }; },
        async run() { const result = sql.prepare(this.query).run(...this.values); return { meta: { changes: Number(result.changes) } }; },
      };
      return statement;
    },
    async batch(statements) {
      sql.exec("BEGIN");
      try {
        const result = [];
        for (const statement of statements) result.push(await statement.run());
        sql.exec("COMMIT");
        return result;
      } catch (error) { sql.exec("ROLLBACK"); throw error; }
    },
  };
  const env = {
    ACCESS_TEAM_DOMAIN: "https://test-team.cloudflareaccess.com",
    ACCESS_AUD: "archive-test-audience",
    APP_ORIGIN: ORIGIN,
    OWNER_EMAIL: OWNER,
    CSRF_SECRET: "test-only-csrf-secret-with-more-than-32-characters",
    DB,
    ASSETS: {
      async fetch(request) {
        assetRequests.push(request);
        const partial = request.headers.has("Range");
        return new Response(request.method === "HEAD" ? null : partial ? "part" : "private asset", {
          status: partial ? 206 : 200,
          headers: {
            "Content-Type": "video/mp4", "Content-Length": partial ? "4" : "13",
            "Accept-Ranges": "bytes", ...(partial ? { "Content-Range": "bytes 0-3/13" } : {}),
            "Cache-Control": "public, max-age=31536000", ETag: "old-public-etag",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  };
  // Only this test-created handler accepts a test identity. The default export always verifies Access JWTs.
  const worker = createWorker({ verifyIdentity: async request => {
    const email = request.headers.get("X-Test-Email");
    if (!email) throw new Error("Not signed in");
    return { email, sub: request.headers.get("X-Test-Subject") ?? `subject:${email}`, exp: NOW() + 7200 };
  } });
  async function send(path, { email = OWNER, method = "GET", body, headers = {}, csrf, origin = ORIGIN, workerOverride = worker, urlOrigin = ORIGIN } = {}) {
    return workerOverride.fetch(new Request(`${urlOrigin}${path}`, {
      method,
      headers: {
        ...(email ? { "X-Test-Email": email } : {}),
        ...(!["GET", "HEAD"].includes(method) && origin ? { Origin: origin } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(csrf ? { "X-CSRF-Token": csrf } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}),
    }), env);
  }
  async function csrf() { return (await (await send("/api/session")).json()).csrfToken; }
  function addViewer(email = VIEWER) { sql.prepare("INSERT INTO archive_viewers VALUES (?, ?, ?)").run(email, new Date().toISOString(), OWNER); }
  const viewers = () => sql.prepare("SELECT * FROM archive_viewers ORDER BY email").all();
  const audit = () => sql.prepare("SELECT * FROM archive_access_audit ORDER BY id").all();
  return { env, worker, send, csrf, addViewer, viewers, audit, sql, assetRequests, reads: () => reads };
}

test("every page, API and asset request fails closed without authentication", async () => {
  const f = fixture();
  for (const path of ["/", "/access", "/api/session", "/api/access", "/NEWFOAMHOME/archive-sept-2026/pages/", "/assets/private.js", "/photo.webp", "/video.mp4", "/foam-media-sw.js"]) {
    for (const method of ["GET", "HEAD"]) {
      const response = await f.send(path, { email: null, method, headers: { Range: "bytes=0-3" } });
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.match(response.headers.get("Cache-Control"), /private, no-store/);
      if (method === "HEAD") assert.equal(await response.text(), "");
    }
  }
  assert.equal(f.assetRequests.length, 0);
  assert.equal(f.reads(), 0);
});

test("production handler rejects test identities, fake email headers and unsigned JWTs", async () => {
  const f = fixture();
  for (const headers of [{}, { "Cf-Access-Authenticated-User-Email": OWNER }, { "Cf-Access-Jwt-Assertion": "fake.jwt.token" }]) {
    assert.equal((await f.send("/private.js", { workerOverride: defaultWorker, headers })).status, 401);
  }
  assert.equal(f.assetRequests.length, 0);
});

test("missing configuration and an alternate hostname cannot expose files", async () => {
  for (const key of ["ACCESS_TEAM_DOMAIN", "ACCESS_AUD", "APP_ORIGIN", "OWNER_EMAIL", "CSRF_SECRET", "DB", "ASSETS"]) {
    const f = fixture();
    delete f.env[key];
    assert.equal((await f.send("/private.js")).status, 503, key);
    assert.equal(f.assetRequests.length, 0);
  }
  const f = fixture();
  assert.equal((await f.send("/private.js", { urlOrigin: "https://preview.example.workers.dev" })).status, 403);
});

test("verified but unapproved email has no access and sees no owner/member list", async () => {
  const f = fixture();
  for (const path of ["/", "/access", "/api/session", "/api/access", "/private.js"]) {
    const response = await f.send(path, { email: "stranger@example.com" });
    assert.equal(response.status, 403);
    assert.ok(!(await response.text()).includes(OWNER));
  }
  assert.equal(f.assetRequests.length, 0);
});

test("owner is permanent and viewers can view but cannot manage access", async () => {
  const f = fixture();
  assert.equal((await f.send("/")).status, 200);
  assert.equal(f.viewers().length, 0);
  f.addViewer();
  assert.equal((await f.send("/", { email: VIEWER })).status, 200);
  const session = await (await f.send("/api/session", { email: VIEWER })).json();
  assert.deepEqual(session, { email: VIEWER, isOwner: false, csrfToken: null });
  for (const path of ["/access", "/api/access"]) {
    for (const method of ["GET", "POST", "DELETE"]) {
      assert.equal((await f.send(path, { email: VIEWER, method })).status, path === "/access" && method !== "GET" ? 405 : 403);
    }
  }
  assert.equal(f.audit().length, 0);
});

test("unapproved browser visitors get an invite-only page and can switch email", async () => {
  const f = fixture();
  const response = await f.send("/", { email: "stranger@example.com", headers: { Accept: "text/html" } });
  assert.equal(response.status, 403);
  assert.match(response.headers.get("Content-Type"), /text\/html/);
  const html = await response.text();
  assert.match(html, /invite-only/);
  assert.ok(!html.includes(OWNER));
  assert.ok(!html.includes("/NEWFOAMHOME/archive-sept-2026/pages/"));
  const logout = await f.send("/logout", { email: "stranger@example.com" });
  assert.equal(logout.status, 302);
  assert.equal(logout.headers.get("Location"), "/cdn-cgi/access/logout");
  assert.equal(f.assetRequests.length, 0);
});

test("authorized range and HEAD requests stream through without public caching", async () => {
  const f = fixture();
  f.addViewer();
  const range = await f.send("/video.mp4", { email: VIEWER, headers: { Range: "bytes=0-3" } });
  assert.equal(range.status, 206);
  assert.equal(await range.text(), "part");
  assert.equal(range.headers.get("Content-Range"), "bytes 0-3/13");
  assert.equal(range.headers.get("Content-Length"), "4");
  assert.equal(range.headers.get("ETag"), null);
  assert.equal(range.headers.get("Access-Control-Allow-Origin"), null);
  assert.match(range.headers.get("Cache-Control"), /no-store/);
  const head = await f.send("/video.mp4", { email: VIEWER, method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.equal(f.assetRequests[0].headers.get("Range"), "bytes=0-3");
  assert.equal(f.assetRequests[1].method, "HEAD");
  assert.equal(f.reads(), 2);
});

test("legacy octet-stream asset metadata receives the correct safe media type", async () => {
  const f = fixture();
  f.env.ASSETS.fetch = async request => new Response(request.method === "HEAD" ? null : "part", {
    status: 206,
    headers: { "Content-Type": "application/octet-stream", "Content-Range": "bytes 0-3/13", "Content-Length": "4" },
  });
  for (const [path, contentType] of [
    ["/clip.webm?v=frozen", "video/webm"], ["/audio.m4a", "audio/mp4"],
    ["/font.ttf", "font/ttf"], ["/readme.md", "text/markdown; charset=utf-8"],
    ["/unknown.bin", "application/octet-stream"],
  ]) {
    for (const method of ["GET", "HEAD"]) {
      const response = await f.send(path, { method, headers: { Range: "bytes=0-3" } });
      assert.equal(response.status, 206);
      assert.equal(response.headers.get("Content-Type"), contentType);
      assert.equal(response.headers.get("Content-Range"), "bytes 0-3/13");
      assert.equal(await response.text(), method === "HEAD" ? "" : "part");
      assert.match(response.headers.get("Cache-Control"), /no-store/);
    }
  }
  f.env.ASSETS.fetch = async () => new Response("audio", { headers: { "Content-Type": "audio/webm" } });
  assert.equal((await f.send("/audio.webm")).headers.get("Content-Type"), "audio/webm");
  assert.equal((await f.send("/clip.webm", { email: null })).status, 401);
});

test("add/remove updates are atomic, normalized, idempotent and audited", async () => {
  const f = fixture();
  const csrf = await f.csrf();
  for (let i = 0; i < 2; i++) {
    const response = await f.send("/api/access", { method: "POST", csrf, body: { email: "  Viewer@Example.com  " } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
  assert.equal(f.viewers().length, 1);
  assert.equal(f.viewers()[0].email, VIEWER);
  assert.deepEqual(f.audit().map(row => row.action), ["added"]);
  const listing = await (await f.send("/api/access")).json();
  assert.equal(listing.ownerEmail, OWNER);
  assert.equal(listing.members[0].email, VIEWER);
  assert.equal(listing.members[0].role, "viewer");
  for (let i = 0; i < 2; i++) assert.equal((await f.send("/api/access", { method: "DELETE", csrf, body: { email: VIEWER } })).status, 200);
  assert.equal(f.viewers().length, 0);
  assert.deepEqual(f.audit().map(row => row.action), ["added", "removed"]);
  assert.ok(f.audit().every(row => row.actor_email === OWNER && row.target_email === VIEWER));
});

test("removal denies the very next request with the same valid identity", async () => {
  const f = fixture();
  f.addViewer();
  assert.equal((await f.send("/photo.webp", { email: VIEWER })).status, 200);
  const csrf = await f.csrf();
  assert.equal((await f.send("/api/access", { method: "DELETE", csrf, body: { email: VIEWER } })).status, 200);
  assert.equal((await f.send("/photo.webp", { email: VIEWER })).status, 403);
  assert.equal((await f.send("/video.mp4", { email: VIEWER, headers: { Range: "bytes=0-3" } })).status, 403);
  assert.equal(f.assetRequests.length, 1);
});

test("owner cannot be added, removed or changed by an extra role field", async () => {
  const f = fixture();
  const csrf = await f.csrf();
  for (const method of ["POST", "DELETE"]) assert.equal((await f.send("/api/access", { method, csrf, body: { email: OWNER.toUpperCase() } })).status, 400);
  assert.equal((await f.send("/api/access", { method: "POST", csrf, body: { email: VIEWER, role: "owner" } })).status, 400);
  assert.equal(f.viewers().length, 0);
  assert.equal(f.audit().length, 0);
});

test("CSRF is bound to the verified subject and exact same origin", async () => {
  const f = fixture();
  const csrf = await f.csrf();
  for (const options of [
    { csrf: undefined }, { csrf: `${NOW() - 10}.${"A".repeat(43)}` }, { csrf: `${NOW() + 60}.${"A".repeat(43)}` },
    { origin: null }, { origin: "https://attacker.example" }, { origin: `${ORIGIN}/` },
    { headers: { "Sec-Fetch-Site": "cross-site" } }, { headers: { "X-Test-Subject": "another-subject" } },
  ]) {
    assert.equal((await f.send("/api/access", { method: "POST", body: { email: VIEWER }, csrf, ...options })).status, 403);
  }
  assert.equal(f.viewers().length, 0);
  assert.equal(f.audit().length, 0);
});

test("mutation validates JSON, email input and streamed request size", async () => {
  const f = fixture();
  const csrf = await f.csrf();
  for (const body of ["broken-json", [], {}, { email: "bad" }, { email: "a\n@example.com" }, { email: "a@-example.com" }, { email: VIEWER, unknown: true }]) {
    assert.equal((await f.send("/api/access", { method: "POST", csrf, body })).status, 400);
  }
  assert.equal((await f.send("/api/access", { method: "POST", csrf, body: { email: VIEWER }, headers: { "Content-Type": "text/plain" } })).status, 415);
  assert.equal((await f.send("/api/access", { method: "POST", csrf, body: { email: "x".repeat(3000) }, headers: { "Content-Length": "1" } })).status, 413);
  assert.equal(f.viewers().length, 0);
  assert.equal(f.audit().length, 0);
});

test("D1 failures fail closed and failed writes roll their audit event back", async () => {
  const f = fixture();
  const csrf = await f.csrf();
  f.sql.exec("CREATE TRIGGER deny_test_insert BEFORE INSERT ON archive_viewers BEGIN SELECT RAISE(ABORT, 'test-only-failure'); END");
  const response = await f.send("/api/access", { method: "POST", csrf, body: { email: VIEWER } });
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes("test-only-failure"));
  assert.equal(f.viewers().length, 0);
  assert.equal(f.audit().length, 0);
  f.sql.close();
  assert.equal((await f.send("/private.js")).status, 503);
  assert.equal(f.assetRequests.length, 0);
});

test("authenticated users can sign out during a D1 outage without accessing protected content", async () => {
  const f = fixture();
  f.sql.close();
  for (const email of [OWNER, "removed@example.com"]) {
    for (const method of ["GET", "HEAD"]) {
      const response = await f.send("/logout", { email, method });
      assert.equal(response.status, 302);
      assert.equal(response.headers.get("Location"), "/cdn-cgi/access/logout");
      assert.match(response.headers.get("Clear-Site-Data"), /cache/);
      assert.equal(await response.text(), "");
    }
  }
  assert.equal(f.reads(), 0);
  assert.equal(f.assetRequests.length, 0);
  assert.equal((await f.send("/logout", { email: null })).status, 401);
  assert.equal((await f.send("/private.js")).status, 503);
  assert.equal(f.assetRequests.length, 0);
});

test("portal has fresh CSP nonces and original service worker cannot cache archive content", async () => {
  const f = fixture();
  const a = await f.send("/access");
  const b = await f.send("/access");
  assert.notEqual(a.headers.get("Content-Security-Policy"), b.headers.get("Content-Security-Policy"));
  const nonce = /script-src 'nonce-([^']+)'/.exec(a.headers.get("Content-Security-Policy"))[1];
  assert.ok((await a.text()).includes(`nonce="${nonce}"`));
  const sw = await f.send("/NEWFOAMHOME/archive-sept-2026/pages/foam-media-sw.js?v=frozen");
  const text = await sw.text();
  assert.equal(sw.status, 200);
  assert.match(text, /registration.unregister/);
  assert.match(text, /caches.delete/);
  assert.ok(!text.includes('addEventListener("fetch"'));
  assert.equal(f.assetRequests.length, 0);
  const logout = await f.send("/logout");
  assert.equal(logout.headers.get("Location"), "/cdn-cgi/access/logout");
  assert.match(logout.headers.get("Clear-Site-Data"), /cache/);
});

test("only the documented methods are accepted and unknown APIs never reach assets", async () => {
  const f = fixture();
  for (const path of ["/api/session", "/api/access", "/private.js"]) assert.equal((await f.send(path, { method: "PUT" })).status, 405);
  assert.equal((await f.send("/api/not-real")).status, 404);
  assert.equal(f.assetRequests.length, 0);
});

test("email normalization preserves explicit aliases rather than broadening invitations", () => {
  assert.equal(normalizeEmail("  Name+Project@Example.com  "), "name+project@example.com");
  assert.notEqual(normalizeEmail("name+project@gmail.com"), normalizeEmail("name@gmail.com"));
  assert.notEqual(normalizeEmail("na.me@gmail.com"), normalizeEmail("name@gmail.com"));
  for (const value of [null, 123, "", "a@@b.com", ".a@b.com", "a..b@c.com", "a@b..com", "a@b.c-", "x".repeat(65) + "@example.com"]) assert.equal(normalizeEmail(value), null);
});

test("real JWT verification checks signature, algorithm, issuer, audience, expiry and identity claims", async () => {
  const f = fixture();
  const keys = await generateKeyPair("RS256", { extractable: true });
  const publicJwk = await exportJWK(keys.publicKey);
  const jwks = createLocalJWKSet({ keys: [{ ...publicJwk, alg: "RS256", use: "sig", kid: "test-key" }] });
  async function sign(overrides = {}, privateKey = keys.privateKey, algorithm = "RS256") {
    const claims = {
      iss: f.env.ACCESS_TEAM_DOMAIN, aud: [f.env.ACCESS_AUD], sub: "verified-owner-subject",
      iat: NOW(), exp: NOW() + 3600, email: OWNER, ...overrides,
    };
    for (const [key, value] of Object.entries(claims)) if (value === undefined) delete claims[key];
    return new SignJWT(claims).setProtectedHeader({ alg: algorithm, kid: "test-key" }).sign(privateKey);
  }
  const requestFor = token => new Request(`${ORIGIN}/private.js`, { headers: { "Cf-Access-Jwt-Assertion": token } });
  const verified = await verifyAccessIdentity(requestFor(await sign()), f.env, jwks);
  assert.equal(verified.email, OWNER);
  assert.equal(verified.sub, "verified-owner-subject");
  for (const claims of [
    { iss: "https://wrong-team.cloudflareaccess.com" }, { aud: "another-app" },
    { exp: NOW() - 1 }, { nbf: NOW() + 3600 }, { exp: undefined }, { iat: undefined },
    { email: undefined }, { email: "invalid" }, { sub: undefined }, { sub: "" },
  ]) {
    const token = await sign(claims);
    await assert.rejects(() => verifyAccessIdentity(requestFor(token), f.env, jwks));
  }
  const unrelated = await generateKeyPair("RS256");
  const wrongKeyToken = await sign({}, unrelated.privateKey);
  await assert.rejects(() => verifyAccessIdentity(requestFor(wrongKeyToken), f.env, jwks));
  const hmac = await sign({}, encoderForTest(), "HS256");
  await assert.rejects(() => verifyAccessIdentity(requestFor(hmac), f.env, jwks));
});

function encoderForTest() { return new TextEncoder().encode("a sufficiently long test HMAC key for HS256"); }
