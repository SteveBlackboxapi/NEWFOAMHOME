import { A } from "../lib/assets";
import type { StagedTalent, TalentContentTile } from "./stagedTalent";
import { websiteCamille, websiteAngelina } from "./skincareReviewTalent";
import {
  websiteAria,
  websiteElise,
  websiteLena,
  websiteMira,
  websiteNia,
  websiteSamantha,
} from "./websiteTalent";

export type FoundResult = {
  id: string;
  talent: StagedTalent;
  tile: TalentContentTile;
  /** Illustrative product match signals, not an analysis of the generated media. */
  evidence: ("visual" | "audio" | "hashtag")[];
};

function resultFor(
  talent: StagedTalent,
  filename: string,
  evidence: FoundResult["evidence"] = ["visual"],
  useOriginal = false,
): FoundResult {
  // Match the pictured asset, including the selected video's poster.
  const index = talent.content.findIndex((tile) =>
    tile.thumb.endsWith(`/${filename}`),
  );
  if (index < 0) throw new Error(`Missing Found with Foam asset: ${filename}`);
  const source = talent.content[index];
  if (useOriginal && !source.original)
    throw new Error(`Missing original asset: ${filename}`);
  const tile = useOriginal ? { ...source, thumb: source.original! } : source;
  return { id: `${talent.id}:${tile.id ?? index}`, talent, tile, evidence };
}

/** Skincare first, with related beauty posts; retain each post’s demo metadata. */
export const FOUND_RESULTS: FoundResult[] = [
  resultFor(websiteNia, "nia-brooks-skincare.webp"),
  resultFor(websiteMira, "mira-vale-paused-makeup.webp", ["visual", "audio"]), // Candid makeup frame
  resultFor(websiteAria, "aria-quen-v2-c1.webp", ["visual", "audio", "hashtag"]), // Lipstick application
  resultFor(websiteElise, "elise-morgan-hotel-selfie.webp"), // Hotel getting-ready moment
  resultFor(websiteLena, "serum-closeup.webp", ["visual", "audio"]), // Tight serum close-up
  resultFor(websiteAria, "aria-quen-v2-c4.webp"), // Makeup flatlay
  resultFor(websiteSamantha, "samantha-pikka-v2-c1.webp", ["visual", "audio"]), // One Samantha appearance
  resultFor(websiteLena, "serum-review.webp"), // Angled product review
  resultFor(websiteCamille, "evening.webp", ["visual", "audio", "hashtag"]),
  resultFor(websiteAngelina, "cleanser.webp", ["visual", "hashtag"]),
];

export const FOUND_SELECTED = FOUND_RESULTS[0];

/** Real frame captures from the generated ten-second review; ranges stay within it. */
export const FOUND_SEEN = [
  {
    image: `${A}/talent/nia-brooks/nia-brooks-seen-1.webp`,
    start: 0,
    end: 4,
    label: "Cleanser applied to skin",
  },
  {
    image: `${A}/talent/nia-brooks/nia-brooks-seen-2.webp`,
    start: 5,
    end: 10,
    label: "Product shown in routine",
  },
];
