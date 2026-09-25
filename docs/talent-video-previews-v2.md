# Talent playback previews — 25 September 2026

The four reviewed ten-second talent clips now have 720px-wide WebM and H.264 MP4 playback versions. `talentVideoSources` returns the WebM first and the smaller MP4 fallback second. Original catalogue URLs and files remain unchanged, so downloads, exports and packs continue to use the full-resolution masters.

| Clip | Original MP4 | Previous WebM | New WebM | New MP4 fallback |
| --- | ---: | ---: | ---: | ---: |
| Aria makeup | 18,074,810 B | 4,049,535 B | 1,630,879 B | 1,745,985 B |
| Lena getting ready | 6,751,974 B | 4,664,600 B | 1,077,980 B | 1,503,922 B |
| Nia skincare | 3,538,617 B | 2,292,745 B | 1,582,415 B | 1,730,490 B |
| Samantha curl refresh | 18,922,728 B | 3,765,141 B | 1,490,970 B | 1,834,835 B |
| **Total** | **47,288,129 B** | **14,772,021 B** | **5,782,244 B** | **6,815,232 B** |

WebM playback is 60.86% smaller than the previous reviewed WebMs and 87.77% smaller than the original MP4s. MP4 fallback playback is 85.59% smaller than the originals. Browsers choose one supported source; the two output columns are alternatives. These are full-file byte savings when played, not measured initial-page transfer savings. The existing 805 KB portrait video is already efficient and keeps its original source.

## Encoding and verification

- FFmpeg 7.1, Lanczos scaling to 720px width with an even height, no cropping. Aria/Samantha output 720×1278; Lena/Nia output 720×1280. Nia was already 720px wide.
- WebM: VP9, CRF 28, zero target bitrate, good deadline, CPU-used 2, row multithreading. MP4: H.264 High profile, CRF 22, slow preset, `faststart` metadata layout. Both use YUV 4:2:0.
- All four inputs are silent. Audio is retained when present through optional audio mapping; no audio-stripping option is used.
- Full decoding confirms 24 fps and every source frame preserved: 241 each, except Nia at 242. Playback durations remain approximately 10.042/10.083 seconds.
- Original SHA-256 values still match the preceding audit. Source-selection tests verify both deployment bases, existing source fallback behaviour, file hashes and MP4 metadata preceding video data.
- Matching frames 24, 120 and 216 were compared visually across original, WebM and MP4 for every clip. Faces, skin, fine hair, clothing and background edges remain consistent at the displayed preview size, with no conspicuous blocking or colour shift.
- VMAF compares each output with the original scaled to that output's delivery dimensions. Both streams first receive the same time base and frame-index timestamps. Mean scores range from 92.43–95.86 for WebM and 93.88–95.91 for MP4. This measures compression fidelity at delivery size, not fidelity of the downscale to the full-resolution original, nor browser compatibility.

Exact dimensions, frame counts, hashes and scores are in [the audit JSON](talent-video-previews-v2-audit.json). The earlier full-resolution preview audit remains available in [talent-video-optimization.md](talent-video-optimization.md).

## Reproduction

Use Python 3 and an FFmpeg build with libvpx-vp9, libx264 and libvmaf:

```sh
python3 scripts/encode-talent-video-previews.py --ffmpeg /path/to/ffmpeg
python3 scripts/encode-talent-video-previews.py --verify-only --ffmpeg /path/to/ffmpeg
node --test scripts/test-talent-video.mjs
```

The first command creates only versioned playback derivatives and the audit report. The second fully decodes and compares existing outputs without re-encoding. The temporary encoder used here came from [imageio-ffmpeg 0.6.0](https://pypi.org/project/imageio-ffmpeg/0.6.0/), outside the website dependencies. Encoder options follow the [FFmpeg codec documentation](https://ffmpeg.org/ffmpeg-codecs.html).
