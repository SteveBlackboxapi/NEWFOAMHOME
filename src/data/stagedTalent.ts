import { A } from "../lib/assets";

/** Networks we stage for catalogue reuse. */
export type TalentNetwork =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitch"
  | "linkedin";

export type TalentPlatform = {
  network: TalentNetwork;
  /** Fake handle only, e.g. @mira.vale.fake */
  handle: string;
  followers: number;
};

export type TalentContentTile = {
  type: "still" | "clip";
  thumb: string;
  views?: number;
  caption?: string;
};

export type StagedTalent = {
  id: string;
  displayName: string;
  age: number;
  location: string;
  bio: string;
  verticals: string[];
  platforms: TalentPlatform[];
  totalAudience: number;
  /** Abstract or staged portrait path (never live kit faces). */
  portrait: string;
  /** Optional short loop; null when not ready. */
  motion: string | null;
  motionStatus: "placeholder" | "ready";
  content: TalentContentTile[];
};

const T = `${A}/talent`;
const DEMO = A;

/** Demo content tiles already in the repo (staged, not live posts). */
const tiles = {
  runA: `${DEMO}/5f2d5.png`,
  runB: `${DEMO}/d52d8.png`,
  runC: `${DEMO}/fe72f.png`,
  track: `${DEMO}/boston-track.jpg`,
  studioA: `${DEMO}/53bfb.png`,
  studioB: `${DEMO}/1f42c.png`,
  studioC: `${DEMO}/7c514.png`,
  studioD: `${DEMO}/36267.png`,
  studioE: `${DEMO}/3ce59.png`,
  studioF: `${DEMO}/03ef9.png`,
  studioG: `${DEMO}/499ca.png`,
  studioH: `${DEMO}/79673.png`,
  studioI: `${DEMO}/f28d9.png`,
  studioJ: `${DEMO}/60da6.png`,
  studioK: `${DEMO}/d63c0.png`,
  studioL: `${DEMO}/ded1e.png`,
  absA: `${T}/tile-a.svg`,
  absB: `${T}/tile-b.svg`,
  absC: `${T}/tile-c.svg`,
  absD: `${T}/tile-d.svg`,
  absE: `${T}/tile-e.svg`,
  absF: `${T}/tile-f.svg`,
};

/**
 * Unlisted staged talent catalogue. Source of truth for /lab/talent.
 * All names, handles, and portraits are invented placeholders.
 */
