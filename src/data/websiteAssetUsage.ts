import { miniSearchContent } from "./miniSearchContent";
import { talentSearchExamples } from "./talentSearchExamples";
import { A } from "../lib/assets";
import { labTalent } from "./labTalentCatalogue";
import { stagedTalent } from "./stagedTalent";
import { websiteAria, websiteNia, websiteSamantha } from "./websiteTalent";
import { creatorLiveExamples } from "./creatorLiveExamples";
import { discoverySearches } from "./discoveryContent";
import { KIT_FEATURED_CONTENT } from "./kitFeaturedContent";
import { websiteFitness } from "./campaignTalent";
import { websiteMatcha } from "./matchaTalent";
import { FOUND_RESULTS, FOUND_SEEN, FOUND_SELECTED } from "./foundWithFoam";
import { overviewFilm } from "./overviewFilm";
import { footerSong } from "./footerSong";

export type WebsiteLocation = { route: string; section: string };
export type WebsiteAssetUsage = {
  src: string;
  /** Person-owned content includes still-life/pet posts; artwork has no invented owner. */
  kind: "person" | "artwork" | "reference-photo";
  talentId?: string;
  assetIds: string[];
  label: string;
  provenance: "ai-generated" | "supplied-reference" | "brand" | "product-demo";
  uses: WebsiteLocation[];
};

