# Preserved Home and Managers — 29 September 2026

The preserved pages are hosted separately at [the private Foam archive](https://foam-archive.stevendavidlewis80.workers.dev/). Cloudflare Access verifies the email with a one-time code, and the archive Worker checks the invitation list before serving any page, script, photograph, font or video.

- Owner: `stevendavidlewis80@gmail.com`.
- The owner can add or remove viewer email addresses at `/access`.
- Viewers can browse the archive but cannot change access or the saved pages.
- A removed viewer is denied on their next request, even if their email sign-in has not expired.
- Sign out is available in the archive menu. Authenticated responses are not stored in browser or public response caches, and the frozen app's offline media cache is disabled.

The saved release is commit `52c71bdca192475bd547272378cff523b643dc3a`, GitHub Pages run `36562457298`. Its production image-library overlay, responsive images and page interactions are preserved. The only served-copy changes are the relocated base, search-index exclusion, removal of offline caching, and replacement of absolute old archive links with same-origin links.

The archive menu opens:

- Home: `/NEWFOAMHOME/archive-sept-2026/pages/` on the protected origin.
- Managers: `/NEWFOAMHOME/archive-sept-2026/pages/managers/` on the protected origin.

The former public `/NEWFOAMHOME/archive-sept-2026/` address and its Home/Managers addresses now redirect to the protected equivalents. The public directory contains only those three redirect documents and a service worker that retires the old archive's cache. Its cleanup targets the exact archive scope and does not unregister or clear the current website's service worker or caches. No frozen archive assets or snapshot manifest remain in the public deployment.

## Preservation and deployment

Private backups live outside the repository's public tree under the local project directory `output/private-page-archive/2026-09-29-home-and-managers/`:

- `published-site.zip`: the original deployed artifact.
- `editable-source.zip`: the corresponding editable source.
- `site/`: the original local preview.
- `online-snapshot-source/`: the verified relocated snapshot and its per-file checksum manifest, retained as a private rebuild input.

Do not overwrite or rebuild these originals when changing the current website. [Worker packaging instructions](../workers/archive/PACKAGING.md) describe checksum verification and generation of the ignored `.assets/` and `.deploy/` directories. Every original input file is verified before packaging, and the six security-only file changes are recorded with before/after hashes. The Worker must retain `run_worker_first: true`; uploading these files to an ungated static host would expose them.

The normal marketing-site build does not include the private snapshot. The public website and Talent Lab use their existing deployments and authentication independently.

This protects access to the current archive deployment. The earlier unlisted copy was public: old Git history, downloaded files, browser copies, or third-party caches do not become private retroactively. The original pages were already public marketing content, and this change does not attempt to rewrite repository history or erase other people's copies.
