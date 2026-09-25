# Feed the Feed

Supplied by Steven Lewis on 25 September 2026 for the shared marketing footer and opt-in player. Excluded from `/kit-story/`.

## Sources and provenance

- Song: `/Users/stevenlewis/Desktop/Whalar/FOAM/2026/NEW FOAM WEBSITE/Music/Feed the Feed.m4a`
- Cover: `/var/folders/4k/whmm7b4j7rq_6rj5vsb0f5n80000gn/T/codex-clipboard-0cad979f-e3c5-4046-b15f-e2d5990d068f.png`
- Title and subtitle use the user's approved presentation copy: **Feed the Feed** / **A Fun song to make you smile**, under **A song from Foam**.
- The supplied image and audio are not assigned fictional talent identities. No claim is made here about their creation method or the identities of the pictured performers.

## Files

| File | Purpose | Dimensions / duration | Bytes |
| --- | --- | --- | ---: |
| `feed-the-feed.m4a` | Unchanged supplied audio master | Opus stereo at 48 kHz in an MP4 container; presented audio duration 198.360 seconds, plus a 200.037-second subtitle track | 3,199,962 |
| `feed-the-feed-playback.m4a` | Browser playback derivative | AAC-LC stereo at 48 kHz, 160 kbps; 198.373 seconds | 4,035,863 |
| `cover-original.png` | Unchanged supplied image master | 1024 × 1024 | 1,371,646 |
| `cover.webp` | Footer card | 640 × 640 | 27,578 |
| `cover-small.webp` | Compact player thumbnail | 144 × 144 | 3,578 |

WebP derivatives preserve the full square composition, with no creative edits. Downsampled with Lanczos and encoded at qualities 86 and 84 respectively. The card derivative saves about 98% against the PNG master. Its visual quality and dimensions were checked.

The supplied audio filename uses `.m4a`, but its audio codec is Opus rather than AAC. Native macOS `afinfo` does not open that source. The website therefore uses a compatible AAC-LC playback derivative, with fast-start metadata and only the audio track. It is not trimmed or remixed; the tiny duration difference is encoder padding. Its codec, channel count and duration were verified with `ffprobe`, and macOS `afinfo` opens it successfully. The unchanged master retains all original metadata and the subtitle track.

## SHA-256

```text
9a1bc9496ad1c4823b61b196898704bd70841cd08bfdab73c37446a7fe54246e  feed-the-feed.m4a
6de831199a35edb4c773b8c5bf3d3cc9288300e123c69056928033fd9be43fb2  feed-the-feed-playback.m4a
30152adfdf5ae008179f08c2b186aa5db46ab5e041c78e8b5dd074f49f9d9535  cover-original.png
02d1824e70cfa2cacc16f03608821eef0ebdfe581cb4122d1b0efc5593b95332  cover.webp
43abf3e015584252c4a542bc41bceef71d06ea21033365beae4e19e076ca3754  cover-small.webp
```

## Future replacement

The player consumes `src/data/footerSong.ts`. Add new versioned media and update that metadata when a replacement song or lip-sync video is ready. Retain these originals and provenance; do not overwrite the source masters.
