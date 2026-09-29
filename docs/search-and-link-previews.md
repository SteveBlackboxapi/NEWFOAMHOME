# Search and link previews

`src/lib/siteMetadata.ts` is the source for public page titles, descriptions, canonical URLs, Open Graph tags, large-image Twitter cards and the sitemap. The same data updates the browser head on internal navigation.

`scripts/site-metadata-plugin.ts` writes metadata into the initial HTML during every public build, including each route's `index.html`. Crawlers do not need to execute JavaScript to read the preview. Do not copy the homepage HTML over these route files after building.

The supplied preview is preserved unchanged at `public/social/foam-preview-2026-09-29.webp` (2000 × 1070). It has a dated filename for independent preview caching and lives outside the responsive-image pipeline. Use a new filename when replacing it, and update `PREVIEW_IMAGE` with the matching dimensions and MIME type.

## Moving to the final address

The current default is `https://steveblackboxapi.github.io/NEWFOAMHOME/`. Set the `SITE_URL` build environment variable to the final public address, including any path prefix. The GitHub Pages workflow accepts this as the repository Actions variable `SITE_URL`. Rebuild after changing it. The application base, canonicals, preview image URLs and sitemap then use the same address. No domain is assumed or registered by this configuration.

Before switching, configure the destination hosting and domain, verify its HTTPS, and plan redirects from the previous public addresses. Submit the new sitemap to that property's Google Search Console after launch. GitHub project Pages cannot publish a host-root robots.txt for this repository; the sitemap is available at the deployment root's `sitemap.xml` and can be submitted directly.

## Scope and checks

- `/` and `/managers/` render the same content; both name `/` as canonical. The sitemap lists that content once.
- Preview, Lab and unknown SPA routes have `noindex,nofollow` metadata. This is an indexing instruction, not access control.
- The protected archive and its existing noindex redirect documents are not rewritten by this build step. Private Lab builds emit no public sitemap or marketing route copies.
- Google chooses snippets and result images; these fields are hints, not a guarantee of the exact search result or immediate indexing. Social services may also cache existing link previews.

Run `node --test scripts/test-site-metadata.mjs` and `GITHUB_PAGES=true npm run build`. Inspect `dist/kit-story/index.html` without executing JavaScript, and check that the absolute preview image URL returns the WebP image. Test internal navigation to confirm metadata follows the route. The full publishing workflow also runs TypeScript and the site's existing tests.
