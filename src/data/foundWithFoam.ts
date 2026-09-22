import type { StagedTalent, TalentContentTile } from "./stagedTalent";
import { websiteAria, websiteSamantha } from "./websiteTalent";

export type FoundResult = {
  id: string;
  talent: StagedTalent;
  tile: TalentContentTile;
};

function resultFor(talent: StagedTalent, filename: string): FoundResult {
  // Match the pictured asset, not its position or a video with the same poster.
  const index = talent.content.findIndex(
    (tile) => tile.type === "still" && tile.thumb.endsWith(`/${filename}`),
  );
  if (index < 0) throw new Error(`Missing Found with Foam asset: ${filename}`);
  const tile = talent.content[index];
  return { id: `${talent.id}:${tile.id ?? index}`, talent, tile };
}

/**
 * Curated demo results for “Everyday makeup and haircare”. Each image has been
 * visually checked against that query. Keep the original tile metadata: zero
 * views on an unpublished asset and missing engagements are not live metrics.
 */
export const FOUND_RESULTS: FoundResult[] = [
  resultFor(websiteSamantha, "samantha-pikka-v2-c1.jpg"), // Curl refresh · ID 0
  resultFor(websiteAria, "aria-quen-v2-c1.jpg"), // Lipstick application · ID 0
  resultFor(websiteSamantha, "samantha-pikka-v2-c6.jpg"), // Haircare products · ID 5
  resultFor(websiteAria, "aria-quen-v2-c4.jpg"), // Everyday makeup · ID 3
];

export const FOUND_SELECTED = FOUND_RESULTS[0];
