# 720px talent playback previews

Reviewed VP9/WebM and H.264/MP4 derivatives for four existing talent clips. Both formats preserve all source frames and the original frame rate. All current sources are silent. The MP4 versions put playback metadata before video data for early playback.

Originals remain under their existing `assets/talent/` paths for downloads and packs. These files are selected only for playback by `src/lib/talentVideo.ts`.

Reproduce with `scripts/encode-talent-video-previews.py`. Encoding settings, visual review, hashes, decoded frame counts and size comparisons are documented in `docs/talent-video-previews-v2.md` and `docs/talent-video-previews-v2-audit.json`.
