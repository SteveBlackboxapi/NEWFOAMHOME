import { A } from "../lib/assets";

/** Networks we stage for catalogue reuse. */
export type TalentNetwork =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitch"
  | "linkedin";

/** Content publish surface shown on explore cards. */
export type ContentPlatform = "instagram" | "tiktok" | "youtube";

/** Strong-badge chrome kinds (layout inspo only; invented content). */
export type StrongKind = "photo" | "hashtag" | "link" | "question";

/** Fonts available for caption overlays on explore cards. */
export type CaptionFontFamily = "founders" | "sf" | "georgia" | "mono";

/**
 * Editable caption / slogan overlay on a content tile.
 * Rendered as DOM/CSS (not baked into the image).
 */
export type TileCaptionSettings = {
  /** Show or hide the overlay text */
  visible: boolean;
  /** Caption / slogan string */
  text: string;
  /** Vertical position as percent from top (10–90) */
  y: number;
  /** Horizontal position as percent from left (0–100) */
  x: number;
  font: CaptionFontFamily;
  /** Font size in px */
  size: number;
  /** Fill colour */
  fill: string;
  /** Outline / stroke colour */
  stroke: string;
  /** Outline width in px (0 = none) */
  strokeWidth: number;
};

export const CAPTION_FONT_OPTIONS: {
  id: CaptionFontFamily;
  label: string;
  css: string;
}[] = [
  {
    id: "founders",
    label: "Founders",
    css: "'Founders Grotesk', system-ui, sans-serif",
  },
  {
    id: "sf",
    label: "SF Pro",
    css: "'SF Pro Text', system-ui, -apple-system, sans-serif",
  },
  {
    id: "georgia",
    label: "Georgia",
    css: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "mono",
    label: "Mono",
    css: "ui-monospace, 'SF Mono', Menlo, monospace",
  },
];

export const DEFAULT_CAPTION_SETTINGS: Omit<TileCaptionSettings, "text" | "visible"> = {
  y: 26,
  x: 50,
  font: "founders",
  size: 14,
  fill: "#ffffff",
  stroke: "#000000",
  strokeWidth: 0,
};

export type TalentPlatform = {
  network: TalentNetwork;
  /** Fake handle only, e.g. @mira.vale.fake */
  handle: string;
  followers: number;
};

export type TalentContentTile = {
  type: "still" | "clip";
  thumb: string;
  /** Playable source, when available. A clip thumbnail alone is not a video. */
  video?: string;
  views: number;
  /** Default caption text; used when captionSettings.text is unset */
  caption?: string;
  /** Optional caption style defaults for this tile */
  captionSettings?: Partial<TileCaptionSettings>;
  platform: ContentPlatform;
  strongKind: StrongKind;
  engagements?: number;
};

/** Resolve full caption settings from tile defaults. */
export function resolveCaptionSettings(
  tile: TalentContentTile,
): TileCaptionSettings {
  const baseText = tile.caption ?? "";
  const merged: TileCaptionSettings = {
    ...DEFAULT_CAPTION_SETTINGS,
    text: baseText,
    visible: baseText.length > 0,
    ...tile.captionSettings,
  };
  if (tile.captionSettings?.text === undefined) {
    merged.text = baseText;
  }
  if (tile.captionSettings?.visible === undefined) {
    merged.visible = merged.text.length > 0;
  }
  return merged;
}

export type StagedTalent = {
  id: string;
  displayName: string;
  age: number;
  location: string;
  bio: string;
  verticals: string[];
  platforms: TalentPlatform[];
  totalAudience: number;
  /** Photoreal staged portrait path (invented identity; never live kit faces). */
  portrait: string;
  /** Optional short loop; null when not ready. */
  motion: string | null;
  motionStatus: "placeholder" | "ready";
  content: TalentContentTile[];
};

const T = `${A}/talent`;

function portrait(id: string) {
  return `${T}/${id}-portrait.jpg`;
}

function tile(id: string, n: number) {
  return `${T}/${id}-c${n}.jpg`;
}

/**
 * Unlisted staged talent catalogue. Source of truth for /lab/talent.
 * All names, handles, portraits, and post stills are invented staged assets.
 * No faces, avatars, or footage from Foam Explore inspo screenshots.
 */
