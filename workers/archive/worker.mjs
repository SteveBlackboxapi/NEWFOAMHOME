import { createRemoteJWKSet, jwtVerify } from "jose";
import { renderDashboard, renderAccessPage, renderAccessDenied } from "./ui.mjs";

const encoder = new TextEncoder();
const jwksByIssuer = new Map();
const BODY_LIMIT = 2048;
const CSRF_LIFETIME_SECONDS = 60 * 60;
const INERT_SERVICE_WORKER = `self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  for (const name of await caches.keys()) {
    if (name.startsWith("foam-media-")) await caches.delete(name);
  }
  await self.registration.unregister();
})()));
`;

class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9.-]+$/.test(email)) return null;
  const [local, domain] = email.split("@");
  if (local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..")) return null;
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return null;
  return email;
}

function configuration(env) {
  const ownerEmail = normalizeEmail(env.OWNER_EMAIL);
  let issuer, origin;
  try {
    issuer = new URL(env.ACCESS_TEAM_DOMAIN);
    origin = new URL(env.APP_ORIGIN);
  } catch { throw new RequestError(503, "The archive is not ready yet."); }
  if (!ownerEmail || issuer.protocol !== "https:" || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer.hostname) ||
      issuer.href !== `${issuer.origin}/` || origin.protocol !== "https:" || origin.href !== `${origin.origin}/` ||
      typeof env.ACCESS_AUD !== "string" || !env.ACCESS_AUD.trim() ||
      typeof env.CSRF_SECRET !== "string" || env.CSRF_SECRET.length < 32 || !env.DB?.prepare || !env.ASSETS?.fetch) {
    throw new RequestError(503, "The archive is not ready yet.");
  }
  return { ownerEmail, issuer: issuer.origin, origin: origin.origin };
}

// Optional resolver is used by cryptographic tests; production obtains keys only from the configured issuer.
export async function verifyAccessIdentity(request, env, keyResolver) {
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token || token.length > 16384) throw new RequestError(401, "Please sign in to view the archive.");
  const { issuer } = configuration(env);
  if (!keyResolver) {
    if (!jwksByIssuer.has(issuer)) {
      if (jwksByIssuer.size >= 4) jwksByIssuer.clear();
      jwksByIssuer.set(issuer, createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)));
    }
    keyResolver = jwksByIssuer.get(issuer);
  }
  const { payload } = await jwtVerify(token, keyResolver, {
    issuer,
    audience: env.ACCESS_AUD,
    algorithms: ["RS256"],
    requiredClaims: ["sub", "email", "exp", "iat", "iss", "aud"],
  });
  const email = normalizeEmail(payload.email);
  if (!email || typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 512) {
    throw new RequestError(401, "Please sign in to view the archive.");
  }
  return { email, sub: payload.sub, exp: payload.exp };
}

function secure(response, { nonce, portal = false, head = false, assetPath } = {}) {
  const headers = new Headers(response.headers);
  // Correct legacy upload metadata without overriding an explicit asset media type.
  if (assetPath && headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase() === "application/octet-stream") {
    const extension = /\.([a-z0-9]+)$/i.exec(assetPath)?.[1].toLowerCase();
    const mediaTypes = { webm: "video/webm", m4a: "audio/mp4", ttf: "font/ttf", md: "text/markdown; charset=utf-8" };
    if (Object.hasOwn(mediaTypes, extension)) headers.set("Content-Type", mediaTypes[extension]);
  }
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Pragma", "no-cache");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Referrer-Policy", "same-origin");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Content-Security-Policy", portal
    ? `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'self'; form-action 'self'`
    // The preserved pages contain existing inline scripts, styles and optional embeds.
    : "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'");
  headers.delete("Access-Control-Allow-Origin");
  headers.delete("Access-Control-Allow-Credentials");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  return new Response(head ? null : response.body, { status: response.status, statusText: response.statusText, headers });
}

function json(data, status = 200, headers) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function csrfKey(secret) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function csrfMessage(subject, origin, expiry) {
  return encoder.encode(JSON.stringify(["foam-archive-csrf-v1", origin, subject, expiry]));
}

