# Foam overview film — supplied original

Added on 24 September 2026 for the “See Foam in action” section on the homepage, following approval of the separate placement preview. The preview remains available at `/home-film-preview/`. The film and poster are supplied assets, not AI-generated media. The source files are unchanged. On 25 September a separate playback copy was remuxed with faststart metadata; its picture and audio were copied without re-encoding.

## Files

| Website file / original download | Supplied source filename | Details | Size |
| --- | --- | --- | --- |
| [overview.mp4](./overview.mp4) | `zxcFfSqECze9toQn1Pu3kisKP8.mp4` | 118.868 seconds; one audio track | 11,628,594 bytes |
| [overview-playback.mp4](./overview-playback.mp4) | Playback derivative of the above | Identical video/audio data; metadata before media for early playback | 11,625,668 bytes |
| [poster.webp](./poster.webp) | `0d1ad.webp` | 1872 × 1056 pixels; WebP | 89,094 bytes |

`overview.mp4` and `poster.webp` also serve as the unchanged originals. Sources were supplied from `Desktop/Whalar/FOAM/2026/NEW FOAM WEBSITE/Video/`; the files in that source directory remain untouched.

## Verification

SHA-256 checksums of the website copies match the supplied files:

```text
59a972252fd7858d660b6837a38fdd4c488f40bd171335461618a8f0c10e7102  overview.mp4
dd3b15c8b81709640ce66ff79217bdf40a616602f40b598c2a9590ed3cde6367  overview-playback.mp4
1eefcc2279c2643147c3573cc041f3314bcdcfdb02223c68dee5c8cdf1e9b371  poster.webp
```

Duration and audio presence were inspected with native AVFoundation. Poster dimensions were verified without conversion. The supplied poster already includes a play symbol.

## Faststart playback copy

The supplied film is already compressed to H.264 1080p at about 612 kbps video plus 163 kbps stereo AAC audio. The playback change preserves that encoding, all media bytes, stream settings and duration. The original `moov` metadata was after the media data, at byte 11,531,254. In the playback copy it starts at byte 32, ahead of the media data. This improves metadata availability at playback start; it is not a quality-reducing compression change.

FFmpeg 7.1 reproduced the derivative with:

```sh
ffmpeg -i public/assets/films/foam-overview-v1/overview.mp4 -map 0 -c copy -map_metadata 0 -movflags +faststart public/assets/films/foam-overview-v1/overview-playback.mp4
node --test scripts/test-overview-playback.mjs
```

The complete `mdat` media payload is byte-identical in the two files. Separate SHA-256 packet-stream hashes also match for both video and audio. The automated test checks this media identity, the retained master checksum, faststart box order and the centrally selected catalogue playback path. Full measurements are in `docs/overview-faststart-audit.json` at the repository root.

## Replacing the film later

Treat the film, poster, accessible description and displayed duration as independently editable presentation data. Keep the original files in this versioned folder and add replacement media in a new versioned folder. Update the shared references in `src/data/overviewFilm.ts` for both the homepage and retained preview, then verify playback, audio, poster framing and the duration label. Avoid loading the film until the visitor chooses to watch it. A future replacement does not require changing the homepage section's layout.
