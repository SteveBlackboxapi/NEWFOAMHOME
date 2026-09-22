import type { StagedTalent, TalentContentTile } from "./stagedTalent";
import { websiteAria, websiteSamantha } from "./websiteTalent";

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
  // Match the pictured asset, not its position or a video with the same poster.
  const index = talent.content.findIndex(
    (tile) => tile.type === "still" && tile.thumb.endsWith(`/${filename}`),
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
  // The preserved original shows the serum being discussed in this night routine.
  resultFor(websiteAria, "aria-quen-v2-c3.jpg", true),
  resultFor(websiteAria, "aria-quen-v2-c1.jpg"), // Lipstick application
  resultFor(websiteSamantha, "samantha-pikka-v2-c1.jpg"), // Curl refresh
  resultFor(websiteAria, "aria-quen-v2-c4.jpg"), // Makeup flatlay
];

export const FOUND_SELECTED = FOUND_RESULTS[0];
