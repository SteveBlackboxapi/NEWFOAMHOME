# Private Foam archive

The private archive runs separately from the marketing site and Talent Lab:

https://foam-archive.stevendavidlewis80.workers.dev/

Cloudflare Access sends a one-time email code. The Worker independently verifies the signed Access assertion (RS256, exact issuer and audience, expiry and identity). It then checks D1 on every request, including images, scripts, videos and range requests. No asset is served before this check: `assets.run_worker_first` must remain `true`.

The fixed owner can use **Manage access** to add or remove viewer addresses. Viewers cannot list or change permissions. Adding an address does not send an invitation; the owner shares the archive link separately. Removal takes effect on the next network request. The owner cannot be removed through this screen.

## Configuration

- `wrangler.jsonc`: Worker, asset routing, audience, issuer and D1 binding.
- `OWNER_EMAIL`: Worker secret containing the owner email; deliberately absent from this public repository.
- `CSRF_SECRET`: independent random Worker secret (at least 32 characters).
- `schema.sql`: D1 viewer permissions and transactional access audit.
- `ui.mjs`: responsive archive dashboard and owner access screen.

The Cloudflare Access application protects both the production hostname and the Worker itself. It allows authentication using the email-code identity provider, while the Worker enforces the actual invitation list. Passing the Cloudflare login alone does **not** grant archive access. Preview URLs are disabled. Do not add a bypass policy or serve these assets through another public host.

Access application ID: `e2e8743b-31a4-4fab-acda-add80115699e`.

## Build and verify

Requires Node 22.13+ (the security tests use built-in SQLite):

```sh
cd workers/archive
npm ci
npm test
node prepare-assets.mjs
npm run build
WRANGLER_LOG_PATH=.deploy/wrangler.log npm run check
```

See [PACKAGING.md](./PACKAGING.md) for the private frozen source and checksums. Private assets, upload tokens, local deployment files and dependencies are ignored by Git. Do not run the marketing build to regenerate the archive.

## Deployment

Apply `schema.sql` to the dedicated D1 database; configure the two secrets and Access application; then deploy this Worker and its prepared Static Assets. Standard authenticated Wrangler deployment can use `wrangler deploy`. The direct-upload alternative uses Cloudflare's manifest/session API, `upload-assets.mjs` with a short-lived scoped upload token saved in `.deploy/upload-session.json`, and the resulting `.deploy/asset-completion.json` when uploading the bundled Worker. Existing secrets must be retained in API deployments (`keep_bindings: ["secret_text"]`). Upload scripts must never print tokens.

The marketing site's Pages workflow tests this Worker but does not deploy it or copy its assets. Its former public archive URLs contain only redirects to the protected site and a retirement service worker. Future website releases cannot silently change this snapshot.

## Privacy boundaries

Responses are private/no-store; the archived offline service worker is disabled. The owner screen uses nonce-based CSP, prepared SQL, same-origin JSON checks and subject-bound CSRF tokens. Database errors fail closed; sign-out remains available during an outage. Authentication tokens and email lists are not logged.

The earlier unlisted archive was public. Removing its active GitHub Pages copy does not erase old Git history, downloaded copies or third-party caches. The original local archive ZIP and editable source remain preserved separately.
