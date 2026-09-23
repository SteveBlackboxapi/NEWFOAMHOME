# Foam discovery and colour refinement

23 September 2026

## Visible changes

- Replace the magnifying-glass/play artwork in the creator wall and Found product tile with a small search-and-content scene.
- Cycle the homepage Discovery card through outfits, skincare, Nike-related posts and cats. Each query has three matching images and opens the same set in the content library.
- Add eight original illustrative stills to the Lab catalogue. Keep existing posts and stable asset identities; do not invent performance metrics for new posts. Retain AI disclosure, original PNGs, editable captions and generation records.
- Use the original Foam F and a wordmark closer to the application reference. Link the shared navigation logo to `/kit-story/`.
- Apply the supplied Media Kit colours: white, black, pale blue, soft sage and pink verification marks. Preserve its structure, imagery, sizing, interactions and animation timing.

## Behaviour

The search loop pauses offscreen, in a hidden tab, or with its Pause control. Manual search selection holds that result until Play is selected. Reduced-motion preferences disable automatic cycling; all search choices remain available. Queries are URL-driven and shared between the homepage and library.

## References and assets

- User-supplied Foam product screenshots informed the visual treatment and subject mix.
- [Navigation logo evidence](foam-navigation-logo.md)
- [Image prompts and saved asset paths](../../public/assets/talent/discovery-v1/creative-brief.md)
- [Generation manifest](../../public/assets/talent/discovery-v1/generation-manifest.json)

The saved `/ideas/` and `/ideas-two/` concepts remain unchanged.

## Validation

- Production build with GitHub Pages base path and TypeScript checks.
- Search/deep-link, responsive feed placement and stable asset identity tests (10 checks).
- Media Kit and Chrome motion regression tests (41 checks).
- Browser review of the search loop, pause/play, matching library searches, logo destination, kit colours, and desktop/phone layouts.
