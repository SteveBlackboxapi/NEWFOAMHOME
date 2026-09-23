# People + colour

The approved second concept is now the shared direction for the marketing site: white space, tall creator photography, Foam colour blocks, white type over images, and a mixed three-column product layout.

## Scope

- Homepage, Managers, Brands, Creators, Features, About, Data & trust, Inside Foam, demo and not-found pages share the new marketing theme.
- The standalone Chrome story gains the shared navigation, footer and typography. Its interactive demonstration is retained.
- Lab pages receive matching canvas and framing styles; their search, filters, saves and media controls remain intact.
- Existing logos are reused. Their redesign is deferred.

## Preservation

- `/ideas/` and `/ideas-two/` remain separate, unchanged review pages.
- `/kit-story/` retains its original source, assets, timing and layout. Marketing rules are scoped to `.pc-site`; the kit route does not receive that class.
- The shared Chrome component returns its original story directly when embedded in the kit. New Chrome styles require `.pc-chrome`, which is only added on the standalone route.
- Source photography, generated-image masters and prompts remain in the concept asset folders. Delivery WebPs and provenance notes are in `public/assets/people-colour/`.

## Validation

- Production build with the `/NEWFOAMHOME/` base path and strict unused-symbol TypeScript check pass.
- All 41 Media Kit and Chrome motion checks pass.
- Desktop and 390px phone review covers marketing page layout, navigation, feature tabs, the photo banner, creator tiles, product grid and the Chrome send interaction.
- Phone marketing pages have no horizontal overflow or clipped headings. The kit route has no marketing theme classes.
- Built-page checks confirm prefixed asset paths, deep links and the About background image. Protected kit and concept files have no diff from the saved second-concept commit.
