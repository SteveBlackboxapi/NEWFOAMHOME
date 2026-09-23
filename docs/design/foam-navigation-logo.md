# Foam navigation lockup

The marketing navigation uses the existing, original F vector (`public/assets/d6571.svg`) inside a square navy badge. Its wordmark follows the full Foam lockup supplied in `Screenshot 2026-09-23 at 13.08.46.png`.

The supplied wordmark matches the already bundled Founders Grotesk Medium (500), with zero letter spacing. This was checked by rendering the actual Founders and SF Pro font files at reference size: Founders matches the curved `f` terminal, `a` tail, letter weight, and total word width. No new logo artwork or substitute font is needed.

The full reference is approximately 2.78 times as wide as its badge. The navigation retains that proportion with a 36px badge, a 27px wordmark, and a 7px gap (32px / 24px / 6px on phones). The F inset is also matched to the reference: its visible mark is roughly 39% of the badge width and 53% of its height. A small optical vertical adjustment aligns the wordmark with the badge.

Sources inspected 23 September 2026:

- [Foam app](https://fluid.foam.io/)
- [Public sidebar implementation](https://fluid.foam.io/assets/_authenticated-exWis8rD.js): `ri()` renders the lowercase wordmark and `ni()` renders the F badge.
- [Public app stylesheet](https://fluid.foam.io/assets/index-CS2c6hAt.css): `text-display-medium` declares Founders Grotesk at font weight 500, letter spacing 0%.

Only the shared marketing navigation is changed. The wordmark links to `/kit-story/`, as requested. Its explicit class specificity prevents the wider marketing theme from reapplying the previous logo typography. No new trademark artwork or raster logo was generated.
