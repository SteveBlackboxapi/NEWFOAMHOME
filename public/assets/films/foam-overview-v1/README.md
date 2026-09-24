# Foam overview film — supplied original

Added on 24 September 2026 for the “See Foam in action” section on the homepage, following approval of the separate placement preview. The preview remains available at `/home-film-preview/`. The film and poster are supplied assets, not AI-generated media. The source files are unchanged; the copies have descriptive filenames and have not been recompressed, resized or re-encoded.

## Files

| Website file / original download | Supplied source filename | Details | Size |
| --- | --- | --- | --- |
| [overview.mp4](./overview.mp4) | `zxcFfSqECze9toQn1Pu3kisKP8.mp4` | 118.868 seconds; one audio track | 11,628,594 bytes |
| [poster.webp](./poster.webp) | `0d1ad.webp` | 1872 × 1056 pixels; WebP | 89,094 bytes |

The linked files also serve as the unchanged originals. Sources were supplied from `Desktop/Whalar/FOAM/2026/NEW FOAM WEBSITE/Video/`; the files in that source directory remain untouched.

## Verification

SHA-256 checksums of the website copies match the supplied files:

```text
59a972252fd7858d660b6837a38fdd4c488f40bd171335461618a8f0c10e7102  overview.mp4
1eefcc2279c2643147c3573cc041f3314bcdcfdb02223c68dee5c8cdf1e9b371  poster.webp
```

Duration and audio presence were inspected with native AVFoundation. Poster dimensions were verified without conversion. The supplied poster already includes a play symbol.

## Replacing the film later

Treat the film, poster, accessible description and displayed duration as independently editable presentation data. Keep the original files in this versioned folder and add replacement media in a new versioned folder. Update the shared references in `src/data/overviewFilm.ts` for both the homepage and retained preview, then verify playback, audio, poster framing and the duration label. Avoid loading the film until the visitor chooses to watch it. A future replacement does not require changing the homepage section's layout.
