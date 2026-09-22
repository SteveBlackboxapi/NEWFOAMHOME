import { websiteSamantha } from "./websiteTalent";
import type { TalentContentTile } from "./stagedTalent";

/** Keep the dance scenes full length; frame the two portraits as shorter feed posts. */
export const KIT_FEATURED_CONTENT = websiteSamantha.content
  .slice(0, 4)
  .map((tile, index): TalentContentTile => ({
    ...tile,
    aspectRatio: index < 2 ? "9/16" : "4/5",
  }));