async function issueCsrf(identity, env, origin) {
  const expiry = Math.min(identity.exp, Math.floor(Date.now() / 1000) + CSRF_LIFETIME_SECONDS);
  const signature = await crypto.subtle.sign("HMAC", await csrfKey(env.CSRF_SECRET), csrfMessage(identity.sub, origin, expiry));
  return `${expiry}.${base64url(signature)}`;
}

async function requireMutation(request, identity, env, origin) {
  if (request.headers.get("Origin") !== origin || new URL(request.url).origin !== origin ||
      (request.headers.has("Sec-Fetch-Site") && request.headers.get("Sec-Fetch-Site") !== "same-origin")) {
    throw new RequestError(403, "Please make this change from the archive access page.");
  }
  if (request.headers.get("Content-Type")?.split(";", 1)[0].trim().toLowerCase() !== "application/json") {
    throw new RequestError(415, "Please send the email address as JSON.");
  }
  const token = request.headers.get("X-CSRF-Token") ?? "";
  const match = /^(\d{10})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) throw new RequestError(403, "Please reload this page and try again.");
  const expiry = Number(match[1]);
  if (expiry <= Math.floor(Date.now() / 1000) || expiry > identity.exp) throw new RequestError(403, "Please reload this page and try again.");
  const signature = Uint8Array.from(atob(match[2].replace(/-/g, "+").replace(/_/g, "/") + "="), char => char.charCodeAt(0));
  if (!await crypto.subtle.verify("HMAC", await csrfKey(env.CSRF_SECRET), signature, csrfMessage(identity.sub, origin, expiry))) {
    throw new RequestError(403, "Please reload this page and try again.");
  }
}

async function readEmailBody(request) {
  const declaredSize = request.headers.get("Content-Length");
  if (declaredSize && (!/^\d+$/.test(declaredSize) || Number(declaredSize) > BODY_LIMIT)) throw new RequestError(413, "That request is too large.");
  if (!request.body) throw new RequestError(400, "Enter an email address.");
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > BODY_LIMIT) {
        await reader.cancel();
        throw new RequestError(413, "That request is too large.");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let data;
  try { data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new RequestError(400, "Enter a valid email address."); }
  if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length !== 1 || !Object.hasOwn(data, "email")) {
    throw new RequestError(400, "Send just the email address to change.");
  }
  const email = normalizeEmail(data.email);
  if (!email) throw new RequestError(400, "Enter a valid email address.");
  return email;
}

function assertOwner(isOwner) {
  if (!isOwner) throw new RequestError(403, "Only the archive owner can manage access.");
}

