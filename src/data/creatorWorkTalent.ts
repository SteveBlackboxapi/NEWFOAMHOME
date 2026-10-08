import { A } from "../lib/assets";
import type { StagedTalent } from "./stagedTalent";

const U = `${A}/talent/creator-ugc-v1`;
const LIVE = `${A}/talent/uploads`;
const LIVE_SOURCE = `${A}/talent/creator-live-v2/provenance.json`;

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
  {
    talentId: "maya-ellis",
    name: "Maya Ellis",
    assetId: "maya-ellis:workout-live-v1",
    src: `${LIVE}/maya-ellis-live-v3.webp`,
    alt: "AI-generated fictional adult Maya Ellis in pink workout clothes and lavender headphones, chatting on a garden exercise mat",
  },
  {
    talentId: "theo-bennett",
    name: "Theo Bennett",
    assetId: "theo-bennett:beach-live-v1",
    src: `${LIVE}/theo-bennett-live-v1.webp`,
    alt: "AI-generated fictional adult Theo Bennett holding an iced coffee beneath a lavender umbrella at a beach café",
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
  {
    id: "maya-ellis",
    displayName: "Maya Ellis",
    age: 27,
    location: "Illustrative profile",
    bio: "Everyday fitness, outdoor movement and a catch-up between sets. Maya is a new fictional adult created for Foam’s demo imagery, distinct from Tessa Quinn and every existing creator. No real social account or audience figures have been assigned.",
    verticals: ["Fitness", "Lifestyle", "Wellness"],
    platforms: [],
    totalAudience: 0,
    portrait: creatorWorkPosts[2].src,
    originalPortrait: `${LIVE}/maya-ellis-live-v3-original.png`,
    referenceImages: [
      { label: "Original approved Nano Banana photograph", src: `${LIVE}/maya-ellis-live-v1-original.jpg` },
      { label: "Earlier tighter crop", src: `${LIVE}/maya-ellis-live-v1.webp` },
      { label: "Earlier wider crop", src: `${LIVE}/maya-ellis-live-v2.webp` },
    ],
    provenance: "ai-generated",
    creativeDirection: {
      summary: "A candid outdoor workout catch-up in pink activewear and lavender headphones. Generated with Google gemini-3-pro-image (Nano Banana Pro), preserving natural skin texture, flyaway hair and ordinary phone-camera light.",
      identityNotes: [
        "Maya is a new fictional adult aged 27. This approved image defines her identity; preserve Tessa Quinn as a separate existing creator.",
        "The user approved a wider 9:16 garden reframe made with the built-in image editor, keeping her original identity, expression and gesture. The untouched Nano Banana JPG and earlier crops remain as references.",
        "Keep her natural freckles, small facial marks, brown ponytail and relaxed mid-conversation expression; avoid smoothing or glamour retouching.",
        "This is an AI-generated still, not a real live broadcast or social post. No audience or performance figures have been assigned.",
      ],
      promptFile: LIVE_SOURCE,
    },
    motion: null,
    motionStatus: "placeholder",
    content: [
      {
        id: "workout-live-v1",
        type: "still",
        thumb: creatorWorkPosts[2].src,
        original: `${LIVE}/maya-ellis-live-v3-original.png`,
        aspectRatio: "9/16",
        caption: "a little reset after the workout",
        captionSettings: { visible: false },
        platform: "tiktok",
        strongKind: "photo",
        provenance: "ai-generated",
        generation: {
          version: "Creator live v3 · approved wider fitness still",
          approach: "Generated by Google gemini-3-pro-image (Nano Banana Pro). New fictional adult Maya Ellis, selected from fitness-a-clean.jpg and reframed more widely with the built-in image editor after user review; the untouched Nano Banana original is preserved as a reference. Live-card activity is illustrative, not recorded performance.",
          prompt: LIVE_SOURCE,
        },
      },
    ],
  },
  {
    id: "theo-bennett",
    displayName: "Theo Bennett",
    age: 32,
    location: "Illustrative profile",
    bio: "Beachside cafés, travel stops and the conversations in between. Theo is a new fictional adult created for Foam’s demo imagery, distinct from Luca Marin and every existing creator. No real social account or audience figures have been assigned.",
    verticals: ["Travel", "Lifestyle", "Beach"],
    platforms: [],
    totalAudience: 0,
    portrait: creatorWorkPosts[3].src,
    originalPortrait: `${LIVE}/theo-bennett-live-v1-original.jpg`,
    referenceImages: [{ label: "Earlier tighter crop", src: `${LIVE}/theo-bennett-live-v2.webp` }],
    provenance: "ai-generated",
    creativeDirection: {
      summary: "A spontaneous beach-café catch-up beneath a lavender umbrella, with iced coffee, pale tousled hair and sunglasses resting on his head. Generated with Google gemini-3-pro-image (Nano Banana Pro), retaining natural sunlight and realistic skin texture.",
      identityNotes: [
        "Theo is a new fictional adult aged 32. This approved image defines his identity; preserve Luca Marin as a separate existing creator.",
        "The display uses the original centred 9:16 framing, restored after user comparison. Retain the untouched 1536 × 2752 JPG master and the approved face, hair and botanical chest tattoos.",
        "Preserve natural stubble, skin texture and casual phone-camera framing; avoid smoothing or glamour retouching.",
        "This is an AI-generated still, not a real live broadcast or social post. No audience or performance figures have been assigned.",
      ],
      promptFile: LIVE_SOURCE,
    },
    motion: null,
    motionStatus: "placeholder",
    content: [
      {
        id: "beach-live-v1",
        type: "still",
        thumb: creatorWorkPosts[3].src,
        original: `${LIVE}/theo-bennett-live-v1-original.jpg`,
        aspectRatio: "9/16",
        caption: "coffee and a view before the beach",
        captionSettings: { visible: false },
        platform: "instagram",
        strongKind: "photo",
        provenance: "ai-generated",
        generation: {
          version: "Creator live v2 · approved beach still",
          approach: "Generated by Google gemini-3-pro-image (Nano Banana Pro). New fictional adult Theo Bennett, selected from beach-a-v2.jpg; realistic phone-camera detail and the untouched original are preserved. Live-card activity is illustrative, not recorded performance.",
          prompt: LIVE_SOURCE,
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
  "maya-ellis:workout-live-v1": ["workout", "fitness", "pink", "headphones", "garden", "outdoor", "selfie"],
  "theo-bennett:beach-live-v1": ["beach", "café", "cafe", "travel", "lavender", "umbrella", "coffee", "selfie"],
};