export const stagedTalent: StagedTalent[] = [
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
    portrait: `${T}/mira-vale.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "still", thumb: tiles.studioA, views: 42_100, caption: "Sunday prep board" },
      { type: "clip", thumb: tiles.absA, views: 118_000, caption: "Three-pan dinner" },
      { type: "still", thumb: tiles.studioB, views: 27_800, caption: "Herb shelf reset" },
      { type: "still", thumb: tiles.runA, views: 19_400 },
    ],
  },
  {
    id: "jax-orin",
    displayName: "Jax Orin",
    age: 31,
    location: "Berlin",
    bio: "Modular synth demos and late-night studio walkthroughs. Fake profile for internal catalogue reuse.",
    verticals: ["Music", "Tech", "Education"],
    platforms: [
      { network: "youtube", handle: "@jaxorin.fake", followers: 402_000 },
      { network: "instagram", handle: "@jax.orin.fake", followers: 96_500 },
      { network: "tiktok", handle: "@jaxorin.fake", followers: 148_200 },
    ],
    totalAudience: 646_700,
    portrait: `${T}/jax-orin.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tiles.absB, views: 210_000, caption: "Patch notes live" },
      { type: "still", thumb: tiles.studioC, views: 33_600 },
      { type: "still", thumb: tiles.studioD, views: 21_900, caption: "Rack close-up" },
      { type: "clip", thumb: tiles.absC, views: 87_400 },
    ],
  },
  {
    id: "nova-reed",
    displayName: "Nova Reed",
    age: 24,
    location: "Toronto",
    bio: "City basketball drills, recovery routines, and kit reviews. Invented talent for Foam lab staging.",
    verticals: ["Sport", "Fitness", "Youth"],
    platforms: [
      { network: "tiktok", handle: "@novareed.fake", followers: 890_000 },
      { network: "instagram", handle: "@nova.reed.fake", followers: 221_000 },
      { network: "youtube", handle: "@novareed.fake", followers: 74_800 },
    ],
    totalAudience: 1_185_800,
    portrait: `${T}/nova-reed.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tiles.track, views: 540_000, caption: "Court sprint set" },
      { type: "still", thumb: tiles.runB, views: 61_200 },
      { type: "still", thumb: tiles.runC, views: 44_500, caption: "Warm-up board" },
      { type: "clip", thumb: tiles.absD, views: 198_000 },
      { type: "still", thumb: tiles.studioE, views: 29_100 },
    ],
  },
  {
    id: "kai-solen",
    displayName: "Kai Solen",
    age: 36,
    location: "Singapore",
    bio: "Travel packing systems and quiet hotel desk setups. Staged only; not a real creator.",
    verticals: ["Travel", "Lifestyle", "Productivity"],
    platforms: [
      { network: "instagram", handle: "@kai.solen.fake", followers: 268_000 },
      { network: "youtube", handle: "@kaisolen.fake", followers: 155_000 },
      { network: "linkedin", handle: "@kai.solen.fake", followers: 18_400 },
    ],
    totalAudience: 441_400,
    portrait: `${T}/kai-solen.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "still", thumb: tiles.studioF, views: 38_700, caption: "Carry-on layout" },
      { type: "still", thumb: tiles.absE, views: 22_300 },
      { type: "clip", thumb: tiles.studioG, views: 91_000, caption: "48-hour city loop" },
    ],
  },
  {
    id: "lena-croft",
    displayName: "Lena Croft",
    age: 29,
    location: "Manchester",
    bio: "Secondhand fashion flips and mend-first styling notes. Catalogue placeholder with fake handles.",
    verticals: ["Fashion", "Sustainability", "Beauty"],
    platforms: [
      { network: "instagram", handle: "@lena.croft.fake", followers: 143_000 },
      { network: "tiktok", handle: "@lenacroft.fake", followers: 507_000 },
      { network: "youtube", handle: "@lena.croft.fake", followers: 39_200 },
    ],
    totalAudience: 689_200,
    portrait: `${T}/lena-croft.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tiles.absF, views: 276_000, caption: "Thrift haul edit" },
      { type: "still", thumb: tiles.studioH, views: 48_900 },
      { type: "still", thumb: tiles.studioI, views: 31_200, caption: "Mend kit" },
      { type: "still", thumb: tiles.studioJ, views: 24_600 },
    ],
  },
  {
    id: "theo-maris",
    displayName: "Theo Maris",
    age: 41,
    location: "Cape Town",
    bio: "Coast photography and slow gear talks. Fake roster row for structured field reuse.",
    verticals: ["Photography", "Outdoors", "Gear"],
    platforms: [
      { network: "instagram", handle: "@theo.maris.fake", followers: 312_000 },
      { network: "youtube", handle: "@theomaris.fake", followers: 98_700 },
      { network: "tiktok", handle: "@theo.maris.fake", followers: 64_100 },
    ],
    totalAudience: 474_800,
    portrait: `${T}/theo-maris.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "still", thumb: tiles.studioK, views: 55_400, caption: "Dawn light study" },
      { type: "still", thumb: tiles.studioL, views: 41_800 },
      { type: "clip", thumb: tiles.absA, views: 72_300, caption: "Lens swap" },
      { type: "still", thumb: tiles.track, views: 36_900 },
    ],
  },
  {
    id: "aria-quen",
    displayName: "Aria Quen",
    age: 22,
    location: "Seoul",
    bio: "Skincare routines with ingredient callouts and soft lighting. Staged demo talent only.",
    verticals: ["Beauty", "Skincare", "Education"],
    platforms: [
      { network: "instagram", handle: "@aria.quen.fake", followers: 419_000 },
      { network: "tiktok", handle: "@ariaquen.fake", followers: 1_240_000 },
      { network: "youtube", handle: "@aria.quen.fake", followers: 112_000 },
    ],
    totalAudience: 1_771_000,
    portrait: `${T}/aria-quen.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tiles.absB, views: 820_000, caption: "AM routine" },
      { type: "still", thumb: tiles.studioA, views: 94_200 },
      { type: "still", thumb: tiles.studioB, views: 67_500, caption: "Shelf check" },
      { type: "clip", thumb: tiles.absC, views: 410_000 },
      { type: "still", thumb: tiles.studioC, views: 52_100 },
      { type: "still", thumb: tiles.absD, views: 38_800 },
    ],
  },
  {
    id: "bode-niles",
    displayName: "Bode Niles",
    age: 34,
    location: "Chicago",
    bio: "Budget home builds and tool-first explainers. Invented profile for lab catalogue work.",
    verticals: ["Home", "DIY", "Finance"],
    platforms: [
      { network: "youtube", handle: "@bodeniles.fake", followers: 528_000 },
      { network: "instagram", handle: "@bode.niles.fake", followers: 87_300 },
      { network: "tiktok", handle: "@bode.niles.fake", followers: 203_000 },
    ],
    totalAudience: 818_300,
    portrait: `${T}/bode-niles.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tiles.absE, views: 305_000, caption: "Shelf build" },
      { type: "still", thumb: tiles.studioD, views: 46_700 },
      { type: "still", thumb: tiles.studioE, views: 33_200, caption: "Cost board" },
      { type: "clip", thumb: tiles.studioF, views: 141_000 },
    ],
  },
  {
    id: "suki-prent",
    displayName: "Suki Prent",
    age: 26,
    location: "Melbourne",
    bio: "Indie games commentary with short clip breakdowns. Fake handles for unlisted staging.",
    verticals: ["Gaming", "Entertainment", "Tech"],
    platforms: [
      { network: "twitch", handle: "@sukiprent.fake", followers: 76_500 },
      { network: "youtube", handle: "@suki.prent.fake", followers: 291_000 },
      { network: "tiktok", handle: "@sukiprent.fake", followers: 455_000 },
      { network: "instagram", handle: "@suki.prent.fake", followers: 58_900 },
    ],
    totalAudience: 881_400,
    portrait: `${T}/suki-prent.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tiles.absF, views: 390_000, caption: "Boss fail cut" },
      { type: "still", thumb: tiles.studioG, views: 28_400 },
      { type: "clip", thumb: tiles.absA, views: 177_000 },
      { type: "still", thumb: tiles.studioH, views: 21_600, caption: "Setup desk" },
      { type: "still", thumb: tiles.absB, views: 18_900 },
    ],
  },
  {
    id: "elio-voss",
    displayName: "Elio Voss",
    age: 38,
    location: "Mexico City",
    bio: "Street food maps and market morning notes. Staged catalogue person, not affiliated with Foam kits.",
    verticals: ["Food", "Travel", "Culture"],
    platforms: [
      { network: "instagram", handle: "@elio.voss.fake", followers: 376_000 },
      { network: "tiktok", handle: "@eliovoss.fake", followers: 612_000 },
      { network: "youtube", handle: "@elio.voss.fake", followers: 88_400 },
    ],
    totalAudience: 1_076_400,
    portrait: `${T}/elio-voss.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "still", thumb: tiles.studioI, views: 71_300, caption: "Market open" },
      { type: "clip", thumb: tiles.absC, views: 248_000, caption: "Taco route" },
      { type: "still", thumb: tiles.studioJ, views: 44_100 },
      { type: "still", thumb: tiles.runA, views: 39_800 },
    ],
  },
  {
    id: "rue-dante",
    displayName: "Rue Dante",
    age: 30,
    location: "Brooklyn, NY",
    bio: "Poetry reels and bookstore shelves. Clearly fake name for internal talent schema tests.",
    verticals: ["Arts", "Books", "Lifestyle"],
    platforms: [
      { network: "instagram", handle: "@rue.dante.fake", followers: 92_700 },
      { network: "tiktok", handle: "@ruedante.fake", followers: 168_000 },
      { network: "youtube", handle: "@rue.dante.fake", followers: 24_500 },
    ],
    totalAudience: 285_200,
    portrait: `${T}/rue-dante.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "clip", thumb: tiles.absD, views: 96_000, caption: "Shelf poem" },
      { type: "still", thumb: tiles.studioK, views: 17_400 },
      { type: "still", thumb: tiles.absE, views: 14_200, caption: "Reading nook" },
    ],
  },
  {
    id: "zane-holt",
    displayName: "Zane Holt",
    age: 45,
    location: "Denver, CO",
    bio: "Trail gear lists and altitude training notes. Placeholder motion until a short loop is ready.",
    verticals: ["Outdoors", "Fitness", "Gear"],
    platforms: [
      { network: "youtube", handle: "@zaneholt.fake", followers: 187_000 },
      { network: "instagram", handle: "@zane.holt.fake", followers: 134_000 },
      { network: "tiktok", handle: "@zane.holt.fake", followers: 79_600 },
    ],
    totalAudience: 400_600,
    portrait: `${T}/zane-holt.svg`,
    motion: null,
    motionStatus: "placeholder",
    content: [
      { type: "still", thumb: tiles.track, views: 58_900, caption: "Ridge morning" },
      { type: "clip", thumb: tiles.absF, views: 112_000, caption: "Pack weigh-in" },
      { type: "still", thumb: tiles.runB, views: 31_500 },
      { type: "still", thumb: tiles.runC, views: 26_700 },
      { type: "still", thumb: tiles.studioL, views: 22_100 },
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