export function createWorker({ verifyIdentity = verifyAccessIdentity } = {}) {
  return {
    async fetch(request, env) {
      const head = request.method === "HEAD";
      try {
        const { ownerEmail, origin } = configuration(env);
        const url = new URL(request.url);
        if (url.origin !== origin) throw new RequestError(403, "Use the archive's main address to sign in.");
        let identity;
        try { identity = await verifyIdentity(request, env); }
        catch { throw new RequestError(401, "Please sign in to view the archive."); }
        if (!identity || !normalizeEmail(identity.email) || typeof identity.sub !== "string" || !identity.sub ||
            !Number.isFinite(identity.exp) || identity.exp <= Math.floor(Date.now() / 1000)) {
          throw new RequestError(401, "Please sign in to view the archive.");
        }
        identity.email = normalizeEmail(identity.email);
        const isOwner = identity.email === ownerEmail;
        // Signing out must work for removed viewers, including during a database outage.
        if (url.pathname === "/logout" && ["GET", "HEAD"].includes(request.method)) {
          return secure(new Response(null, { status: 302, headers: { Location: "/cdn-cgi/access/logout", "Clear-Site-Data": '"cache", "storage"' } }), { head });
        }
        // Default D1 queries use the primary. Never cache approval: revocation must apply to the next request.
        const member = await env.DB.prepare("SELECT email FROM archive_viewers WHERE email = ?").bind(identity.email).first();
        if (!isOwner && !member) {
          if (["GET", "HEAD"].includes(request.method) && !url.pathname.startsWith("/api/") && request.headers.get("Accept")?.includes("text/html")) {
            const nonce = base64url(crypto.getRandomValues(new Uint8Array(18)));
            return secure(new Response(renderAccessDenied({ email: identity.email, nonce }), { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }), { nonce, portal: true, head });
          }
          throw new RequestError(403, "This email address does not have access to the archive.");
        }

        if (url.pathname === "/api/session") {
          if (request.method !== "GET") return secure(json({ error: "Method not allowed." }, 405, { Allow: "GET" }), { head });
          return secure(json({ email: identity.email, isOwner, csrfToken: isOwner ? await issueCsrf(identity, env, origin) : null }));
        }
        if (url.pathname === "/api/access") {
          assertOwner(isOwner);
          if (request.method === "GET") {
            const list = await env.DB.prepare("SELECT email, added_at AS addedAt FROM archive_viewers WHERE email <> ? ORDER BY added_at, email").bind(ownerEmail).all();
            return secure(json({ ownerEmail, members: list.results.map(member => ({ ...member, role: "viewer" })) }));
          }
          if (!["POST", "DELETE"].includes(request.method)) return secure(json({ error: "Method not allowed." }, 405, { Allow: "GET, POST, DELETE" }), { head });
          await requireMutation(request, identity, env, origin);
          const email = await readEmailBody(request);
          if (email === ownerEmail) throw new RequestError(400, "The owner's access is permanent and cannot be changed here.");
          const timestamp = new Date().toISOString();
          if (request.method === "POST") {
            await env.DB.batch([
              env.DB.prepare("INSERT INTO archive_access_audit (actor_email, target_email, action, occurred_at) SELECT ?, ?, 'added', ? WHERE NOT EXISTS (SELECT 1 FROM archive_viewers WHERE email = ?)").bind(identity.email, email, timestamp, email),
              env.DB.prepare("INSERT OR IGNORE INTO archive_viewers (email, added_at, added_by) VALUES (?, ?, ?)").bind(email, timestamp, identity.email),
            ]);
          } else {
            await env.DB.batch([
              env.DB.prepare("INSERT INTO archive_access_audit (actor_email, target_email, action, occurred_at) SELECT ?, ?, 'removed', ? WHERE EXISTS (SELECT 1 FROM archive_viewers WHERE email = ?)").bind(identity.email, email, timestamp, email),
              env.DB.prepare("DELETE FROM archive_viewers WHERE email = ?").bind(email),
            ]);
          }
          return secure(json({ ok: true }));
        }
        if (url.pathname.startsWith("/api/")) throw new RequestError(404, "That page was not found.");
        if (!["GET", "HEAD"].includes(request.method)) return secure(json({ error: "Method not allowed." }, 405, { Allow: "GET, HEAD" }), { head });
        if (url.pathname === "/" || url.pathname === "/access" || url.pathname === "/access/") {
          const isAccessPage = url.pathname !== "/";
          if (isAccessPage) assertOwner(isOwner);
          const nonce = base64url(crypto.getRandomValues(new Uint8Array(18)));
          const html = isAccessPage ? renderAccessPage({ email: identity.email, nonce }) : renderDashboard({ email: identity.email, isOwner, nonce });
          return secure(new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }), { nonce, portal: true, head });
        }
        // Existing frozen bundles may try to register their old offline media cache.
        if (url.pathname.endsWith("/foam-media-sw.js")) {
          return secure(new Response(INERT_SERVICE_WORKER, { headers: { "Content-Type": "text/javascript; charset=utf-8" } }), { head });
        }
        // Pass the original request through so byte ranges and HEAD keep working after authorization.
        return secure(await env.ASSETS.fetch(request), { head, assetPath: url.pathname });
      } catch (error) {
        if (error instanceof RequestError) return secure(json({ error: error.message }, error.status), { head });
        console.error(JSON.stringify({ event: "archive_request_failed", name: error?.name ?? "Error" }));
        return secure(json({ error: "The archive is temporarily unavailable. Please try again." }, 503), { head });
      }
    },
  };
}

export default createWorker();
