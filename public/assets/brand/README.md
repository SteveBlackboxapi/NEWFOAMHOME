# Foam wordmark

`foam-wordmark.svg` contains actual vector outlines of the four original glyphs from `public/fonts/Founders_Grotesk-Medium.woff2`, the typeface and weight matched to the full Foam logo supplied on 23 September 2026 (`Screenshot 2026-09-23 at 13.08.46.png`). It is not AI-generated artwork or a raster trace.

The glyphs were laid out as `foam` at weight 500 with the font's normal kerning and zero added letter spacing, then converted to Bézier paths with Skia's `outlineText`. The paths were translated to a tight view box without stretching, scaling individual letters, or altering the letter spacing. The original font remains unchanged.

- Intrinsic dimensions: 2076 × 654; aspect ratio 3.1743119266:1.
- Fill: Foam navy `#101828`.
- No `<text>`, embedded bitmap, font loading dependency, or decorative symbol.
- Source font SHA-256: `3dd4c2c38e3a33da06e7a9a870ab23dddd404dc14705baf35753833c3b75f6a9`.

The standalone SVG can be reused beside the original F badge. The footer renders it with its intrinsic aspect ratio. Footer CSS changes only its overall width and, on the legacy dark footer, its colour; it cannot apply tracking or font substitutions to the outlined letters.
