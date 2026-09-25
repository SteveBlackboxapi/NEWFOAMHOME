# Feed the Feed — second supplied version

Steven Lewis replaced the source song on 25 September 2026 with the version described as having a studio sound. This is the current footer player version. The previous supplied audio remains unchanged in `../feed-the-feed-v1/`; existing artwork is reused from that folder.

Source: `/Users/stevenlewis/Desktop/Whalar/FOAM/2026/NEW FOAM WEBSITE/Music/Feed the Feed.m4a`

The source was independently re-read and checked before copying. Its modification time was 25 September 2026 at 13:21:01, its size was 3,211,409 bytes, and its SHA-256 differs from the first supplied version. `feed-the-feed.m4a` here is a byte-identical copy of that new source.

| File | Purpose | Format / duration | Bytes |
| --- | --- | --- | ---: |
| `feed-the-feed.m4a` | Unchanged second supplied master | Opus stereo at 48 kHz in an MP4 container; 189.560 seconds presented audio, with a 193.734-second subtitle track | 3,211,409 |
| `feed-the-feed-playback.m4a` | Current browser playback derivative | AAC-LC stereo at 48 kHz, 160 kbps; 189.573 seconds | 3,890,157 |

The browser derivative contains the audio track, encoded to AAC-LC with fast-start metadata for compatibility. It is not trimmed or remixed; the tiny duration difference is encoder padding. The supplied master retains the original metadata and subtitle track. Codec, channel count and duration were checked with `ffprobe`.

## SHA-256

```text
36bdc797efe9b89a31562a8cfd5ecbd5cd6e9d8d3569d811b415140b2c001136  feed-the-feed.m4a
dc6ed70c91657f1754c14374392f102afbc017ba6682c11fa4bea719bb9d9b91  feed-the-feed-playback.m4a
```

Previous source checksum, retained in `../feed-the-feed-v1/`:

```text
9a1bc9496ad1c4823b61b196898704bd70841cd08bfdab73c37446a7fe54246e
```

`src/data/footerSong.ts` selects this version. The shared footer excludes `/kit-story/`. Song and image provenance remain supplied reference material; this record makes no additional claims about creation method or performer identities.
