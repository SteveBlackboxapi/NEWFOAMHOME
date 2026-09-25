# Private Foam Talent Lab

Target: `https://foam-talent-lab.stevendavidlewis80.workers.dev`
Worker name: `foam-talent-lab`
Repository: `SteveBlackboxapi/NEWFOAMHOME`
Library branch: `content/talent-library`

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

After login, connect a GitHub fine-grained access key once through the Lab UI. Scope it to this repository with Contents read and write permission. The UI sends it to `POST /api/connect` as `{ "token": "…" }`; the Worker verifies repository write access and stores it encrypted with AES-GCM in KV. The key is never returned to the browser. `GET /api/status` returns only `{ "connected": true|false }`. Reconnecting replaces the stored key.

To rotate the password, generate a new strong random password, calculate its SHA-256 digest without adding a trailing newline, and replace the `LAB_PASSWORD_HASH` secret. Existing cookies then stop working. The GitHub connection survives this password change. Rotating `SESSION_SECRET` also invalidates cookies, but requires reconnecting GitHub because the previous encrypted key can no longer be decrypted. Never put a password, hash, session secret or GitHub key in this repository or deployment logs.

## Write boundaries

All mutations require an exact same-origin `Origin` header. Login attempts are limited per client IP at each Cloudflare location. This is a shared-password workspace, not individual user accounts.

`/api/github/*` forwards only a small allowlist of repository read operations and the library's Git object save sequence. It cannot target a different repository or modify another branch. Trees must inherit the current library tree and may change only `public/assets/talent/library.json` and PNG, JPEG or WebP files directly under `public/assets/talent/uploads/`. Uploads are limited to 10 MB each; request bodies are streamed with a hard 32 MB bound. Executable modes, symlinks, arbitrary source files, forced updates and unapproved commits are rejected. Short-lived KV records connect validated blobs, trees and commits before the branch reference may advance. Stale or expired saves fail without overwriting newer work.

`/api/asset?path=assets/talent/uploads/<filename>&ref=<40-character-commit>` serves an authenticated image from an immutable revision. **The underlying repository is public: images and catalogue data saved there remain publicly accessible through GitHub.** The password protects the editing workspace and server-held key, not the public repository itself.

All responses disable caching and indexing. The Content Security Policy restricts application scripts to this origin; media and source downloads may also use the existing Foam GitHub Pages origin. No passwords or keys are logged by the Worker.

## Publishing website image replacements

Open the bottom-left workspace menu, choose **Settings → Website images**, and select a page in the image map. Each section shows its current images and shared placements. **Replace** stages a new image; **Save changes** saves it and queues website publishing. **Talent library** keeps profile and content management separate from Explore content. Returning from Settings preserves the current search and library view.

**Lock this browser** lives in Settings. It closes the current browser's editing session and requires the password next time; saved images and the shared GitHub connection remain intact. Unsaved changes receive a discard confirmation first.

Saving a replacement for an image with an existing website placement adds an explicit `websiteReplacements` entry to the library manifest. Its key is the original canonical website image path (for example, `assets/talent/nia-brooks/nia-brooks-skincare.webp`) and its value is a canonical uploaded image path. Stable asset IDs keep the same source key through repeated replacements. New images, new profiles, old saved drafts, removed profiles and other profile edits do not become publication instructions. Replacing a video poster changes the public poster only; the public demo's video, identity, metrics and layout remain unchanged. Referenced published uploads are retained even when a draft profile no longer uses them.

After an approved library branch reference advances, the Worker sends one fixed GitHub `repository_dispatch` event: `talent-library-saved`, with `client_payload.libraryRevision` set to the saved commit SHA. The existing Contents-write GitHub key is sufficient. The public workflow must exist on `main` and build source from `main`; the separate, older library branch is never merged or executed. A failed dispatch returns a successful save with a separate failed publication status, so the editor keeps the saved revision and can retry without resaving or overwriting the catalogue.

`POST /api/publish` retries that fixed dispatch. It accepts only `{ "revision": "<40-character-commit>" }`, requires the authenticated session and exact same-origin Origin header, and verifies the revision still equals the current library branch head. It cannot select another repository, workflow, event, branch or historical commit. The generic GitHub proxy does not expose the dispatch endpoint.

Before generating responsive media or building the public website, run `node scripts/publish-library-images.mjs --revision <saved-commit>` in a disposable build checkout. Omitting the argument (and `LIBRARY_REVISION`) reads and pins the latest library branch revision once. `GITHUB_TOKEN` may be supplied by CI for read access. The script reads only explicit map entries, verifies their destinations against the website's current image-placement catalogue, fetches uploaded bytes from the same repository at that exact revision, validates/decodes the images, and overlays working copies at their existing filenames. It does not publish Lab profile drafts or modify source files, IDs, videos or archived masters. Run the responsive-media preparation next to produce new content-versioned URLs. Do not commit these temporary overlaid originals.

The build writes `public/website-publication.json` with `{ "version": 1, "libraryRevision": "<commit>", "replacementCount": 1 }`. Once deployed, authenticated `GET /api/publication` reads only this fixed public marker without forwarding credentials. After saving, the Lab checks it for up to ten minutes and reports when its saved revision is live. A queued event alone is never presented as a completed deployment.

## Verification

Run `node --test workers/talent-lab/worker.test.mjs` and `node --check workers/talent-lab/worker.mjs` before deployment. The tests exercise authentication, CSRF, session tampering/expiry/rotation, encrypted key persistence, rate limiting, gzip headers, private asset denial, public source proxies, body bounds and Git write scope with mocked upstream GitHub responses. After deployment, verify login, compressed app loading, a connected library read/save and logout in the actual Worker runtime.

Run `node --test scripts/test-github-talent-library.mjs scripts/test-publish-library-images.mjs` for explicit publication, old-draft isolation, upload retention, fixed revision reads and replacement-image validation. Worker tests also verify dispatch failure preserves saves, retries remain scoped, and publication status cannot expose private credentials.
