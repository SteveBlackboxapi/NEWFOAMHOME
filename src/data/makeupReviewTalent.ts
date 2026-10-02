import { A } from "../lib/assets";
import type { StagedTalent } from "./stagedTalent";

/** Fictional adult creator for the candid makeup-review example. */
export const websiteTessa: StagedTalent = {
  id: "tessa-marlow",
  displayName: "Tessa Marlow",
  provenance: "ai-generated",
  age: 27,
  location: "Leeds",
  bio: "Everyday makeup texture checks and straightforward getting-ready routines. Fictional demo creator; audience and post figures are illustrative.",
  verticals: ["Beauty", "Makeup", "Skincare"],
  platforms: [{ network: "instagram", handle: "@tessa.marlow.fake", followers: 124_700 }],
  totalAudience: 124_700,
  portrait: `${A}/talent/tessa-marlow-v1/palette-review.webp`,
  originalPortrait: `${A}/talent/tessa-marlow-v1/masters/palette-review.png`,
  motion: null,
  motionStatus: "placeholder",
  creativeDirection: {
    summary: "Candid makeup review with a neutral eyeshadow palette, brush and harsh mixed bathroom light.",
    identityNotes: ["New fictional adult aged 27 with long wavy chestnut hair, brown eyes and olive skin. AI-generated still; no real endorsement or recorded video."],
    promptFile: `${A}/talent/tessa-marlow-v1/creative-brief.md`,
  },
  content: [{
    id: "palette-review-v1",
    type: "still",
    provenance: "ai-generated",
    thumb: `${A}/talent/tessa-marlow-v1/palette-review.webp`,
    original: `${A}/talent/tessa-marlow-v1/masters/palette-review.png`,
    aspectRatio: "9/16",
    caption: "Trying the everyday eyeshadow palette",
    captionSettings: { visible: false },
    platform: "instagram",
    views: 186_400,
    strongKind: "photo",
    generation: {
      version: "Makeup review v1",
      approach: "Original fictional adult generated in harsh mixed bathroom light. Illustrative post figures; no baked captions.",
      prompt: `${A}/talent/tessa-marlow-v1/creative-brief.md`,
    },
  }],
};
