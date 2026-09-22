# Website image delivery

Prefer WebP for photographs and raster backgrounds when it produces a smaller file at the required visual quality. Keep SVG artwork as vectors and use lossless compression for sharp text or transparency. Retain source masters.

## September 2026 image pass

These 22 delivered assets total 3,570,064 bytes, down from 18,429,323 bytes (80.6% smaller). This compares the prior bitmap payloads, not the full page transfer. Dimensions are unchanged. PNG/JPEG masters remain available in the repository.

The corrected billboard WebP is used exactly as supplied; its logo is already part of the artwork. Photo variants were encoded with Pillow WebP, method 6, with the quality below. The transparent agency logo sheet is lossless. Existing small JPEGs remain when quality-90 WebP saves less than 20%.

| Served file | Before (bytes) | After (bytes) | Encoding |
| --- | ---: | ---: | --- |
| `3546d.webp` | 1,275,104 | 126,654 | Quality 85 |
| `9e849.webp` | 1,214,946 | 126,976 | Quality 85 |
| `agency-logos.webp` | 55,775 | 41,412 | Lossless |
| `b93cd.webp` | 933,504 | 50,994 | Quality 85 |
| `campaigns/found-with-foam-skincare-v2.webp` | 2,453,769 | 157,486 | Supplied corrected WebP, unchanged |
| `chrome-desktop-landscape.webp` | 2,710,077 | 319,030 | Quality 85 |
| `talent/aria-quen-v2/aria-quen-v2-c1.webp` | 415,612 | 182,466 | Quality 90 |
| `talent/aria-quen-v2/aria-quen-v2-c2.webp` | 455,955 | 204,114 | Quality 90 |
| `talent/aria-quen-v2/aria-quen-v2-c3.webp` | 469,848 | 201,710 | Quality 90 |
| `talent/aria-quen-v2/aria-quen-v2-c4.webp` | 440,853 | 195,854 | Quality 90 |
| `talent/aria-quen-v2/aria-quen-v2-c5.webp` | 502,859 | 254,230 | Quality 90 |
| `talent/aria-quen-v2/aria-quen-v2-c6.webp` | 429,474 | 181,358 | Quality 90 |
| `talent/aria-quen-v2/aria-quen-v2-portrait.webp` | 480,649 | 239,584 | Quality 90 |
| `talent/nia-brooks/nia-brooks-profile.webp` | 2,026,548 | 115,020 | Quality 85 |
| `talent/nia-brooks/nia-brooks-seen-1.webp` | 212,191 | 82,102 | Quality 90 |
| `talent/nia-brooks/nia-brooks-seen-2.webp` | 219,322 | 87,234 | Quality 90 |
| `talent/nia-brooks/nia-brooks-skincare.webp` | 2,100,084 | 123,384 | Quality 85 |
| `talent/samantha-pikka-v2/samantha-pikka-v2-c1.webp` | 401,105 | 173,164 | Quality 90 |
| `talent/samantha-pikka-v2/samantha-pikka-v2-c2.webp` | 408,080 | 188,058 | Quality 90 |
| `talent/samantha-pikka-v2/samantha-pikka-v2-c5.webp` | 417,788 | 182,736 | Quality 90 |
| `talent/samantha-pikka-v2/samantha-pikka-v2-c6.webp` | 423,799 | 182,528 | Quality 90 |
| `talent/samantha-pikka-v2/samantha-pikka-v2-portrait.webp` | 381,981 | 153,970 | Quality 90 |
