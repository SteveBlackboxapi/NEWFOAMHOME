import { A } from "../lib/assets";
import type { StagedTalent } from "./stagedTalent";

/** Public projections share stable identities with the existing private-library profiles. */
export const websiteCamille: StagedTalent = {
  "provenance": "ai-generated",
  "id": "camille-aubert",
  "displayName": "Camille Aubert",
  "age": 0,
  "location": "Illustrative profile",
  "bio": "Camille shares relaxed travel, hotel mornings and practical skincare rituals, from daily moisturiser to sun-care on the go. Fictional creator; new skincare posts and figures are illustrative.",
  "verticals": [
    "Travel",
    "Lifestyle",
    "Beauty",
    "Skincare"
  ],
  "platforms": [],
  "totalAudience": 0,
  "portrait": `${A}/talent/camille-skincare-v1/portrait.webp`,
  "originalPortrait": `${A}/talent/camille-skincare-v1/portrait.webp`,
  "creativeDirection": {
    "summary": "Identity-preserving skincare review stills generated from the owner-supplied creator references.",
    "identityNotes": [
      "Existing creator identity and age assignment preserved. These are AI-generated photographs, not recorded videos or real endorsements. New post figures are illustrative demo data."
    ],
    "promptFile": `${A}/talent/camille-skincare-v1/creative-brief.md`
  },
  "motion": null,
  "motionStatus": "placeholder",
  "content": [
    {
      "id": "skincare-moisturiser-v1",
      "type": "still",
      "provenance": "ai-generated",
      "thumb": `${A}/talent/camille-skincare-v1/moisturiser.webp`,
      "original": `${A}/talent/camille-skincare-v1/masters/moisturiser.png`,
      "aspectRatio": "9/16",
      "caption": "A quick moisturiser texture check",
      "captionSettings": {
        "visible": false
      },
      "platform": "instagram",
      "views": 219400,
      "strongKind": "photo",
      "generation": {
        "version": "Skincare review v1 · 2 October 2026",
        "approach": "Identity-preserving AI-generated skincare review photograph. Fictional product, creator post and illustrative figures; no real account or measured result.",
        "prompt": `${A}/talent/camille-skincare-v1/creative-brief.md`
      }
    },
    {
      "id": "skincare-spf-v1",
      "type": "still",
      "provenance": "ai-generated",
      "thumb": `${A}/talent/camille-skincare-v1/spf.webp`,
      "original": `${A}/talent/camille-skincare-v1/masters/spf.png`,
      "aspectRatio": "9/16",
      "caption": "The SPF that comes with me",
      "captionSettings": {
        "visible": false
      },
      "platform": "tiktok",
      "views": 163800,
      "engagements": 8700,
      "strongKind": "photo",
      "generation": {
        "version": "Skincare review v1 · 2 October 2026",
        "approach": "Identity-preserving AI-generated skincare review photograph. Fictional product, creator post and illustrative figures; no real account or measured result.",
        "prompt": `${A}/talent/camille-skincare-v1/creative-brief.md`
      }
    },
    {
      "id": "skincare-evening-v1",
      "type": "still",
      "provenance": "ai-generated",
      "thumb": `${A}/talent/camille-skincare-v1/evening.webp`,
      "original": `${A}/talent/camille-skincare-v1/masters/evening.png`,
      "aspectRatio": "9/16",
      "caption": "Keeping the evening routine simple",
      "captionSettings": {
        "visible": false
      },
      "platform": "instagram",
      "views": 94700,
      "strongKind": "photo",
      "generation": {
        "version": "Skincare review v1 · 2 October 2026",
        "approach": "Identity-preserving AI-generated skincare review photograph. Fictional product, creator post and illustrative figures; no real account or measured result.",
        "prompt": `${A}/talent/camille-skincare-v1/creative-brief.md`
      }
    }
  ]
};

