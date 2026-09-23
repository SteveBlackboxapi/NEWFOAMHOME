# Foam navigation lockup

The marketing navigation uses the existing, original F vector (`public/assets/d6571.svg`) inside a square navy badge. Its wordmark follows the public Foam app shown in the user's 23 September 2026 screenshot, rather than the previous tightly tracked Founders Semibold treatment.

The public app renders `foam` as text, not as a separate logo SVG. Its sidebar component uses `text-display-medium` with weight 500 and zero letter spacing. On inspection the declared Founders Medium font URL returned HTTP 404, leaving the app's system font fallback. This explains the rounder, more open wordmark in the supplied macOS screenshot. The marketing lockup uses the already bundled SF Pro Text Medium (500) to retain that appearance consistently without relying on a failed font request.

Sources inspected 23 September 2026:

- [Foam app](https://fluid.foam.io/)
- [Public sidebar implementation](https://fluid.foam.io/assets/_authenticated-exWis8rD.js): `ri()` renders the lowercase wordmark and `ni()` renders the F badge.
- [Public app stylesheet](https://fluid.foam.io/assets/index-CS2c6hAt.css): `text-display-medium` font weight 500, letter spacing 0%; system-ui / -apple-system fallbacks.

Only the shared marketing navigation is changed. The wordmark links to `/kit-story/`, as requested. Its explicit class specificity prevents the wider marketing theme from reapplying the previous logo typography. No new trademark artwork or raster logo was generated.
