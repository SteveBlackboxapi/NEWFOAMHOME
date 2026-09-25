# Private Foam Talent Lab

Target: `https://foam-talent-lab.stevendavidlewis80.workers.dev`
Worker name: `foam-talent-lab`
Repository: `SteveBlackboxapi/NEWFOAMHOME`
Library branch: `content/talent-library`

Bookmark `/lab/` or `/lab/talent/`. After sign-in, `/`, `/login`, `/lab` and `/lab/` redirect to the full Lab address. Existing view/layout query parameters are preserved by these authenticated redirects.

The Worker protects the Lab HTML, JavaScript, assets and API behind one shared password. The public marketing build must omit the Lab route. This is a separate deployment; deploying the marketing site does not update this Worker.

## Deployment inputs

Deploy through the Cloudflare Workers API as an ES module Worker with `worker.mjs` as its main module and the generated `site-assets.mjs` as its second module. Use compatibility date `2026-09-23` and the `nodejs_compat` compatibility flag. Do not include tests, this README, credentials or source maps in the upload.

Required bindings:

| Binding             | Type         | Value or purpose                                                                                                             |
| ------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `LAB_PASSWORD_HASH` | Secret text  | Lowercase SHA-256 hex digest of a randomly generated strong password.                                                        |
| `SESSION_SECRET`    | Secret text  | Independently generated random secret, at least 32 characters. Used for session signatures and encryption of the GitHub key. |
| `LIBRARY_SECRETS`   | KV namespace | Namespace ID `c266c0e031774104ba04f872923f3822`. Stores the encrypted GitHub key and short-lived approved save objects.      |
| `LOGIN_RATE_LIMIT`  | Rate limit   | A dedicated account namespace, configured for 10 requests per 60 seconds.                                                    |

Cloudflare API metadata uses a `kv_namespace` binding for KV and a `ratelimit` binding with `simple: { limit: 10, period: 60 }` for the login limiter. Store the two secret values as `secret_text` bindings. Missing configuration fails closed with HTTP 503.

`site-assets.mjs` exports a default map of URL paths to `{ body, contentType, encoding? }`, where `body` is base64 and `encoding` may be `gzip`. It must include `/index.html` and all hashed build files. The Worker uses `encodeBody: 'manual'` for already compressed files. Authenticated requests for `/assets/*`, `/fonts/*` and `/ideas-two/*` fall back to the existing public GitHub Pages site. No GitHub key is needed for these assets or initial public library reads.

Optional binding: `LAB_MEDIA_REF` is a nonsecret `plain_text` value containing an exact 40-character lowercase Git commit SHA. It allows the private deployment to serve the four reviewed WebM alternatives before the marketing site has deployed that commit. Only these paths are fetched from `https://raw.githubusercontent.com/SteveBlackboxapi/NEWFOAMHOME/<LAB_MEDIA_REF>/public`:

- `/assets/talent/aria-quen-v2/aria-quen-v2-makeup.webm`
- `/assets/talent/lena-croft-v2/lena-croft-grwm.webm`
- `/assets/talent/nia-brooks/nia-brooks-skincare.webm`
- `/assets/talent/samantha-pikka-v2/samantha-pikka-v2-curl-refresh.webm`

The files must exist in the pinned commit. An absent or invalid binding keeps the existing GitHub Pages origin; all other assets always keep that origin. Browser requests remain same-origin and password protected, and request parameters cannot select another repository, revision or media path. The proxy forwards only byte-range request headers, preserves partial-content and unsatisfiable-range responses, and does not send the session cookie or GitHub key upstream. This binding does not permit video uploads or change the image-only library upload rules. Preserve existing secret, KV and rate-limit bindings when updating this optional value.

## Login, key connection and rotation

The login form posts to `/api/login`. Successful login creates a 12-hour `Secure; HttpOnly; SameSite=Strict` host-only session cookie, then opens `/lab/talent/?view=content`. JSON login is also supported with `{ "password": "…" }`. `/api/logout` clears that browser's cookie; it does not disconnect the shared GitHub key.

The login document uses `Referrer-Policy: same-origin` so native form submissions retain the same-origin `Origin` header required by the mutation guard. Other responses keep `no-referrer`. Missing, null and foreign origins remain rejected.

After login, connect a GitHub fine-grained access key once through the Lab UI. Scope it to this repository with Contents read and write permission. The UI sends it to `POST /api/connect` as `{ "token": "…" }`; the Worker verifies repository write access and stores it encrypted with AES-GCM in KV. The key is never returned to the browser. `GET /api/status` returns only `{ "connected": true|false }`. Reconnecting replaces the stored key.

To rotate the password, generate a new strong random password, calculate its SHA-256 digest without adding a trailing newline, and replace the `LAB_PASSWORD_HASH` secret. Existing cookies then stop working. The GitHub connection survives this password change. Rotating `SESSION_SECRET` also invalidates cookies, but requires reconnecting GitHub because the previous encrypted key can no longer be decrypted. Never put a password, hash, session secret or GitHub key in this repository or deployment logs.

## Write boundaries

All mutations require an exact same-origin `Origin` header. Login attempts are limited per client IP at each Cloudflare location. This is a shared-password workspace, not individual user accounts.

`/api/github/*` forwards only a small allowlist of repository read operations and the library's Git object save sequence. It cannot target a different repository or modify another branch. Trees must inherit the current library tree and may change only `public/assets/talent/library.json` and PNG, JPEG or WebP files directly under `public/assets/talent/uploads/`. Uploads are limited to 10 MB each; request bodies are streamed with a hard 32 MB bound. Executable modes, symlinks, arbitrary source files, forced updates and unapproved commits are rejected. Short-lived KV records connect validated blobs, trees and commits before the branch reference may advance. Stale or expired saves fail without overwriting newer work.

`/api/asset?path=assets/talent/uploads/<filename>&ref=<40-character-commit>` serves an authenticated image from an immutable revision. **The underlying repository is public: images and catalogue data saved there remain publicly accessible through GitHub.** The password protects the editing workspace and server-held key, not the public repository itself.

All responses disable caching and indexing. The Content Security Policy restricts application scripts to this origin; media and source downloads may also use the existing Foam GitHub Pages origin. No passwords or keys are logged by the Worker.

All upstream requests use `redirect: "manual"` and reject 3xx responses with a generic 502. The Workers runtime does not support `redirect: "error"`; that value throws before contacting GitHub or the public media host. Never replace this with automatic redirect following: GitHub credentials must remain on the approved origin.

## Verification

Run `node --test workers/talent-lab/worker.test.mjs` and `node --check workers/talent-lab/worker.mjs` before deployment. The tests exercise authentication, CSRF, session tampering/expiry/rotation, encrypted key persistence, rate limiting, gzip headers, private asset denial, public source proxies, body bounds and Git write scope with mocked upstream GitHub responses. After deployment, verify login, compressed app loading, a connected library read/save and logout in the actual Worker runtime.