export const stagedTalent: StagedTalent[] = [
  {
    id: "aria-quen",
    displayName: "Aria Quen",
    age: 22,
    location: "Seoul",
    bio: "GRWM, soft makeup hauls, and skincare callouts under quiet bathroom light. Staged demo talent only.",
    verticals: ["Beauty", "Skincare", "GRWM"],
    platforms: [
      { network: "instagram", handle: "@aria.quen.fake", followers: 419_000 },
      { network: "tiktok", handle: "@ariaquen.fake", followers: 1_240_000 },
      { network: "youtube", handle: "@aria.quen.fake", followers: 112_000 },
    ],
    totalAudience: 1_771_000,
    portrait: portrait("aria-quen"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("aria-quen", 1), views: 820_400, caption: "soft glam lip tutorial", platform: "tiktok", strongKind: "photo", engagements: 64_200 },
      { type: "still", thumb: tile("aria-quen", 2), views: 194_200, caption: "shelf haul morning", platform: "instagram", strongKind: "hashtag", engagements: 12_800 },
      { type: "still", thumb: tile("aria-quen", 3), views: 410_000, caption: "AM dropper routine", platform: "tiktok", strongKind: "photo", engagements: 38_100 },
      { type: "still", thumb: tile("aria-quen", 4), views: 88_600, caption: "palette desk still", platform: "instagram", strongKind: "photo" },
      { type: "clip", thumb: tile("aria-quen", 5), views: 267_000, caption: "travel makeup bag", platform: "tiktok", strongKind: "link", engagements: 21_400 },
    ],
  },
  {
    id: "nova-reed",
    displayName: "Nova Reed",
    age: 24,
    location: "Toronto",
    bio: "Home training, recovery routines, and everyday fitness lifestyle clips. Invented talent for Foam lab staging.",
    verticals: ["Fitness", "Lifestyle", "Recovery"],
    platforms: [
      { network: "tiktok", handle: "@novareed.fake", followers: 890_000 },
      { network: "instagram", handle: "@nova.reed.fake", followers: 221_000 },
      { network: "youtube", handle: "@novareed.fake", followers: 74_800 },
    ],
    totalAudience: 1_185_800,
    portrait: portrait("nova-reed"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("nova-reed", 1), views: 540_000, caption: "band stretch set", platform: "tiktok", strongKind: "photo", engagements: 41_200 },
      { type: "still", thumb: tile("nova-reed", 2), views: 128_400, caption: "post workout smoothie", platform: "instagram", strongKind: "hashtag", engagements: 9_600 },
      { type: "still", thumb: tile("nova-reed", 3), views: 76_200, caption: "loft mat reset", platform: "instagram", strongKind: "photo" },
      { type: "clip", thumb: tile("nova-reed", 4), views: 312_000, caption: "evening walk vlog", platform: "tiktok", strongKind: "photo", engagements: 27_800 },
      { type: "still", thumb: tile("nova-reed", 5), views: 94_500, caption: "foam roll recovery", platform: "youtube", strongKind: "question", engagements: 6_100 },
    ],
  },
  {
    id: "mira-vale",
    displayName: "Mira Vale",
    age: 27,
    location: "Austin, TX",
    bio: "Plant-forward weeknight cooking with a calm camera and clear grocery lists. Staged catalogue entry only.",
    verticals: ["Food", "Wellness", "Home"],
    platforms: [
      { network: "instagram", handle: "@mira.vale.fake", followers: 184_200 },
      { network: "tiktok", handle: "@miravale.fake", followers: 312_000 },
      { network: "youtube", handle: "@mira.vale.fake", followers: 61_400 },
    ],
    totalAudience: 557_600,
    portrait: portrait("mira-vale"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("mira-vale", 1), views: 218_000, caption: "chop board dinner", platform: "tiktok", strongKind: "photo", engagements: 18_400 },
      { type: "still", thumb: tile("mira-vale", 2), views: 64_100, caption: "calm bowl Sunday", platform: "instagram", strongKind: "hashtag", engagements: 4_900 },
      { type: "still", thumb: tile("mira-vale", 3), views: 91_800, caption: "taste test mid cook", platform: "instagram", strongKind: "photo", engagements: 7_200 },
      { type: "still", thumb: tile("mira-vale", 4), views: 42_300, caption: "herb shelf reset", platform: "instagram", strongKind: "photo" },
      { type: "clip", thumb: tile("mira-vale", 5), views: 156_000, caption: "grocery prep list", platform: "tiktok", strongKind: "link", engagements: 11_100 },
    ],
  },
  {
    id: "lena-croft",
    displayName: "Lena Croft",
    age: 29,
    location: "Manchester",
    bio: "Secondhand outfit checks, packing edits, and mend-first styling notes. Catalogue placeholder with fake handles.",
    verticals: ["Fashion", "Packing", "Sustainability"],
    platforms: [
      { network: "instagram", handle: "@lena.croft.fake", followers: 143_000 },
      { network: "tiktok", handle: "@lenacroft.fake", followers: 507_000 },
      { network: "youtube", handle: "@lena.croft.fake", followers: 39_200 },
    ],
    totalAudience: 689_200,
    portrait: portrait("lena-croft"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("lena-croft", 1), views: 276_000, caption: "mirror outfit check", platform: "tiktok", strongKind: "photo", engagements: 32_400 },
      { type: "still", thumb: tile("lena-croft", 2), views: 148_900, caption: "PACKING FOR WEEKEND", platform: "instagram", strongKind: "hashtag", engagements: 10_200 },
      { type: "still", thumb: tile("lena-croft", 3), views: 58_400, caption: "thrift haul flatlay", platform: "instagram", strongKind: "photo" },
      { type: "clip", thumb: tile("lena-croft", 4), views: 121_000, caption: "mend kit close-up", platform: "tiktok", strongKind: "photo", engagements: 9_800 },
      { type: "still", thumb: tile("lena-croft", 5), views: 87_600, caption: "getting ready glow", platform: "instagram", strongKind: "question", engagements: 6_400 },
    ],
  },
  {
    id: "zane-holt",
    displayName: "Zane Holt",
    age: 45,
    location: "Denver, CO",
    bio: "Creator-style running sessions, gear weigh-ins, and dawn training notes. Invented roster row only.",
    verticals: ["Running", "Sport", "Training"],
    platforms: [
      { network: "youtube", handle: "@zaneholt.fake", followers: 187_000 },
      { network: "instagram", handle: "@zane.holt.fake", followers: 134_000 },
      { network: "tiktok", handle: "@zane.holt.fake", followers: 79_600 },
    ],
    totalAudience: 400_600,
    portrait: portrait("zane-holt"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("zane-holt", 1), views: 198_000, caption: "dawn path tempo", platform: "tiktok", strongKind: "photo", engagements: 14_600 },
      { type: "still", thumb: tile("zane-holt", 2), views: 72_400, caption: "lace up before miles", platform: "instagram", strongKind: "photo", engagements: 5_100 },
      { type: "still", thumb: tile("zane-holt", 3), views: 48_900, caption: "gear flatlay check", platform: "instagram", strongKind: "hashtag" },
      { type: "clip", thumb: tile("zane-holt", 4), views: 112_000, caption: "post run stretch", platform: "youtube", strongKind: "photo", engagements: 8_300 },
      { type: "still", thumb: tile("zane-holt", 5), views: 86_700, caption: "track interval split", platform: "tiktok", strongKind: "link", engagements: 7_200 },
    ],
  },
  {
    id: "kai-solen",
    displayName: "Kai Solen",
    age: 36,
    location: "Singapore",
    bio: "Travel packing systems, quiet hotel desks, and short road-trip loops. Staged only; not a real creator.",
    verticals: ["Travel", "Packing", "Lifestyle"],
    platforms: [
      { network: "instagram", handle: "@kai.solen.fake", followers: 268_000 },
      { network: "youtube", handle: "@kaisolen.fake", followers: 155_000 },
      { network: "linkedin", handle: "@kai.solen.fake", followers: 18_400 },
    ],
    totalAudience: 441_400,
    portrait: portrait("kai-solen"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("kai-solen", 1), views: 164_000, caption: "carry-on layout", platform: "instagram", strongKind: "photo", engagements: 11_900 },
      { type: "still", thumb: tile("kai-solen", 2), views: 221_000, caption: "road trip morning", platform: "tiktok", strongKind: "hashtag", engagements: 19_400 },
      { type: "still", thumb: tile("kai-solen", 3), views: 58_700, caption: "hotel desk setup", platform: "instagram", strongKind: "photo" },
      { type: "clip", thumb: tile("kai-solen", 4), views: 132_000, caption: "terminal window wait", platform: "youtube", strongKind: "photo", engagements: 9_100 },
      { type: "still", thumb: tile("kai-solen", 5), views: 44_200, caption: "packing cubes close", platform: "instagram", strongKind: "link" },
    ],
  },
  {
    id: "bode-niles",
    displayName: "Bode Niles",
    age: 34,
    location: "Chicago",
    bio: "Budget home builds, soft interiors resets, and tool-first explainers. Invented profile for lab catalogue work.",
    verticals: ["Home", "Interiors", "DIY"],
    platforms: [
      { network: "youtube", handle: "@bodeniles.fake", followers: 528_000 },
      { network: "instagram", handle: "@bode.niles.fake", followers: 87_300 },
      { network: "tiktok", handle: "@bode.niles.fake", followers: 203_000 },
    ],
    totalAudience: 818_300,
    portrait: portrait("bode-niles"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("bode-niles", 1), views: 305_000, caption: "shelf day one install", platform: "youtube", strongKind: "photo", engagements: 22_100 },
      { type: "still", thumb: tile("bode-niles", 2), views: 271_400, caption: "this corner finally done", platform: "instagram", strongKind: "hashtag", engagements: 15_600 },
      { type: "still", thumb: tile("bode-niles", 3), views: 148_000, caption: "drill tip that saves time", platform: "tiktok", strongKind: "photo", engagements: 12_400 },
      { type: "still", thumb: tile("bode-niles", 4), views: 46_700, caption: "budget board check", platform: "instagram", strongKind: "link" },
      { type: "clip", thumb: tile("bode-niles", 5), views: 189_000, caption: "sage wall reset", platform: "youtube", strongKind: "photo", engagements: 14_800 },
    ],
  },
  {
    id: "rue-dante",
    displayName: "Rue Dante",
    age: 30,
    location: "Brooklyn, NY",
    bio: "Soft family routines, lunchbox prep, and calm home parenting notes. Clearly fake name for internal catalogue tests.",
    verticals: ["Parenting", "Family", "Lifestyle"],
    platforms: [
      { network: "instagram", handle: "@rue.dante.fake", followers: 92_700 },
      { network: "tiktok", handle: "@ruedante.fake", followers: 168_000 },
      { network: "youtube", handle: "@rue.dante.fake", followers: 24_500 },
    ],
    totalAudience: 285_200,
    portrait: portrait("rue-dante"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("rue-dante", 1), views: 196_000, caption: "storytime still hits", platform: "tiktok", strongKind: "photo", engagements: 18_400 },
      { type: "still", thumb: tile("rue-dante", 2), views: 141_200, caption: "play rug sunday", platform: "instagram", strongKind: "hashtag", engagements: 9_200 },
      { type: "still", thumb: tile("rue-dante", 3), views: 168_500, caption: "lunchbox assembly line", platform: "instagram", strongKind: "photo", engagements: 14_700 },
      { type: "clip", thumb: tile("rue-dante", 4), views: 154_100, caption: "tiny laundry night", platform: "tiktok", strongKind: "photo", engagements: 13_900 },
      { type: "still", thumb: tile("rue-dante", 5), views: 79_800, caption: "nursery corner calm", platform: "instagram", strongKind: "question", engagements: 5_100 },
    ],
  },
  {
    id: "suki-prent",
    displayName: "Suki Prent",
    age: 26,
    location: "Melbourne",
    bio: "Gadget unboxings, desk setups, and short comparison clips. Fake handles for unlisted staging.",
    verticals: ["Tech", "Gadgets", "Setup"],
    platforms: [
      { network: "youtube", handle: "@suki.prent.fake", followers: 291_000 },
      { network: "tiktok", handle: "@sukiprent.fake", followers: 455_000 },
      { network: "instagram", handle: "@suki.prent.fake", followers: 58_900 },
      { network: "twitch", handle: "@sukiprent.fake", followers: 76_500 },
    ],
    totalAudience: 881_400,
    portrait: portrait("suki-prent"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("suki-prent", 1), views: 490_000, caption: "unbox night shift", platform: "tiktok", strongKind: "photo", engagements: 44_200 },
      { type: "still", thumb: tile("suki-prent", 2), views: 184_600, caption: "desk that just works", platform: "instagram", strongKind: "hashtag", engagements: 16_100 },
      { type: "clip", thumb: tile("suki-prent", 3), views: 311_000, caption: "earbuds face off", platform: "youtube", strongKind: "photo", engagements: 25_700 },
      { type: "still", thumb: tile("suki-prent", 4), views: 97_400, caption: "cafe laptop day", platform: "instagram", strongKind: "photo", engagements: 7_800 },
      { type: "still", thumb: tile("suki-prent", 5), views: 152_900, caption: "cable kit flatlay", platform: "tiktok", strongKind: "link", engagements: 14_200 },
    ],
  },
  {
    id: "jax-orin",
    displayName: "Jax Orin",
    age: 31,
    location: "Berlin",
    bio: "Modular synth demos, vinyl nights, and late studio walkthroughs. Fake profile for internal catalogue reuse.",
    verticals: ["Music", "Culture", "Gear"],
    platforms: [
      { network: "youtube", handle: "@jaxorin.fake", followers: 402_000 },
      { network: "instagram", handle: "@jax.orin.fake", followers: 96_500 },
      { network: "tiktok", handle: "@jaxorin.fake", followers: 148_200 },
    ],
    totalAudience: 646_700,
    portrait: portrait("jax-orin"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("jax-orin", 1), views: 310_000, caption: "patch notes live", platform: "youtube", strongKind: "photo", engagements: 26_800 },
      { type: "still", thumb: tile("jax-orin", 2), views: 173_400, caption: "cable rack glow", platform: "instagram", strongKind: "hashtag", engagements: 15_400 },
      { type: "still", thumb: tile("jax-orin", 3), views: 228_000, caption: "headphones late mix", platform: "tiktok", strongKind: "photo", engagements: 21_200 },
      { type: "clip", thumb: tile("jax-orin", 4), views: 197_600, caption: "vinyl loft night", platform: "instagram", strongKind: "photo", engagements: 17_900 },
      { type: "still", thumb: tile("jax-orin", 5), views: 84_100, caption: "module patch close", platform: "youtube", strongKind: "link", engagements: 6_300 },
    ],
  },
  {
    id: "elio-voss",
    displayName: "Elio Voss",
    age: 38,
    location: "Mexico City",
    bio: "Balcony skits, cafe bits, and loud lifestyle comedy cuts. Staged catalogue person, not affiliated with Foam kits.",
    verticals: ["Comedy", "Lifestyle", "Culture"],
    platforms: [
      { network: "instagram", handle: "@elio.voss.fake", followers: 376_000 },
      { network: "tiktok", handle: "@eliovoss.fake", followers: 612_000 },
      { network: "youtube", handle: "@elio.voss.fake", followers: 88_400 },
    ],
    totalAudience: 1_076_400,
    portrait: portrait("elio-voss"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("elio-voss", 1), views: 682_000, caption: "me waiting for everyone...", platform: "tiktok", strongKind: "photo", engagements: 71_200 },
      { type: "still", thumb: tile("elio-voss", 2), views: 264_000, caption: "cafe laugh take 3", platform: "instagram", strongKind: "hashtag", engagements: 23_800 },
      { type: "still", thumb: tile("elio-voss", 3), views: 178_400, caption: "street table still", platform: "instagram", strongKind: "photo", engagements: 12_100 },
      { type: "clip", thumb: tile("elio-voss", 4), views: 391_000, caption: "kitchen bit energy", platform: "tiktok", strongKind: "photo", engagements: 38_600 },
      { type: "still", thumb: tile("elio-voss", 5), views: 219_000, caption: "night lights skit", platform: "youtube", strongKind: "question", engagements: 19_400 },
    ],
  },
  {
    id: "theo-maris",
    displayName: "Theo Maris",
    age: 41,
    location: "Cape Town",
    bio: "Coast trails, dawn light studies, and slow gear talks. Fake roster row for structured field reuse.",
    verticals: ["Outdoors", "Adventure", "Photography"],
    platforms: [
      { network: "instagram", handle: "@theo.maris.fake", followers: 312_000 },
      { network: "youtube", handle: "@theomaris.fake", followers: 98_700 },
      { network: "tiktok", handle: "@theo.maris.fake", followers: 64_100 },
    ],
    totalAudience: 474_800,
    portrait: portrait("theo-maris"),
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tile("theo-maris", 1), views: 256_000, caption: "dune trail morning", platform: "instagram", strongKind: "photo", engagements: 22_100 },
      { type: "still", thumb: tile("theo-maris", 2), views: 188_400, caption: "ridge light study", platform: "instagram", strongKind: "hashtag", engagements: 16_800 },
      { type: "still", thumb: tile("theo-maris", 3), views: 212_000, caption: "pack the overlook", platform: "tiktok", strongKind: "photo", engagements: 18_900 },
      { type: "clip", thumb: tile("theo-maris", 4), views: 124_300, caption: "lens swap dawn", platform: "youtube", strongKind: "photo", engagements: 9_200 },
      { type: "still", thumb: tile("theo-maris", 5), views: 151_700, caption: "camp kit check", platform: "instagram", strongKind: "link", engagements: 11_400 },
    ],
  },
];

export function formatAudience(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? m.toFixed(0) : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${k >= 100 ? k.toFixed(0) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(n);
}

export function getStagedTalent(id: string): StagedTalent | undefined {
  return stagedTalent.find((t) => t.id === id);
}
