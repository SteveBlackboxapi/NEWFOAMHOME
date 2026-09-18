# Foam homepage — Figma Make export

Marketing site for Foam. Vite + React 19 + Tailwind v4. Exported from Figma Make on 18 Sep 2026.

**This is the repo agents should use.**

`https://github.com/Steve4Foam/NEWFOAMHOME` is not reachable from the connected GitHub account (`SteveBlackboxapi`). This public repo is the same name, under the account agents can read and push.

## Run locally

```bash
pnpm install
pnpm dev
```

Dev server defaults to port 8443 (Figma Make config).

## Routes

- `/` home
- `/managers` `/brands` `/creators` `/features` `/about` `/data-trust` `/updates` `/demo`

## Notes for agents

- Hero copy to keep: *Nobody got into creator management for the spreadsheet. Get back to the part you're actually good at.* CTA: *Ditch the spreadsheet.*
- Palette: lime, off-white, pale blue, deep navy, black. Brand burgundy `#7a0036` is in tokens. No orange as brand colour. No copying social logos.
- Light = editorial contrast. Dark = live intelligence.
- `@make-kits/foam-connect-ios-steve` is a Figma Make kit. It is listed in package.json; source pages do not import it. Install may fail outside Figma unless that package is removed or mirrored.
- `public/assets`, `public/fonts`, and hashed SVGs/PNGs from the zip still need a git push from a machine that can upload binaries (~21MB). This first commit is the source tree so the repo is no longer empty.

## Pages

GitHub Pages is not enabled yet. After assets are in the repo, add a Vite static deploy (GitHub Pages or Netlify) with `base: '/'`.