export const websiteAngelina: StagedTalent = {
  "provenance": "reference",
  "id": "angelina-lemon",
  "displayName": "Angelina Lemon",
  "age": 0,
  "location": "",
  "bio": "Angelina brings a relaxed, encouraging voice to everyday movement, casual style and approachable skincare. Gentle cleansing, honest texture checks and small routines that fit an ordinary day. Fictional creator; audiences and post figures are illustrative.",
  "verticals": [
    "Lifestyle",
    "Fitness",
    "Everyday style",
    "Skincare"
  ],
  "platforms": [
    {
      "network": "instagram",
      "handle": "@angelina.lemon.demo",
      "followers": 82400
    },
    {
      "network": "tiktok",
      "handle": "@angelina.lemon.demo",
      "followers": 126800
    }
  ],
  "totalAudience": 209200,
  "portrait": `${A}/talent/angelina-skincare-v1/portrait.webp`,
  "originalPortrait": `${A}/talent/angelina-skincare-v1/portrait.webp`,
  "creativeDirection": {
    "summary": "Identity-preserving skincare review stills generated from the owner-supplied creator references.",
    "identityNotes": [
      "Existing creator identity and age assignment preserved. These are AI-generated photographs, not recorded videos or real endorsements. New post figures are illustrative demo data."
    ],
    "promptFile": `${A}/talent/angelina-skincare-v1/creative-brief.md`
  },
  "motion": null,
  "motionStatus": "placeholder",
  "content": [
    {
      "id": "skincare-cleanser-v1",
      "type": "still",
      "provenance": "ai-generated",
      "thumb": `${A}/talent/angelina-skincare-v1/cleanser.webp`,
      "original": `${A}/talent/angelina-skincare-v1/masters/cleanser.png`,
      "aspectRatio": "9/16",
      "caption": "A gentle cleanse before the day starts",
      "captionSettings": {
        "visible": false
      },
      "platform": "tiktok",
      "views": 318700,
      "engagements": 12900,
      "strongKind": "photo",
      "generation": {
        "version": "Skincare review v1 · 2 October 2026",
        "approach": "Identity-preserving AI-generated skincare review photograph. Fictional product, creator post and illustrative figures; no real account or measured result.",
        "prompt": `${A}/talent/angelina-skincare-v1/creative-brief.md`
      }
    },
    {
      "id": "skincare-serum-v1",
      "type": "still",
      "provenance": "ai-generated",
      "thumb": `${A}/talent/angelina-skincare-v1/serum.webp`,
      "original": `${A}/talent/angelina-skincare-v1/masters/serum.png`,
      "aspectRatio": "9/16",
      "caption": "Trying the serum texture on my hand",
      "captionSettings": {
        "visible": false
      },
      "platform": "instagram",
      "views": 128600,
      "strongKind": "photo",
      "generation": {
        "version": "Skincare review v1 · 2 October 2026",
        "approach": "Identity-preserving AI-generated skincare review photograph. Fictional product, creator post and illustrative figures; no real account or measured result.",
        "prompt": `${A}/talent/angelina-skincare-v1/creative-brief.md`
      }
    },
    {
      "id": "skincare-moisturiser-v1",
      "type": "still",
      "provenance": "ai-generated",
      "thumb": `${A}/talent/angelina-skincare-v1/moisturiser.webp`,
      "original": `${A}/talent/angelina-skincare-v1/masters/moisturiser.png`,
      "aspectRatio": "9/16",
      "caption": "Checking the finish after moisturiser",
      "captionSettings": {
        "visible": false
      },
      "platform": "tiktok",
      "views": 207300,
      "engagements": 16400,
      "strongKind": "photo",
      "generation": {
        "version": "Skincare review v1 · 2 October 2026",
        "approach": "Identity-preserving AI-generated skincare review photograph. Fictional product, creator post and illustrative figures; no real account or measured result.",
        "prompt": `${A}/talent/angelina-skincare-v1/creative-brief.md`
      }
    }
  ]
};
