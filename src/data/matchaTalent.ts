import { A } from "../lib/assets";
import type { StagedTalent } from "./stagedTalent";

const M = `${A}/talent/theo-lane`;

/** Fictional lifestyle example; no real account, audience or endorsement is implied. */
export const websiteMatcha: StagedTalent = {
  id: "theo-lane",
  displayName: "Theo Lane",
  provenance: "ai-generated",
  age: 30,
  gender: "Male",
  location: "Illustrative profile",
  bio: "A fictional lifestyle creator with an eye for slow mornings, local cafés and little everyday rituals. Created for Foam website examples; no real account or partnership is represented.",
  verticals: ["Lifestyle", "Food & drink", "Everyday rituals"],
  platforms: [],
  totalAudience: 0,
  portrait: `${M}/matcha.webp`,
  originalPortrait: `${M}/matcha-master.png`,
  creativeDirection: {
    summary: "A relaxed, brand-free iced matcha moment in a softly lit café. Natural texture, navy clothing and a sage-green drink.",
    identityNotes: ["Fictional adult created with AI.", "No real social account, product endorsement or performance figures are claimed."],
    promptFile: `${M}/creative-brief.md`,
  },
  motion: null,
  motionStatus: "placeholder",
  content: [{
    id: "matcha-moment",
    type: "still",
    provenance: "ai-generated",
    thumb: `${M}/matcha.webp`,
    original: `${M}/matcha-master.png`,
    aspectRatio: "4/5",
    caption: "a little pause in the day",
    captionSettings: { visible: false },
    platform: "instagram",
    strongKind: "photo",
  }],
};
