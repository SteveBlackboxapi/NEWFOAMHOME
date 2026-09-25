import { A } from "../lib/assets";
import type { StagedTalent, TalentContentTile } from "./stagedTalent";

const P = `${A}/people-colour`;

type WebsitePhoto = {
  id: string;
  name: string;
  age?: number;
  src: string;
  original?: string;
  aspectRatio: TalentContentTile["aspectRatio"];
  provenance: "ai-generated" | "reference";
  bio: string;
  source: string;
  verticals: string[];
};

/** Existing public photography, catalogued without assigning real people fictional identities. */
export const websitePhotos: WebsitePhoto[] = [
  {
    id: "ada-bell",
    name: "Ada Bell",
    age: 32,
    src: `${P}/story-refresh-v1/ada-flash.webp`,
    original: `${P}/story-refresh-v1/masters/ada-flash.png`,
    aspectRatio: "9/16",
    provenance: "ai-generated",
    bio: "Ada is an original fictional adult at her creative studio desk. This direct-flash photograph preserves her generated identity, denim outfit and natural twists while refreshing the lighting. She is not a real staff member or customer, and no social account or audience has been assigned.",
    source: `${P}/story-refresh-v1/README.md`,
    verticals: ["Creativity", "Design", "Website photography"],
  },
  {
    id: "milo-west",
    name: "Milo West",
    age: 28,
    src: `${P}/original-portraits-v1/blue-portrait-original-v1.webp`,
    original: `${P}/original-portraits-v1/masters/blue-portrait-original-v1.png`,
    aspectRatio: "16/9",
    provenance: "ai-generated",
    bio: "Milo is an original fictional adult laughing in a blue varsity jacket against a vivid blue background. The portrait was generated for Foam’s website, without a reference identity. He is not a real staff member or customer, and no social account or audience has been assigned.",
    source: `${P}/original-portraits-v1/README.md`,
    verticals: ["Lifestyle", "Portraits", "Website photography"],
  },
  {
    id: "privacy-portrait",
    name: "Privacy portrait",
    src: `${P}/trust-v1/privacy-helmet.webp`,
    original: `${P}/trust-v1/masters/privacy-helmet.png`,
    aspectRatio: "16/9",
    provenance: "ai-generated",
    bio: "An unnamed fictional adult wearing a cream motorcycle helmet and a pale blush jacket. This conceptual privacy image was generated for the Data & trust page; it is not a named creator, real staff portrait or customer endorsement.",
    source: `${P}/trust-v1/README.md`,
    verticals: ["Conceptual photography", "Website photography"],
  },
  {
    id: "studio-collaborators",
    name: "Studio collaborators",
    src: `${P}/studio-moment.webp`,
    original: `${A.replace(/(?:\/media\/[a-f0-9]+)?\/assets$/, "")}/ideas-two/assets/masters/studio-moment.png`,
    aspectRatio: "16/9",
    provenance: "ai-generated",
    bio: "An original AI-generated collaboration scene featuring two fictional adults reviewing creative work. This record catalogues the shared scene, not a single person or actual Foam team. No real identities, accounts or audience figures are claimed.",
    source: `${A.replace(/(?:\/media\/[a-f0-9]+)?\/assets$/, "")}/ideas-two/README.md`,
    verticals: ["Collaboration", "Website photography"],
  },
  {
    id: "nico-voss",
    name: "Nico Voss",
    age: 31,
    src: `${P}/story-refresh-v1/music-creator.webp`,
    original: `${P}/story-refresh-v1/masters/music-creator.png`,
    aspectRatio: "9/16",
    provenance: "ai-generated",
    bio: "Nico is an original fictional adult having coffee at his home-studio desk, photographed with direct flash. This newly generated identity replaces the supplied music portrait on the website; he is not the person in that reference. He is not a real staff member or customer, and no social account or audience has been assigned.",
    source: `${P}/story-refresh-v1/README.md`,
    verticals: ["Music", "Creativity", "Website photography"],
  },
  {
    id: "iris-hale",
    name: "Iris Hale",
    age: 27,
    src: `${P}/story-refresh-v1/outdoor-creator.webp`,
    original: `${P}/story-refresh-v1/masters/outdoor-creator.png`,
    aspectRatio: "9/16",
    provenance: "ai-generated",
    bio: "Iris is an original fictional adult in an outdoor sunglasses portrait under a bright blue sky. This newly generated identity replaces the supplied outdoor photograph on the website; she is not the person in that reference. She is not a real staff member or customer, and no social account or audience has been assigned.",
    source: `${P}/story-refresh-v1/README.md`,
    verticals: ["Outdoors", "Lifestyle", "Website photography"],
  },
  {
    id: "reference-collaborators",
    name: "Collaborators reference",
    src: `${P}/collaborators.webp`,
    aspectRatio: "16/9",
    provenance: "reference",
    bio: "Unidentified people in supplied reference photography, extracted from page 13 of the supplied design deck (p13-asset-00-X1.png). This group is not identified as Foam staff or customers. This record preserves the supplied source; it does not invent individual identities, employment or endorsements.",
    source: `${A.replace(/(?:\/media\/[a-f0-9]+)?\/assets$/, "")}/ideas-two/assets/README.md`,
    verticals: ["Collaboration", "Supplied reference"],
  },
];

/** Metric-free catalogue records for public website photographs missing from the original cast. */
export const websitePhotoTalent: StagedTalent[] = websitePhotos.map(
  (photo) => ({
    id: photo.id,
    displayName: photo.name,
    // Zero denotes unassigned; the library hides it for unnamed scenes and reference photography.
    age: photo.age ?? 0,
    provenance: photo.provenance,
    location:
      photo.provenance === "reference"
        ? "Supplied reference"
        : "Illustrative profile",
    bio: photo.bio,
    verticals: photo.verticals,
    platforms: [],
    totalAudience: 0,
    portrait: photo.src,
    originalPortrait: photo.original,
    creativeDirection: {
      summary: photo.bio,
      identityNotes: [
        photo.provenance === "reference"
          ? "Preserve supplied-reference provenance. Do not relabel this person as an AI-generated creator or Foam staff."
          : "Original fictional imagery. Not a real customer, employee, social account or endorsement.",
      ],
      promptFile: photo.source,
    },
    motion: null,
    motionStatus: "placeholder",
    content: [
      {
        id: "website-photo",
        type: "still",
        thumb: photo.src,
        original: photo.original,
        aspectRatio: photo.aspectRatio,
        provenance: photo.provenance,
        caption: photo.name,
        captionSettings: { visible: false },
        // Required preview chrome only; no live account or published post is asserted.
        platform: "instagram",
        strongKind: "photo",
      },
    ],
  }),
);
