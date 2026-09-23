import { A } from "../lib/assets";
import { stagedTalent, type StagedTalent, type TalentContentTile } from "./stagedTalent";
import { creatorWorkKeywords, creatorWorkTalent } from "./creatorWorkTalent";

const D = `${A}/talent/discovery-v1`;

type Addition = {
  talentId: string;
  name: string;
  caption: string;
  aspectRatio: TalentContentTile["aspectRatio"];
  platform: TalentContentTile["platform"];
  keywords: string[];
  captionSettings?: TalentContentTile["captionSettings"];
};

export const discoveryAdditions: Addition[] = [
  { talentId: "jax-orin", name: "jax-live-set", caption: "one more track before we go", aspectRatio: "4/5", platform: "instagram", keywords: ["music", "live", "performance", "synth", "keyboard", "night", "concert"], captionSettings: { y: 70, size: 15, font: "sf", strokeWidth: 1 } },
  { talentId: "zane-holt", name: "zane-shoe-chat", caption: "the pair I keep by the door", aspectRatio: "9/16", platform: "tiktok", keywords: ["Nike", "running", "trainer", "shoe", "gear", "talking"], captionSettings: { y: 70, size: 16, font: "sf", strokeWidth: 1 } },
  { talentId: "rue-dante", name: "cats-sleeping", caption: "the sofa is booked", aspectRatio: "4/5", platform: "instagram", keywords: ["cats", "pets", "ginger", "sleep", "home"], captionSettings: { visible: false } },
  { talentId: "zane-holt", name: "nike-lacing", caption: "five minutes before leaving", aspectRatio: "9/16", platform: "tiktok", keywords: ["Nike", "running", "trainer", "shoe", "park", "sport"], captionSettings: { y: 24, size: 16, font: "sf", strokeWidth: 1 } },
  { talentId: "rue-dante", name: "cat-laundry", caption: "someone else had laundry plans", aspectRatio: "9/16", platform: "tiktok", keywords: ["cats", "pets", "tabby", "laundry", "home"], captionSettings: { y: 24, size: 16, font: "sf", background: "box", backgroundColor: "#ffffff", fill: "#172133" } },
  { talentId: "zane-holt", name: "nike-after-run", caption: "back from the morning run", aspectRatio: "4/5", platform: "instagram", keywords: ["Nike", "running", "trainer", "shoe", "gear", "sport"], captionSettings: { visible: false } },
  { talentId: "rue-dante", name: "cat-window", caption: "rainy-day supervisor", aspectRatio: "16/9", platform: "instagram", keywords: ["cats", "pets", "tuxedo", "window", "home"], captionSettings: { visible: false } },
  { talentId: "nia-brooks", name: "skincare-shelf", caption: "what stays by the sink", aspectRatio: "4/5", platform: "instagram", keywords: ["skincare", "product", "review", "cleanser", "moisturiser", "serum", "bathroom"], captionSettings: { visible: false } },
];

export const discoveryKeywords: Record<string, string[]> = {
  ...Object.fromEntries(
    discoveryAdditions.map((item) => [`${item.talentId}:discovery-${item.name}`, item.keywords]),
  ),
  ...creatorWorkKeywords,
};

/** Lab-only extension: original talent records, tile order and Kit selections remain untouched. */
export const labTalent: StagedTalent[] = stagedTalent.map((talent) => {
  const additions = discoveryAdditions.filter((item) => item.talentId === talent.id);
  if (!additions.length) return talent;
  return {
    ...talent,
    verticals: talent.id === "rue-dante" ? [...talent.verticals, "Pets"] : [...talent.verticals],
    content: [
      ...talent.content,
      ...additions.map((item): TalentContentTile => ({
        id: `discovery-${item.name}`,
        type: "still",
        thumb: `${D}/${item.name}.webp`,
        original: `${D}/masters/${item.name}.png`,
        aspectRatio: item.aspectRatio,
        caption: item.caption,
        captionSettings: item.captionSettings,
        platform: item.platform,
        strongKind: "photo",
        generation: {
          version: "Discovery v1 · illustrative still",
          approach: "AI-generated illustrative social post. Original fictional identity references used for people; no sponsorship, real post or performance figures claimed.",
          prompt: `${D}/creative-brief.md`,
        },
      })),
    ],
  };
}).concat(creatorWorkTalent);

/** Mix new candid imagery with existing content, rather than grouping one creator repeatedly. */
export const discoveryFeedOrder = [
  "tessa-quinn:workout-selfie-v1",
  "luca-marin:beach-cafe-v1",
  "jax-orin:discovery-jax-live-set",
  "zane-holt:discovery-zane-shoe-chat",
  "rue-dante:discovery-cats-sleeping",
  "mira-vale:paused-makeup-v2",
  "elise-morgan:hotel-mirror-v1",
  "nia-brooks:skincare-review",
  "rue-dante:discovery-cat-laundry",
  "lena-croft:0",
  "zane-holt:discovery-nike-lacing",
  "nia-brooks:discovery-skincare-shelf",
  "rue-dante:discovery-cat-window",
  "zane-holt:discovery-nike-after-run",
];
