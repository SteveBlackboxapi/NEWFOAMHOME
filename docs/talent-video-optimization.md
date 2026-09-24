# Talent Lab video previews — 24 September 2026

Four larger Talent Lab clips have smaller VP9/WebM playback previews. Their original MP4s remain untouched and are still used for downloads, exports and packs. The Lab offers WebM first with a native MP4 `<source>` fallback. Unreviewed media and external/uploaded URLs keep their existing source.

| Clip | Original MP4 | WebM preview | Reduction | Mean VMAF | Mean SSIM |
| --- | ---: | ---: | ---: | ---: | ---: |
| Aria — makeup | 18,074,810 B | 4,049,535 B | 77.60% | 95.17 | 0.9971 |
| Lena — getting ready | 6,751,974 B | 4,664,600 B | 30.92% | 94.43 | 0.9983 |
| Nia — skincare | 3,538,617 B | 2,292,745 B | 35.21% | 96.96 | 0.9962 |
| Samantha — curl refresh | 18,922,728 B | 3,765,141 B | 80.10% | 95.34 | 0.9964 |
| Samantha — original portrait | 805,389 B | Not retained | — | — | — |

The four retained previews total **14,772,021 B instead of 47,288,129 B: 68.76% smaller**. The original portrait remains MP4 because the trial WebM was larger (1,525,568 B). `ren-kit.mp4` is outside this Lab-only change.

## Encoding and verification

- FFmpeg 7.1 with `libvpx-vp9`, constant quality, CRF 24; Lena uses CRF 20 for more detail.
- Shared settings: `-b:v 0 -deadline good -cpu-used 2 -row-mt 1 -threads 4 -pix_fmt yuv420p -fps_mode passthrough`.
- No scaling, cropping, frame-rate reduction or frame removal. All inputs are silent, so no audio was removed.
- Every original and resulting file was fully decoded. Dimensions, 24 fps and frame counts match exactly (241 frames each except Nia at 242).
- Full-clip VMAF, SSIM and PSNR compared decoded WebM frames to the existing MP4. Frame timestamps were aligned by index at the source's 24 fps for measurement; MP4 and WebM use different container time bases. This avoids comparing adjacent frames because of millisecond timestamp rounding. Quality metrics describe fidelity to the existing MP4, not the quality of the generated source.
- Matched middle frames were inspected side by side for all four clips; faces, hair, clothing and background detail remained visually consistent.
- A native WebM/VP9 source is offered first, followed by the original MP4. Browsers without VP9 support can skip it. Browser playback still needs verification on the target preview/deployment; metrics and successful decoding alone do not establish playback in every browser.

Hashes, exact dimensions, frame counts and measurements are recorded in [the audit JSON](talent-video-audit-2026-09-24.json). Playback paths and fallback preservation are covered by `scripts/test-talent-video.mjs`.

The temporary encoding tool was obtained from the [imageio-ffmpeg distribution](https://pypi.org/project/imageio-ffmpeg/0.6.0/); it is not a new website dependency. Encoding options follow [FFmpeg's libvpx documentation](https://ffmpeg.org/ffmpeg-codecs.html#libvpx).
