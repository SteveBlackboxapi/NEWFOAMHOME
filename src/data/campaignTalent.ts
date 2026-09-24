import { A } from "../lib/assets";
import type { StagedTalent } from "./stagedTalent";

const F = `${A}/talent/fitness-creator`;

/** Fictional demo identity requested by the site owner; supplied image origin is unconfirmed. */
export const websiteFitness: StagedTalent = {
  id: "avery-cole",
  displayName: "Avery Cole",
  provenance: "reference",
  age: 28,
  gender: "Female",
  location: "London · demo profile",
  bio: "Avery is a fictional running, fitness and everyday-wellness creator. Her world moves between sunrise runs, strength sessions and the small habits that make showing up feel good. This demo identity, age, location, handles and all audience/post figures are invented for the Foam talent library; they do not describe the person pictured.",
  verticals: ["Fitness", "Running", "Wellness", "Active lifestyle"],
  platforms: [
    { network: "instagram", handle: "@avery.cole.fake", followers: 184_000 },
    { network: "tiktok", handle: "@averycole.fake", followers: 268_000 },
    { network: "youtube", handle: "@avery.cole.fake", followers: 41_000 },
  ],
  totalAudience: 493_000,
  portrait: `${F}/waterfront.webp`,
  originalPortrait: `${F}/waterfront.webp`,
  referenceImages: [
    { label: "Supplied waterfront photograph · original WebP", src: `${F}/waterfront.webp` },
    { label: "Supplied stair-running photograph · original WebP", src: `${F}/steps.webp` },
  ],
  creativeDirection: {
    summary: "A fitness story with warm dawn light, black performance clothing, an open waterfront and a powerful stair-running moment. The two supplied WebPs are preserved without recompression. Avery Cole is an invented catalogue character, not an identification of the photographed person.",
    identityNotes: [
      "The owner explicitly requested a fictional name and full demo profile. Avery Cole, her biography, age, location, handles and metrics are illustrative only.",
      "The images were supplied by the owner on 24 September 2026. Their origin was not confirmed; keep supplied-reference provenance and do not claim that these files were AI-generated.",
      "No real social account, customer relationship, sportswear endorsement or brand partnership is claimed.",
      "Both content assets are still photographs. Do not label them as playable video.",
    ],
    promptFile: `${F}/README.md`,
  },
  motion: null,
  motionStatus: "placeholder",
  content: [
    {
      id: "waterfront",
      type: "still",
      provenance: "reference",
      thumb: `${F}/waterfront.webp`,
      original: `${F}/waterfront.webp`,
      aspectRatio: "16/9",
      caption: "the city is still waking up",
      captionSettings: { visible: false },
      platform: "instagram",
      strongKind: "photo",
      views: 142_000,
      engagements: 11_360,
    },
    {
      id: "steps",
      type: "still",
      provenance: "reference",
      thumb: `${F}/steps.webp`,
      original: `${F}/steps.webp`,
      aspectRatio: "9/16",
      caption: "one more step, then another",
      captionSettings: { visible: false },
      platform: "instagram",
      strongKind: "photo",
      views: 222_000,
      engagements: 17_760,
    },
  ],
};

export const campaignTalent: StagedTalent[] = [websiteFitness];

export const campaignKeywords: Record<string, string[]> = {
  "avery-cole:waterfront": ["fitness", "running", "wellness", "sport", "activewear", "waterfront", "sunrise", "bottle"],
  "avery-cole:steps": ["fitness", "running", "wellness", "sport", "activewear", "steps", "stairs", "training"],
};
