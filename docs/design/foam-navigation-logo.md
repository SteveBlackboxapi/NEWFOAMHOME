# Foam navigation lockup

The marketing navigation uses the existing, original F vector (`public/assets/d6571.svg`) inside a square navy badge. Its wordmark follows the full Foam lockup supplied in `Screenshot 2026-09-23 at 13.08.46.png`.

The supplied wordmark matches the already bundled Founders Grotesk Medium (500), with zero letter spacing. This was checked by rendering the actual Founders and SF Pro font files at reference size: Founders matches the curved `f` terminal, `a` tail, letter weight, and total word width. No new logo artwork or substitute font is needed.

The full reference is approximately 2.78 times as wide as its badge. The navigation retains that proportion with a 36px badge, a 56px-wide outlined wordmark, and a 7px gap (32px / 50px / 6px on phones). The F inset is also matched to the reference: its visible mark is roughly 39% of the badge width and 53% of its height. The tight vector bounds centre the visible wordmark against the badge.

Sources inspected 23 September 2026:

- [Foam app](https://fluid.foam.io/)
- [Public sidebar implementation](https://fluid.foam.io/assets/_authenticated-exWis8rD.js): `ri()` renders the lowercase wordmark and `ni()` renders the F badge.
- [Public app stylesheet](https://fluid.foam.io/assets/index-CS2c6hAt.css): `text-display-medium` declares Founders Grotesk at font weight 500, letter spacing 0%.

The navigation wordmark links to `/kit-story/`, as requested. Its explicit class specificity prevents the wider marketing theme from reapplying the previous logo typography.

## Vector wordmark

The footer and header now use `public/assets/brand/foam-wordmark.svg`: outlines extracted from the same original Founders Grotesk Medium glyphs, with normal kerning and zero added tracking. This removes the footer's separate Semibold, tightly tracked text treatment and makes the shape independent of CSS typography and font loading. The vector has a 2076 × 654 view box and is rendered without distortion. Its provenance and source font checksum are recorded in `public/assets/brand/README.md`.

The desktop navigation, mobile menu and footer include a Home link so the main marketing page remains directly reachable while the header logo still opens Kit story.
