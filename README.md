# Foam homepage

Live source for agents: **SteveBlackboxapi/NEWFOAMHOME**

Vite + React 19 + Tailwind v4. Figma Make export, 18 Sep 2026.

```bash
git clone https://github.com/SteveBlackboxapi/NEWFOAMHOME.git
cd NEWFOAMHOME
pnpm install
pnpm dev
```

## Routes

`/` `/managers` `/brands` `/creators` `/features` `/about` `/data-trust` `/updates` `/demo`

## Visual rules

Lime, off-white, pale blue, deep navy, black. Brand burgundy `#7a0036`. No orange. No copied social logos.

## Still to push from the Make zip

`public/fonts`, photo PNGs, and the full Figma page implementations (`Home.tsx` Gmail/kit mock, `FoamAppScreen.tsx`). GitHub's agent file API is text-only; drop those from the unzipped export with a normal `git add public src && git push`.

Pages workflow is in `.github/workflows/pages.yml`. Enable Pages → GitHub Actions in repo settings when you want the preview URL.
