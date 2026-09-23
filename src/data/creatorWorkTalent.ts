import { A } from "../lib/assets";
import type { StagedTalent } from "./stagedTalent";

const U = `${A}/talent/creator-ugc-v1`;

export const creatorWorkPosts = [
  {
    talentId: "tessa-quinn",
    name: "Tessa Quinn",
    assetId: "tessa-quinn:workout-selfie-v1",
    src: `${U}/tessa-quinn-workout-v1.webp`,
    alt: "AI-generated fictional adult Tessa taking a pink-workout selfie on a charcoal mat with lavender headphones",
  },
  {
    talentId: "luca-marin",
    name: "Luca Marin",
    assetId: "luca-marin:beach-cafe-v1",
    src: `${U}/luca-marin-beach-v1.webp`,
    alt: "AI-generated fictional adult Luca with a platinum buzzcut and white sunglasses beneath a purple beach-café umbrella",
  },
];

/** New fictional identities for the Creators page and Lab, without invented audience or post results. */
export const creatorWorkTalent: StagedTalent[] = [
  {
    id: "tessa-quinn",
    displayName: "Tessa Quinn",
    age: 25,
    location: "Illustrative profile",
    bio: "Fitness breaks, everyday routines and a little time outside. Tessa is an original fictional adult created for Foam’s demo imagery. No real social account or audience figures have been assigned.",
    verticals: ["Fitness", "Lifestyle", "Wellness"],
    platforms: [],
    // Required data-shape sentinel: the Lab displays unassigned, never a claimed zero audience.
    totalAudience: 0,
    portrait: creatorWorkPosts[0].src,
    originalPortrait: `${U}/masters/tessa-quinn-workout-v1.png`,
    creativeDirection: {
      summary:
        "A natural high-angle workout selfie: pink sportswear, lavender headphones, charcoal ribbed mat and green turf. Generated from the supplied written scene, without a reference photograph.",
      identityNotes: [
        "Tessa is a new fictional adult aged 25; this image defines her identity. Do not reuse an existing creator’s name for this face.",
        "Full head, headphones and ponytail are included in the master. Natural skin texture and phone-camera light are intentional.",
        "This is an AI-generated still, not a video or a real social post. No performance or audience figures have been assigned.",
      ],
      promptFile: `${U}/creative-brief.md`,
    },
    motion: null,
    motionStatus: "placeholder",
    content: [
      {
        id: "workout-selfie-v1",
        type: "still",
        thumb: creatorWorkPosts[0].src,
        original: `${U}/masters/tessa-quinn-workout-v1.png`,
        aspectRatio: "9/16",
        caption: "a little pause between sets",
        captionSettings: { visible: false },
        platform: "instagram",
        strongKind: "photo",
        generation: {
          version: "Creator UGC v1 · original still",
          approach:
            "Original fictional adult generated from the user’s written fitness-selfie scene. No image input, copied identity, real account, endorsement or performance claim.",
          prompt: `${U}/creative-brief.md`,
        },
      },
    ],
  },
  {
    id: "luca-marin",
    displayName: "Luca Marin",
    age: 28,
    location: "Illustrative profile",
    bio: "Beachside cafés, travel pauses and casual everyday moments. Luca is an original fictional adult created for Foam’s demo imagery. No real social account or audience figures have been assigned.",
    verticals: ["Travel", "Lifestyle", "Beach"],
    platforms: [],
    totalAudience: 0,
    portrait: creatorWorkPosts[1].src,
    originalPortrait: `${U}/masters/luca-marin-beach-v1.png`,
    creativeDirection: {
      summary:
        "A spontaneous beach-café portrait: platinum buzzcut, white wraparound sunglasses and a purple umbrella, with natural midday phone-camera light. Generated from the supplied written scene, without a reference photograph.",
      identityNotes: [
        "Luca is a new fictional adult aged 28; this image defines his identity. He is different from every existing creator in the library.",
        "His complete head and hair remain within the 9:16 master. The natural skin texture, stubble and original botanical tattoos are intentional.",
        "This is an AI-generated still, not a video or a real social post. No performance or audience figures have been assigned.",
      ],
      promptFile: `${U}/creative-brief.md`,
    },
    motion: null,
    motionStatus: "placeholder",
    content: [
      {
        id: "beach-cafe-v1",
        type: "still",
        thumb: creatorWorkPosts[1].src,
        original: `${U}/masters/luca-marin-beach-v1.png`,
        aspectRatio: "9/16",
        caption: "one more coffee before the beach",
        captionSettings: { visible: false },
        platform: "instagram",
        strongKind: "photo",
        generation: {
          version: "Creator UGC v1 · original still",
          approach:
            "Original fictional adult generated from the user’s written beach-café scene. No image input, copied identity, real account, endorsement or performance claim.",
          prompt: `${U}/creative-brief.md`,
        },
      },
    ],
  },
];

export const creatorWorkKeywords: Record<string, string[]> = {
  "tessa-quinn:workout-selfie-v1": [
    "workout",
    "fitness",
    "pink",
    "headphones",
    "mat",
    "selfie",
    "turf",
  ],
  "luca-marin:beach-cafe-v1": [
    "beach",
    "café",
    "cafe",
    "travel",
    "purple",
    "umbrella",
    "sunglasses",
    "selfie",
  ],
};
