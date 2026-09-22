import type { StagedTalent, TalentContentTile } from "./stagedTalent";
import { websiteAria, websiteNia, websiteSamantha } from "./websiteTalent";

export type FoundResult = {
  id: string;
  talent: StagedTalent;
  tile: TalentContentTile;
};

function resultFor(
  talent: StagedTalent,
  filename: string,
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
  return { id: `${talent.id}:${tile.id ?? index}`, talent, tile };
}

/** Skincare first, with related beauty posts; retain each post’s demo metadata. */
export const FOUND_RESULTS: FoundResult[] = [
  resultFor(websiteNia, "nia-brooks-skincare.webp"),
  resultFor(websiteAria, "aria-quen-v2-c1.webp"), // Lipstick application
  resultFor(websiteSamantha, "samantha-pikka-v2-c1.webp"), // Curl refresh
  resultFor(websiteAria, "aria-quen-v2-c4.webp"), // Makeup flatlay
  resultFor(websiteSamantha, "samantha-pikka-v2-c6.webp"), // Haircare products
  resultFor(websiteAria, "aria-quen-v2-c3.webp"), // Evening routine
  resultFor(websiteSamantha, "samantha-pikka-v2-c5.webp"), // Morning check-in
  resultFor(websiteAria, "aria-quen-v2-c2.webp"), // Coffee break
  resultFor(websiteAria, "aria-quen-v2-c5.webp"), // Packing essentials
  resultFor(websiteSamantha, "samantha-pikka-dance-solo.webp"),
  resultFor(websiteAria, "aria-quen-v2-c6.webp"), // Evening selfie
  resultFor(websiteSamantha, "samantha-pikka-v2-c2.webp"), // Between takes
  resultFor(websiteSamantha, "samantha-pikka-dance-duo.webp"),
];

export const FOUND_SELECTED = FOUND_RESULTS[0];

/** Real frame captures from the generated ten-second review; ranges stay within it. */
export const FOUND_SEEN = [
  {
    image: `${import.meta.env.BASE_URL}assets/talent/nia-brooks/nia-brooks-seen-1.webp`,
    start: 0,
    end: 4,
    label: "Cleanser applied to skin",
  },
  {
    image: `${import.meta.env.BASE_URL}assets/talent/nia-brooks/nia-brooks-seen-2.webp`,
    start: 5,
    end: 10,
    label: "Product shown in routine",
  },
];
