import siteAssets from "./site-assets.mjs";

export const REPOSITORY = "SteveBlackboxapi/NEWFOAMHOME";
export const BRANCH = "content/talent-library";
export const MANIFEST = "public/assets/talent/library.json";
const GITHUB = `https://api.github.com/repos/${REPOSITORY}`;
const PUBLIC_SITE = "https://steveblackboxapi.github.io/NEWFOAMHOME";
const COOKIE = "__Host-foam_lab";
const SESSION_SECONDS = 12 * 60 * 60;
const MAX_BODY = 32 * 1024 * 1024;
const TOKEN_KEY = "github-token-v1";
const SHA = /^[a-f0-9]{40}$/;
const UPLOAD = /^public\/assets\/talent\/uploads\/[a-z0-9-]+\.(png|jpg|webp)$/;
const REVIEWED_WEBM = new Set([
  "/assets/talent/aria-quen-v2/aria-quen-v2-makeup.webm",
  "/assets/talent/lena-croft-v2/lena-croft-grwm.webm",
  "/assets/talent/nia-brooks/nia-brooks-skincare.webm",
  "/assets/talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh.webm",
]);
const encoder = new TextEncoder();
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message);
};
const hex = (bytes) =>
  [...new Uint8Array(bytes)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
const bytes = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
const base64 = (value) => {
  let text = "";
  for (const byte of new Uint8Array(value)) text += String.fromCharCode(byte);
  return btoa(text);
};
const b64url = (value) =>
  base64(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const unurl = (value) => bytes(value.replaceAll("-", "+").replaceAll("_", "/"));
const now = () => Math.floor(Date.now() / 1000);

function response(body, status = 200, extra = {}) {
  return new Response(body, {
    status,
    ...(extra["Content-Encoding"] ? { encodeBody: "manual" } : {}),
    headers: {
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://steveblackboxapi.github.io/NEWFOAMHOME/; media-src 'self' blob: https://steveblackboxapi.github.io/NEWFOAMHOME/; font-src 'self'; connect-src 'self' https://steveblackboxapi.github.io/NEWFOAMHOME/; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
      ...extra,
    },
  });
}
const json = (value, status = 200, extra = {}) =>
  response(JSON.stringify(value), status, {
    "Content-Type": "application/json; charset=utf-8",
    ...extra,
  });
const redirect = (location, extra = {}) =>
  response(null, 303, { Location: location, ...extra });
const sessionCookie = (value, age = SESSION_SECONDS) =>
  `${COOKIE}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
async function hmacKey(env) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
async function sign(value, env) {
  return crypto.subtle.sign("HMAC", await hmacKey(env), encoder.encode(value));
}
async function sameSecret(a, b, env) {
  return crypto.subtle.verify(
    "HMAC",
    await hmacKey(env),
    await sign(a, env),
    encoder.encode(b),
  );
}
async function issueSession(env) {
  const payload = b64url(
    encoder.encode(
      JSON.stringify({
        v: 1,
        exp: now() + SESSION_SECONDS,
        nonce: crypto.randomUUID(),
      }),
    ),
  );
  return `${payload}.${b64url(await sign(`${payload}.${env.LAB_PASSWORD_HASH}`, env))}`;
}
async function authenticated(request, env) {
  const cookie = (request.headers.get("Cookie") || "")
    .split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  if (!cookie || cookie.length > 1024) return false;
  try {
    const [payload, signature, extra] = cookie.split(".");
    if (!payload || !signature || extra) return false;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(env),
      unurl(signature),
      encoder.encode(`${payload}.${env.LAB_PASSWORD_HASH}`),
    );
    if (!valid) return false;
    const parsed = JSON.parse(new TextDecoder().decode(unurl(payload)));
    return (
      parsed.v === 1 &&
      Number.isInteger(parsed.exp) &&
      parsed.exp > now() &&
      parsed.exp <= now() + SESSION_SECONDS + 60
    );
  } catch {
    return false;
  }
}
async function encryptionKey(env) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`foam-github-token-v1:${env.SESSION_SECRET}`),
  );
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}
async function encryptToken(token, env) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(REPOSITORY) },
    await encryptionKey(env),
    encoder.encode(token),
  );
  return JSON.stringify({ iv: base64(iv), ciphertext: base64(encrypted) });
}
async function readToken(env) {
  const stored = await env.LIBRARY_SECRETS.get(TOKEN_KEY);
  if (!stored) return "";
  const { iv, ciphertext } = JSON.parse(stored);
  const clear = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: bytes(iv),
      additionalData: encoder.encode(REPOSITORY),
    },
    await encryptionKey(env),
    bytes(ciphertext),
  );
  return new TextDecoder().decode(clear);
}
async function readText(request, limit = MAX_BODY) {
  if (Number(request.headers.get("Content-Length")) > limit)
    fail(413, "This request is too large.");
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        fail(413, "This request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(buffer);
}
async function readJson(request, limit) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    fail(415, "Use JSON for this request.");
  let value;
  try {
    value = JSON.parse(await readText(request, limit));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    fail(400, "Invalid JSON.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(400, "Invalid request.");
  return value;
}
const keysOnly = (body, allowed) =>
  Object.keys(body).every((key) => allowed.includes(key));
function requireOrigin(request, url) {
  if (request.headers.get("Origin") !== url.origin)
    fail(403, "This request must come from the Lab.");
}
function loginPage(error = "", status = 200) {
  return response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Foam Talent Lab</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#1d2635;background:#f7f7f8;margin:0;display:grid;place-items:center;min-height:100svh}main{box-sizing:border-box;width:min(440px,calc(100% - 40px));padding:40px;background:white;border:1px solid #e6e7eb;border-radius:22px}h1{font-size:28px;letter-spacing:-1px;margin:0 0 12px}p{color:#667085}label{display:block;margin:24px 0 8px}input,button{box-sizing:border-box;width:100%;font:inherit;padding:13px 15px;border:1px solid #d0d5dd;border-radius:9px}button{margin-top:18px;background:#1d2635;color:white;cursor:pointer}a{color:inherit}.error{color:#7a0036}</style><main><h1>Foam Talent Lab</h1><p>A private workspace for your fictional creator library.</p>${error ? `<p class="error" role="alert">${error}</p>` : ""}<form method="post" action="/api/login"><label for="password">Password</label><input id="password" name="password" type="password" required autocomplete="current-password" autofocus maxlength="256"><button type="submit">Open the Lab</button></form></main></html>`,
    status,
    {
      "Content-Type": "text/html; charset=utf-8",
      // A native form POST under no-referrer sends Origin: null. Same-origin
      // preserves the login Origin without revealing referrers to other sites.
      "Referrer-Policy": "same-origin",
    },
  );
}
async function fetchUpstream(url, options, fetcher) {
  // workerd supports manual/follow, not redirect: "error". Keep redirects
  // blocked explicitly so credentials can never follow an upstream Location.
  const result = await fetcher(url, { ...options, redirect: "manual" });
  if (result.status >= 300 && result.status < 400) {
    await result.body?.cancel();
    fail(502, "The library source returned an unexpected redirect.");
  }
  return result;
}
async function github(path, token, method = "GET", body, fetcher = fetch) {
  const result = await fetchUpstream(`${GITHUB}${path}`, {
    method,
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      "User-Agent": "Foam-Talent-Lab",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }, fetcher);
  if (!result.ok)
    fail(
      result.status >= 500 ? 502 : result.status,
      result.status === 404
        ? "The library record was not found."
        : "GitHub could not complete this library request.",
    );
  // GitHub's response is bounded too; never reflect arbitrary upstream text/errors.
  return JSON.parse(await readText(result, MAX_BODY));
}
async function currentParent(token, fetcher) {
  try {
    return (
      await github(`/git/ref/heads/${BRANCH}`, token, "GET", undefined, fetcher)
    ).object.sha;
  } catch (error) {
    if (error.status !== 404) throw error;
    return (
      await github("/git/ref/heads/main", token, "GET", undefined, fetcher)
    ).object.sha;
  }
}
async function remember(env, kind, sha, value) {
  if (!SHA.test(sha)) fail(502, "GitHub returned an invalid object.");
  await env.LIBRARY_SECRETS.put(
    `approved-${kind}:${sha}`,
    JSON.stringify(value),
    { expirationTtl: 900 },
  );
}
async function approved(env, kind, sha) {
  if (!SHA.test(sha || "")) fail(400, "Invalid Git object.");
  const value = await env.LIBRARY_SECRETS.get(`approved-${kind}:${sha}`);
  if (!value)
    fail(409, "This save has expired. Refresh the library and save again.");
  return JSON.parse(value);
}
function imageKind(body) {
  if (
    !keysOnly(body, ["content", "encoding"]) ||
    body.encoding !== "base64" ||
    typeof body.content !== "string" ||
    !body.content.length ||
    body.content.length > Math.ceil((10 * 1024 * 1024) / 3) * 4 ||
    body.content.length % 4 ||
    /[^A-Za-z0-9+/=]/.test(body.content)
  )
    fail(400, "Only PNG, JPEG and WebP images under 10 MB can be uploaded.");
  let data;
  try {
    data = bytes(body.content);
  } catch {
    fail(400, "Invalid image encoding.");
  }
  if (data.length > 10 * 1024 * 1024) fail(413, "The image is too large.");
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => data[i] === v))
    return "png";
  if (data[0] === 255 && data[1] === 216 && data[2] === 255) return "jpg";
  if (
    new TextDecoder().decode(data.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(data.slice(8, 12)) === "WEBP"
  )
    return "webp";
  fail(400, "Only PNG, JPEG and WebP images can be uploaded.");
}
async function proxyGithub(request, url, env, fetcher) {
  const path = url.pathname.slice("/api/github".length);
  if (/%|\\|\/\//.test(path)) fail(403, "This GitHub path is not allowed.");
  const token = await readToken(env);
  if (request.method === "GET") {
    const refRead =
      path === `/git/ref/heads/${BRANCH}` || path === "/git/ref/heads/main";
    const commitRead = /^\/git\/commits\/[a-f0-9]{40}$/.test(path);
    const manifestRead =
      path === `/contents/${MANIFEST}` &&
      url.searchParams.size === 1 &&
      SHA.test(url.searchParams.get("ref") || "");
    if (
      !(refRead || commitRead || manifestRead || path === "") ||
      (!manifestRead && url.search)
    )
      fail(403, "This GitHub path is not allowed.");
    const result = await github(
      `${path}${url.search}`,
      token,
      "GET",
      undefined,
      fetcher,
    );
    return json(
      path === ""
        ? { permissions: { push: Boolean(result.permissions?.push) } }
        : result,
    );
  }
  if (!token) fail(409, "Connect GitHub before saving.");
  if (url.search) fail(403, "This GitHub path is not allowed.");
  const body = await readJson(request);
  if (request.method === "POST" && path === "/git/blobs") {
    const kind = imageKind(body);
    const result = await github(path, token, "POST", body, fetcher);
    await remember(env, "blob", result.sha, { kind });
    return json({ sha: result.sha }, 201);
  }
  if (request.method === "POST" && path === "/git/trees") {
    if (
      !keysOnly(body, ["base_tree", "tree"]) ||
      !SHA.test(body.base_tree || "") ||
      !Array.isArray(body.tree) ||
      !body.tree.length ||
      body.tree.length > 500
    )
      fail(400, "Invalid library tree.");
    const parent = await currentParent(token, fetcher);
    const base = await github(
      `/git/commits/${parent}`,
      token,
      "GET",
      undefined,
      fetcher,
    );
    if (base.tree.sha !== body.base_tree)
      fail(409, "The library changed. Refresh before saving.");
    const paths = new Set();
    for (const entry of body.tree) {
      if (
        !entry ||
        typeof entry !== "object" ||
        !keysOnly(entry, ["path", "mode", "type", "sha", "content"]) ||
        paths.has(entry.path) ||
        entry.type !== "blob" ||
        entry.mode !== "100644"
      )
        fail(403, "Invalid library file.");
      paths.add(entry.path);
      if (entry.path === MANIFEST) {
        if (
          typeof entry.content !== "string" ||
          entry.content.length > 4 * 1024 * 1024 ||
          "sha" in entry
        )
          fail(400, "Invalid library catalogue.");
        let manifest;
        try {
          manifest = JSON.parse(entry.content);
        } catch {
          fail(400, "Invalid library catalogue.");
        }
        if (
          manifest.version !== 1 ||
          !Array.isArray(manifest.profiles) ||
          manifest.profiles.length > 500 ||
          !Array.isArray(manifest.removedTalentIds)
        )
          fail(400, "Invalid library catalogue.");
      } else {
        const kind = UPLOAD.exec(entry.path || "")?.[1];
        if (!kind || "content" in entry || !("sha" in entry))
          fail(403, "Writes are limited to library images and the catalogue.");
        if (
          entry.sha !== null &&
          (await approved(env, "blob", entry.sha)).kind !== kind
        )
          fail(403, "Image format does not match its filename.");
      }
    }
    if (!paths.has(MANIFEST)) fail(400, "A save must include its catalogue.");
    const result = await github(path, token, "POST", body, fetcher);
    await remember(env, "tree", result.sha, { parent });
    return json({ sha: result.sha }, 201);
  }
  if (request.method === "POST" && path === "/git/commits") {
    if (
      !keysOnly(body, ["message", "tree", "parents"]) ||
      typeof body.message !== "string" ||
      body.message.length > 200 ||
      !Array.isArray(body.parents) ||
      body.parents.length !== 1
    )
      fail(400, "Invalid library commit.");
    const tree = await approved(env, "tree", body.tree);
    if (body.parents[0] !== tree.parent)
      fail(403, "The library commit must follow its approved parent.");
    const result = await github(
      path,
      token,
      "POST",
      {
        message: "Update Foam talent library drafts",
        tree: body.tree,
        parents: [tree.parent],
      },
      fetcher,
    );
    await remember(env, "commit", result.sha, { parent: tree.parent });
    return json({ sha: result.sha }, 201);
  }
  const create = request.method === "POST" && path === "/git/refs";
  const update =
    request.method === "PATCH" && path === `/git/refs/heads/${BRANCH}`;
  if (create || update) {
    if (
      create
        ? !keysOnly(body, ["ref", "sha"]) || body.ref !== `refs/heads/${BRANCH}`
        : !keysOnly(body, ["sha", "force"]) || body.force !== false
    )
      fail(403, "Only non-forced library branch updates are allowed.");
    const commit = await approved(env, "commit", body.sha);
    if (commit.parent !== (await currentParent(token, fetcher)))
      fail(409, "The library changed. Refresh before saving.");
    const result = await github(path, token, request.method, body, fetcher);
    return json(result, create ? 201 : 200);
  }
  fail(403, "This GitHub operation is not allowed.");
}

export async function handleRequest(
  request,
  env,
  assets = siteAssets,
  fetcher = fetch,
) {
  try {
    if (
      !/^[a-f0-9]{64}$/.test(env.LAB_PASSWORD_HASH || "") ||
      typeof env.SESSION_SECRET !== "string" ||
      env.SESSION_SECRET.length < 32 ||
      !env.LIBRARY_SECRETS?.get ||
      !env.LIBRARY_SECRETS?.put ||
      !env.LOGIN_RATE_LIMIT?.limit
    )
      fail(503, "The Lab is not configured yet.");
    const url = new URL(request.url);
    if (url.protocol !== "https:") fail(400, "Use the secure Lab address.");
    const read = request.method === "GET" || request.method === "HEAD";
    if (!read) requireOrigin(request, url);
    if (url.pathname === "/api/login" && request.method === "POST") {
      const limited = await env.LOGIN_RATE_LIMIT.limit({
        key: `login:${request.headers.get("CF-Connecting-IP") || "unknown"}`,
      });
      if (!limited.success)
        fail(429, "Too many attempts. Please wait a minute.");
      const isJson = request.headers
        .get("Content-Type")
        ?.startsWith("application/json");
      const payload = isJson
        ? await readJson(request, 2048)
        : Object.fromEntries(
            new URLSearchParams(await readText(request, 2048)),
          );
      const password = payload.password;
      const digest =
        typeof password === "string" && password.length <= 256
          ? hex(await crypto.subtle.digest("SHA-256", encoder.encode(password)))
          : "";
      if (!(await sameSecret(env.LAB_PASSWORD_HASH, digest, env)))
        return isJson
          ? json({ error: "Incorrect password." }, 401)
          : loginPage("Incorrect password. Please try again.", 401);
      const headers = { "Set-Cookie": sessionCookie(await issueSession(env)) };
      return isJson
        ? json({ ok: true }, 200, headers)
        : redirect("/lab/talent/?view=content", headers);
    }
    if (!(await authenticated(request, env))) {
      if (
        read &&
        (url.pathname === "/" ||
          url.pathname === "/login" ||
          url.pathname === "/lab" ||
          url.pathname.startsWith("/lab/"))
      )
        return loginPage();
      return json({ error: "Sign in to the Lab." }, 401);
    }
    if (url.pathname === "/api/logout" && request.method === "POST")
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0) });
    if (url.pathname === "/api/status" && request.method === "GET")
      return json({ connected: Boolean(await readToken(env)) });
    if (url.pathname === "/api/connect" && request.method === "POST") {
      const body = await readJson(request, 4096);
      if (
        !keysOnly(body, ["token"]) ||
        typeof body.token !== "string" ||
        !/^[A-Za-z0-9_]{20,255}$/.test(body.token)
      )
        fail(400, "Enter a valid GitHub access key.");
      const repo = await github("", body.token, "GET", undefined, fetcher);
      if (!repo.permissions?.push)
        fail(403, "This access key cannot write to the Foam repository.");
      await env.LIBRARY_SECRETS.put(
        TOKEN_KEY,
        await encryptToken(body.token, env),
      );
      return json({ connected: true });
    }
    if (url.pathname === "/api/asset" && read) {
      const path = url.searchParams.get("path") || "";
      const revision = url.searchParams.get("ref") || "";
      if (
        url.searchParams.size !== 2 ||
        !UPLOAD.test(`public/${path}`) ||
        !SHA.test(revision)
      )
        fail(403, "This library image path is not allowed.");
      const token = await readToken(env);
      const upstream = await fetchUpstream(
        `${GITHUB}/contents/public/${path}?ref=${revision}`,
        {
          method: request.method,
          headers: {
            Accept: "application/vnd.github.raw+json",
            "X-GitHub-Api-Version": "2026-03-10",
            "User-Agent": "Foam-Talent-Lab",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
        fetcher,
      );
      if (!upstream.ok)
        fail(
          upstream.status === 404 ? 404 : 502,
          "The library image could not be loaded.",
        );
      const kind = UPLOAD.exec(`public/${path}`)[1];
      return response(upstream.body, 200, {
        "Content-Type": {
          png: "image/png",
          jpg: "image/jpeg",
          webp: "image/webp",
        }[kind],
      });
    }
    if (
      url.pathname === "/api/github" ||
      url.pathname.startsWith("/api/github/")
    )
      return await proxyGithub(request, url, env, fetcher);
    if (url.pathname.startsWith("/api/")) fail(404, "Not found.");
    if (!read) fail(405, "Method not allowed.");
    if (["/", "/login", "/lab", "/lab/"].includes(url.pathname))
      return redirect(`/lab/talent/${url.search || "?view=content"}`);
    const asset = Object.hasOwn(assets, url.pathname)
      ? assets[url.pathname]
      : url.pathname === "/lab/talent/" || url.pathname === "/lab/talent"
        ? assets["/index.html"]
        : null;
    if (asset)
      return response(
        request.method === "HEAD" ? null : bytes(asset.body),
        200,
        {
          "Content-Type": asset.contentType,
          ...(asset.encoding === "gzip" ? { "Content-Encoding": "gzip" } : {}),
        },
      );
    if (
      /^\/(?:assets|ideas-two|fonts)\/[a-zA-Z0-9_./ -]+$/.test(url.pathname) &&
      !url.pathname.split("/").some((part) => part === "." || part === "..")
    ) {
      const pinnedMedia =
        typeof env.LAB_MEDIA_REF === "string" &&
        SHA.test(env.LAB_MEDIA_REF) &&
        REVIEWED_WEBM.has(url.pathname);
      const upstreamUrl = pinnedMedia
        ? `https://raw.githubusercontent.com/${REPOSITORY}/${env.LAB_MEDIA_REF}/public${url.pathname}`
        : `${PUBLIC_SITE}${url.pathname}`;
      const upstream = await fetchUpstream(upstreamUrl, {
        method: request.method,
        headers: Object.fromEntries(
          ["Range", "If-Range"]
            .filter((name) => request.method === "GET" && request.headers.has(name))
            .map((name) => [name, request.headers.get(name)]),
        ),
      }, fetcher);
      if (!upstream.ok && upstream.status !== 416) fail(404, "Asset not found.");
      return response(request.method === "HEAD" ? null : upstream.body, upstream.status, {
        "Content-Type":
          pinnedMedia
            ? "video/webm"
            : upstream.headers.get("Content-Type") || "application/octet-stream",
        ...Object.fromEntries(
          ["Content-Length", "Content-Range", "Accept-Ranges", "ETag", "Last-Modified"]
            .filter((name) => upstream.headers.has(name))
            .map((name) => [name, upstream.headers.get(name)]),
        ),
      });
    }
    fail(404, "Not found.");
  } catch (error) {
    return json(
      {
        error:
          error instanceof HttpError
            ? error.message
            : "The Lab could not complete this request. Please try again.",
      },
      error instanceof HttpError ? error.status : 500,
    );
  }
}

export default { fetch: (request, env) => handleRequest(request, env) };
