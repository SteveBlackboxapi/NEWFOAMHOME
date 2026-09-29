# Frozen archive assets

`prepare-assets.mjs` creates private, ignored Worker Static Assets from the September 29 snapshot. The input directory contains `snapshot-manifest.json` and `pages/`; every input byte and the complete 953-file inventory are checked before packaging. It never rebuilds the marketing app or changes the original source/artifact ZIPs.

The default input is the private `output/private-page-archive/2026-09-29-home-and-managers/online-snapshot-source/` sibling of this checkout. To seed that private input before removing an existing public snapshot:

```sh
node workers/archive/prepare-assets.mjs --source public/archive-sept-2026 --preserve-source ../output/private-page-archive/2026-09-29-home-and-managers/online-snapshot-source
```

Subsequent runs use:

```sh
node workers/archive/prepare-assets.mjs
```

An alternate frozen input can be supplied using `--source /absolute/path/to/snapshot`. Existing private inputs are verified and never overwritten. Private input/output directories have mode `0700`; generated files have mode `0600`.

The result is `workers/archive/.assets/NEWFOAMHOME/archive-sept-2026/pages/`, retaining all existing archived paths. The following security-only transformations are applied to the served copy and recorded with before/after SHA-256 digests:

- Disable the frozen app's media service-worker registration.
- Replace its service worker with an inert retirement script, removing only caches scoped to that archive.
- Convert absolute links to the old GitHub archive into same-origin links.

All other bytes, including photographs, fonts, and videos, stay identical. Authentication and `Cache-Control: private, no-store` remain the responsibility of the Worker; deployment must use `run_worker_first: true`. Do not publish `.assets` through GitHub Pages or any ungated static host.

`workers/archive/.deploy/` contains:

- `asset-manifest.json`: Cloudflare direct-upload URL-to-hash/size map.
- `hash-files.json`: unique upload hash to absolute local file, size, full digest, extension and URL list.
- `asset-audit.json`: original artifact and manifest digests, original/served file digests and exact security transformations.

Hashes follow [Cloudflare's direct-upload format](https://developers.cloudflare.com/workers/static-assets/direct-upload/): the first 32 hexadecimal characters of SHA-256 over the file's base64 text followed by its extension without the leading dot. Private packaging outputs and deployment tokens are ignored by Git. The manifests are local verification/deployment inputs, not website assets.