/** Match an exact file across local previews, GitHub Pages bases, and cache-busting URLs. */
export function normalizeWebsiteAssetSrc(src: string): string {
  let pathname = src.trim().split(/[?#]/, 1)[0];
  if (/^https?:\/\//i.test(pathname)) {
    try {
      pathname = new URL(pathname).pathname;
    } catch {
      return pathname;
    }
  }
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    /* Preserve malformed paths for a non-match. */
  }
  const assetsAt = pathname.indexOf("/assets/");
  if (assetsAt >= 0) return pathname.slice(assetsAt);
  return pathname.startsWith("assets/") ? `/${pathname}` : pathname;
}

type Owner = Pick<
  WebsiteAssetUsage,
  "talentId" | "assetIds" | "label" | "kind" | "provenance"
>;
const owners = new Map<string, Owner>();
function own(
  src: string | undefined,
  owner: Omit<Owner, "assetIds">,
  assetId: string,
) {
  if (!src) return;
  const key = normalizeWebsiteAssetSrc(src);
  const existing = owners.get(key);
  if (existing) {
    if (!existing.assetIds.includes(assetId)) existing.assetIds.push(assetId);
  } else owners.set(key, { ...owner, assetIds: [assetId] });
}

for (const talent of labTalent) {
  const reference = talent.provenance === "reference";
  const owner: Omit<Owner, "assetIds"> = {
    talentId: talent.id,
    label: `${talent.displayName} · Portrait`,
    kind: reference ? "reference-photo" : "person",
    provenance: reference ? "supplied-reference" : "ai-generated",
  };
  own(talent.portrait, owner, `${talent.id}:portrait`);
  talent.content.forEach((tile, index) => {
    const assetId = `${talent.id}:${tile.id ?? index}`;
    const tileOwner = {
      ...owner,
      label: `${talent.displayName} · ${tile.caption || "Content"}`,
    };
    own(tile.thumb, tileOwner, assetId);
    own(tile.video, tileOwner, assetId);
  });
  talent.referenceImages?.forEach((reference, index) => {
    own(
      reference.src,
      { ...owner, label: `${talent.displayName} · ${reference.label}` },
      `${talent.id}:reference-${index}`,
    );
  });
}

const records = new Map<string, WebsiteAssetUsage>();
function use(
  src: string | undefined,
  route: string,
  section: string,
  metadata?: Partial<Owner>,
) {
  if (!src) return;
  const key = normalizeWebsiteAssetSrc(src);
  let record = records.get(key);
  if (!record) {
    const owner = owners.get(key);
    if (!owner && !metadata?.kind)
      throw new Error(`Uncatalogued website asset: ${src}`);
    record = {
      src,
      kind: "artwork",
      provenance: "product-demo",
      label: key.split("/").pop() || key,
      ...owner,
      ...metadata,
      assetIds: [...(owner?.assetIds || [])],
      uses: [],
    };
    records.set(key, record);
  }
  if (
    !record.uses.some(
      (location) => location.route === route && location.section === section,
    )
  ) {
    record.uses.push({ route, section });
  }
}
function photo(path: string, route: string, section: string) {
  use(`${A}/${path}`, route, section);
}
function artwork(
  path: string,
  label: string,
  route: string,
  section: string,
  provenance: WebsiteAssetUsage["provenance"] = "brand",
) {
  use(`${A}/${path}`, route, section, { kind: "artwork", label, provenance });
}

/** Keep the miniature casts aligned with MiniPrimitives and their rendered scenes. */
function miniature(
  route: string,
  section: string,
  talent: { portrait: string }[],
) {
  talent.forEach(({ portrait }) => use(portrait, route, section));
  artwork("d6571.svg", "Foam symbol", route, section);
}

/** Public route/section manifest, including reachable tabs, scroll stages and mobile variants.
 * Lab pages and saved design concepts are deliberately not public placements.
 * Keep this alongside the pages when moving imagery; the coverage check catches literal new assets.
 */
export const publicWebsiteRoutes = [
  "/",
  "/managers",
  "/brands",
  "/creators",
  "/features",
  "/about",
  "/data-trust",
  "/updates",
  "/demo",
  "/kit-story",
  "/chrome-story",
];
for (const route of publicWebsiteRoutes.filter(
  (route) => !route.endsWith("-story"),
)) {
  artwork("d6571.svg", "Foam symbol", route, "Navigation");
  artwork("brand/foam-wordmark.svg", "Foam wordmark", route, "Navigation");
  artwork("brand/foam-wordmark.svg", "Foam wordmark", route, "Footer");
}

for (const route of publicWebsiteRoutes.filter((route) => route !== "/kit-story")) {
  for (const [src, label] of [
    [footerSong.cover, "Feed the Feed · Supplied cover artwork"],
    [footerSong.thumbnail, "Feed the Feed · Player thumbnail"],
    [footerSong.src, "Feed the Feed · Supplied song"],
  ]) {
    use(src, route, "Footer · A song from Foam", {
      kind: "artwork",
      label,
      provenance: "supplied-reference",
    });
  }
}

const wall = [
  "talent/elise-morgan/elise-morgan-hotel-selfie.webp",
  "talent/nia-brooks/nia-brooks-skincare.webp",
  "people-colour/story-refresh-v1/music-creator.webp",
  "talent/discovery-v1/jax-live-set.webp",
  "people-colour/story-refresh-v1/outdoor-creator.webp",
  "talent/samantha-pikka-v3/samantha-pikka-dance-solo.webp",
  "people-colour/story-refresh-v1/ada-flash.webp",
  "people-colour/original-portraits-v1/blue-portrait-original-v1.webp",
  "talent/fitness-creator/waterfront.webp",
];
wall.forEach((path) => photo(path, "/", "A world of talent · Creator wall"));
discoverySearches[0].assets.forEach(({ src }) =>
  use(src, "/", "A world of talent · Found preview"),
);
photo(
  "people-colour/studio-moment.webp",
  "/",
  "Good work. Deserves to be seen.",
);
photo(
  "people-colour/collaborators.webp",
  "/",
  "A little of everything · Your people",
);
photo(
  "talent/elise-morgan/elise-morgan-hotel-selfie.webp",
  "/",
  "A little of everything · Phone media kit",
);
artwork(
  "foam-media-kit.webp",
  "Media Kit product mark",
  "/",
  "A little of everything · Media Kit",
  "ai-generated",
);
artwork(
  "chrome-store-transparent.webp",
  "Chrome Web Store mark",
  "/",
  "A little of everything · Foam for Chrome",
);
miniature("/", "A little of everything · Foam for Chrome", [websiteSamantha]);
use(overviewFilm.poster, "/", "See Foam in action", {
  kind: "artwork",
  label: "Foam overview film · Poster",
  provenance: "supplied-reference",
});
use(overviewFilm.src, "/", "See Foam in action", {
  kind: "artwork",
  label: "Foam overview film · Product demonstration",
  provenance: "supplied-reference",
});
discoverySearches.forEach((search) =>
  search.assets.forEach(({ src }) =>
    use(src, "/", `Content discovery · ${search.query}`),
  ),
);
artwork(
  "foam-media-kit.webp",
  "Media Kit product mark",
  "/features",
  "Product family · Media Kit",
  "ai-generated",
);
artwork(
  "chrome-store-transparent.webp",
  "Chrome Web Store mark",
  "/features",
  "Product family · Foam for Chrome",
);
discoverySearches[0].assets.forEach(({ src }) =>
  use(src, "/features", "Product family · Found with Foam"),
);
const peopleTiles: Record<string, string[]> = {
  "/managers": [
    "elise-morgan/elise-morgan-hotel-selfie.webp",
    "discovery-v1/jax-live-set.webp",
    "nova-reed-v2/nova-reed-walk.webp",
  ],
  "/brands": [
    "fitness-creator/waterfront.webp",
    "nia-brooks/nia-brooks-skincare.webp",
    "theo-lane/matcha.webp",
  ],
  "/creators": [
    "nova-reed-v2/nova-reed-walk.webp",
    "elise-morgan/elise-morgan-hotel-selfie.webp",
    "lena-croft-v2/lena-croft-outfit.webp",
  ],
  "/about": [
    "lena-croft-v2/lena-croft-outfit.webp",
    "samantha-pikka-v3/samantha-pikka-dance-solo.webp",
    "nia-brooks/nia-brooks-skincare.webp",
  ],
};
peopleTiles["/demo"] = peopleTiles["/creators"];
Object.entries(peopleTiles).forEach(([route, paths]) =>
  paths.forEach((path) => photo(`talent/${path}`, route, "Opening collage")),
);

[websiteSamantha, websiteAria, websiteNia].forEach((talent) =>
  use(talent.portrait, "/managers", "A home for your roster · The beauty edit"),
);
miniature("/managers", "The media kit · Miniature preview", [websiteSamantha]);
miniature("/managers", "Foam for Chrome · Inbox miniature", [websiteSamantha]);
[websiteMatcha, websiteNia].forEach((talent) =>
  use(
    talent.content[0].thumb,
    "/brands",
    "Start with the work · Content examples",
  ),
);
use(websiteFitness.content[1].thumb, "/brands", "Start with the work · Content examples");
use(websiteFitness.content[0].thumb, "/brands", "From interesting to informed · Fitness moment");
miniature("/brands", "Been sent a Foam link? · Sharing miniature", [
  websiteAria,
]);
for (const route of ["/brands", "/features"]) {
  talentSearchExamples.forEach((example) => example.matches.forEach((talent) =>
    use(talent.portrait, route, `${route === "/features" ? "Product preview · Talent search" : "Talent discovery"} · ${example.query}`),
  ));
}

creatorLiveExamples.forEach(({ talentId, name, image }) => {
  own(
    image,
    {
      talentId,
      label: `${name} · Conversational live portrait`,
      kind: "person",
      provenance: "ai-generated",
    },
    `${talentId}:live-portrait-v1`,
  );
  use(image, "/creators", "Your work · Live creator spread");
});
miniature("/creators", "Your side of the connection · Connections miniature", [
  websiteSamantha,
  websiteAria,
  websiteNia,
]);
for (const route of ["/managers", "/kit-story", "/chrome-story"]) {
  for (const [path, label] of [
    ["60920.svg", "Instagram interface icon"],
    ["31c2a.svg", "TikTok interface icon"],
    ["572b1.svg", "YouTube interface icon"],
  ]) {
    artwork(path, label, route, "Product interface · Connected platforms");
  }
}

for (const route of ["/", "/features"]) {
  const section = route === "/" ? "Product family" : "Product preview";
  miniature(route, `${section} · Media kit miniature`, [websiteSamantha]);
  miniature(route, `${section} · Content search miniature`, []);
  miniSearchContent.forEach(({ tile }) => use(tile.thumb, route, `${section} · Content search miniature`));
  miniature(route, `${section} · Foam for Chrome miniature`, [websiteSamantha]);
}
miniature("/features", "Product preview · Shortlist miniature", [
  websiteSamantha,
  websiteAria,
  websiteNia,
]);

photo(
  "people-colour/studio-moment.webp",
  "/about",
  "Our belief · Creative collaboration",
);
photo(
  "people-colour/story-refresh-v1/ada-flash.webp",
  "/about",
  "Invitation · Original studio portrait",
);
photo(
  "people-colour/story-refresh-v1/outdoor-creator.webp",
  "/about",
  "Invitation · Outdoor portrait",
);
miniature(
  "/data-trust",
  "The person behind the profile · Connections miniature",
  [websiteSamantha, websiteAria, websiteNia],
);
miniature("/data-trust", "The connection, explained · Permissions miniature", [
  websiteSamantha,
]);
miniature("/data-trust", "Put it in context · Media kit miniature", [
  websiteSamantha,
]);
use(websiteSamantha.portrait, "/updates", "Featured story · Media kits");
use(websiteAria.portrait, "/updates", "Two more ways in · Foam for Chrome");
use(
  websiteNia.content[0].thumb,
  "/updates",
  "Two more ways in · Content discovery",
);

artwork(
  "brand/foam-story-lockup-white.svg",
  "Foam white story lockup",
  "/kit-story",
  "Opening · Story navigation",
);
artwork(
  "foam-media-kit.webp",
  "Media Kit product mark",
  "/kit-story",
  "Media Kit · Opening and send finale",
  "ai-generated",
);
artwork(
  "agency-logos.webp",
  "Agency logo ticker artwork",
  "/kit-story",
  "In good company · Agency ticker",
);
for (const [path, label] of [
  ["20684.svg", "Instagram mark"],
  ["8509e.svg", "TikTok mark"],
  ["d0b8e.svg", "YouTube mark"],
  ["a2840.svg", "Share icon"],
  ["fdb3b.svg", "Foam app symbol"],
]) {
  artwork(path, label, "/kit-story", "Media Kit · Product interface");
}
photo(
  "io-portrait-poster.webp",
  "/kit-story",
  "Media Kit · Samantha portrait film",
);
photo(
  "io-portrait-web.mp4",
  "/kit-story",
  "Media Kit · Samantha portrait film",
);
use(
  websiteSamantha.portrait,
  "/kit-story",
  "Media Kit · Profile and sharing preview",
);
KIT_FEATURED_CONTENT.forEach((tile) => {
  use(tile.thumb, "/kit-story", "Media Kit · Featured content");
  use(tile.video, "/kit-story", "Media Kit · Featured content");
});
for (const route of ["/kit-story", "/chrome-story"]) {
  artwork(
    "chrome-store-transparent.webp",
    "Chrome Web Store mark",
    route,
    "Foam for Chrome · Send finale",
  );
  artwork(
    route === "/kit-story"
      ? "chrome-desktop-blurio.webp"
      : "chrome-desktop-landscape.webp",
    route === "/kit-story"
      ? "Blurio desktop wallpaper"
      : "Chrome demo landscape wallpaper",
    route,
    "Foam for Chrome · Desktop background",
    route === "/kit-story" ? "supplied-reference" : "product-demo",
  );
  artwork(
    "fdb3b.svg",
    "Foam app symbol",
    route,
    "Foam for Chrome · Extension and browser",
  );
  stagedTalent.forEach((talent) =>
    use(talent.portrait, route, "Foam for Chrome · Extension roster"),
  );
  use(
    websiteSamantha.portrait,
    route,
    "Foam for Chrome · Selected profile and pasted email",
  );
}
FOUND_RESULTS.forEach(({ talent, tile }) => {
  use(tile.thumb, "/kit-story", "Found with Foam · Search results");
  use(talent.portrait, "/kit-story", "Found with Foam · Result avatars");
});
use(FOUND_SELECTED.tile.video, "/kit-story", "Found with Foam · Review video");
use(
  FOUND_SELECTED.tile.thumb,
  "/kit-story",
  "Found with Foam · Review video poster",
);
FOUND_SEEN.forEach(({ image, label }) =>
  use(image, "/kit-story", `Found with Foam · Evidence: ${label}`),
);
artwork(
  "999f1.svg",
  "Engagements icon",
  "/kit-story",
  "Found with Foam · Post metrics",
);
artwork(
  "169ab.svg",
  "Views icon",
  "/kit-story",
  "Media Kit and Found with Foam · Content metrics",
);
artwork(
  "958bd.svg",
  "Instagram content icon",
  "/kit-story",
  "Media Kit and Found with Foam · Content platform",
);
artwork(
  "23d4f.svg",
  "Media Kit drag handle",
  "/kit-story",
  "Media Kit · Editor controls",
);
artwork(
  "5f955.svg",
  "Media Kit pencil icon",
  "/kit-story",
  "Media Kit · Editor controls",
);
artwork(
  "fdb3b.svg",
  "Foam app symbol",
  "/kit-story",
  "Found with Foam · Workspace",
);
artwork(
  "campaigns/found-with-foam-skincare-v4.webp",
  "Found with Foam · Illustrative skincare campaign",
  "/kit-story",
  "From a search to your next campaign",
  "ai-generated",
);

export const websiteAssetUsage: WebsiteAssetUsage[] = [...records.values()];
export const websiteArtwork = websiteAssetUsage.filter(
  (asset) => asset.kind === "artwork",
);
export const websiteReferencePhotos = websiteAssetUsage.filter(
  (asset) => asset.kind === "reference-photo",
);

export function websiteUsageFor(src: string): WebsiteAssetUsage | undefined {
  return records.get(normalizeWebsiteAssetSrc(src));
}
export function websiteUsageForTalent(talentId: string): WebsiteAssetUsage[] {
  return websiteAssetUsage.filter((asset) => asset.talentId === talentId);
}
export function websiteLocationsForTalent(talentId: string): WebsiteLocation[] {
  const locations = new Map<string, WebsiteLocation>();
  websiteUsageForTalent(talentId).forEach((asset) =>
    asset.uses.forEach((location) => {
      locations.set(`${location.route}:${location.section}`, location);
    }),
  );
  return [...locations.values()];
}
