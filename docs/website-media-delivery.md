# Website media delivery

`npm run dev` and `npm run build` prepare the media used by the public website. The preparation step reads the placement catalogue, keeps supplied originals, and makes smaller WebP variants at 96, 256, 480, 768 and 1280 pixels where they save bytes. Native `srcset` selection accounts for both layout width and screen density. The manifest and public media directory share a content revision derived from the actual files, so replacing an image gives it a fresh URL.

Generated `public/media/` files are build output and are not committed. `src/data/imageVariants.json` is generated alongside them. Run the preparation step after adding a public placement or changing media. Use `OptimizedImage` with a realistic `sizes` value for new image placements; keep source/download links pointing to the retained originals.

Kit Story gives its opening poster high priority, then warms the following images with two low-priority requests at a time. The warm-up uses the same responsive sizes as the displayed images, stops on unmount, and never queues the long film or song. The Found Story detail video receives sources only when its detail view is active.

Production registers a service worker scoped to the site. It stores revision-addressed public images and fonts only, with at most 180 entries per revision and two retained revisions. App code, HTML, private Lab data, APIs, audio and video are not placed in this persistent image cache. Storage failures leave normal browser loading available. Browsers may evict caches; no preload can guarantee that every first visit or offline request is instantaneous.

The public client also checks `website-version.json` for newer builds. A content fingerprint covers the source and media manifest, including Lab image-only updates. An already-open page refreshes when idle and visible, while playing media, form editing and open dialogs postpone the refresh. The refresh preserves the current route and anchor and uses a new query key to avoid stale HTML. This update check never runs in the private Lab or local development.

The Pages build first applies explicit saved image replacements from the newest pinned Talent Lab catalogue, then prepares responsive media. The Lab workflow and protection of existing drafts are documented in [the private Lab README](../workers/talent-lab/README.md#publishing-website-image-replacements). Build overlays must not be committed over the supplied masters.

Playback savings and fidelity checks are documented in [the talent clip audit](talent-video-previews-v2.md). The overview film has a separate lossless faststart playback copy. The overview (about 11.6 MB) and song (about 3.9 MB) remain click-to-play; full-resolution source files remain available for downloads and editing.
